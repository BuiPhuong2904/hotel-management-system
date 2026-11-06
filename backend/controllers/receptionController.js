const BookingModel = require('../models/bookingModel');
const pricing = require('../utils/pricing');
const rules = require('../utils/bookingRules');

const MAX_NIGHTS = 30;
const MAX_ROOMS_PER_BOOKING = 10;

const ROOM_STATUS_TEXT = {
  Occupied: 'đang có khách',
  Cleaning: 'đang dọn dẹp',
  Maintenance: 'đang bảo trì',
};

const fail = (res, status, message) => res.status(status).json({ success: false, message });
const isValidId = (value) => /^\d+$/.test(String(value)) && Number(value) > 0;

const handleError = (res, err) => {
  if (err.code === 'ROOMS_NOT_READY') {
    return res.status(409).json({
      success: false,
      message: 'Có phòng chưa sẵn sàng nhận khách (đang có khách, dọn dẹp hoặc bảo trì)',
      roomIds: err.roomIds,
    });
  }
  if (err.code === 'ROOMS_UNAVAILABLE') {
    return res.status(409).json({
      success: false,
      message: 'Có phòng đã được đặt trong khoảng thời gian này',
      roomIds: err.roomIds,
    });
  }
  if (err.code === 'BOOKING_STATE') {
    return fail(res, 409, 'Trạng thái đơn vừa thay đổi, vui lòng tải lại');
  }
  console.error(err);
  return fail(res, 500, 'Lỗi máy chủ');
};

// Tiền cọc: bỏ trống = 0
const parseMoney = (raw) =>
  raw === undefined || raw === null || raw === '' ? 0 : Number(raw);

exports.createDirectBooking = async (req, res) => {
  try {
    const body = req.body || {};
    const guestName = String(body.GuestName ?? '').trim();
    const guestPhone = rules.optional(body.GuestPhone);
    const note = rules.optional(body.Note);
    if (!guestName || guestName.length > 100) {
      return fail(res, 400, 'Tên khách bắt buộc và tối đa 100 ký tự');
    }
    if (!guestPhone || !rules.PHONE_PATTERN.test(guestPhone)) {
      return fail(res, 400, 'Số điện thoại không hợp lệ');
    }
    if (note && note.length > 255) return fail(res, 400, 'Ghi chú tối đa 255 ký tự');

    const today = rules.todayString();
    const checkOutDate = rules.parseDate(body.CheckOutDate);
    if (!checkOutDate) return fail(res, 400, 'Ngày trả phòng không hợp lệ (dạng YYYY-MM-DD)');
    const nights = pricing.countNights(today, checkOutDate);
    if (nights < 1) return fail(res, 400, 'Ngày trả phòng phải sau hôm nay');
    if (nights > MAX_NIGHTS) return fail(res, 400, `Mỗi đơn tối đa ${MAX_NIGHTS} đêm`);

    const parsedRooms = rules.parseRoomIds(body.Rooms, MAX_ROOMS_PER_BOOKING);
    if (parsedRooms.error) return fail(res, 400, parsedRooms.error);
    const { roomIds } = parsedRooms;

    const roomInfos = await BookingModel.getRoomsForBooking(roomIds);
    if (roomInfos.length !== roomIds.length) return fail(res, 404, 'Có phòng không tồn tại');
    const infoById = new Map(roomInfos.map((r) => [r.RoomID, r]));

    const settings = await rules.readSettings();
    const now = rules.nowString();

    const details = [];
    let estimatedTotal = 0;
    for (const r of body.Rooms) {
      const info = infoById.get(Number(r.RoomID));
      if (info.Status !== 'Available') {
        return fail(
          res,
          409,
          `Phòng ${info.RoomNumber} chưa sẵn sàng (${ROOM_STATUS_TEXT[info.Status] || info.Status})`
        );
      }
      const parsed = rules.parseGuests(r.Guests, info.MaxGuests);
      if (parsed.error) return fail(res, 400, `Phòng ${info.RoomNumber}: ${parsed.error}`);

      const hasForeigner = parsed.guests.some((g) => g.CustomerType === 'Foreign');
      const price = Number(info.BasePrice);
      const subTotal = pricing.calcRoomSubTotal({
        price,
        nights,
        guestCount: parsed.guests.length,
        standardGuests: info.StandardGuests,
        surchargeRate: settings.surchargeRate,
        hasForeigner,
        foreignerRate: settings.foreignerRate,
      });
      estimatedTotal += subTotal;
      details.push({
        RoomID: info.RoomID,
        PriceAtBooking: price,
        ActualCheckIn: now,
        AppliedSurchargeRate: settings.surchargeRate,
        AppliedForeignerRate: settings.foreignerRate,
        GuestCount: parsed.guests.length,
        HasForeigner: hasForeigner,
        RentalDays: nights,
        SubTotal: subTotal,
        TimeSurcharge: rules.calcEarlySurcharge({
          price,
          actualCheckIn: now,
          standardTime: settings.checkInTime,
          earlyRate: settings.earlyRate,
        }),
        Guests: parsed.guests,
      });
    }
    estimatedTotal = pricing.round2(estimatedTotal);

    const deposit = parseMoney(body.Deposit);
    if (!Number.isFinite(deposit) || deposit < 0) {
      return fail(res, 400, 'Tiền cọc phải là số từ 0 trở lên');
    }
    if (deposit > estimatedTotal) {
      return fail(res, 400, 'Tiền cọc không được lớn hơn tổng tiền dự kiến');
    }

    const bookingId = await BookingModel.createDirect({
      booking: {
        UserID: null,
        GuestName: guestName,
        GuestPhone: guestPhone,
        CreatedBy: req.user.id,
        BookingSource: 'Direct',
        ExpectedCheckIn: now,
        ExpectedCheckOut: `${checkOutDate} ${settings.checkOutTime}`,
        Status: 'CheckedIn',
        Deposit: deposit,
        Note: note,
      },
      details,
    });

    const booking = await BookingModel.getById(bookingId);
    return res.status(201).json({
      success: true,
      message: 'Đã lập phiếu thuê và nhận phòng',
      data: { ...booking, EstimatedTotal: estimatedTotal },
    });
  } catch (err) {
    return handleError(res, err);
  }
};

