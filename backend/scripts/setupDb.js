const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

const DB_NAME = process.env.DB_NAME || 'Hotel_Management';
const BASELINE_FILE = path.join(__dirname, '../../database/Hotel_Management.sql');
const MIGRATIONS_DIR = path.join(__dirname, '../../database/migrations');

const normalize = (text) => text.replace(/\r\n/g, '\n');
const sha256 = (text) => crypto.createHash('sha256').update(text).digest('hex');

async function setupDatabase({ reset = false } = {}) {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    charset: 'utf8mb4',
    multipleStatements: true,
  });

  try {
    const [dbs] = await conn.query('SHOW DATABASES');
    let found = dbs.find((d) => d.Database.toLowerCase() === DB_NAME.toLowerCase());

    if (found && reset) {
      await conn.query(`DROP DATABASE \`${found.Database}\``);
      console.log(`[db] Đã xóa database "${found.Database}".`);
      found = undefined;
    }
    if (!found) {
      await conn.query(fs.readFileSync(BASELINE_FILE, 'utf8'));
      console.log(`[db] Đã tạo database "${DB_NAME}" từ Hotel_Management.sql.`);
    }

    await conn.query(`USE \`${found ? found.Database : DB_NAME}\``);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        filename   VARCHAR(255) PRIMARY KEY,
        checksum   CHAR(64)     NOT NULL,
        applied_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB`);

    const [lockRows] = await conn.query("SELECT GET_LOCK('hotel_migrations', 30) AS ok");
    if (!lockRows[0].ok) {
      throw new Error('Không lấy được khóa migration, hãy thử lại sau.');
    }

    try {
      const [rows] = await conn.query('SELECT filename, checksum FROM schema_migrations');
      const applied = new Map(rows.map((r) => [r.filename, r.checksum]));

      const files = fs.existsSync(MIGRATIONS_DIR)
        ? fs.readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith('.sql')).sort()
        : [];

      let count = 0;
      for (const file of files) {
        const sql = normalize(fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8'));
        const checksum = sha256(sql);

        if (applied.has(file)) {
          if (applied.get(file) !== checksum) {
            console.warn(
              `[db] CẢNH BÁO: file ${file} đã bị sửa sau khi được chạy. ` +
                'Đừng sửa migration cũ, hãy tạo migration mới.'
            );
          }
          continue;
        }

        console.log(`[db] Đang chạy migration: ${file}`);
        await conn.query(sql);
        await conn.query(
          'INSERT INTO schema_migrations (filename, checksum) VALUES (?, ?)',
          [file, checksum]
        );
        count++;
      }

      console.log(
        count > 0
          ? `[db] Đã áp dụng ${count} migration mới.`
          : '[db] Database đã ở phiên bản mới nhất.'
      );
    } finally {
      await conn.query("SELECT RELEASE_LOCK('hotel_migrations')");
    }
  } finally {
    await conn.end();
  }
}

if (require.main === module) {
  setupDatabase({ reset: process.argv.includes('--reset') }).catch((err) => {
    console.error('[db] Lỗi:', err.message);
    process.exit(1);
  });
}

module.exports = { setupDatabase };