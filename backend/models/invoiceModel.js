const db = require('../config/db');

const INVOICE_SELECT = `
  SELECT i.InvoiceID, i.BookingID, i.CreatedBy, u.FullName AS CreatedByName,
         i.BillingName, i.BillingAddress, i.RoomTotal, i.TimeSurchargeTotal, i.ServiceTotal,
         i.DepositDeducted, i.TotalAmount, i.AmountDue, i.PaymentStatus, i.PaymentMethod,
         i.TransactionReference, i.PaidAt,
         b.UserID, b.GuestName, b.GuestPhone, b.BookingSource
  FROM Invoices i
  JOIN Bookings b ON b.BookingID = i.BookingID
  JOIN Users u ON u.UserID = i.CreatedBy`;

const SUMMARY_COLUMNS = `i.InvoiceID, i.BookingID, i.BillingName, i.TotalAmount, i.AmountDue,
  i.PaymentStatus, i.PaymentMethod, i.PaidAt`;

// MỘT transaction: thành công thì ghi hết, lỗi thì hủy hết
const withTransaction = async (work) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const result = await work(conn);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

const modelError = (code) => Object.assign(new Error(code), { code });

const InvoiceModel = {
  async createAndPay({ bookingId, expectedServiceTotal, invoice, rooms, paidAt }) {
    return withTransaction(async (conn) => {
      const [bookingRows] = await conn.query(
        'SELECT Status FROM Bookings WHERE BookingID = ? FOR UPDATE',
        [bookingId]
      );
      if (!bookingRows[0] || bookingRows[0].Status !== 'CheckedIn') {
        throw modelError('BOOKING_STATE');
      }

      // Tính lại tiền dịch vụ ngay trong transaction để chắc chắn khớp với hóa đơn
      const [sumRows] = await conn.query(
        `SELECT COALESCE(SUM(su.SubTotal), 0) AS Total
         FROM ServiceUsages su
         JOIN BookingDetails bd ON bd.DetailID = su.DetailID
         WHERE bd.BookingID = ?`,
        [bookingId]
      );
      if (Math.abs(Number(sumRows[0].Total) - expectedServiceTotal) > 0.005) {
        throw modelError('SERVICES_CHANGED');
      }

      for (const r of rooms) {
        await conn.query(
          `UPDATE BookingDetails
           SET ActualCheckOut = ?, RentalDays = ?, SubTotal = ?, TimeSurcharge = ?
           WHERE DetailID = ?`,
          [r.ActualCheckOut, r.RentalDays, r.SubTotal, r.TimeSurcharge, r.DetailID]
        );
      }

      const [result] = await conn.query(
        `INSERT INTO Invoices (BookingID, CreatedBy, BillingName, BillingAddress, RoomTotal,
                               TimeSurchargeTotal, ServiceTotal, DepositDeducted, TotalAmount,
                               AmountDue, PaymentStatus, PaymentMethod, TransactionReference, PaidAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Paid', ?, ?, ?)`,
        [
          bookingId,
          invoice.CreatedBy,
          invoice.BillingName,
          invoice.BillingAddress,
          invoice.RoomTotal,
          invoice.TimeSurchargeTotal,
          invoice.ServiceTotal,
          invoice.DepositDeducted,
          invoice.TotalAmount,
          invoice.AmountDue,
          invoice.PaymentMethod,
          invoice.TransactionReference,
          paidAt,
        ]
      );

      await conn.query('UPDATE Rooms SET Status = ? WHERE RoomID IN (?)', [
        'Cleaning',
        rooms.map((r) => r.RoomID),
      ]);
      await conn.query("UPDATE Bookings SET Status = 'Completed' WHERE BookingID = ?", [bookingId]);
      return result.insertId;
    });
  },

  async getById(id) {
    const [rows] = await db.query(INVOICE_SELECT + ' WHERE i.InvoiceID = ?', [id]);
    return rows[0] || null;
  },

  // Danh sách hóa đơn, lọc theo khoảng ngày thanh toán, trạng thái, đơn
  async list({ from, to, status, bookingId } = {}) {
    let sql = `SELECT ${SUMMARY_COLUMNS} FROM Invoices i WHERE 1 = 1`;
    const params = [];
    if (from && to) {
      sql += ' AND i.PaidAt >= ? AND i.PaidAt < ?';
      params.push(from, to);
    }
    if (status) {
      sql += ' AND i.PaymentStatus = ?';
      params.push(status);
    }
    if (bookingId) {
      sql += ' AND i.BookingID = ?';
      params.push(bookingId);
    }
    sql += ' ORDER BY i.PaidAt DESC, i.InvoiceID DESC';
    const [rows] = await db.query(sql, params);
    return rows;
  },

  // Hóa đơn của các đơn thuộc một tài khoản khách hàng
  async listByUser(userId) {
    const [rows] = await db.query(
      `SELECT ${SUMMARY_COLUMNS}
       FROM Invoices i
       JOIN Bookings b ON b.BookingID = i.BookingID
       WHERE b.UserID = ?
       ORDER BY i.PaidAt DESC, i.InvoiceID DESC`,
      [userId]
    );
    return rows;
  },
};

module.exports = InvoiceModel;