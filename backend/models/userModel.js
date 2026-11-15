const db = require('../config/db');

const PUBLIC_COLUMNS = `UserID, Username, Role, FullName, IdentityNumber,
  Phone, Email, Status, Note, CreatedAt`;

const UserModel = {
  async findAll({ role, status, search } = {}) {
    let sql = `SELECT ${PUBLIC_COLUMNS} FROM Users WHERE 1 = 1`;
    const params = [];
    if (role) {
      sql += ' AND Role = ?';
      params.push(role);
    }
    if (status) {
      sql += ' AND Status = ?';
      params.push(status);
    }
    if (search) {
      const like = `%${search.replace(/[\\%_]/g, '\\$&')}%`;
      sql += ` AND (Username LIKE ? OR FullName LIKE ? OR Phone LIKE ?
                    OR Email LIKE ? OR IdentityNumber LIKE ?)`;
      params.push(like, like, like, like, like);
    }
    sql += ' ORDER BY UserID';
    const [rows] = await db.query(sql, params);
    return rows;
  },

  async findByUsername(username) {
    const [rows] = await db.query(
      `SELECT ${PUBLIC_COLUMNS}, PasswordHash FROM Users WHERE Username = ?`,
      [username]
    );
    return rows[0] || null;
  },

  async findById(id) {
    const [rows] = await db.query(`SELECT ${PUBLIC_COLUMNS} FROM Users WHERE UserID = ?`, [id]);
    return rows[0] || null;
  },

  // Tạo tài khoản mới
  async create({
    Username,
    PasswordHash,
    Role = 'Customer',
    FullName,
    IdentityNumber = null,
    Phone = null,
    Email = null,
    Note = null,
  }) {
    const [result] = await db.query(
      `INSERT INTO Users (Username, PasswordHash, Role, FullName, IdentityNumber, Phone, Email, Note)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [Username, PasswordHash, Role, FullName, IdentityNumber, Phone, Email, Note]
    );
    return result.insertId;
  },

  // Sửa hồ sơ
  async updateProfile(id, { FullName, IdentityNumber, Phone, Email, Note }) {
    const [result] = await db.query(
      `UPDATE Users
       SET FullName = ?, IdentityNumber = ?, Phone = ?, Email = ?, Note = ?
       WHERE UserID = ?`,
      [FullName, IdentityNumber, Phone, Email, Note, id]
    );
    return result.affectedRows > 0;
  },

  async updateRole(id, role) {
    const [result] = await db.query('UPDATE Users SET Role = ? WHERE UserID = ?', [role, id]);
    return result.affectedRows > 0;
  },

  // Khóa / mở khóa / ngừng hoạt động tài khoản
  async updateStatus(id, status) {
    const [result] = await db.query('UPDATE Users SET Status = ? WHERE UserID = ?', [status, id]);
    return result.affectedRows > 0;
  },

  async updatePassword(id, passwordHash) {
    const [result] = await db.query('UPDATE Users SET PasswordHash = ? WHERE UserID = ?', [
      passwordHash,
      id,
    ]);
    return result.affectedRows > 0;
  },
};

module.exports = UserModel;