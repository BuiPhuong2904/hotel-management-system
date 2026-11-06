const round2 = (n) => Math.round(n * 100) / 100;

const toUtcDay = (dateString) => {
  const [y, m, d] = dateString.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
};

// Số đêm giữa hai ngày dạng YYYY-MM-DD
const countNights = (checkInDate, checkOutDate) =>
  Math.round((toUtcDay(checkOutDate) - toUtcDay(checkInDate)) / 86400000);

// Hệ số phụ thu khách vượt số khách tiêu chuẩn
const guestSurchargeFactor = (guestCount, standardGuests, surchargeRate) =>
  1 + surchargeRate * Math.max(0, guestCount - standardGuests);

// Thành tiền một phòng (chưa gồm phụ thu giờ nhận/trả và dịch vụ)
const calcRoomSubTotal = ({
  price,
  nights,
  guestCount,
  standardGuests,
  surchargeRate,
  hasForeigner,
  foreignerRate,
}) =>
  round2(
    price *
      nights *
      guestSurchargeFactor(guestCount, standardGuests, surchargeRate) *
      (hasForeigner ? foreignerRate : 1)
  );

// Tiền cọc tối thiểu = tỉ lệ x (đơn giá x số đêm của các phòng)
const calcMinDeposit = (baseTotal, rate) => Math.ceil(round2(baseTotal * rate));

module.exports = { round2, countNights, guestSurchargeFactor, calcRoomSubTotal, calcMinDeposit };