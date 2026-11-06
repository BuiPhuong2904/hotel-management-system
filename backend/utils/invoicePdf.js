const path = require('path');
const PDFDocument = require('pdfkit');
const rules = require('./bookingRules');

const FONT_REGULAR = path.join(__dirname, '..', 'assets', 'fonts', 'DejaVuSans.ttf');
const FONT_BOLD = path.join(__dirname, '..', 'assets', 'fonts', 'DejaVuSans-Bold.ttf');

const HOTEL_NAME = process.env.HOTEL_NAME || 'Khách sạn';
const PAYMENT_METHOD_LABEL = {
  Cash: 'Tiền mặt',
  BankTransfer: 'Chuyển khoản',
  CreditCard: 'Thẻ tín dụng',
};

const money = (value) => `${Number(value || 0).toLocaleString('vi-VN', { maximumFractionDigits: 2 })} đ`;

const formatDateTime = (value) => {
  if (!value) return '';
  const s = rules.toDateTimeString(value);
  return `${s.slice(8, 10)}/${s.slice(5, 7)}/${s.slice(0, 4)} ${s.slice(11, 16)}`;
};

const LEFT = 50;
const RIGHT = 545;
const PAGE_BOTTOM = 770;

const ensureSpace = (doc, y, need) => {
  if (y + need > PAGE_BOTTOM) {
    doc.addPage();
    return 50;
  }
  return y;
};

const tableRow = (doc, y, cols, cells, { bold = false } = {}) => {
  doc.font(bold ? 'Bold' : 'Regular').fontSize(9);
  cells.forEach((text, i) => {
    doc.text(String(text ?? ''), cols[i].x, y, {
      width: cols[i].w,
      align: cols[i].align || 'left',
      height: 12,
      ellipsis: true,
    });
  });
  return y + 16;
};

const drawLine = (doc, y) => {
  doc.moveTo(LEFT, y).lineTo(RIGHT, y).lineWidth(0.5).stroke();
};

const buildInvoicePdf = (invoice) =>
  new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc.registerFont('Regular', FONT_REGULAR);
      doc.registerFont('Bold', FONT_BOLD);

      // ----- Tiêu đề -----
      doc.font('Bold').fontSize(16).text(HOTEL_NAME.toUpperCase(), LEFT, 50, { align: 'center', width: RIGHT - LEFT });
      doc.font('Bold').fontSize(14).text('HÓA ĐƠN THANH TOÁN', LEFT, 74, { align: 'center', width: RIGHT - LEFT });

      // ----- Thông tin chung -----
      let y = 105;
      const info = [
        ['Số hóa đơn', `#${invoice.InvoiceID}`],
        ['Mã đơn thuê', `#${invoice.BookingID}`],
        ['Khách hàng', invoice.BillingName || invoice.GuestName || ''],
        ['Địa chỉ', invoice.BillingAddress || ''],
        ['Ngày thanh toán', formatDateTime(invoice.PaidAt)],
        ['Hình thức', PAYMENT_METHOD_LABEL[invoice.PaymentMethod] || invoice.PaymentMethod || ''],
        ['Mã giao dịch', invoice.TransactionReference || ''],
        ['Nhân viên lập', invoice.CreatedByName || ''],
      ];
      info.forEach(([label, value]) => {
        if (!value) return;
        doc.font('Bold').fontSize(10).text(`${label}:`, LEFT, y, { width: 110 });
        doc.font('Regular').fontSize(10).text(String(value), LEFT + 115, y, { width: RIGHT - LEFT - 115 });
        y += 16;
      });

      // ----- Bảng tiền phòng -----
      y += 8;
      y = ensureSpace(doc, y, 60);
      doc.font('Bold').fontSize(11).text('Tiền phòng', LEFT, y);
      y += 18;
      const roomCols = [
        { x: 50, w: 45 }, // phòng
        { x: 95, w: 95 }, // loại
        { x: 190, w: 80, align: 'right' }, // đơn giá
        { x: 270, w: 40, align: 'right' }, // đêm
        { x: 310, w: 40, align: 'right' }, // khách
        { x: 350, w: 95, align: 'right' }, // tiền phòng
        { x: 445, w: 100, align: 'right' }, // phụ thu giờ
      ];
      y = tableRow(doc, y, roomCols, ['Phòng', 'Loại', 'Đơn giá', 'Đêm', 'Khách', 'Tiền phòng', 'Phụ thu giờ'], { bold: true });
      drawLine(doc, y - 3);
      (invoice.Rooms || []).forEach((room) => {
        y = ensureSpace(doc, y, 20);
        y = tableRow(doc, y, roomCols, [
          room.RoomNumber,
          room.TypeName,
          money(room.PriceAtBooking),
          room.RentalDays,
          room.GuestCount,
          money(room.SubTotal),
          money(room.TimeSurcharge),
        ]);
      });

      // ----- Bảng dịch vụ -----
      const services = invoice.Services || [];
      if (services.length > 0) {
        y += 8;
        y = ensureSpace(doc, y, 60);
        doc.font('Bold').fontSize(11).text('Dịch vụ phát sinh', LEFT, y);
        y += 18;
        const svcCols = [
          { x: 50, w: 45 }, // phòng
          { x: 95, w: 185 }, // tên dịch vụ
          { x: 280, w: 60, align: 'right' }, // số lượng
          { x: 340, w: 50 }, // đơn vị
          { x: 390, w: 75, align: 'right' }, // đơn giá
          { x: 465, w: 80, align: 'right' }, // thành tiền
        ];
        y = tableRow(doc, y, svcCols, ['Phòng', 'Dịch vụ', 'SL', 'ĐVT', 'Đơn giá', 'Thành tiền'], { bold: true });
        drawLine(doc, y - 3);
        services.forEach((s) => {
          y = ensureSpace(doc, y, 20);
          y = tableRow(doc, y, svcCols, [
            s.RoomNumber,
            s.ServiceName,
            s.Quantity,
            s.Unit,
            money(s.PriceAtUsage),
            money(s.SubTotal),
          ]);
        });
      }

      // ----- Tổng kết -----
      y += 10;
      y = ensureSpace(doc, y, 130);
      drawLine(doc, y);
      y += 8;
      const summary = [
        ['Tiền phòng', invoice.RoomTotal],
        ['Phụ thu nhận sớm / trả trễ', invoice.TimeSurchargeTotal],
        ['Tiền dịch vụ', invoice.ServiceTotal],
        ['Tổng cộng', invoice.TotalAmount, true],
        ['Đã trừ tiền cọc', invoice.DepositDeducted],
        ['Khách thanh toán', invoice.AmountDue, true],
      ];
      summary.forEach(([label, value, bold]) => {
        doc.font(bold ? 'Bold' : 'Regular').fontSize(10);
        doc.text(label, 300, y, { width: 150 });
        doc.text(money(value), 450, y, { width: 95, align: 'right' });
        y += 17;
      });

      y += 20;
      y = ensureSpace(doc, y, 30);
      doc.font('Regular').fontSize(9).text('Cảm ơn quý khách đã sử dụng dịch vụ!', LEFT, y, {
        align: 'center',
        width: RIGHT - LEFT,
      });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });

module.exports = { buildInvoicePdf, formatDateTime, money };