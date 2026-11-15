const RoomTypeModel = require('../models/roomTypeModel');

const ID_PATTERN = /^[A-Za-z0-9_-]{1,10}$/;
const MAX_PRICE = 9999999999;

const fail = (res, status, message) => res.status(status).json({ success: false, message });

// Đổi lỗi của MySQL thành thông báo
const handleError = (res, err) => {
  if (err.code === 'ER_DUP_ENTRY') {
    return fail(res, 409, 'Mã loại phòng đã tồn tại');
  }
  if (err.code === 'ER_ROW_IS_REFERENCED_2') {
    return fail(res, 409, 'Loại phòng đang có phòng sử dụng nên không thể xóa');
  }
  if (err.code === 'ER_CHECK_CONSTRAINT_VIOLATED' || err.code === 'ER_DATA_TOO_LONG') {
    return fail(res, 400, 'Dữ liệu không hợp lệ');
  }
  console.error(err);
  return fail(res, 500, 'Lỗi máy chủ');
};

// Kiểm tra và chuẩn hóa dữ liệu loại phòng
const parseFields = (source) => {
  const TypeName = String(source.TypeName ?? '').trim();
  const rawPrice = source.BasePrice;
  const BasePrice = rawPrice === '' || rawPrice === null || rawPrice === undefined ? NaN : Number(rawPrice);
  const StandardGuests = Number(source.StandardGuests);
  const MaxGuests = Number(source.MaxGuests);
  const Note = source.Note ? String(source.Note).trim() || null : null;

  if (!TypeName) return { error: 'Thiếu tên loại phòng' };
  if (TypeName.length > 50) return { error: 'Tên loại phòng tối đa 50 ký tự' };
  if (!Number.isFinite(BasePrice) || BasePrice < 0 || BasePrice > MAX_PRICE) {
    return { error: 'Đơn giá phải là số từ 0 trở lên' };
  }
  if (!Number.isInteger(StandardGuests) || !Number.isInteger(MaxGuests) || StandardGuests < 1) {
    return { error: 'Số khách phải là số nguyên từ 1 trở lên' };
  }
  if (StandardGuests > MaxGuests) {
    return { error: 'Số khách tiêu chuẩn không được lớn hơn số khách tối đa' };
  }
  if (Note && Note.length > 255) return { error: 'Ghi chú tối đa 255 ký tự' };

  return { data: { TypeName, BasePrice, StandardGuests, MaxGuests, Note } };
};

// GET /api/v1/room-types
exports.getRoomTypes = async (req, res) => {
  try {
    const types = await RoomTypeModel.getAll();
    return res.json({ success: true, data: types });
  } catch (err) {
    return handleError(res, err);
  }
};

// GET /api/v1/room-types/:id
exports.getRoomTypeById = async (req, res) => {
  try {
    if (!ID_PATTERN.test(req.params.id)) return fail(res, 400, 'Mã loại phòng không hợp lệ');
    const type = await RoomTypeModel.getById(req.params.id);
    if (!type) return fail(res, 404, 'Không tìm thấy loại phòng');
    return res.json({ success: true, data: type });
  } catch (err) {
    return handleError(res, err);
  }
};

// POST /api/v1/room-types
exports.createRoomType = async (req, res) => {
  try {
    const body = req.body || {};
    const RoomTypeID = String(body.RoomTypeID ?? '').trim();
    if (!ID_PATTERN.test(RoomTypeID)) {
      return fail(res, 400, 'Mã loại phòng gồm chữ, số, - hoặc _ (tối đa 10 ký tự)');
    }
    const { error, data } = parseFields({
      StandardGuests: 2,
      MaxGuests: 3,
      ...body,
    });
    if (error) return fail(res, 400, error);

    await RoomTypeModel.create({ RoomTypeID, ...data });
    const type = await RoomTypeModel.getById(RoomTypeID);
    return res.status(201).json({ success: true, data: type });
  } catch (err) {
    return handleError(res, err);
  }
};

// PUT /api/v1/room-types/:id
exports.updateRoomType = async (req, res) => {
  try {
    if (!ID_PATTERN.test(req.params.id)) return fail(res, 400, 'Mã loại phòng không hợp lệ');
    const existing = await RoomTypeModel.getById(req.params.id);
    if (!existing) return fail(res, 404, 'Không tìm thấy loại phòng');

    const { error, data } = parseFields({ ...existing, ...(req.body || {}) });
    if (error) return fail(res, 400, error);

    await RoomTypeModel.update(req.params.id, data);
    const type = await RoomTypeModel.getById(req.params.id);
    return res.json({ success: true, data: type });
  } catch (err) {
    return handleError(res, err);
  }
};

// DELETE /api/v1/room-types/:id
exports.deleteRoomType = async (req, res) => {
  try {
    if (!ID_PATTERN.test(req.params.id)) return fail(res, 400, 'Mã loại phòng không hợp lệ');
    const existing = await RoomTypeModel.getById(req.params.id);
    if (!existing) return fail(res, 404, 'Không tìm thấy loại phòng');

    await RoomTypeModel.remove(req.params.id);
    return res.json({ success: true, message: 'Đã xóa loại phòng' });
  } catch (err) {
    return handleError(res, err);
  }
};