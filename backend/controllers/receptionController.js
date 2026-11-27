const BookingModel = require('../models/bookingModel');
const PromotionModel = require('../models/promotionModel');
const pricing = require('../utils/pricing');
const rules = require('../utils/bookingRules');
const { resolvePromoCode } = require('../utils/promotion');

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
  if (err.code === 'DETAIL_NOT_FOUND') return fail(res, 404, 'Phòng này không thuộc đơn');
  console.error(err);
  return fail(res, 500, 'Lỗi máy chủ');
};

// Tiền cọc: bỏ trống = 0
const parseMoney = (raw) =>
  raw === undefined || raw === null || raw === '' ? 0 : Number(raw);

// POST /api/v1/bookings/direct
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

    const promoResult = await resolvePromoCode(body.PromoCode, now);
    if (promoResult.error) return fail(res, 400, promoResult.error);
    const promo = promoResult.promo;

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
        PromoID: promo ? promo.PromoID : null,
        Note: note,
      },
      details,
    });

    const booking = await BookingModel.getById(bookingId);
    return res.status(201).json({
      success: true,
      message: 'Đã lập phiếu thuê và nhận phòng',
      data: {
        ...booking,
        EstimatedTotal: estimatedTotal,
        PromoCode: promo ? promo.PromoCode : null,
        EstimatedDiscount: pricing.calcDiscount(promo, estimatedTotal),
      },
    });
  } catch (err) {
    return handleError(res, err);
  }
};

// PATCH /api/v1/bookings/:id/confirm-deposit
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
    let entries = (req.body || {}).Rooms;
    if (entries === undefined) {
      const noGuests = booking.Rooms.find((r) => r.Guests.length === 0);
      if (noGuests) {
        return fail(res, 400, `Phòng ${noGuests.RoomNumber} chưa có danh sách khách, cần nhập trước khi nhận phòng`);
      }
      entries = booking.Rooms.map((r) => ({ RoomID: r.RoomID, Guests: r.Guests }));
    }
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

// Quản lý đơn đặt phòng cho Lễ tân/Admin: danh sách, tạo đơn tại quầy, sửa đơn, danh sách khách
const BOOKING_STATUSES = ['Pending', 'Confirmed', 'CheckedIn', 'Completed', 'Cancelled'];

// Từ ngày và đến ngày (YYYY-MM-DD) -> khoảng [from, to)
const dayAfter = (dateStr) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  const next = new Date(Date.UTC(y, m - 1, d + 1));
  return next.toISOString().slice(0, 10);
};

// GET /api/v1/bookings?status=&q=&from=2026-11-23&to=2026-11-29 
exports.listBookings = async (req, res) => {
  try {
    const { status, from, to } = req.query;
    const q = rules.optional(req.query.q);
    if (status && !BOOKING_STATUSES.includes(status)) {
      return fail(res, 400, `Trạng thái phải là một trong: ${BOOKING_STATUSES.join(', ')}`);
    }
    if ((from && !to) || (!from && to)) return fail(res, 400, 'Cần truyền cả from và to');
    let range = {};
    if (from && to) {
      if (!rules.parseDate(from) || !rules.parseDate(to) || to < from) {
        return fail(res, 400, 'Khoảng ngày không hợp lệ (from, to dạng YYYY-MM-DD, to >= from)');
      }
      range = { from: `${from} 00:00:00`, to: `${dayAfter(to)} 00:00:00` };
    }
    if (q && q.length > 100) return fail(res, 400, 'Từ khóa tối đa 100 ký tự');

    const data = await BookingModel.list({ status, q, ...range });
    return res.json({ success: true, data });
  } catch (err) {
    return handleError(res, err);
  }
};

