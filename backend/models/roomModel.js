const db = require('../config/db');

const SELECT_ROOM = `
  SELECT r.RoomID, r.RoomNumber, r.RoomTypeID, rt.TypeName, rt.BasePrice,
         rt.StandardGuests, rt.MaxGuests, r.Status, r.Note
  FROM Rooms r
  JOIN RoomTypes rt ON rt.RoomTypeID = r.RoomTypeID`;

const RoomModel = {
  // Danh sách phòng, có thể lọc theo trạng thái và/hoặc loại phòng
  async getAll({ status, roomTypeId } = {}) {
    let sql = SELECT_ROOM + ' WHERE 1 = 1';
    const params = [];
    if (status) {
      sql += ' AND r.Status = ?';
      params.push(status);
    }
    if (roomTypeId) {
      sql += ' AND r.RoomTypeID = ?';
      params.push(roomTypeId);
    }
    sql += ' ORDER BY r.RoomNumber';
    const [rows] = await db.query(sql, params);
    return rows;
  },

  // Một phòng theo RoomID
  async getById(id) {
    const [rows] = await db.query(SELECT_ROOM + ' WHERE r.RoomID = ?', [id]);
    return rows[0] || null;
  },

  // Thêm phòng mới
  async create({ RoomNumber, RoomTypeID, Status = 'Available', Note = null }) {
    const [result] = await db.query(
      'INSERT INTO Rooms (RoomNumber, RoomTypeID, Status, Note) VALUES (?, ?, ?, ?)',
      [RoomNumber, RoomTypeID, Status, Note]
    );
    return result.insertId;
  },

  // Sửa thông tin phòng
  async update(id, { RoomNumber, RoomTypeID, Note }) {
    const [result] = await db.query(
      'UPDATE Rooms SET RoomNumber = ?, RoomTypeID = ?, Note = ? WHERE RoomID = ?',
      [RoomNumber, RoomTypeID, Note ?? null, id]
    );
    return result.affectedRows > 0;
  },

  // Chỉ đổi trạng thái phòng (Lễ tân dùng)
  async updateStatus(id, status) {
    const [result] = await db.query('UPDATE Rooms SET Status = ? WHERE RoomID = ?', [
      status,
      id,
    ]);
    return result.affectedRows > 0;
  },

  // Xóa phòng
  async remove(id) {
    const [result] = await db.query('DELETE FROM Rooms WHERE RoomID = ?', [id]);
    return result.affectedRows > 0;
  },

  // Phòng còn trống trong khoảng (checkIn, checkOut)
  async findAvailable(checkIn, checkOut) {
    const [rows] = await db.query(
      SELECT_ROOM +
        `
      WHERE r.Status <> 'Maintenance'
        AND NOT EXISTS (
          SELECT 1
          FROM BookingDetails bd
          JOIN Bookings b ON b.BookingID = bd.BookingID
          WHERE bd.RoomID = r.RoomID
            AND b.Status IN ('Confirmed', 'CheckedIn')
            AND b.ExpectedCheckIn < ?
            AND b.ExpectedCheckOut > ?
        )
      ORDER BY r.RoomNumber`,
      [checkOut, checkIn]
    );
    return rows;
  },
};

module.exports = RoomModel;