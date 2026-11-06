const SettingModel = require('../models/settingModel');

const fail = (res, status, message) => res.status(status).json({ success: false, message });

const rate = (label) => (raw) => {
  const text = String(raw ?? '').trim();
  const n = Number(text);
  if (text === '' || !Number.isFinite(n) || n < 0 || n > 1) {
    return { error: `${label} phải là số từ 0 đến 1 (ví dụ 0.25 là 25%)` };
  }
  return { value: String(n) };
};

const time = (label) => (raw) => {
  const text = String(raw ?? '').trim();
  const match = /^(\d{1,2}):(\d{2})$/.exec(text);
  if (!match || Number(match[1]) > 23 || Number(match[2]) > 59) {
    return { error: `${label} phải có dạng HH:mm (ví dụ 14:00)` };
  }
  return { value: `${match[1].padStart(2, '0')}:${match[2]}` };
};

const VALIDATORS = {
  SurchargeThirdGuestRate: rate('Tỉ lệ phụ thu khách thứ 3'),
  MinDepositRateOnline: rate('Tỉ lệ cọc tối thiểu'),
  EarlyCheckInSurchargeRate: rate('Phụ thu nhận phòng sớm'),
  LateCheckOutSurchargeRate: rate('Phụ thu trả phòng trễ'),
  StandardCheckInTime: time('Giờ nhận phòng chuẩn'),
  StandardCheckOutTime: time('Giờ trả phòng chuẩn'),
  ForeignerCoefficient: (raw) => {
    const text = String(raw ?? '').trim();
    const n = Number(text);
    if (text === '' || !Number.isFinite(n) || n < 1 || n > 10) {
      return { error: 'Hệ số khách nước ngoài phải là số từ 1 đến 10' };
    }
    return { value: String(n) };
  },
};

// GET /api/v1/settings
exports.getSettings = async (req, res) => {
  try {
    const rows = await SettingModel.getAll();
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    return fail(res, 500, 'Lỗi máy chủ');
  }
};

// PUT /api/v1/settings/:key (chỉ Admin)
exports.updateSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const validate = Object.prototype.hasOwnProperty.call(VALIDATORS, key) ? VALIDATORS[key] : null;
    if (!validate) return fail(res, 404, 'Không có tham số này');

    const result = validate(req.body && req.body.value);
    if (result.error) return fail(res, 400, result.error);

    const updated = await SettingModel.update(key, result.value);
    if (!updated) return fail(res, 404, 'Không có tham số này');

    const rows = await SettingModel.getAll();
    return res.json({
      success: true,
      message: 'Đã cập nhật quy định',
      data: rows.find((r) => r.SettingKey === key),
    });
  } catch (err) {
    console.error(err);
    return fail(res, 500, 'Lỗi máy chủ');
  }
};