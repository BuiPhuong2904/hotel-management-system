const BookingModel = require('../models/bookingModel');
const SettingModel = require('../models/settingModel');
const UserModel = require('../models/userModel');
const pricing = require('../utils/pricing');

const MAX_NIGHTS = 30;
const MAX_ROOMS_PER_BOOKING = 10;
const PHONE_PATTERN = /^\+?\d{9,15}$/;

const fail = (res, status, message) => res.status(status).json({ success: false, message });
const isValidId = (value) => /^\d+$/.test(String(value)) && Number(value) > 0;

const handleError = (res, err) => {
  if (err.code === 'ROOMS_UNAVAILABLE') {
    return res.status(409).json({
      success: false,
      message: 'Có phòng không còn trống trong khoảng ngày này, vui lòng chọn lại',
      roomIds: err.roomIds,
    });
  }
  console.error(err);
  return fail(res, 500, 'Lỗi máy chủ');
};

const optional = (value) => {
  const text = String(value ?? '').trim();
  return text === '' ? null : text;
};


const parseDate = (value) => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const d = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== value ? null : value;
};

const todayString = () => {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

// Đọc các tham số quy định từ bảng Settings
const readSettings = async () => {
  const map = await SettingModel.getMap();
  const num = (key) => {
    const value = Number(map[key]);
    if (map[key] === undefined || !Number.isFinite(value)) {
      throw new Error(`Tham số ${key} trong bảng Settings thiếu hoặc không hợp lệ`);
    }
    return value;
  };
  const time = (key) => {
    const value = String(map[key] ?? '');
    if (!/^\d{2}:\d{2}(:\d{2})?$/.test(value)) {
      throw new Error(`Tham số ${key} trong bảng Settings thiếu hoặc không hợp lệ`);
    }
    return value.length === 5 ? `${value}:00` : value;
  };
  return {
    surchargeRate: num('SurchargeThirdGuestRate'),
    foreignerRate: num('ForeignerCoefficient'),
    minDepositRate: num('MinDepositRateOnline'),
    checkInTime: time('StandardCheckInTime'),
    checkOutTime: time('StandardCheckOutTime'),
  };
};

// Admin và Lễ tân xem được mọi đơn; khách chỉ xem đơn của mình
const canAccess = (user, booking) =>
  user.role === 'Admin' || user.role === 'Staff' || booking.UserID === user.id;


exports.createOnlineBooking = async (req, res) => {
  try {
    const body = req.body || {};

    // ---- Ngày ----
    const checkInDate = parseDate(body.CheckInDate);
    const checkOutDate = parseDate(body.CheckOutDate);
    if (!checkInDate || !checkOutDate) {
      return fail(res, 400, 'Ngày nhận/trả phòng không hợp lệ (dạng YYYY-MM-DD)');
    }
    if (checkInDate < todayString()) {
      return fail(res, 400, 'Ngày nhận phòng không được ở quá khứ');
    }
    const nights = pricing.countNights(checkInDate, checkOutDate);
    if (nights < 1) return fail(res, 400, 'Ngày trả phòng phải sau ngày nhận phòng');
    if (nights > MAX_NIGHTS) return fail(res, 400, `Mỗi đơn tối đa ${MAX_NIGHTS} đêm`);

    // ---- Danh sách phòng ----
    const requested = body.Rooms;
    if (!Array.isArray(requested) || requested.length === 0) {
      return fail(res, 400, 'Cần chọn ít nhất một phòng');
    }
    if (requested.length > MAX_ROOMS_PER_BOOKING) {
      return fail(res, 400, `Mỗi đơn tối đa ${MAX_ROOMS_PER_BOOKING} phòng`);
    }
    const roomIds = requested.map((r) => Number((r || {}).RoomID));
    if (roomIds.some((id) => !Number.isInteger(id) || id < 1)) {
      return fail(res, 400, 'Mã phòng không hợp lệ');
    }
    if (new Set(roomIds).size !== roomIds.length) {
      return fail(res, 400, 'Mỗi phòng chỉ được chọn một lần');
    }
    for (const r of requested) {
      if (!Number.isInteger(r.GuestCount) || r.GuestCount < 1) {
        return fail(res, 400, 'Số khách mỗi phòng phải là số nguyên từ 1 trở lên');
      }
      if (r.HasForeigner !== undefined && typeof r.HasForeigner !== 'boolean') {
        return fail(res, 400, 'HasForeigner phải là true hoặc false');
      }
    }

    const roomInfos = await BookingModel.getRoomsForBooking(roomIds);
    if (roomInfos.length !== roomIds.length) {
      return fail(res, 404, 'Có phòng không tồn tại');
    }
    const infoById = new Map(roomInfos.map((r) => [r.RoomID, r]));

    // ---- Quy định và tính tiền ----
    const settings = await readSettings();

    const details = [];
    let baseTotal = 0;
    let estimatedTotal = 0;
    for (const r of requested) {
      const info = infoById.get(Number(r.RoomID));
      if (info.Status === 'Maintenance') {
        return fail(res, 409, `Phòng ${info.RoomNumber} đang bảo trì`);
      }
      if (r.GuestCount > info.MaxGuests) {
        return fail(res, 400, `Phòng ${info.RoomNumber} tối đa ${info.MaxGuests} khách`);
      }
      const price = Number(info.BasePrice);
      const hasForeigner = r.HasForeigner === true;
      const subTotal = pricing.calcRoomSubTotal({
        price,
        nights,
        guestCount: r.GuestCount,
        standardGuests: info.StandardGuests,
        surchargeRate: settings.surchargeRate,
        hasForeigner,
        foreignerRate: settings.foreignerRate,
      });
      baseTotal += price * nights;
      estimatedTotal += subTotal;
      details.push({
        RoomID: info.RoomID,
        PriceAtBooking: price,
        AppliedSurchargeRate: settings.surchargeRate,
        AppliedForeignerRate: settings.foreignerRate,
        GuestCount: r.GuestCount,
        HasForeigner: hasForeigner,
        RentalDays: nights,
        SubTotal: subTotal,
      });
    }
    estimatedTotal = pricing.round2(estimatedTotal);

    // ---- Tiền cọc ----
    const minDeposit = pricing.calcMinDeposit(baseTotal, settings.minDepositRate);
    const rawDeposit = body.Deposit;
    const deposit =
      rawDeposit === undefined || rawDeposit === null || rawDeposit === '' ? 0 : Number(rawDeposit);
    if (!Number.isFinite(deposit) || deposit < 0) {
      return fail(res, 400, 'Tiền cọc phải là số từ 0 trở lên');
    }
    if (deposit > 0 && deposit < minDeposit) {
      return fail(res, 400, `Tiền cọc tối thiểu là ${minDeposit} (${settings.minDepositRate * 100}%)`);
    }
    if (deposit > estimatedTotal) {
      return fail(res, 400, 'Tiền cọc không được lớn hơn tổng tiền dự kiến');
    }

    const status = deposit > 0 ? 'Confirmed' : 'Pending';

    // ---- Thông tin người đặt ----
    const me = await UserModel.findById(req.user.id);
    const guestName = optional(body.GuestName) || me.FullName;
    const guestPhone = optional(body.GuestPhone) || me.Phone;
    const note = optional(body.Note);
    if (!guestPhone) {
      return fail(res, 400, 'Cần cung cấp số điện thoại liên hệ (GuestPhone)');
    }
    if (!PHONE_PATTERN.test(guestPhone)) return fail(res, 400, 'Số điện thoại không hợp lệ');
    if (guestName.length > 100) return fail(res, 400, 'Tên người đặt tối đa 100 ký tự');
    if (note && note.length > 255) return fail(res, 400, 'Ghi chú tối đa 255 ký tự');

    // ---- Ghi vào database ----
    const bookingId = await BookingModel.createWithDetails({
      booking: {
        UserID: req.user.id,
        GuestName: guestName,
        GuestPhone: guestPhone,
        CreatedBy: null,
        BookingSource: 'Online',
        ExpectedCheckIn: `${checkInDate} ${settings.checkInTime}`,
        ExpectedCheckOut: `${checkOutDate} ${settings.checkOutTime}`,
        Status: status,
        Deposit: deposit,
        Note: note,
      },
      details,
    });

    const booking = await BookingModel.getById(bookingId);
    return res.status(201).json({
      success: true,
      message:
        status === 'Confirmed'
          ? 'Đặt phòng thành công, phòng đã được giữ'
          : `Đặt phòng thành công, đang chờ đặt cọc tối thiểu ${minDeposit} để giữ phòng`,
      data: { ...booking, MinDeposit: minDeposit, EstimatedTotal: estimatedTotal },
    });
  } catch (err) {
    return handleError(res, err);
  }
};

// GET /api/v1/bookings/my
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await BookingModel.getByUser(req.user.id);
    return res.json({ success: true, data: bookings });
  } catch (err) {
    return handleError(res, err);
  }
};

