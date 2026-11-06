const StatsModel = require('../models/statsModel');
const pricing = require('../utils/pricing');
const rules = require('../utils/bookingRules');

const fail = (res, status, message) => res.status(status).json({ success: false, message });
const pad = (n) => String(n).padStart(2, '0');

const handleError = (res, err) => {
  console.error(err);
  return fail(res, 500, 'Lỗi máy chủ');
};

// Đọc năm/tháng từ query
const readYear = (value, fallback) => {
  if (value === undefined || value === '') return fallback;
  if (!/^\d{4}$/.test(String(value))) return null;
  const year = Number(value);
  return year >= 2000 && year <= 2100 ? year : null;
};
const readMonth = (value, fallback) => {
  if (value === undefined || value === '') return fallback;
  if (!/^\d{1,2}$/.test(String(value))) return null;
  const month = Number(value);
  return month >= 1 && month <= 12 ? month : null;
};

// Đầu tháng (YYYY-MM-01) và đầu tháng kế tiếp
const monthRange = (year, month) => {
  const nextYear = month === 12 ? year + 1 : year;
  const nextMonth = month === 12 ? 1 : month + 1;
  return {
    from: `${year}-${pad(month)}-01`,
    to: `${nextYear}-${pad(nextMonth)}-01`,
  };
};

// Ngày hôm sau của một chuỗi YYYY-MM-DD
const nextDay = (dateStr) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d + 1);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const num = (value) => pricing.round2(Number(value) || 0);

// GET /api/v1/reports/monthly?month=10&year=2026
exports.monthlyReport = async (req, res) => {
  try {
    const today = rules.todayString();
    const month = readMonth(req.query.month, Number(today.slice(5, 7)));
    const year = readYear(req.query.year, Number(today.slice(0, 4)));
    if (month === null) return fail(res, 400, 'Tháng không hợp lệ (1 đến 12)');
    if (year === null) return fail(res, 400, 'Năm không hợp lệ');

    const { from, to } = monthRange(year, month);
    const [byType, totals] = await Promise.all([
      StatsModel.revenueByRoomType(from, to),
      StatsModel.invoiceTotals(from, to),
    ]);

    const roomRevenue = pricing.round2(byType.reduce((sum, row) => sum + Number(row.Revenue), 0));
    const items = byType.map((row, index) => {
      const revenue = num(row.Revenue);
      return {
        no: index + 1,
        roomTypeId: row.RoomTypeID,
        typeName: row.TypeName,
        revenue,
        roomNights: Number(row.RoomNights),
        ratePercent: roomRevenue > 0 ? pricing.round2((revenue / roomRevenue) * 100) : 0,
      };
    });

    return res.json({
      success: true,
      data: {
        month,
        year,
        items,
        roomRevenue,
        serviceRevenue: num(totals.ServiceRevenue),
        totalRevenue: num(totals.TotalRevenue),
        invoiceCount: Number(totals.InvoiceCount),
      },
    });
  } catch (err) {
    return handleError(res, err);
  }
};