// Đọc và tính tiền cho một đơn chưa nhận phòng
const planStay = async (body, currentCheckInDate = null) => {
  const settings = await rules.readSettings();
  const checkInDate = rules.parseDate(body.CheckInDate);
  const checkOutDate = rules.parseDate(body.CheckOutDate);
  if (!checkInDate || !checkOutDate) {
    return { error: [400, 'Ngày nhận/trả phòng không hợp lệ (dạng YYYY-MM-DD)'] };
  }
  if (checkInDate < rules.todayString() && checkInDate !== currentCheckInDate) {
    return { error: [400, 'Ngày nhận phòng không được ở quá khứ'] };
  }
  const nights = pricing.countNights(checkInDate, checkOutDate);
  if (nights < 1) return { error: [400, 'Ngày trả phòng phải sau ngày nhận phòng'] };
  if (nights > MAX_NIGHTS) return { error: [400, `Mỗi đơn tối đa ${MAX_NIGHTS} đêm`] };

  const parsedRooms = rules.parseRoomIds(body.Rooms, MAX_ROOMS_PER_BOOKING);
  if (parsedRooms.error) return { error: [400, parsedRooms.error] };
  for (const r of body.Rooms) {
    if (!Number.isInteger(r.GuestCount) || r.GuestCount < 1) {
      return { error: [400, 'Số khách mỗi phòng phải là số nguyên từ 1 trở lên'] };
    }
    if (r.HasForeigner !== undefined && typeof r.HasForeigner !== 'boolean') {
      return { error: [400, 'HasForeigner phải là true hoặc false'] };
    }
  }

  const roomInfos = await BookingModel.getRoomsForBooking(parsedRooms.roomIds);
  if (roomInfos.length !== parsedRooms.roomIds.length) return { error: [404, 'Có phòng không tồn tại'] };
  const infoById = new Map(roomInfos.map((r) => [r.RoomID, r]));

  const details = [];
  let baseTotal = 0;
  let estimatedTotal = 0;
  for (const r of body.Rooms) {
    const info = infoById.get(Number(r.RoomID));
    if (info.Status === 'Maintenance') return { error: [409, `Phòng ${info.RoomNumber} đang bảo trì`] };
    if (r.GuestCount > info.MaxGuests) {
      return { error: [400, `Phòng ${info.RoomNumber} tối đa ${info.MaxGuests} khách`] };
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
  return { checkInDate, checkOutDate, details, baseTotal, estimatedTotal: pricing.round2(estimatedTotal), settings };
};

// Kiểm tra họ tên, SĐT, ghi chú
const parseContact = (body) => {
  const guestName = String(body.GuestName ?? '').trim();
  const guestPhone = rules.optional(body.GuestPhone);
  const note = rules.optional(body.Note);
  if (!guestName || guestName.length > 100) return { error: 'Tên người đặt bắt buộc và tối đa 100 ký tự' };
  if (!guestPhone || !rules.PHONE_PATTERN.test(guestPhone)) return { error: 'Số điện thoại không hợp lệ' };
  if (note && note.length > 255) return { error: 'Ghi chú tối đa 255 ký tự' };
  return { guestName, guestPhone, note };
};

// POST /api/v1/bookings/reserve
exports.createReservation = async (req, res) => {
  try {
    const body = req.body || {};
    const contact = parseContact(body);
    if (contact.error) return fail(res, 400, contact.error);

    const plan = await planStay(body);
    if (plan.error) return fail(res, ...plan.error);

    const minDeposit = pricing.calcMinDeposit(plan.baseTotal, plan.settings.minDepositRate);
    const deposit = parseMoney(body.Deposit);
    if (!Number.isFinite(deposit) || deposit < 0) return fail(res, 400, 'Tiền cọc phải là số từ 0 trở lên');
    if (deposit > 0 && deposit < minDeposit) {
      return fail(res, 400, `Tiền cọc tối thiểu là ${minDeposit} (${plan.settings.minDepositRate * 100}%)`);
    }
    if (deposit > plan.estimatedTotal) return fail(res, 400, 'Tiền cọc không được lớn hơn tổng tiền dự kiến');

    const promoResult = await resolvePromoCode(body.PromoCode, rules.nowString());
    if (promoResult.error) return fail(res, 400, promoResult.error);
    const promo = promoResult.promo;

    const bookingId = await BookingModel.createWithDetails({
      booking: {
        UserID: null,
        GuestName: contact.guestName,
        GuestPhone: contact.guestPhone,
        CreatedBy: req.user.id,
        BookingSource: 'Direct',
        ExpectedCheckIn: `${plan.checkInDate} ${plan.settings.checkInTime}`,
        ExpectedCheckOut: `${plan.checkOutDate} ${plan.settings.checkOutTime}`,
        Status: deposit > 0 ? 'Confirmed' : 'Pending',
        Deposit: deposit,
        PromoID: promo ? promo.PromoID : null,
        Note: contact.note,
      },
      details: plan.details,
    });

    const booking = await BookingModel.getById(bookingId);
    return res.status(201).json({
      success: true,
      message:
        deposit > 0
          ? 'Đã tạo đơn đặt phòng, phòng đã được giữ'
          : `Đã tạo đơn, đang chờ đặt cọc tối thiểu ${minDeposit} để giữ phòng`,
      data: {
        ...booking,
        MinDeposit: minDeposit,
        EstimatedTotal: plan.estimatedTotal,
        PromoCode: promo ? promo.PromoCode : null,
        EstimatedDiscount: pricing.calcDiscount(promo, plan.estimatedTotal),
      },
    });
  } catch (err) {
    return handleError(res, err);
  }
};

// PUT /api/v1/bookings/:id
exports.updateBooking = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return fail(res, 400, 'Mã đơn không hợp lệ');
    const body = req.body || {};
    const current = await BookingModel.getById(req.params.id);
    if (!current) return fail(res, 404, 'Không tìm thấy đơn đặt phòng');
    if (!['Pending', 'Confirmed'].includes(current.Status)) {
      return fail(res, 409, `Chỉ sửa được đơn chưa nhận phòng (đơn đang ở trạng thái ${current.Status})`);
    }

    const contact = parseContact(body);
    if (contact.error) return fail(res, 400, contact.error);
    const plan = await planStay(body, rules.dateOnly(current.ExpectedCheckIn));
    if (plan.error) return fail(res, ...plan.error);

    // Đơn đã cọc
    const deposit = Number(current.Deposit);
    if (current.Status === 'Confirmed') {
      const minDeposit = pricing.calcMinDeposit(plan.baseTotal, plan.settings.minDepositRate);
      if (deposit < minDeposit) {
        return fail(res, 400, `Tiền cọc hiện tại (${deposit}) thấp hơn mức tối thiểu của đơn sau khi sửa (${minDeposit})`);
      }
      if (deposit > plan.estimatedTotal) {
        return fail(res, 400, 'Tiền cọc hiện tại lớn hơn tổng tiền dự kiến sau khi sửa');
      }
    }

    let promoId = current.PromoID;
    if (body.PromoCode !== undefined) {
      const promoResult = await resolvePromoCode(body.PromoCode, rules.nowString());
      if (promoResult.error) return fail(res, 400, promoResult.error);
      promoId = promoResult.promo ? promoResult.promo.PromoID : null;
    }

    await BookingModel.update(current.BookingID, {
      booking: {
        GuestName: contact.guestName,
        GuestPhone: contact.guestPhone,
        ExpectedCheckIn: `${plan.checkInDate} ${plan.settings.checkInTime}`,
        ExpectedCheckOut: `${plan.checkOutDate} ${plan.settings.checkOutTime}`,
        PromoID: promoId,
        Note: contact.note,
      },
      details: plan.details,
    });

    const updated = await BookingModel.getById(current.BookingID);
    const promo = promoId ? await PromotionModel.getById(promoId) : null;
    return res.json({
      success: true,
      message: 'Đã cập nhật đơn đặt phòng',
      data: {
        ...updated,
        EstimatedTotal: plan.estimatedTotal,
        PromoCode: promo ? promo.PromoCode : null,
        EstimatedDiscount: pricing.calcDiscount(promo, plan.estimatedTotal),
      },
    });
  } catch (err) {
    return handleError(res, err);
  }
};

