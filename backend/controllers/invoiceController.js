const InvoiceModel = require('../models/invoiceModel');
const BookingModel = require('../models/bookingModel');
const ServiceUsageModel = require('../models/serviceUsageModel');
const pricing = require('../utils/pricing');
const rules = require('../utils/bookingRules');
const { calcInvoice } = require('../utils/invoiceCalc');
const { sendInvoiceEmail } = require('./invoiceDocController');

const PAYMENT_METHODS = ['Cash', 'BankTransfer', 'CreditCard'];
const PAYMENT_STATUSES = ['Pending', 'Paid', 'Failed', 'Cancelled'];

const fail = (res, status, message) => res.status(status).json({ success: false, message });
const isValidId = (value) => /^\d+$/.test(String(value)) && Number(value) > 0;
const pad = (n) => String(n).padStart(2, '0');

const handleError = (res, err) => {
  if (err.code === 'BOOKING_STATE') {
    return fail(res, 409, 'Đơn không còn ở trạng thái đang ở (có thể đã được thanh toán)');
  }
  if (err.code === 'SERVICES_CHANGED') {
    return fail(res, 409, 'Dịch vụ của đơn vừa thay đổi, vui lòng tính lại hóa đơn');
  }
  if (err.code === 'ER_DUP_ENTRY') {
    return fail(res, 409, 'Đơn này đã có hóa đơn');
  }
  console.error(err);
  return fail(res, 500, 'Lỗi máy chủ');
};

// Gom dữ liệu cần để tính hóa đơn của một đơn đang ở
const loadContext = async (bookingId) => {
  const booking = await BookingModel.getById(bookingId);
  if (!booking) return { error: [404, 'Không tìm thấy đơn đặt phòng'] };
  if (booking.Status !== 'CheckedIn') {
    return {
      error: [
        409,
        booking.Status === 'Completed'
          ? 'Đơn đã thanh toán và trả phòng'
          : `Chỉ lập hóa đơn cho đơn đang ở (đơn đang ở trạng thái ${booking.Status})`,
      ],
    };
  }
  const roomInfos = new Map(
    (await BookingModel.getRoomsForBooking(booking.Rooms.map((r) => r.RoomID))).map((r) => [
      r.RoomID,
      r,
    ])
  );
  const serviceItems = await ServiceUsageModel.listByBooking(booking.BookingID);
  const serviceTotal = pricing.round2(serviceItems.reduce((s, i) => s + Number(i.SubTotal), 0));
  const settings = await rules.readSettings();
  return { booking, roomInfos, serviceItems, serviceTotal, settings };
};

// Chi tiết một hóa đơn
const buildInvoiceDetail = async (invoice) => {
  const booking = await BookingModel.getById(invoice.BookingID);
  const services = await ServiceUsageModel.listByBooking(invoice.BookingID);
  return { ...invoice, Rooms: booking.Rooms, Services: services };
};

// GET /api/v1/invoices/preview?bookingId=1   (Lễ tân/Admin)
exports.previewInvoice = async (req, res) => {
  try {
    const { bookingId } = req.query;
    if (!isValidId(bookingId)) return fail(res, 400, 'Mã đơn không hợp lệ');
    const ctx = await loadContext(bookingId);
    if (ctx.error) return fail(res, ...ctx.error);

    const now = rules.nowString();
    const calc = calcInvoice({
      booking: ctx.booking,
      roomInfos: ctx.roomInfos,
      settings: ctx.settings,
      now,
      serviceTotal: ctx.serviceTotal,
    });
    return res.json({
      success: true,
      data: {
        BookingID: ctx.booking.BookingID,
        GuestName: ctx.booking.GuestName,
        CheckOutTime: now,
        Deposit: Number(ctx.booking.Deposit),
        Rooms: calc.rooms,
        Services: ctx.serviceItems,
        RoomTotal: calc.roomTotal,
        TimeSurchargeTotal: calc.timeSurchargeTotal,
        ServiceTotal: calc.serviceTotal,
        TotalAmount: calc.totalAmount,
        DepositDeducted: calc.depositDeducted,
        AmountDue: calc.amountDue,
        RefundDue: calc.refundDue,
      },
    });
  } catch (err) {
    return handleError(res, err);
  }
};

