const PromotionModel = require('../models/promotionModel');
const rules = require('../utils/bookingRules');
const { CODE_PATTERN, normalizeCode, unusableReason } = require('../utils/promotion');

const MAX_AMOUNT = 9999999999;
const STATUSES = ['Active', 'Inactive'];

const fail = (res, status, message) => res.status(status).json({ success: false, message });
const isValidId = (value) => /^\d+$/.test(String(value)) && Number(value) > 0;

const handleError = (res, err) => {
  if (err.code === 'ER_DUP_ENTRY') return fail(res, 409, 'Mã khuyến mãi đã tồn tại');
  if (err.code === 'ER_CHECK_CONSTRAINT_VIOLATED' || err.code === 'ER_DATA_TOO_LONG') {
    return fail(res, 400, 'Dữ liệu không hợp lệ');
  }
  console.error(err);
  return fail(res, 500, 'Lỗi máy chủ');
};

const parseDateTime = (raw, isEnd) => {
  const match = /^(\d{4}-\d{2}-\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?$/.exec(String(raw ?? '').trim());
  if (!match || !rules.parseDate(match[1])) return null;
  if (match[2] === undefined) return `${match[1]} ${isEnd ? '23:59:59' : '00:00:00'}`;
  const [h, m, s] = [Number(match[2]), Number(match[3]), Number(match[4] ?? 0)];
  if (h > 23 || m > 59 || s > 59) return null;
  const pad = (n) => String(n).padStart(2, '0');
  return `${match[1]} ${pad(h)}:${pad(m)}:${pad(s)}`;
};

const toNumber = (raw) => (raw === '' || raw === null || raw === undefined ? NaN : Number(raw));

// Kiểm tra và chuẩn hóa dữ liệu mã
const parseFields = (body) => {
  const PromoCode = normalizeCode(body.PromoCode);
  const DiscountPercent = toNumber(body.DiscountPercent);
  const MaxDiscountAmount = toNumber(body.MaxDiscountAmount);
  const StartDate = parseDateTime(body.StartDate, false);
  const EndDate = parseDateTime(body.EndDate, true);
  const Status = body.Status === undefined || body.Status === '' ? 'Active' : body.Status;
  const Note = rules.optional(body.Note);

  if (!CODE_PATTERN.test(PromoCode)) {
    return { error: 'Mã khuyến mãi gồm 3 đến 30 ký tự: chữ, số, gạch ngang hoặc gạch dưới' };
  }
  if (!Number.isFinite(DiscountPercent) || DiscountPercent <= 0 || DiscountPercent > 100) {
    return { error: 'Phần trăm giảm phải lớn hơn 0 và không quá 100' };
  }
  if (!Number.isFinite(MaxDiscountAmount) || MaxDiscountAmount < 0 || MaxDiscountAmount > MAX_AMOUNT) {
    return { error: 'Mức giảm tối đa phải là số từ 0 trở lên' };
  }
  if (!StartDate || !EndDate) {
    return { error: 'Thời gian hiệu lực không hợp lệ (dạng YYYY-MM-DD hoặc YYYY-MM-DD HH:mm)' };
  }
  if (EndDate <= StartDate) return { error: 'Thời gian kết thúc phải sau thời gian bắt đầu' };
  if (!STATUSES.includes(Status)) return { error: `Trạng thái phải là một trong: ${STATUSES.join(', ')}` };
  if (Note && Note.length > 255) return { error: 'Mô tả tối đa 255 ký tự' };

  return { data: { PromoCode, DiscountPercent, MaxDiscountAmount, StartDate, EndDate, Status, Note } };
};

// GET /api/v1/promotions   (Admin)
exports.getPromotions = async (req, res) => {
  try {
    return res.json({ success: true, data: await PromotionModel.getAll() });
  } catch (err) {
    return handleError(res, err);
  }
};

// GET /api/v1/promotions/check?code=SUMMER26 
exports.checkPromotion = async (req, res) => {
  try {
    const code = normalizeCode(req.query.code);
    if (!code) return fail(res, 400, 'Vui lòng nhập mã khuyến mãi');
    const promo = CODE_PATTERN.test(code) ? await PromotionModel.getByCode(code) : null;
    const reason = unusableReason(promo, rules.nowString());
    if (reason) return fail(res, 404, reason);
    return res.json({
      success: true,
      data: {
        PromoCode: promo.PromoCode,
        DiscountPercent: Number(promo.DiscountPercent),
        MaxDiscountAmount: Number(promo.MaxDiscountAmount),
        EndDate: rules.toDateTimeString(promo.EndDate),
        Note: promo.Note,
      },
    });
  } catch (err) {
    return handleError(res, err);
  }
};

// GET /api/v1/promotions/:id   (Admin)
exports.getPromotionById = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return fail(res, 400, 'Mã khuyến mãi không hợp lệ');
    const promo = await PromotionModel.getById(req.params.id);
    if (!promo) return fail(res, 404, 'Không tìm thấy mã khuyến mãi');
    return res.json({ success: true, data: promo });
  } catch (err) {
    return handleError(res, err);
  }
};

// POST /api/v1/promotions   (Admin)
exports.createPromotion = async (req, res) => {
  try {
    const parsed = parseFields(req.body || {});
    if (parsed.error) return fail(res, 400, parsed.error);
    const id = await PromotionModel.create(parsed.data);
    return res.status(201).json({
      success: true,
      message: 'Đã thêm mã khuyến mãi',
      data: await PromotionModel.getById(id),
    });
  } catch (err) {
    return handleError(res, err);
  }
};

// PUT /api/v1/promotions/:id   (Admin)
exports.updatePromotion = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return fail(res, 400, 'Mã khuyến mãi không hợp lệ');
    const parsed = parseFields(req.body || {});
    if (parsed.error) return fail(res, 400, parsed.error);
    const updated = await PromotionModel.update(req.params.id, parsed.data);
    if (!updated) return fail(res, 404, 'Không tìm thấy mã khuyến mãi');
    return res.json({
      success: true,
      message: 'Đã cập nhật mã khuyến mãi',
      data: await PromotionModel.getById(req.params.id),
    });
  } catch (err) {
    return handleError(res, err);
  }
};

// DELETE /api/v1/promotions/:id   (Admin)
exports.deletePromotion = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return fail(res, 400, 'Mã khuyến mãi không hợp lệ');
    const promo = await PromotionModel.getById(req.params.id);
    if (!promo) return fail(res, 404, 'Không tìm thấy mã khuyến mãi');
    if ((await PromotionModel.countOpenBookings(promo.PromoID)) > 0) {
      return fail(res, 409, 'Mã đang được dùng bởi đơn chưa hoàn tất, hãy chuyển sang Inactive thay vì xóa');
    }
    await PromotionModel.remove(promo.PromoID);
    return res.json({ success: true, message: 'Đã xóa mã khuyến mãi' });
  } catch (err) {
    return handleError(res, err);
  }
};