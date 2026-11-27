const PromotionModel = require('../models/promotionModel');
const { toDateTimeString, nowString } = require('./bookingRules');

const CODE_PATTERN = /^[A-Z0-9_-]{3,30}$/;
const normalizeCode = (raw) => String(raw ?? '').trim().toUpperCase();

const unusableReason = (promo, now) => {
  if (!promo) return 'Mã khuyến mãi không tồn tại';
  if (promo.Status !== 'Active') return 'Mã khuyến mãi đang tạm khóa';
  if (now < toDateTimeString(promo.StartDate)) return 'Mã khuyến mãi chưa đến thời gian áp dụng';
  if (now > toDateTimeString(promo.EndDate)) return 'Mã khuyến mãi đã hết hạn';
  if (promo.UsageLimit != null && promo.UsedCount >= promo.UsageLimit) {
    return 'Mã khuyến mãi đã hết lượt sử dụng';
  }
  return null;
};

// Tìm và kiểm tra mã người dùng nhập.
const resolveBookingPromo = async (rawCode, conn) => {
  const code = normalizeCode(rawCode);
  if (code === '') return { promo: null };
  if (!CODE_PATTERN.test(code)) return { error: 'Mã khuyến mãi không tồn tại' };
  // Khóa trước lần đọc snapshot đầu tiên để thấy booking đã commit của lượt trước.
  await conn.execute('SELECT PromoID FROM Promotions WHERE PromoCode = ? FOR UPDATE', [code]);
  const promo = await PromotionModel.getByCode(code, conn);
  const reason = unusableReason(promo, nowString());
  return reason ? { error: reason } : { promo };
};

module.exports = { CODE_PATTERN, normalizeCode, unusableReason, resolveBookingPromo };