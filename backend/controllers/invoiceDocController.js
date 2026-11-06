const InvoiceModel = require('../models/invoiceModel');
const BookingModel = require('../models/bookingModel');
const ServiceUsageModel = require('../models/serviceUsageModel');
const UserModel = require('../models/userModel');
const { buildInvoicePdf, formatDateTime, money } = require('../utils/invoicePdf');
const mailer = require('../utils/mailer');

const fail = (res, status, message) => res.status(status).json({ success: false, message });
const isValidId = (value) => /^\d+$/.test(String(value)) && Number(value) > 0;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const HOTEL_NAME = process.env.HOTEL_NAME || 'Khách sạn';

const escapeHtml = (text) =>
  String(text ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Chi tiết đầy đủ của hóa đơn
const loadDetail = async (invoice) => {
  const booking = await BookingModel.getById(invoice.BookingID);
  const services = await ServiceUsageModel.listByBooking(invoice.BookingID);
  return { ...invoice, Rooms: booking ? booking.Rooms : [], Services: services };
};

// Email mặc định là email của tài khoản khách đã đặt đơn
const defaultRecipient = async (invoice) => {
  if (!invoice.UserID) return null;
  const user = await UserModel.findById(invoice.UserID);
  return user && user.Email ? user.Email : null;
};

// Gửi hóa đơn (kèm PDF) qua email
const sendInvoiceEmail = async (invoiceId, overrideEmail) => {
  try {
    if (!mailer.isConfigured()) return { sent: false, reason: 'Chưa cấu hình SMTP' };

    const invoice = await InvoiceModel.getById(invoiceId);
    if (!invoice) return { sent: false, reason: 'Không tìm thấy hóa đơn' };

    const to = overrideEmail || (await defaultRecipient(invoice));
    if (!to) return { sent: false, reason: 'Khách chưa có email' };

    const detail = await loadDetail(invoice);
    const pdf = await buildInvoicePdf(detail);
    const name = escapeHtml(detail.BillingName || detail.GuestName || 'Quý khách');

    await mailer.sendMail({
      to,
      subject: `[${HOTEL_NAME}] Hóa đơn thanh toán #${detail.InvoiceID}`,
      text:
        `Xin chào ${detail.BillingName || 'Quý khách'},\n\n` +
        `Cảm ơn quý khách đã lưu trú tại ${HOTEL_NAME}. ` +
        `Hóa đơn #${detail.InvoiceID} (thanh toán ngày ${formatDateTime(detail.PaidAt)}) có tổng cộng ` +
        `${money(detail.TotalAmount)}, quý khách đã thanh toán ${money(detail.AmountDue)} ` +
        `sau khi trừ tiền cọc. Chi tiết xem trong file PDF đính kèm.`,
      html:
        `<p>Xin chào <b>${name}</b>,</p>` +
        `<p>Cảm ơn quý khách đã lưu trú tại ${escapeHtml(HOTEL_NAME)}.</p>` +
        `<p>Hóa đơn <b>#${detail.InvoiceID}</b> (thanh toán ngày ${escapeHtml(formatDateTime(detail.PaidAt))}):<br>` +
        `Tổng cộng: <b>${escapeHtml(money(detail.TotalAmount))}</b><br>` +
        `Quý khách đã thanh toán: <b>${escapeHtml(money(detail.AmountDue))}</b> (sau khi trừ tiền cọc).</p>` +
        `<p>Chi tiết xem trong file PDF đính kèm.</p>`,
      attachments: [{ filename: `hoa-don-${detail.InvoiceID}.pdf`, content: pdf, contentType: 'application/pdf' }],
    });
    return { sent: true, to };
  } catch (err) {
    console.error('Gửi email hóa đơn thất bại:', err.message);
    return { sent: false, reason: 'Gửi email thất bại' };
  }
};

// GET /api/v1/invoices/:id/pdf
const downloadPdf = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return fail(res, 400, 'Mã hóa đơn không hợp lệ');
    const invoice = await InvoiceModel.getById(req.params.id);
    const isStaff = req.user.role === 'Admin' || req.user.role === 'Staff';
    if (!invoice || (!isStaff && invoice.UserID !== req.user.id)) {
      return fail(res, 404, 'Không tìm thấy hóa đơn');
    }
    const pdf = await buildInvoicePdf(await loadDetail(invoice));
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="hoa-don-${invoice.InvoiceID}.pdf"`);
    return res.send(pdf);
  } catch (err) {
    console.error(err);
    return fail(res, 500, 'Lỗi máy chủ');
  }
};

// POST /api/v1/invoices/:id/email
const emailInvoice = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return fail(res, 400, 'Mã hóa đơn không hợp lệ');
    const raw = req.body && req.body.email;
    const email = raw === undefined || raw === null || String(raw).trim() === '' ? null : String(raw).trim();
    if (email && (email.length > 100 || !EMAIL_PATTERN.test(email))) {
      return fail(res, 400, 'Email không hợp lệ');
    }
    if (!mailer.isConfigured()) return fail(res, 503, 'Hệ thống chưa cấu hình gửi email');

    const invoice = await InvoiceModel.getById(req.params.id);
    if (!invoice) return fail(res, 404, 'Không tìm thấy hóa đơn');

    const result = await sendInvoiceEmail(invoice.InvoiceID, email);
    if (!result.sent) {
      const status = result.reason === 'Khách chưa có email' ? 400 : 502;
      return fail(res, status, result.reason === 'Khách chưa có email' ? 'Khách chưa có email, hãy nhập email để gửi' : result.reason);
    }
    return res.json({ success: true, message: `Đã gửi hóa đơn tới ${result.to}` });
  } catch (err) {
    console.error(err);
    return fail(res, 500, 'Lỗi máy chủ');
  }
};

module.exports = { downloadPdf, emailInvoice, sendInvoiceEmail };