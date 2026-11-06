const db = require('../config/db');

// Kèm số phòng thuộc từng loại (RoomCount) để Admin biết loại nào đang được dùng
const SELECT_TYPE = `
  SELECT rt.RoomTypeID, rt.TypeName, rt.BasePrice, rt.StandardGuests,
         rt.MaxGuests, rt.Note, COUNT(r.RoomID) AS RoomCount
  FROM RoomTypes rt
  LEFT JOIN Rooms r ON r.RoomTypeID = rt.RoomTypeID`;

const GROUP_BY = `
  GROUP BY rt.RoomTypeID, rt.TypeName, rt.BasePrice, rt.StandardGuests,
           rt.MaxGuests, rt.Note`;

const RoomTypeModel = {
  // Danh sách tất cả loại phòng
  async getAll() {
    const [rows] = await db.query(SELECT_TYPE + GROUP_BY + ' ORDER BY rt.RoomTypeID');
    return rows;
  },

  // Một loại phòng theo mã (ví dụ 'A')
  async getById(id) {
    const [rows] = await db.query(SELECT_TYPE + ' WHERE rt.RoomTypeID = ?' + GROUP_BY, [id]);
    return rows[0] || null;
  },

  // Thêm loại phòng mới
  async create({ RoomTypeID, TypeName, BasePrice, StandardGuests, MaxGuests, Note = null }) {
    await db.query(
      `INSERT INTO RoomTypes (RoomTypeID, TypeName, BasePrice, StandardGuests, MaxGuests, Note)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [RoomTypeID, TypeName, BasePrice, StandardGuests, MaxGuests, Note]
    );
    return RoomTypeID;
  },

  // Sửa loại phòng
  async update(id, { TypeName, BasePrice, StandardGuests, MaxGuests, Note = null }) {
    const [result] = await db.query(
      `UPDATE RoomTypes
       SET TypeName = ?, BasePrice = ?, StandardGuests = ?, MaxGuests = ?, Note = ?
       WHERE RoomTypeID = ?`,
      [TypeName, BasePrice, StandardGuests, MaxGuests, Note, id]
    );
    return result.affectedRows > 0;
  },

  // Xóa loại phòng
  async remove(id) {
    const [result] = await db.query('DELETE FROM RoomTypes WHERE RoomTypeID = ?', [id]);
    return result.affectedRows > 0;
  },
};

module.exports = RoomTypeModel;