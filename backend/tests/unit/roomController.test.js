const { test, afterEach, mock } = require('node:test');
const assert = require('node:assert/strict');
const model = require('../../models/roomModel');
const controller = require('../../controllers/roomController');

afterEach(() => mock.restoreAll());

function response() {
  return { statusCode: 200, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } };
}

const room = { RoomID: 1, RoomNumber: '101', RoomTypeID: 'A', Status: 'Available' };

test('GET rooms chuyển cả hai điều kiện lọc cho model', async () => {
  const getAll = mock.method(model, 'getAll', async () => [room]);
  const res = response();
  await controller.getRooms({ query: { status: 'Available', roomTypeId: 'A' } }, res);
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body.data, [room]);
  assert.deepEqual(getAll.mock.calls[0].arguments[0], { status: 'Available', roomTypeId: 'A' });
});

test('GET rooms từ chối trạng thái lọc không hợp lệ', async () => {
  const res = response();
  await controller.getRooms({ query: { status: 'invalid' } }, res);
  assert.equal(res.statusCode, 400);
});

test('GET rooms/:id trả 404 khi không tồn tại', async () => {
  mock.method(model, 'getById', async () => null);
  const res = response();
  await controller.getRoomById({ params: { id: '10' } }, res);
  assert.equal(res.statusCode, 404);
});

test('POST rooms tạo phòng với trạng thái mặc định Available', async () => {
  const create = mock.method(model, 'create', async () => 1);
  mock.method(model, 'getById', async () => room);
  const res = response();
  await controller.createRoom({ body: { RoomNumber: '101', RoomTypeID: 'A' } }, res);
  assert.equal(res.statusCode, 201);
  assert.equal(create.mock.calls[0].arguments[0].Status, 'Available');
});

test('POST rooms từ chối số phòng bị trùng', async () => {
  mock.method(model, 'create', async () => { throw Object.assign(new Error(), { code: 'ER_DUP_ENTRY' }); });
  const res = response();
  await controller.createRoom({ body: room }, res);
  assert.equal(res.statusCode, 409);
});

test('POST rooms từ chối loại phòng không tồn tại', async () => {
  mock.method(model, 'create', async () => { throw Object.assign(new Error(), { code: 'ER_NO_REFERENCED_ROW_2' }); });
  const res = response();
  await controller.createRoom({ body: room }, res);
  assert.equal(res.statusCode, 400);
});

test('PUT rooms cập nhật thông tin phòng', async () => {
  mock.method(model, 'getById', async () => room);
  const update = mock.method(model, 'update', async () => true);
  const res = response();
  await controller.updateRoom({ params: { id: '1' }, body: { RoomNumber: '102', RoomTypeID: 'A' } }, res);
  assert.equal(res.statusCode, 200);
  assert.equal(update.mock.calls[0].arguments[1].RoomNumber, '102');
});

for (const status of ['Available', 'Occupied', 'Cleaning', 'Maintenance']) {
  test(`PATCH rooms/:id/status chấp nhận ${status}`, async () => {
    mock.method(model, 'getById', async () => ({ ...room, Status: status }));
    const update = mock.method(model, 'updateStatus', async () => true);
    const res = response();
    await controller.updateRoomStatus({ params: { id: '1' }, body: { status } }, res);
    assert.equal(res.statusCode, 200);
    assert.equal(update.mock.calls[0].arguments[1], status);
  });
}

test('PATCH rooms/:id/status từ chối trạng thái không hợp lệ', async () => {
  const res = response();
  await controller.updateRoomStatus({ params: { id: '1' }, body: { status: 'Unknown' } }, res);
  assert.equal(res.statusCode, 400);
});

test('DELETE rooms trả 409 nếu phòng có lịch sử đặt', async () => {
  mock.method(model, 'getById', async () => room);
  mock.method(model, 'remove', async () => { throw Object.assign(new Error(), { code: 'ER_ROW_IS_REFERENCED_2' }); });
  const res = response();
  await controller.deleteRoom({ params: { id: '1' } }, res);
  assert.equal(res.statusCode, 409);
});
