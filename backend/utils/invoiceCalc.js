const pricing = require('./pricing');
const { toDateTimeString } = require('./bookingRules');

const calcInvoice = ({ booking, roomInfos, settings, now, serviceTotal }) => {
  const nowDate = now.slice(0, 10);
  const nowTime = now.slice(11, 19);

  const rooms = booking.Rooms.map((d) => {
    const info = roomInfos.get(d.RoomID);
    const checkIn = toDateTimeString(d.ActualCheckIn);
    const checkInDate = checkIn.slice(0, 10);
    const price = Number(d.PriceAtBooking);

    // Số ngày thuê = ngày trả - ngày nhận, tối thiểu 1 
    const nights = Math.max(1, pricing.countNights(checkInDate, nowDate));

    // Tiền phòng theo số khách và loại khách thực tế, giữ hệ số đã lưu lúc đặt
    const subTotal = pricing.calcRoomSubTotal({
      price,
      nights,
      guestCount: d.GuestCount,
      standardGuests: info.StandardGuests,
      surchargeRate: Number(d.AppliedSurchargeRate),
      hasForeigner: Boolean(d.HasForeigner),
      foreignerRate: Number(d.AppliedForeignerRate),
    });

    // Phụ thu nhận sớm đã ghi lúc nhận phòng
    const earlySurcharge = Number(d.TimeSurcharge);
    const lateSurcharge =
      nowDate > checkInDate && nowTime > settings.checkOutTime
        ? pricing.round2(price * settings.lateRate)
        : 0;

    return {
      DetailID: d.DetailID,
      RoomID: d.RoomID,
      RoomNumber: d.RoomNumber,
      TypeName: d.TypeName,
      PriceAtBooking: price,
      GuestCount: d.GuestCount,
      HasForeigner: Boolean(d.HasForeigner),
      ActualCheckIn: checkIn,
      ActualCheckOut: now,
      RentalDays: nights,
      SubTotal: subTotal,
      EarlySurcharge: earlySurcharge,
      LateSurcharge: lateSurcharge,
      TimeSurcharge: pricing.round2(earlySurcharge + lateSurcharge),
    };
  });

  const roomTotal = pricing.round2(rooms.reduce((s, r) => s + r.SubTotal, 0));
  const timeSurchargeTotal = pricing.round2(rooms.reduce((s, r) => s + r.TimeSurcharge, 0));
  const totalAmount = pricing.round2(roomTotal + timeSurchargeTotal + serviceTotal);

  // Trừ tiền cọc nhưng không vượt quá tổng tiền
  const deposit = Number(booking.Deposit);
  const depositDeducted = Math.min(deposit, totalAmount);
  const amountDue = pricing.round2(totalAmount - depositDeducted);
  const refundDue = pricing.round2(deposit - depositDeducted);

  return {
    rooms,
    roomTotal,
    timeSurchargeTotal,
    serviceTotal,
    totalAmount,
    depositDeducted,
    amountDue,
    refundDue,
  };
};

module.exports = { calcInvoice };