// GET /api/v1/bookings/:id
exports.getBookingById = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return fail(res, 400, 'Mã đơn không hợp lệ');
    const booking = await BookingModel.getById(req.params.id);

    if (!booking || !canAccess(req.user, booking)) {
      return fail(res, 404, 'Không tìm thấy đơn đặt phòng');
    }
    return res.json({ success: true, data: booking });
  } catch (err) {
    return handleError(res, err);
  }
};

// PATCH /api/v1/bookings/:id/cancel
exports.cancelBooking = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return fail(res, 400, 'Mã đơn không hợp lệ');
    const booking = await BookingModel.getById(req.params.id);
    if (!booking || !canAccess(req.user, booking)) {
      return fail(res, 404, 'Không tìm thấy đơn đặt phòng');
    }
    if (!['Pending', 'Confirmed'].includes(booking.Status)) {
      return fail(
        res,
        409,
        `Chỉ hủy được đơn đang chờ cọc hoặc đã cọc (đơn đang ở trạng thái ${booking.Status})`
      );
    }

    if (req.user.role === 'Customer' && new Date(booking.ExpectedCheckIn) <= new Date()) {
      return fail(res, 409, 'Đã quá giờ nhận phòng, vui lòng liên hệ khách sạn để hủy đơn');
    }

    const cancelled = await BookingModel.cancel(booking.BookingID);
    if (!cancelled) return fail(res, 409, 'Trạng thái đơn vừa thay đổi, vui lòng tải lại');

    const updated = await BookingModel.getById(booking.BookingID);
    return res.json({
      success: true,
      message:
        Number(booking.Deposit) > 0
          ? 'Đã hủy đơn. Vui lòng liên hệ khách sạn về tiền cọc đã đóng'
          : 'Đã hủy đơn',
      data: updated,
    });
  } catch (err) {
    return handleError(res, err);
  }
};