// PATCH /api/v1/bookings/:id/confirm-deposit   body: { Deposit }
exports.confirmDeposit = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return fail(res, 400, 'Mã đơn không hợp lệ');
    const deposit = parseMoney((req.body || {}).Deposit);
    if (!Number.isFinite(deposit) || deposit <= 0) {
      return fail(res, 400, 'Tiền cọc phải là số lớn hơn 0');
    }

    const booking = await BookingModel.getById(req.params.id);
    if (!booking) return fail(res, 404, 'Không tìm thấy đơn đặt phòng');
    if (booking.Status !== 'Pending') {
      return fail(res, 409, `Chỉ xác nhận cọc cho đơn đang chờ cọc (đơn đang ở trạng thái ${booking.Status})`);
    }
    if (rules.dateOnly(booking.ExpectedCheckIn) < rules.todayString()) {
      return fail(res, 409, 'Đã quá ngày nhận phòng của đơn này');
    }

    // Cọc tối thiểu tính theo tỉ lệ hiện hành trong Settings
    const settings = await rules.readSettings();
    const baseTotal = booking.Rooms.reduce(
      (sum, r) => sum + Number(r.PriceAtBooking) * r.RentalDays,
      0
    );
    const estimatedTotal = pricing.round2(
      booking.Rooms.reduce((sum, r) => sum + Number(r.SubTotal), 0)
    );
    const minDeposit = pricing.calcMinDeposit(baseTotal, settings.minDepositRate);
    if (deposit < minDeposit) {
      return fail(res, 400, `Tiền cọc tối thiểu là ${minDeposit} (${settings.minDepositRate * 100}%)`);
    }
    if (deposit > estimatedTotal) {
      return fail(res, 400, 'Tiền cọc không được lớn hơn tổng tiền dự kiến');
    }

    await BookingModel.confirmDeposit(booking.BookingID, deposit);
    const updated = await BookingModel.getById(booking.BookingID);
    return res.json({ success: true, message: 'Đã xác nhận cọc, phòng đã được giữ', data: updated });
  } catch (err) {
    return handleError(res, err);
  }
};

