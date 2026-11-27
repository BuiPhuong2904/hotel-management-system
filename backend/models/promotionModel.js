const db = require('../config/db');

const COLUMNS = `p.PromoID, p.PromoCode, p.DiscountPercent, p.MaxDiscountAmount,
  p.StartDate, p.EndDate, p.Status, p.Note, p.UsageLimit`;

const PromotionModel = {
  async getAll() {
    const [rows] = await db.query(
      `SELECT ${COLUMNS},
              (SELECT COUNT(*) FROM Bookings b WHERE b.PromoID = p.PromoID) AS UsedCount
       FROM Promotions p
       ORDER BY p.PromoID DESC`
    );
    return rows;
  },

  async getById(id) {
    const [rows] = await db.query(`SELECT ${COLUMNS} FROM Promotions p WHERE p.PromoID = ?`, [id]);
    return rows[0] || null;
  },

  // Tìm theo mã nhập (đã viết hoa). Không có thì trả về null.
  async getByCode(code) {
    const [rows] = await db.query(`SELECT ${COLUMNS} FROM Promotions p WHERE p.PromoCode = ?`, [code]);
    return rows[0] || null;
  },

  async create({ PromoCode, DiscountPercent, MaxDiscountAmount, StartDate, EndDate, Status, Note, UsageLimit }) {
    const [result] = await db.query(
      `INSERT INTO Promotions (PromoCode, DiscountPercent, MaxDiscountAmount, StartDate, EndDate, Status, Note, UsageLimit)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [PromoCode, DiscountPercent, MaxDiscountAmount, StartDate, EndDate, Status, Note, UsageLimit ?? null]
    );
    return result.insertId;
  },

  async update(id, { PromoCode, DiscountPercent, MaxDiscountAmount, StartDate, EndDate, Status, Note, UsageLimit }) {
    const [result] = await db.query(
      `UPDATE Promotions
       SET PromoCode = ?, DiscountPercent = ?, MaxDiscountAmount = ?, StartDate = ?, EndDate = ?,
           Status = ?, Note = ?, UsageLimit = IF(?, ?, UsageLimit)
       WHERE PromoID = ?`,
      [PromoCode, DiscountPercent, MaxDiscountAmount, StartDate, EndDate, Status, Note, UsageLimit !== undefined, UsageLimit ?? null, id]
    );
    return result.affectedRows > 0;
  },

  // Số đơn CHƯA hoàn tất đang dùng mã này
  async countOpenBookings(id) {
    const [rows] = await db.query(
      `SELECT COUNT(*) AS n FROM Bookings
       WHERE PromoID = ? AND Status IN ('Pending', 'Confirmed', 'CheckedIn')`,
      [id]
    );
    return Number(rows[0].n);
  },

  // Xóa mã
  async remove(id) {
    const [result] = await db.query('DELETE FROM Promotions WHERE PromoID = ?', [id]);
    return result.affectedRows > 0;
  },
};

module.exports = PromotionModel;