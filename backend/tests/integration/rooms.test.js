// Tạo database riêng cho mỗi lần chạy; không dùng db:setup vì SQL gốc cố định tên database.
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const mysql = require('mysql2/promise');
const express = require('express');
const jwt = require('jsonwebtoken');

require('dotenv').config({ path: path.join(__dirname, '../../.env'), quiet: true });
const testDatabase = `hotel_test_${crypto.randomBytes(6).toString('hex')}`;
const testSecret = crypto.randomBytes(32).toString('hex');
let server;
let pool;
let url;
let adminToken;
let staffToken;
let customerToken;
let createdDatabase = false;

before(async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    multipleStatements: true,
    charset: 'utf8mb4',
  });
  try {
    // CREATE không dùng IF NOT EXISTS: không bao giờ sử dụng lại database có sẵn.
    await connection.query(`CREATE DATABASE \`${testDatabase}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    createdDatabase = true;
    console.log(`Database test được tạo: ${testDatabase}`);
    await connection.query(`USE \`${testDatabase}\``);
    const sql = fs.readFileSync(path.join(__dirname, '../../../database/Hotel_Management.sql'), 'utf8');
    const schema = sql.replace(/^CREATE DATABASE Hotel_Management\s+CHARACTER SET utf8mb4\s+COLLATE utf8mb4_unicode_ci;\s*USE Hotel_Management;\s*/i, '');
    if (schema === sql) throw new Error('Không nhận diện được phần tạo database trong file SQL; dừng để bảo vệ database thật.');
    await connection.query(schema);
    await connection.query(fs.readFileSync(path.join(__dirname, '../../../database/migrations/001_add_promotions.sql'), 'utf8'));
  } finally {
    await connection.end();
  }

  // Phải đặt trước khi nạp routes/models để pool trỏ tới database test.
  process.env.DB_NAME = testDatabase;
  process.env.JWT_SECRET = testSecret;
  pool = require('../../config/db');
  const [[admin]] = await pool.query("SELECT UserID FROM Users WHERE Role = 'Admin' AND Status = 'Active' LIMIT 1");
  assert.ok(admin, 'Database mẫu phải có tài khoản Admin hoạt động');
  const [staff] = await pool.query("INSERT INTO Users (Username, PasswordHash, Role, FullName) VALUES ('test_staff', 'unused', 'Staff', 'Test Staff')");
  const [customer] = await pool.query("INSERT INTO Users (Username, PasswordHash, Role, FullName) VALUES ('test_customer', 'unused', 'Customer', 'Test Customer')");
  const token = (id) => jwt.sign({ id }, testSecret);
  adminToken = token(admin.UserID);
  staffToken = token(staff.insertId);
  customerToken = token(customer.insertId);

  const app = express();
  app.use(express.json());
  app.use('/api/v1/rooms', require('../../routes/roomRoutes'));
  app.use('/api/v1/room-types', require('../../routes/roomTypeRoutes'));
  server = await new Promise((resolve, reject) => {
    const instance = app.listen(0, '127.0.0.1', () => resolve(instance));
    instance.on('error', reject);
  });
  url = `http://127.0.0.1:${server.address().port}/api/v1`;
});

after(async () => {
  try {
    if (server) await new Promise((resolve, reject) => server.close((err) => err ? reject(err) : resolve()));
  } finally {
    try {
      if (pool) await pool.end();
    } finally {
      if (createdDatabase) {
        if (!/^hotel_test_[0-9a-f]{12}$/.test(testDatabase)) throw new Error('Tên database test không hợp lệ; từ chối xóa');
        const connection = await mysql.createConnection({
          host: process.env.DB_HOST || 'localhost',
          port: Number(process.env.DB_PORT || 3306),
          user: process.env.DB_USER || 'root',
          password: process.env.DB_PASSWORD,
        });
        try {
          await connection.query(`DROP DATABASE \`${testDatabase}\``);
          console.log(`Đã xóa database test: ${testDatabase}`);
        } finally {
          await connection.end();
        }
      }
    }
  }
});

