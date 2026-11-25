const { test, afterEach, mock } = require('node:test');
const assert = require('node:assert/strict');
const model = require('../../models/roomTypeModel');
const controller = require('../../controllers/roomTypeController');

afterEach(() => mock.restoreAll());

function response() {
  return { statusCode: 200, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } };
}

const validType = { RoomTypeID: 'A', TypeName: 'Loại A', BasePrice: 150000, StandardGuests: 2, MaxGuests: 3 };

test('GET room-types trả danh sách', async () => {
  mock.method(model, 'getAll', async () => [validType]);
  const res = response();
  await controller.getRoomTypes({}, res);
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body.data, [validType]);
});

test('GET room-types/:id trả 404 khi không tồn tại', async () => {
  mock.method(model, 'getById', async () => null);
  const res = response();
  await controller.getRoomTypeById({ params: { id: 'Z' } }, res);
  assert.equal(res.statusCode, 404);
});

test('POST room-types tạo loại phòng, chấp nhận giá bằng 0', async () => {
  const created = { ...validType, BasePrice: 0 };
  const create = mock.method(model, 'create', async () => 'A');
  mock.method(model, 'getById', async () => created);
  const res = response();
  await controller.createRoomType({ body: created }, res);
  assert.equal(res.statusCode, 201);
  assert.equal(res.body.data.BasePrice, 0);
  assert.equal(create.mock.callCount(), 1);
});

for (const [name, fields] of [
  ['giá âm', { BasePrice: -1 }],
  ['giá thiếu', { BasePrice: null }],
  ['sức chứa bằng 0', { MaxGuests: 0 }],
  ['sức chứa không nguyên', { MaxGuests: 2.5 }],
  ['số khách tiêu chuẩn vượt sức chứa', { StandardGuests: 4 }],
  ['tên rỗng', { TypeName: ' ' }],
]) {
  test(`POST room-types từ chối ${name}`, async () => {
    const create = mock.method(model, 'create', async () => {});
    const res = response();
    await controller.createRoomType({ body: { ...validType, ...fields } }, res);
    assert.equal(res.statusCode, 400);
    assert.equal(create.mock.callCount(), 0);
  });
}

test('POST room-types trả 409 khi mã trùng', async () => {
  mock.method(model, 'create', async () => { throw Object.assign(new Error(), { code: 'ER_DUP_ENTRY' }); });
  const res = response();
  await controller.createRoomType({ body: validType }, res);
  assert.equal(res.statusCode, 409);
});

test('PUT room-types cập nhật sức chứa', async () => {
  mock.method(model, 'getById', async () => validType);
  const update = mock.method(model, 'update', async () => true);
  const res = response();
  await controller.updateRoomType({ params: { id: 'A' }, body: { MaxGuests: 2 } }, res);
  assert.equal(res.statusCode, 200);
  assert.equal(update.mock.calls[0].arguments[1].MaxGuests, 2);
});

test('DELETE room-types trả 409 nếu loại phòng đang được sử dụng', async () => {
  mock.method(model, 'getById', async () => validType);
  mock.method(model, 'remove', async () => { throw Object.assign(new Error(), { code: 'ER_ROW_IS_REFERENCED_2' }); });
  const res = response();
  await controller.deleteRoomType({ params: { id: 'A' } }, res);
  assert.equal(res.statusCode, 409);
});
