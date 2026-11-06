const db = require('../config/db');

const SettingModel = {
  async getAll() {
    const [rows] = await db.query(
      'SELECT SettingKey, SettingValue, Description, UpdatedAt FROM Settings ORDER BY SettingKey'
    );
    return rows;
  },

  async getMap() {
    const [rows] = await db.query('SELECT SettingKey, SettingValue FROM Settings');
    return Object.fromEntries(rows.map((r) => [r.SettingKey, r.SettingValue]));
  },

  async update(key, value) {
    const [result] = await db.query(
      'UPDATE Settings SET SettingValue = ?, UpdatedAt = CURRENT_TIMESTAMP WHERE SettingKey = ?',
      [value, key]
    );
    return result.affectedRows > 0;
  },
};

module.exports = SettingModel;