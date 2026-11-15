const RoomModel = require('../models/roomModel');

const ROOM_STATUSES = ['Available', 'Occupied', 'Cleaning', 'Maintenance'];

const DEFAULT_CHECK_IN_TIME = '14:00:00';
const DEFAULT_CHECK_OUT_TIME = '12:00:00';

const isValidId = (value) => /^\d+$/.test(String(value)) && Number(value) > 0;

const fail = (res, status, message) => res.status(status).json({ success: false, message });

// Đổi lỗi của MySQL thành thông báo
const handleError = (res, err) => {
  if (err.code === 'ER_DUP_ENTRY') {
    return fail(res, 409, 'Số phòng đã tồn tại');
  }
  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return fail(res, 400, 'Loại phòng không tồn tại');
  }
  if (err.code === 'ER_ROW_IS_REFERENCED_2') {
    return fail(res, 409, 'Phòng đã có lịch sử đặt/thuê nên không thể xóa');
  }
  console.error(err);
  return fail(res, 500, 'Lỗi máy chủ');
};

// "2026-11-08" -> "2026-11-08 14:00:00"; chuỗi sai định dạng -> null
const toDateTime = (value, defaultTime) => {
  if (typeof value !== 'string' || !value.trim()) return null;
  let text = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) text += ` ${defaultTime}`;
  return Number.isNaN(new Date(text.replace(' ', 'T')).getTime()) ? null : text;
};
const toTime = (text) => new Date(text.replace(' ', 'T')).getTime();

// GET /api/v1/rooms?status=Available&roomTypeId=A
exports.getRooms = async (req, res) => {
  try {
    const { status, roomTypeId } = req.query;
    if (status && !ROOM_STATUSES.includes(status)) {
      return fail(res, 400, 'Trạng thái không hợp lệ');
    }
    const rooms = await RoomModel.getAll({ status, roomTypeId });
    return res.json({ success: true, data: rooms });
  } catch (err) {
    return handleError(res, err);
  }
};

// GET /api/v1/rooms/available?checkIn=2026-11-08&checkOut=2026-11-09
exports.getAvailableRooms = async (req, res) => {
  try {
    const checkIn = toDateTime(req.query.checkIn, DEFAULT_CHECK_IN_TIME);
    const checkOut = toDateTime(req.query.checkOut, DEFAULT_CHECK_OUT_TIME);
    if (!checkIn || !checkOut) {
      return fail(res, 400, 'Cần truyền checkIn và checkOut hợp lệ (dạng YYYY-MM-DD)');
    }
    if (toTime(checkOut) <= toTime(checkIn)) {
      return fail(res, 400, 'Ngày trả phòng phải sau ngày nhận phòng');
    }
    const rooms = await RoomModel.findAvailable(checkIn, checkOut);
    return res.json({ success: true, data: rooms });
  } catch (err) {
    return handleError(res, err);
  }
};

// GET /api/v1/rooms/:id
exports.getRoomById = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return fail(res, 400, 'Mã phòng không hợp lệ');
    const room = await RoomModel.getById(req.params.id);
    if (!room) return fail(res, 404, 'Không tìm thấy phòng');
    return res.json({ success: true, data: room });
  } catch (err) {
    return handleError(res, err);
  }
};

// POST /api/v1/rooms   body: { RoomNumber, RoomTypeID, Status?, Note? }
exports.createRoom = async (req, res) => {
  try {
    const body = req.body || {};
    const RoomNumber = String(body.RoomNumber || '').trim();
    const RoomTypeID = String(body.RoomTypeID || '').trim();
    const Status = body.Status || 'Available';
    const Note = body.Note ? String(body.Note).trim() : null;

    if (!RoomNumber || !RoomTypeID) return fail(res, 400, 'Thiếu số phòng hoặc loại phòng');
    if (RoomNumber.length > 10) return fail(res, 400, 'Số phòng tối đa 10 ký tự');
    if (!ROOM_STATUSES.includes(Status)) return fail(res, 400, 'Trạng thái không hợp lệ');

    const id = await RoomModel.create({ RoomNumber, RoomTypeID, Status, Note });
    const room = await RoomModel.getById(id);
    return res.status(201).json({ success: true, data: room });
  } catch (err) {
    return handleError(res, err);
  }
};

// PUT /api/v1/rooms/:id   body: { RoomNumber, RoomTypeID, Note? }
exports.updateRoom = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return fail(res, 400, 'Mã phòng không hợp lệ');
    const existing = await RoomModel.getById(req.params.id);
    if (!existing) return fail(res, 404, 'Không tìm thấy phòng');

    const body = req.body || {};
    const RoomNumber = String(body.RoomNumber || '').trim();
    const RoomTypeID = String(body.RoomTypeID || '').trim();
    const Note = body.Note !== undefined ? String(body.Note || '').trim() || null : existing.Note;

    if (!RoomNumber || !RoomTypeID) return fail(res, 400, 'Thiếu số phòng hoặc loại phòng');
    if (RoomNumber.length > 10) return fail(res, 400, 'Số phòng tối đa 10 ký tự');

    await RoomModel.update(req.params.id, { RoomNumber, RoomTypeID, Note });
    const room = await RoomModel.getById(req.params.id);
    return res.json({ success: true, data: room });
  } catch (err) {
    return handleError(res, err);
  }
};

// PATCH /api/v1/rooms/:id/status   body: { status }
exports.updateRoomStatus = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return fail(res, 400, 'Mã phòng không hợp lệ');
    const status = (req.body || {}).status;
    if (!ROOM_STATUSES.includes(status)) {
      return fail(res, 400, `Trạng thái phải là một trong: ${ROOM_STATUSES.join(', ')}`);
    }
    const existing = await RoomModel.getById(req.params.id);
    if (!existing) return fail(res, 404, 'Không tìm thấy phòng');

    await RoomModel.updateStatus(req.params.id, status);
    const room = await RoomModel.getById(req.params.id);
    return res.json({ success: true, data: room });
  } catch (err) {
    return handleError(res, err);
  }
};

// DELETE /api/v1/rooms/:id
exports.deleteRoom = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return fail(res, 400, 'Mã phòng không hợp lệ');
    const existing = await RoomModel.getById(req.params.id);
    if (!existing) return fail(res, 404, 'Không tìm thấy phòng');

    await RoomModel.remove(req.params.id);
    return res.json({ success: true, message: 'Đã xóa phòng' });
  } catch (err) {
    return handleError(res, err);
  }
};