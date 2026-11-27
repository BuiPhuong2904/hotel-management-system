export const STATUS_LABEL = {
  Pending: 'Chờ xác nhận',
  Confirmed: 'Đã xác nhận',
  CheckedIn: 'Đang lưu trú',
  Completed: 'Đã trả/hủy',
  Cancelled: 'Đã trả/hủy',
};

export const ROOM_STATUS_LABEL = {
  Available: 'Sẵn sàng',
  Occupied: 'Đang lưu trú',
  Cleaning: 'Đang dọn',
  Maintenance: 'Bảo trì',
};

export const SOURCE_LABEL = {
  Online: 'Website online',
  Direct: 'Trực tiếp (Tại quầy/Hotline)',
};

const pad = (n) => String(n).padStart(2, '0');


export const toDateInput = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;


export const apiDateToInput = (value) => {
  if (!value) return '';
  const date = new Date(String(value).replace(' ', 'T'));
  return Number.isNaN(date.getTime()) ? '' : toDateInput(date);
};

export const startOfDay = (input) => new Date(`${input}T00:00:00`);

export const nightsBetween = (checkIn, checkOut) =>
  Math.max(
    1,
    Math.round((startOfDay(checkOut) - startOfDay(checkIn)) / (24 * 60 * 60 * 1000)),
  );


export const bookingCode = (b) => {
  const year = b.BookingDate ? new Date(String(b.BookingDate).replace(' ', 'T')).getFullYear() : '';
  return `BK-${year}-${String(b.BookingID).padStart(4, '0')}`;
};

export const formatPrice = (value) => `${new Intl.NumberFormat('vi-VN').format(Math.round(value || 0))} đ`;


export const mapRoom = (r) => ({
  id: r.RoomID,
  number: r.RoomNumber,
  floor: `T${String(r.RoomNumber).charAt(0)}`,
  type: r.RoomTypeID,
  description: r.Note || r.TypeName,
  price: formatPrice(Number(r.BasePrice)),
  basePrice: Number(r.BasePrice),
  maxGuests: r.MaxGuests,
  standardGuests: r.StandardGuests,
  apiStatus: r.Status,
  roomStatus: ROOM_STATUS_LABEL[r.Status] || r.Status,
  bookings: [],
});


export const mapBooking = (b) => {
  const checkIn = apiDateToInput(b.ExpectedCheckIn);
  const checkOut = apiDateToInput(b.ExpectedCheckOut);
  const nights = checkIn && checkOut ? nightsBetween(checkIn, checkOut) : 1;
  const rooms = b.Rooms || [];
  const total = Math.round(
    b.EstimatedTotal !== undefined
      ? Number(b.EstimatedTotal) || 0
      : rooms.reduce((sum, r) => sum + (Number(r.SubTotal) || 0), 0),
  );
  const deposit = Math.round(Number(b.Deposit) || 0);

  return {
    id: b.BookingID,
    code: bookingCode(b),
    guest: b.GuestName,
    phone: b.GuestPhone,
    source: SOURCE_LABEL[b.BookingSource] || SOURCE_LABEL.Direct,
    apiStatus: b.Status,
    status: STATUS_LABEL[b.Status] || b.Status,
    checkIn,
    checkOut,
    duration: nights,
    note: b.Note || '',
    createdAt: b.BookingDate,
    promoCode: b.PromoCode || '',
    totalAmount: total,
    depositAmount: deposit,
    depositPercent: total > 0 ? Math.round((deposit / total) * 100) : 0,
    roomRows: rooms.map((r) => ({
      id: `${b.BookingID}-${r.DetailID}`,
      detailId: r.DetailID,
      roomId: r.RoomID,
      roomNumber: r.RoomNumber,
      roomType: r.RoomTypeID,
      guests: r.GuestCount,
      foreignGuest: Boolean(r.HasForeigner),
      price: Number(r.PriceAtBooking),
      guestProfiles: (r.Guests || []).map(mapGuestFromApi),
    })),
  };
};

export const mapGuestFromApi = (g) => ({
  name: g.FullName || '',
  identity: g.IdentityNumber || '',
  type: g.CustomerType === 'Foreign' ? 'Nước ngoài' : 'Nội địa (Việt Nam)',
  note: g.Address || '',
});

export const mapGuestToApi = (g) => ({
  FullName: g.name.trim(),
  IdentityNumber: g.identity.trim(),
  CustomerType: g.type === 'Nước ngoài' ? 'Foreign' : 'Domestic',
  Address: (g.note || '').trim() || null,
});

export const formToApiPayload = (form, rooms) => {
  const payload = {
    GuestName: form.guest,
    GuestPhone: form.phone,
    CheckInDate: form.checkIn,
    CheckOutDate: form.checkOut,
    Note: form.note || undefined,
    Rooms: form.roomRows.map((row) => {
      const room = rooms.find((r) => r.number === row.roomNumber);
      return {
        RoomID: room?.id,
        GuestCount: Number(row.guests),
        HasForeigner: Boolean(row.foreignGuest),
      };
    }),
  };
  return payload;
};