// POST /api/v1/bookings/:id/check-in
exports.checkIn = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return fail(res, 400, 'Mã đơn không hợp lệ');
    const booking = await BookingModel.getById(req.params.id);
    if (!booking) return fail(res, 404, 'Không tìm thấy đơn đặt phòng');

    if (booking.Status === 'Pending') {
      return fail(res, 409, 'Đơn chưa đặt cọc, cần xác nhận cọc trước khi nhận phòng');
    }
    if (booking.Status !== 'Confirmed') {
      return fail(res, 409, `Không thể nhận phòng cho đơn đang ở trạng thái ${booking.Status}`);
    }
    const expectedDate = rules.dateOnly(booking.ExpectedCheckIn);
    if (rules.todayString() < expectedDate) {
      return fail(res, 409, `Chưa đến ngày nhận phòng (ngày nhận: ${expectedDate})`);
    }

    // Danh sách phòng gửi lên phải khớp đúng các phòng trong đơn
    const entries = (req.body || {}).Rooms;
    const parsedRooms = rules.parseRoomIds(entries, MAX_ROOMS_PER_BOOKING);
    if (parsedRooms.error) return fail(res, 400, parsedRooms.error);
    const bookingRoomIds = booking.Rooms.map((r) => r.RoomID);
    const extra = parsedRooms.roomIds.find((id) => !bookingRoomIds.includes(id));
    if (extra !== undefined) return fail(res, 400, `Phòng ${extra} không thuộc đơn này`);
    const missing = booking.Rooms.find((r) => !parsedRooms.roomIds.includes(r.RoomID));
    if (missing) return fail(res, 400, `Thiếu thông tin khách của phòng ${missing.RoomNumber}`);

    const roomInfos = await BookingModel.getRoomsForBooking(bookingRoomIds);
    const infoById = new Map(roomInfos.map((r) => [r.RoomID, r]));
    const settings = await rules.readSettings();
    const now = rules.nowString();

    const arrivedOnTime = rules.dateOnly(now) === expectedDate;

    const rooms = [];
    for (const detail of booking.Rooms) {
      const info = infoById.get(detail.RoomID);
      if (info.Status !== 'Available') {
        return fail(
          res,
          409,
          `Phòng ${info.RoomNumber} chưa sẵn sàng (${ROOM_STATUS_TEXT[info.Status] || info.Status})`
        );
      }
      const entry = entries.find((e) => Number(e.RoomID) === detail.RoomID);
      const parsed = rules.parseGuests(entry.Guests, info.MaxGuests);
      if (parsed.error) return fail(res, 400, `Phòng ${info.RoomNumber}: ${parsed.error}`);

      const hasForeigner = parsed.guests.some((g) => g.CustomerType === 'Foreign');
      const price = Number(detail.PriceAtBooking);
      // Tính lại tiền phòng theo số khách và loại khách thực tế, giữ hệ số đã lưu lúc đặt
      const subTotal = pricing.calcRoomSubTotal({
        price,
        nights: detail.RentalDays,
        guestCount: parsed.guests.length,
        standardGuests: info.StandardGuests,
        surchargeRate: Number(detail.AppliedSurchargeRate),
        hasForeigner,
        foreignerRate: Number(detail.AppliedForeignerRate),
      });
      rooms.push({
        RoomID: detail.RoomID,
        ActualCheckIn: now,
        GuestCount: parsed.guests.length,
        HasForeigner: hasForeigner,
        SubTotal: subTotal,
        TimeSurcharge: arrivedOnTime
          ? rules.calcEarlySurcharge({
              price,
              actualCheckIn: now,
              standardTime: settings.checkInTime,
              earlyRate: settings.earlyRate,
            })
          : 0,
        Guests: parsed.guests,
      });
    }

    await BookingModel.checkIn(booking.BookingID, rooms);
    const updated = await BookingModel.getById(booking.BookingID);
    return res.json({ success: true, message: 'Đã nhận phòng', data: updated });
  } catch (err) {
    return handleError(res, err);
  }
};