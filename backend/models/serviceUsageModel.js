const db = require('../config/db');

const SELECT_USAGE = `
  SELECT su.UsageID, su.DetailID, su.ServiceID, s.ServiceName, s.Unit, su.Quantity,
         su.PriceAtUsage, su.SubTotal, su.RecordedAt,
         bd.BookingID, bd.RoomID, r.RoomNumber, b.Status AS BookingStatus
  FROM ServiceUsages su
  JOIN Services s ON s.ServiceID = su.ServiceID
  JOIN BookingDetails bd ON bd.DetailID = su.DetailID
  JOIN Rooms r ON r.RoomID = bd.RoomID
  JOIN Bookings b ON b.BookingID = bd.BookingID`;

const ServiceUsageModel = {
  // Lượt thuê đang diễn ra của một phòng
  async findActiveDetailByRoom(roomId) {
    const [rows] = await db.query(
      `SELECT bd.DetailID, bd.BookingID, bd.RoomID
       FROM BookingDetails bd
       JOIN Bookings b ON b.BookingID = bd.BookingID
       WHERE bd.RoomID = ?
         AND b.Status = 'CheckedIn'
         AND bd.ActualCheckIn IS NOT NULL
         AND bd.ActualCheckOut IS NULL
       LIMIT 1`,
      [roomId]
    );
    return rows[0] || null;
  },

  // Đơn đã lập hóa đơn
  async isInvoiced(bookingId) {
    const [rows] = await db.query(
      "SELECT InvoiceID FROM Invoices WHERE BookingID = ? AND PaymentStatus <> 'Cancelled' LIMIT 1",
      [bookingId]
    );
    return rows.length > 0;
  },

  // Ghi nhận dịch vụ
  async create({ DetailID, ServiceID, Quantity, PriceAtUsage, SubTotal }) {
    const [result] = await db.query(
      `INSERT INTO ServiceUsages (DetailID, ServiceID, Quantity, PriceAtUsage, SubTotal)
       VALUES (?, ?, ?, ?, ?)`,
      [DetailID, ServiceID, Quantity, PriceAtUsage, SubTotal]
    );
    return result.insertId;
  },

  async getById(id) {
    const [rows] = await db.query(SELECT_USAGE + ' WHERE su.UsageID = ?', [id]);
    return rows[0] || null;
  },

  // Tất cả dịch vụ đã dùng của một đơn
  async listByBooking(bookingId) {
    const [rows] = await db.query(
      SELECT_USAGE + ' WHERE bd.BookingID = ? ORDER BY su.RecordedAt, su.UsageID',
      [bookingId]
    );
    return rows;
  },

  // Sửa số lượng
  async updateQuantity(id, quantity, subTotal) {
    const [result] = await db.query(
      'UPDATE ServiceUsages SET Quantity = ?, SubTotal = ? WHERE UsageID = ?',
      [quantity, subTotal, id]
    );
    return result.affectedRows > 0;
  },

  async remove(id) {
    const [result] = await db.query('DELETE FROM ServiceUsages WHERE UsageID = ?', [id]);
    return result.affectedRows > 0;
  },
};

module.exports = ServiceUsageModel;