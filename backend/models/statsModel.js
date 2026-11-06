const db = require('../config/db');

const StatsModel = {
  // Doanh thu tiền phòng theo từng loại phòng
  async revenueByRoomType(from, to) {
    const [rows] = await db.query(
      `SELECT rt.RoomTypeID, rt.TypeName,
              COALESCE(x.Revenue, 0) AS Revenue,
              COALESCE(x.RoomNights, 0) AS RoomNights
       FROM RoomTypes rt
       LEFT JOIN (
         SELECT r.RoomTypeID,
                SUM(bd.SubTotal + bd.TimeSurcharge) AS Revenue,
                SUM(bd.RentalDays) AS RoomNights
         FROM Invoices i
         JOIN BookingDetails bd ON bd.BookingID = i.BookingID
         JOIN Rooms r ON r.RoomID = bd.RoomID
         WHERE i.PaymentStatus = 'Paid' AND i.PaidAt >= ? AND i.PaidAt < ?
         GROUP BY r.RoomTypeID
       ) x ON x.RoomTypeID = rt.RoomTypeID
       ORDER BY rt.RoomTypeID`,
      [from, to]
    );
    return rows;
  },

  // Tổng hợp các hóa đơn đã thanh toán
  async invoiceTotals(from, to) {
    const [rows] = await db.query(
      `SELECT COUNT(*) AS InvoiceCount,
              COALESCE(SUM(RoomTotal + TimeSurchargeTotal), 0) AS RoomRevenue,
              COALESCE(SUM(ServiceTotal), 0) AS ServiceRevenue,
              COALESCE(SUM(TotalAmount), 0) AS TotalRevenue
       FROM Invoices
       WHERE PaymentStatus = 'Paid' AND PaidAt >= ? AND PaidAt < ?`,
      [from, to]
    );
    return rows[0];
  },

  // Từng hóa đơn đã thanh toán
  async paidInvoices(from, to) {
    const [rows] = await db.query(
      `SELECT PaidAt, RoomTotal, TimeSurchargeTotal, ServiceTotal, TotalAmount
       FROM Invoices
       WHERE PaymentStatus = 'Paid' AND PaidAt >= ? AND PaidAt < ?`,
      [from, to]
    );
    return rows;
  },

  // Dịch vụ bán chạy nhất
  async topServices(from, to, limit) {
    const [rows] = await db.query(
      `SELECT s.ServiceID, s.ServiceName, s.Unit,
              SUM(su.Quantity) AS TotalQuantity, SUM(su.SubTotal) AS Revenue
       FROM ServiceUsages su
       JOIN Services s ON s.ServiceID = su.ServiceID
       JOIN BookingDetails bd ON bd.DetailID = su.DetailID
       JOIN Invoices i ON i.BookingID = bd.BookingID
       WHERE i.PaymentStatus = 'Paid' AND i.PaidAt >= ? AND i.PaidAt < ?
       GROUP BY s.ServiceID, s.ServiceName, s.Unit
       ORDER BY Revenue DESC, s.ServiceID
       LIMIT ?`,
      [from, to, limit]
    );
    return rows;
  },

  // Số phòng theo từng trạng thái
  async roomStatusCounts() {
    const [rows] = await db.query('SELECT Status, COUNT(*) AS Count FROM Rooms GROUP BY Status');
    return rows;
  },

  // Tổng số khách đang ở
  async guestsInHouse() {
    const [rows] = await db.query(
      `SELECT COALESCE(SUM(bd.GuestCount), 0) AS Total
       FROM BookingDetails bd
       JOIN Bookings b ON b.BookingID = bd.BookingID
       WHERE b.Status = 'CheckedIn'`
    );
    return Number(rows[0].Total);
  },

  // Số đơn đã cọc dự kiến nhận phòng
  async expectedArrivals(from, to) {
    const [rows] = await db.query(
      `SELECT COUNT(*) AS n FROM Bookings
       WHERE Status = 'Confirmed' AND ExpectedCheckIn >= ? AND ExpectedCheckIn < ?`,
      [from, to]
    );
    return Number(rows[0].n);
  },

  // Số đơn đang ở dự kiến trả phòng
  async expectedDepartures(from, to) {
    const [rows] = await db.query(
      `SELECT COUNT(*) AS n FROM Bookings
       WHERE Status = 'CheckedIn' AND ExpectedCheckOut >= ? AND ExpectedCheckOut < ?`,
      [from, to]
    );
    return Number(rows[0].n);
  },

  // Số đơn đang chờ cọc
  async pendingBookings() {
    const [rows] = await db.query("SELECT COUNT(*) AS n FROM Bookings WHERE Status = 'Pending'");
    return Number(rows[0].n);
  },
};

module.exports = StatsModel;