// POST /api/v1/invoices   (Lễ tân/Admin)
exports.createInvoice = async (req, res) => {
  try {
    const body = req.body || {};
    if (!isValidId(body.BookingID)) return fail(res, 400, 'Mã đơn không hợp lệ');

    const billingName = rules.optional(body.BillingName);
    const billingAddress = rules.optional(body.BillingAddress);
    const reference = rules.optional(body.TransactionReference);
    const paymentMethod = body.PaymentMethod ?? null;
    if (billingName && billingName.length > 100) {
      return fail(res, 400, 'Tên khách/cơ quan tối đa 100 ký tự');
    }
    if (billingAddress && billingAddress.length > 255) {
      return fail(res, 400, 'Địa chỉ tối đa 255 ký tự');
    }
    if (reference && reference.length > 100) {
      return fail(res, 400, 'Mã giao dịch tối đa 100 ký tự');
    }
    if (paymentMethod !== null && !PAYMENT_METHODS.includes(paymentMethod)) {
      return fail(res, 400, `Phương thức thanh toán phải là một trong: ${PAYMENT_METHODS.join(', ')}`);
    }

    const ctx = await loadContext(body.BookingID);
    if (ctx.error) return fail(res, ...ctx.error);

    const now = rules.nowString();
    const calc = calcInvoice({
      booking: ctx.booking,
      roomInfos: ctx.roomInfos,
      settings: ctx.settings,
      now,
      serviceTotal: ctx.serviceTotal,
    });

    if (calc.amountDue > 0 && !paymentMethod) {
      return fail(res, 400, 'Cần chọn phương thức thanh toán');
    }

    const invoiceId = await InvoiceModel.createAndPay({
      bookingId: ctx.booking.BookingID,
      expectedServiceTotal: ctx.serviceTotal,
      paidAt: now,
      rooms: calc.rooms,
      invoice: {
        CreatedBy: req.user.id,
        BillingName: billingName || ctx.booking.GuestName,
        BillingAddress: billingAddress,
        RoomTotal: calc.roomTotal,
        TimeSurchargeTotal: calc.timeSurchargeTotal,
        ServiceTotal: calc.serviceTotal,
        DepositDeducted: calc.depositDeducted,
        TotalAmount: calc.totalAmount,
        AmountDue: calc.amountDue,
        PaymentMethod: paymentMethod,
        TransactionReference: reference,
      },
    });

    const invoice = await InvoiceModel.getById(invoiceId);
    const responseBody = {
      success: true,
      message: 'Đã lập hóa đơn, ghi nhận thanh toán và trả phòng',
      data: { ...(await buildInvoiceDetail(invoice)), RefundDue: calc.refundDue },
    };
    res.status(201).json(responseBody);
    sendInvoiceEmail(invoiceId);
    return undefined;
  } catch (err) {
    return handleError(res, err);
  }
};

// GET /api/v1/invoices?month=10&year=2026&status=Paid&bookingId=3   (Lễ tân/Admin)
exports.getInvoices = async (req, res) => {
  try {
    const { month, year, status, bookingId } = req.query;
    if (status && !PAYMENT_STATUSES.includes(status)) {
      return fail(res, 400, 'Trạng thái thanh toán không hợp lệ');
    }
    if (bookingId && !isValidId(bookingId)) return fail(res, 400, 'Mã đơn không hợp lệ');

    let from;
    let to;
    if (month !== undefined || year !== undefined) {
      const m = Number(month);
      const y = Number(year);
      if (!Number.isInteger(m) || m < 1 || m > 12 || !Number.isInteger(y) || y < 2000 || y > 2100) {
        return fail(res, 400, 'Cần truyền cả month (1-12) và year hợp lệ');
      }
      const [ny, nm] = m === 12 ? [y + 1, 1] : [y, m + 1];
      from = `${y}-${pad(m)}-01 00:00:00`;
      to = `${ny}-${pad(nm)}-01 00:00:00`;
    }

    const invoices = await InvoiceModel.list({ from, to, status, bookingId });
    return res.json({ success: true, data: invoices });
  } catch (err) {
    return handleError(res, err);
  }
};

// GET /api/v1/invoices/my   (khách hàng: hóa đơn của mình)
exports.getMyInvoices = async (req, res) => {
  try {
    const invoices = await InvoiceModel.listByUser(req.user.id);
    return res.json({ success: true, data: invoices });
  } catch (err) {
    return handleError(res, err);
  }
};

// GET /api/v1/invoices/:id   (Lễ tân/Admin, hoặc khách là chủ đơn)
exports.getInvoiceById = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return fail(res, 400, 'Mã hóa đơn không hợp lệ');
    const invoice = await InvoiceModel.getById(req.params.id);
    const isStaff = req.user.role === 'Admin' || req.user.role === 'Staff';
    if (!invoice || (!isStaff && invoice.UserID !== req.user.id)) {
      return fail(res, 404, 'Không tìm thấy hóa đơn');
    }
    return res.json({ success: true, data: await buildInvoiceDetail(invoice) });
  } catch (err) {
    return handleError(res, err);
  }
};