async function request(method, route, { body, token } = {}) {
  const response = await fetch(url + route, {
    method,
    headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return { status: response.status, body: await response.json() };
}

test('CRUD hạng phòng và phòng, lọc, trạng thái và ràng buộc database', async () => {
  const type = { RoomTypeID: 'TEST', TypeName: 'Integration Test', BasePrice: 150000, StandardGuests: 2, MaxGuests: 3 };
  let result = await request('POST', '/room-types', { token: adminToken, body: type });
  assert.equal(result.status, 201);
  result = await request('POST', '/room-types', { token: adminToken, body: type });
  assert.equal(result.status, 409);
  result = await request('GET', '/room-types/TEST');
  assert.equal(result.status, 200);
  assert.equal(Number(result.body.data.BasePrice), 150000);
  result = await request('PUT', '/room-types/TEST', { token: adminToken, body: { MaxGuests: 2, BasePrice: 200000 } });
  assert.equal(result.status, 200);
  assert.equal(result.body.data.MaxGuests, 2);
  result = await request('GET', '/room-types/TEST');
  assert.equal(Number(result.body.data.BasePrice), 200000);

  result = await request('POST', '/rooms', { token: adminToken, body: { RoomNumber: 'T101', RoomTypeID: 'TEST' } });
  assert.equal(result.status, 201);
  const roomId = result.body.data.RoomID;
  result = await request('POST', '/rooms', { token: adminToken, body: { RoomNumber: 'T101', RoomTypeID: 'TEST' } });
  assert.equal(result.status, 409);
  result = await request('GET', '/rooms?roomTypeId=TEST');
  assert.equal(result.body.data.filter((item) => item.RoomNumber === 'T101').length, 1);
  result = await request('DELETE', '/room-types/TEST', { token: adminToken });
  assert.equal(result.status, 409);
  result = await request('PATCH', `/rooms/${roomId}/status`, { token: staffToken, body: { status: 'Cleaning' } });
  assert.equal(result.status, 200);
  result = await request('GET', '/rooms?roomTypeId=TEST&status=Cleaning');
  assert.equal(result.status, 200);
  assert.deepEqual(result.body.data.map((item) => item.RoomID), [roomId]);
  result = await request('PUT', `/rooms/${roomId}`, { token: adminToken, body: { RoomNumber: 'T102', RoomTypeID: 'TEST' } });
  assert.equal(result.status, 200);
  result = await request('GET', `/rooms/${roomId}`);
  assert.equal(result.body.data.RoomNumber, 'T102');
  result = await request('DELETE', `/rooms/${roomId}`, { token: adminToken });
  assert.equal(result.status, 200);
  result = await request('DELETE', '/room-types/TEST', { token: adminToken });
  assert.equal(result.status, 200);
});

test('Phân quyền và dữ liệu không hợp lệ', async () => {
  const type = { RoomTypeID: 'TEST2', TypeName: 'Test', BasePrice: 100, StandardGuests: 2, MaxGuests: 3 };
  assert.equal((await request('POST', '/room-types', { body: type })).status, 401);
  assert.equal((await request('POST', '/room-types', { token: customerToken, body: type })).status, 403);
  assert.equal((await request('POST', '/room-types', { token: adminToken, body: { ...type, MaxGuests: 1 } })).status, 400);
  assert.equal((await request('GET', '/rooms?status=Invalid')).status, 400);
  assert.equal((await request('PATCH', '/rooms/1/status', { token: customerToken, body: { status: 'Cleaning' } })).status, 403);
  assert.equal((await request('GET', '/rooms/999999')).status, 404);
});

test('roomService dùng API thật cho vòng đời phòng và quyền lễ tân', async (t) => {
  const service = await import('../../../frontend/src/services/roomService.js');
  const { default: client } = await import('../../../frontend/src/services/apiClient.js');
  const previousURL = client.defaults.baseURL;
  const previousStorage = Object.getOwnPropertyDescriptor(globalThis, 'sessionStorage');
  let token = adminToken;
  Object.defineProperty(globalThis, 'sessionStorage', {
    configurable: true, value: { getItem: (key) => key === 'roomToken' ? token : null },
  });
  client.defaults.baseURL = url;
  t.after(() => {
    client.defaults.baseURL = previousURL;
    if (previousStorage) Object.defineProperty(globalThis, 'sessionStorage', previousStorage);
    else delete globalThis.sessionStorage;
  });

  const { data: types } = await service.getRoomTypesAPI();
  const room = { RoomNumber: 'FLOW01', RoomTypeID: types[0].RoomTypeID, Note: 'test' };
  const { data: created } = await service.createRoomAPI(room);
  assert.equal(created.Status, 'Available');
  const id = created.RoomID;
  await assert.rejects(service.createRoomAPI(room), (err) => err.response?.status === 409);
  await service.updateRoomAPI(id, { ...room, Note: 'updated' });
  assert.equal((await service.getRoomAPI(id)).data.Note, 'updated');

  token = staffToken;
  await assert.rejects(service.deleteRoomAPI(id), (err) => err.response?.status === 403);
  for (const status of ['Occupied', 'Cleaning', 'Maintenance', 'Available']) {
    await service.updateRoomStatusAPI(id, status);
    const { data } = await service.getRoomsAPI({ status, roomTypeId: room.RoomTypeID });
    assert.ok(data.some((entry) => entry.RoomID === id));
    assert.ok(data.every((entry) => entry.Status === status && entry.RoomTypeID === room.RoomTypeID));
  }

  token = adminToken;
  await service.deleteRoomAPI(id);
  await assert.rejects(service.getRoomAPI(id), (err) => err.response?.status === 404);
});
