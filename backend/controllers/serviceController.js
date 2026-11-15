const ServiceModel = require('../models/serviceModel');

const MAX_PRICE = 9999999999;

const fail = (res, status, message) => res.status(status).json({ success: false, message });
const isValidId = (value) => /^\d+$/.test(String(value)) && Number(value) > 0;

// Đổi lỗi của MySQL thành thông báo
const handleError = (res, err) => {
  if (err.code === 'ER_DUP_ENTRY') {
    return fail(res, 409, 'Tên dịch vụ đã tồn tại');
  }
  if (err.code === 'ER_ROW_IS_REFERENCED_2') {
    return fail(res, 409, 'Dịch vụ đã được sử dụng trong các phiếu thuê nên không thể xóa');
  }
  if (err.code === 'ER_CHECK_CONSTRAINT_VIOLATED' || err.code === 'ER_DATA_TOO_LONG') {
    return fail(res, 400, 'Dữ liệu không hợp lệ');
  }
  console.error(err);
  return fail(res, 500, 'Lỗi máy chủ');
};

// Kiểm tra và chuẩn hóa dữ liệu dịch vụ
const parseFields = (source) => {
  const ServiceName = String(source.ServiceName ?? '').trim();
  const Unit = String(source.Unit ?? '').trim();
  const rawPrice = source.Price;
  const Price =
    rawPrice === '' || rawPrice === null || rawPrice === undefined ? NaN : Number(rawPrice);
  const Note = source.Note ? String(source.Note).trim() || null : null;

  if (!ServiceName) return { error: 'Thiếu tên dịch vụ' };
  if (ServiceName.length > 100) return { error: 'Tên dịch vụ tối đa 100 ký tự' };
  if (!Unit) return { error: 'Thiếu đơn vị tính' };
  if (Unit.length > 20) return { error: 'Đơn vị tính tối đa 20 ký tự' };
  if (!Number.isFinite(Price) || Price < 0 || Price > MAX_PRICE) {
    return { error: 'Đơn giá phải là số từ 0 trở lên' };
  }
  if (Note && Note.length > 255) return { error: 'Ghi chú tối đa 255 ký tự' };

  return { data: { ServiceName, Unit, Price, Note } };
};

// GET /api/v1/services?search=bia
exports.getServices = async (req, res) => {
  try {
    const search = req.query.search ? String(req.query.search).trim() : undefined;
    const services = await ServiceModel.getAll({ search });
    return res.json({ success: true, data: services });
  } catch (err) {
    return handleError(res, err);
  }
};

// GET /api/v1/services/:id
exports.getServiceById = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return fail(res, 400, 'Mã dịch vụ không hợp lệ');
    const service = await ServiceModel.getById(req.params.id);
    if (!service) return fail(res, 404, 'Không tìm thấy dịch vụ');
    return res.json({ success: true, data: service });
  } catch (err) {
    return handleError(res, err);
  }
};

// POST /api/v1/services   body: { ServiceName, Unit, Price, Note? }
exports.createService = async (req, res) => {
  try {
    const { error, data } = parseFields(req.body || {});
    if (error) return fail(res, 400, error);

    const id = await ServiceModel.create(data);
    const service = await ServiceModel.getById(id);
    return res.status(201).json({ success: true, data: service });
  } catch (err) {
    return handleError(res, err);
  }
};

// PUT /api/v1/services/:id
exports.updateService = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return fail(res, 400, 'Mã dịch vụ không hợp lệ');
    const existing = await ServiceModel.getById(req.params.id);
    if (!existing) return fail(res, 404, 'Không tìm thấy dịch vụ');

    const { error, data } = parseFields({ ...existing, ...(req.body || {}) });
    if (error) return fail(res, 400, error);

    await ServiceModel.update(req.params.id, data);
    const service = await ServiceModel.getById(req.params.id);
    return res.json({ success: true, data: service });
  } catch (err) {
    return handleError(res, err);
  }
};

// DELETE /api/v1/services/:id
exports.deleteService = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return fail(res, 400, 'Mã dịch vụ không hợp lệ');
    const existing = await ServiceModel.getById(req.params.id);
    if (!existing) return fail(res, 404, 'Không tìm thấy dịch vụ');

    await ServiceModel.remove(req.params.id);
    return res.json({ success: true, message: 'Đã xóa dịch vụ' });
  } catch (err) {
    return handleError(res, err);
  }
};