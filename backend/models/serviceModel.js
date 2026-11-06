const db = require('../config/db');

const COLUMNS = 'ServiceID, ServiceName, Unit, Price, Note';

const ServiceModel = {
  // Danh sách dịch vụ, có thể tìm theo tên
  async getAll({ search } = {}) {
    let sql = `SELECT ${COLUMNS} FROM Services WHERE 1 = 1`;
    const params = [];
    if (search) {
      sql += ' AND ServiceName LIKE ?';
      params.push(`%${search.replace(/[\\%_]/g, '\\$&')}%`);
    }
    sql += ' ORDER BY ServiceID';
    const [rows] = await db.query(sql, params);
    return rows;
  },

  async getById(id) {
    const [rows] = await db.query(`SELECT ${COLUMNS} FROM Services WHERE ServiceID = ?`, [id]);
    return rows[0] || null;
  },

  // Thêm dịch vụ mới
  async create({ ServiceName, Unit, Price, Note = null }) {
    const [result] = await db.query(
      'INSERT INTO Services (ServiceName, Unit, Price, Note) VALUES (?, ?, ?, ?)',
      [ServiceName, Unit, Price, Note]
    );
    return result.insertId;
  },

  // Sửa dịch vụ
  async update(id, { ServiceName, Unit, Price, Note = null }) {
    const [result] = await db.query(
      'UPDATE Services SET ServiceName = ?, Unit = ?, Price = ?, Note = ? WHERE ServiceID = ?',
      [ServiceName, Unit, Price, Note, id]
    );
    return result.affectedRows > 0;
  },

  // Xóa dịch vụ
  async remove(id) {
    const [result] = await db.query('DELETE FROM Services WHERE ServiceID = ?', [id]);
    return result.affectedRows > 0;
  },
};

module.exports = ServiceModel;