// PUT /api/v1/bookings/:id/rooms/:detailId/guests
exports.updateRoomGuests = async (req, res) => {
  try {
    if (!isValidId(req.params.id) || !isValidId(req.params.detailId)) {
      return fail(res, 400, 'Mã đơn hoặc mã phòng trong đơn không hợp lệ');
    }
    const booking = await BookingModel.getById(req.params.id);
    if (!booking) return fail(res, 404, 'Không tìm thấy đơn đặt phòng');
    if (!['Confirmed', 'CheckedIn'].includes(booking.Status)) {
      return fail(res, 409, `Chỉ cập nhật khách cho đơn đã cọc hoặc đang ở (đơn đang ở trạng thái ${booking.Status})`);
    }
    const detail = booking.Rooms.find((r) => r.DetailID === Number(req.params.detailId));
    if (!detail) return fail(res, 404, 'Phòng này không thuộc đơn');

    const [info] = await BookingModel.getRoomsForBooking([detail.RoomID]);
    const parsed = rules.parseGuests((req.body || {}).Guests, info.MaxGuests);
    if (parsed.error) return fail(res, 400, `Phòng ${info.RoomNumber}: ${parsed.error}`);

    const hasForeigner = parsed.guests.some((g) => g.CustomerType === 'Foreign');
    const subTotal = pricing.calcRoomSubTotal({
      price: Number(detail.PriceAtBooking),
      nights: detail.RentalDays,
      guestCount: parsed.guests.length,
      standardGuests: info.StandardGuests,
      surchargeRate: Number(detail.AppliedSurchargeRate),
      hasForeigner,
      foreignerRate: Number(detail.AppliedForeignerRate),
    });

    await BookingModel.replaceGuests(booking.BookingID, detail.DetailID, parsed.guests, {
      GuestCount: parsed.guests.length,
      HasForeigner: hasForeigner,
      SubTotal: subTotal,
    });
    const updated = await BookingModel.getById(booking.BookingID);
    return res.json({ success: true, message: 'Đã cập nhật danh sách khách', data: updated });
  } catch (err) {
    return handleError(res, err);
  }
};