// GET /api/v1/dashboard/overview
exports.overview = async (req, res) => {
  try {
    const today = rules.todayString();
    const tomorrow = nextDay(today);
    const year = Number(today.slice(0, 4));
    const month = Number(today.slice(5, 7));
    const thisMonth = monthRange(year, month);
    const lastMonth = monthRange(month === 1 ? year - 1 : year, month === 1 ? 12 : month - 1);

    const [statusRows, guests, arrivals, departures, pending, thisTotals, lastTotals] =
      await Promise.all([
        StatsModel.roomStatusCounts(),
        StatsModel.guestsInHouse(),
        StatsModel.expectedArrivals(today, tomorrow),
        StatsModel.expectedDepartures(today, tomorrow),
        StatsModel.pendingBookings(),
        StatsModel.invoiceTotals(thisMonth.from, thisMonth.to),
        StatsModel.invoiceTotals(lastMonth.from, lastMonth.to),
      ]);

    const rooms = { Available: 0, Occupied: 0, Cleaning: 0, Maintenance: 0 };
    statusRows.forEach((row) => {
      rooms[row.Status] = Number(row.Count);
    });
    const totalRooms = Object.values(rooms).reduce((a, b) => a + b, 0);
    // Công suất = phòng đang có khách / tổng số phòng
    const occupancyRate = totalRooms > 0 ? pricing.round2((rooms.Occupied / totalRooms) * 100) : 0;

    const thisRevenue = num(thisTotals.TotalRevenue);
    const lastRevenue = num(lastTotals.TotalRevenue);

    const changePercent =
      lastRevenue > 0 ? pricing.round2(((thisRevenue - lastRevenue) / lastRevenue) * 100) : null;

    return res.json({
      success: true,
      data: {
        today,
        rooms: { total: totalRooms, ...rooms, occupancyRate },
        guestsInHouse: guests,
        arrivalsToday: arrivals,
        departuresToday: departures,
        pendingBookings: pending,
        revenue: {
          thisMonth: thisRevenue,
          lastMonth: lastRevenue,
          changePercent,
        },
      },
    });
  } catch (err) {
    return handleError(res, err);
  }
};

// GET /api/v1/dashboard/revenue?year=2026
exports.revenueByYear = async (req, res) => {
  try {
    const year = readYear(req.query.year, Number(rules.todayString().slice(0, 4)));
    if (year === null) return fail(res, 400, 'Năm không hợp lệ');

    const invoices = await StatsModel.paidInvoices(`${year}-01-01`, `${year + 1}-01-01`);
    const months = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      roomRevenue: 0,
      serviceRevenue: 0,
      totalRevenue: 0,
      invoiceCount: 0,
    }));
    invoices.forEach((inv) => {
      const paidAt = rules.toDateTimeString(inv.PaidAt);
      const m = months[Number(paidAt.slice(5, 7)) - 1];
      m.roomRevenue += Number(inv.RoomTotal) + Number(inv.TimeSurchargeTotal);
      m.serviceRevenue += Number(inv.ServiceTotal);
      m.totalRevenue += Number(inv.TotalAmount);
      m.invoiceCount += 1;
    });
    months.forEach((m) => {
      m.roomRevenue = pricing.round2(m.roomRevenue);
      m.serviceRevenue = pricing.round2(m.serviceRevenue);
      m.totalRevenue = pricing.round2(m.totalRevenue);
    });

    return res.json({
      success: true,
      data: {
        year,
        months,
        yearTotal: pricing.round2(months.reduce((sum, m) => sum + m.totalRevenue, 0)),
      },
    });
  } catch (err) {
    return handleError(res, err);
  }
};

// GET /api/v1/dashboard/top-services?month=10&year=2026&limit=5
exports.topServices = async (req, res) => {
  try {
    const today = rules.todayString();
    const month = readMonth(req.query.month, Number(today.slice(5, 7)));
    const year = readYear(req.query.year, Number(today.slice(0, 4)));
    if (month === null) return fail(res, 400, 'Tháng không hợp lệ (1 đến 12)');
    if (year === null) return fail(res, 400, 'Năm không hợp lệ');

    let limit = 5;
    if (req.query.limit !== undefined && req.query.limit !== '') {
      if (!/^\d+$/.test(String(req.query.limit)) || Number(req.query.limit) < 1) {
        return fail(res, 400, 'limit phải là số nguyên dương');
      }
      limit = Math.min(Number(req.query.limit), 50);
    }

    const { from, to } = monthRange(year, month);
    const rows = await StatsModel.topServices(from, to, limit);
    return res.json({
      success: true,
      data: {
        month,
        year,
        services: rows.map((row) => ({
          serviceId: row.ServiceID,
          serviceName: row.ServiceName,
          unit: row.Unit,
          totalQuantity: Number(row.TotalQuantity),
          revenue: num(row.Revenue),
        })),
      },
    });
  } catch (err) {
    return handleError(res, err);
  }
};