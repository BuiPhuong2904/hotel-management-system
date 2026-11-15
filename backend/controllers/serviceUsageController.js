const ServiceUsageModel = require('../models/serviceUsageModel');
const ServiceModel = require('../models/serviceModel');
const RoomModel = require('../models/roomModel');
const BookingModel = require('../models/bookingModel');
const pricing = require('../utils/pricing');

const MAX_QUANTITY = 999;

const fail = (res, status, message) => res.status(status).json({ success: false, message });
const isValidId = (value) => /^\d+$/.test(String(value)) && Number(value) > 0;
const isValidQuantity = (value) => Number.isInteger(value) && value >= 1 && value <= MAX_QUANTITY;

const handleError = (res, err) => {
  console.error(err);
  return fail(res, 500, 'Lỗi máy chủ');
};

// sửa được khi khách còn đang ở và đơn CHƯA lập hóa đơn
const lockedReason = async (bookingId, bookingStatus) => {
  if (bookingStatus !== 'CheckedIn') {
    return 'Khách không còn ở trong phòng nên không thể thay đổi dịch vụ';
  }
  if (await ServiceUsageModel.isInvoiced(bookingId)) {
    return 'Đơn đã lập hóa đơn nên không thể thay đổi dịch vụ';
  }
  return null;
};

// POST /api/v1/service-usages
exports.createUsage = async (req, res) => {
  try {
    const body = req.body || {};
    if (!isValidId(body.RoomID)) return fail(res, 400, 'Mã phòng không hợp lệ');
    if (!isValidId(body.ServiceID)) return fail(res, 400, 'Mã dịch vụ không hợp lệ');
    if (!isValidQuantity(body.Quantity)) {
      return fail(res, 400, `Số lượng phải là số nguyên từ 1 đến ${MAX_QUANTITY}`);
    }

    const service = await ServiceModel.getById(body.ServiceID);
    if (!service) return fail(res, 404, 'Không tìm thấy dịch vụ');
    const room = await RoomModel.getById(body.RoomID);
    if (!room) return fail(res, 404, 'Không tìm thấy phòng');

    // Phòng đang có khách (đã nhận phòng, chưa trả)
    const detail = await ServiceUsageModel.findActiveDetailByRoom(room.RoomID);
    if (!detail) {
      return fail(res, 409, `Phòng ${room.RoomNumber} chưa có khách đang ở, không thể ghi nhận dịch vụ`);
    }
    if (await ServiceUsageModel.isInvoiced(detail.BookingID)) {
      return fail(res, 409, 'Đơn đã lập hóa đơn nên không thể thêm dịch vụ');
    }

    const price = Number(service.Price);
    const usageId = await ServiceUsageModel.create({
      DetailID: detail.DetailID,
      ServiceID: service.ServiceID,
      Quantity: body.Quantity,
      PriceAtUsage: price,
      SubTotal: pricing.round2(body.Quantity * price),
    });
    const usage = await ServiceUsageModel.getById(usageId);
    return res.status(201).json({ success: true, message: 'Đã ghi nhận dịch vụ', data: usage });
  } catch (err) {
    return handleError(res, err);
  }
};

// GET /api/v1/service-usages?bookingId=1
exports.getUsages = async (req, res) => {
  try {
    const { bookingId, roomId } = req.query;
    if ((bookingId && roomId) || (!bookingId && !roomId)) {
      return fail(res, 400, 'Cần truyền đúng một trong hai: bookingId hoặc roomId');
    }

    let targetBookingId;
    if (bookingId) {
      if (!isValidId(bookingId)) return fail(res, 400, 'Mã đơn không hợp lệ');
      const booking = await BookingModel.getById(bookingId);
      const isOwner = booking && booking.UserID === req.user.id;
      if (!booking || (req.user.role === 'Customer' && !isOwner)) {
        return fail(res, 404, 'Không tìm thấy đơn đặt phòng');
      }
      targetBookingId = booking.BookingID;
    } else {
      if (req.user.role === 'Customer') return fail(res, 403, 'Bạn không có quyền xem theo phòng');
      if (!isValidId(roomId)) return fail(res, 400, 'Mã phòng không hợp lệ');
      const detail = await ServiceUsageModel.findActiveDetailByRoom(roomId);
      if (!detail) return fail(res, 404, 'Phòng này chưa có khách đang ở');
      targetBookingId = detail.BookingID;
    }

    const items = await ServiceUsageModel.listByBooking(targetBookingId);
    const serviceTotal = pricing.round2(items.reduce((sum, i) => sum + Number(i.SubTotal), 0));
    return res.json({
      success: true,
      data: { BookingID: targetBookingId, ItemCount: items.length, ServiceTotal: serviceTotal, Items: items },
    });
  } catch (err) {
    return handleError(res, err);
  }
};

// PATCH /api/v1/service-usages/:id
exports.updateUsage = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return fail(res, 400, 'Mã dòng dịch vụ không hợp lệ');
    const quantity = (req.body || {}).Quantity;
    if (!isValidQuantity(quantity)) {
      return fail(res, 400, `Số lượng phải là số nguyên từ 1 đến ${MAX_QUANTITY}`);
    }
    const usage = await ServiceUsageModel.getById(req.params.id);
    if (!usage) return fail(res, 404, 'Không tìm thấy dòng dịch vụ');
    const reason = await lockedReason(usage.BookingID, usage.BookingStatus);
    if (reason) return fail(res, 409, reason);

    // Giữ nguyên đơn giá đã ghi lúc dùng
    const subTotal = pricing.round2(quantity * Number(usage.PriceAtUsage));
    await ServiceUsageModel.updateQuantity(usage.UsageID, quantity, subTotal);
    const updated = await ServiceUsageModel.getById(usage.UsageID);
    return res.json({ success: true, data: updated });
  } catch (err) {
    return handleError(res, err);
  }
};

// DELETE /api/v1/service-usages/:id
exports.deleteUsage = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return fail(res, 400, 'Mã dòng dịch vụ không hợp lệ');
    const usage = await ServiceUsageModel.getById(req.params.id);
    if (!usage) return fail(res, 404, 'Không tìm thấy dòng dịch vụ');
    const reason = await lockedReason(usage.BookingID, usage.BookingStatus);
    if (reason) return fail(res, 409, reason);

    await ServiceUsageModel.remove(usage.UsageID);
    return res.json({ success: true, message: 'Đã xóa dòng dịch vụ' });
  } catch (err) {
    return handleError(res, err);
  }
};