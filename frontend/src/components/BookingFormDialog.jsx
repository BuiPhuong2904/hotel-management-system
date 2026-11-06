import { useEffect, useMemo, useState } from 'react';
import { FiPlus } from 'react-icons/fi';

const sourceOptions = [
  'Trực tiếp (Tại quầy/Hotline)',
  'Website online',
  'Điện thoại',
  'Đối tác/OTA',
];

const paymentOptions = [
  'Chuyển khoản ngân hàng (QR)',
  'Tiền mặt',
  'Thẻ ngân hàng',
];

const toDateInput = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const fromDay = (startDay) => {
  const date = new Date('2026-10-26T00:00:00');
  date.setDate(date.getDate() + startDay);
  return toDateInput(date);
};

const parsePrice = (price) => {
  const amount = Number(String(price ?? '').replace(/\D/g, ''));
  return Number.isFinite(amount) && amount > 0 ? amount : 150000;
};

const formatPrice = (price) =>
  new Intl.NumberFormat('vi-VN').format(Math.round(price));

function getRoomRow(room, index = 0) {
  return {
    id: `${Date.now()}-${index}`,
    roomType: room?.type || 'A',
    roomNumber: room?.number || '',
    guests: '2',
    foreignGuest: index === 0,
    price: parsePrice(room?.price),
  };
}

function createInitialForm(booking, room, rooms) {
  if (!booking) {
    const firstRoom = rooms[0];
    const secondRoom = rooms[1];
    return {
      guest: '',
      phone: '',
      source: sourceOptions[0],
      checkIn: '2026-11-01',
      checkOut: '2026-11-02',
      roomRows: [
        {
          ...getRoomRow(firstRoom),
          foreignGuest: true,
          price: parsePrice(firstRoom?.price) * 1.5,
        },
        {
          ...getRoomRow(secondRoom, 1),
          foreignGuest: false,
        },
      ],
      note: '',
      paymentMethod: paymentOptions[0],
      depositPercent: 30,
    };
  }

  const startDay = booking.startDay ?? 2;
  return {
    guest: booking.guest || '',
    phone: booking.phone || '0912345678',
    source: booking.source || 'Website online',
    checkIn: booking.checkIn || fromDay(startDay),
    checkOut: booking.checkOut || fromDay(startDay + (booking.duration || 2)),
    roomRows: booking.roomRows
      ? booking.roomRows.map((row, index) => ({
          ...row,
          id: row.id || `${Date.now()}-${index}`,
          guests: String(row.guests || 2),
          price: Number(row.price || parsePrice(room?.price)),
        }))
      : [
          {
            ...getRoomRow(room),
            roomNumber: room?.number || '',
            roomType: room?.type || 'A',
            guests: String(booking.guests || 2),
            foreignGuest: Boolean(booking.foreignGuest),
            price: booking.price || parsePrice(room?.price),
          },
        ],
    note: booking.note || '',
    paymentMethod: booking.paymentMethod || paymentOptions[0],
    depositPercent: booking.depositPercent ?? 30,
  };
}

function FormField({ label, children, className = '' }) {
  return (
    <label className={`flex min-w-0 flex-col gap-2 ${className}`}>
      <span className="text-sm font-bold text-[#075A9C]">{label}</span>
      {children}
    </label>
  );
}

const controlClass =
  'h-10 min-w-0 w-full rounded-lg border border-[#DCECF8] bg-white px-4 text-sm font-normal text-[#526575] outline-none focus:border-[#0D8BEA]';

function SectionTitle({ children }) {
  return (
    <h3 className="border-l-[5px] border-[#0D8BEA] pl-2.5 text-sm font-bold text-[#075A9C]">
      {children}
    </h3>
  );
}

function BookingFormDialog({ booking, room, rooms, onClose, onSave }) {
  const isEditing = Boolean(booking);
  const [form, setForm] = useState(() =>
    createInitialForm(booking, room, rooms),
  );
  const nights = useMemo(() => {
    if (!form.checkIn || !form.checkOut) return 1;
    const start = new Date(`${form.checkIn}T00:00:00`);
    const end = new Date(`${form.checkOut}T00:00:00`);
    return Math.max(1, Math.ceil((end - start) / (24 * 60 * 60 * 1000)));
  }, [form.checkIn, form.checkOut]);
  const roomTotal = form.roomRows.reduce(
    (total, row) => total + Number(row.price || 0),
    0,
  );
  const total = roomTotal * nights;
  const deposit = Math.round((total * form.depositPercent) / 100);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const updateRoomRow = (id, field, value) => {
    setForm((current) => ({
      ...current,
      roomRows: current.roomRows.map((row) =>
        row.id === id ? { ...row, [field]: value } : row,
      ),
    }));
  };

  const changeRoom = (id, number) => {
    const selected = rooms.find((item) => item.number === number);
    if (!selected) return;
    setForm((current) => ({
      ...current,
      roomRows: current.roomRows.map((row) =>
        row.id === id
          ? {
              ...row,
              roomNumber: selected.number,
              roomType: selected.type,
              price:
                parsePrice(selected.price) * (row.foreignGuest ? 1.5 : 1),
            }
          : row,
      ),
    }));
  };

  const changeRoomType = (id, type) => {
    const matchingRoom = rooms.find((item) => item.type === type);
    setForm((current) => ({
      ...current,
      roomRows: current.roomRows.map((row) =>
        row.id === id
          ? {
              ...row,
              roomType: type,
              ...(matchingRoom
                ? {
                    roomNumber: matchingRoom.number,
                    price:
                      parsePrice(matchingRoom.price) *
                      (row.foreignGuest ? 1.5 : 1),
                  }
                : {}),
            }
          : row,
      ),
    }));
  };

  const changeForeignGuest = (row, checked) => {
    const selectedRoom = rooms.find((item) => item.number === row.roomNumber);
    updateRoomRow(row.id, 'foreignGuest', checked);
    if (selectedRoom) {
      updateRoomRow(
        row.id,
        'price',
        parsePrice(selectedRoom.price) * (checked ? 1.5 : 1),
      );
    }
  };

  const addRoom = () => {
    const selected = rooms.find(
      (item) => !form.roomRows.some((row) => row.roomNumber === item.number),
    ) || rooms[0];
    setForm((current) => ({
      ...current,
      roomRows: [...current.roomRows, getRoomRow(selected, current.roomRows.length)],
    }));
  };

  const removeRoom = (id) => {
    setForm((current) => ({
      ...current,
      roomRows:
        current.roomRows.length > 1
          ? current.roomRows.filter((row) => row.id !== id)
          : current.roomRows,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSave({
      guest: form.guest.trim(),
      phone: form.phone.trim(),
      source: form.source,
      checkIn: form.checkIn,
      checkOut: form.checkOut,
      startDay: Math.floor(
        (new Date(`${form.checkIn}T00:00:00`).getTime() -
          new Date('2026-10-26T00:00:00').getTime()) /
          (24 * 60 * 60 * 1000),
      ),
      duration: nights,
      guests: Number(form.roomRows[0]?.guests || 1),
      foreignGuest: Boolean(form.roomRows[0]?.foreignGuest),
      price: Number(form.roomRows[0]?.price || 0),
      roomRows: form.roomRows,
      note: form.note.trim(),
      paymentMethod: form.paymentMethod,
      depositPercent: form.depositPercent,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-3 sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-dialog-title"
        onSubmit={handleSubmit}
        className="flex h-[663px] max-h-[90vh] w-full max-w-[800px] flex-col gap-4 rounded-xl bg-white px-4 py-5 shadow-[0_8px_24px_rgba(0,0,0,0.1)] sm:px-6"
      >
        <header className="flex min-h-[34px] shrink-0 items-center justify-between border-b border-[#DCECF8]">
          <h2
            id="booking-dialog-title"
            className="min-w-0 truncate text-xl font-bold text-[#075A9C] sm:text-2xl"
          >
            {isEditing
              ? `Chỉnh sửa Đặt phòng: ${booking.code || ''}`.trim()
              : 'Tạo Đặt Phòng Mới'}
          </h2>
          <button
            type="button"
            aria-label="Đóng"
            onClick={onClose}
            className="flex h-6 w-6 shrink-0 items-center justify-center"
          >
            <img src="/images/booking-form-close.svg" alt="" aria-hidden="true" />
          </button>
        </header>

        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain pr-1">
          <section className="flex flex-col gap-3">
            <SectionTitle>THÔNG TIN KHÁCH HÀNG</SectionTitle>
            <div className="flex flex-col gap-4 rounded-xl border border-[#DCECF8] bg-[#F7FBFF] p-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                <FormField label="Tên người đặt *">
                  <input
                    autoFocus
                    required
                    value={form.guest}
                    onChange={(event) => updateForm('guest', event.target.value)}
                    placeholder="Nhập thông tin..."
                    className={controlClass}
                  />
                </FormField>
                <FormField label="Số điện thoại *">
                  <input
                    required
                    type="tel"
                    value={form.phone}
                    onChange={(event) => updateForm('phone', event.target.value)}
                    placeholder="Nhập thông tin..."
                    className={controlClass}
                  />
                </FormField>
              </div>
              <FormField label="Nguồn đặt" className="sm:max-w-[347px]">
                <div className="relative">
                  <select
                    value={form.source}
                    onChange={(event) => updateForm('source', event.target.value)}
                    className={`${controlClass} appearance-none pr-10`}
                  >
                    {sourceOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <img
                    src="/images/booking-form-chevron.svg"
                    alt=""
                    aria-hidden="true"
                    className="pointer-events-none absolute right-3 top-2 h-6 w-6"
                  />
                </div>
              </FormField>
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <SectionTitle>LỊCH TRÌNH &amp; PHÒNG</SectionTitle>
            <div className="flex flex-col gap-4 rounded-xl border border-[#DCECF8] bg-[#F7FBFF] p-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                <FormField label="Ngày nhận phòng *">
                  <div className="relative">
                    <input
                      required
                      type="date"
                      value={form.checkIn}
                      onChange={(event) => updateForm('checkIn', event.target.value)}
                      className={`${controlClass} pr-3 [&::-webkit-calendar-picker-indicator]:opacity-0`}
                    />
                    <img
                      src="/images/booking-form-calendar.svg"
                      alt=""
                      aria-hidden="true"
                      className="pointer-events-none absolute right-3 top-2 h-6 w-6"
                    />
                  </div>
                </FormField>
                <FormField label="Ngày trả phòng *">
                  <div className="relative">
                    <input
                      required
                      type="date"
                      min={form.checkIn}
                      value={form.checkOut}
                      onChange={(event) => updateForm('checkOut', event.target.value)}
                      className={`${controlClass} pr-3 [&::-webkit-calendar-picker-indicator]:opacity-0`}
                    />
                    <img
                      src="/images/booking-form-calendar.svg"
                      alt=""
                      aria-hidden="true"
                      className="pointer-events-none absolute right-3 top-2 h-6 w-6"
                    />
                  </div>
                </FormField>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-sm font-bold text-[#075A9C]">
                  Danh sách phòng
                </h4>
              </div>

              <div className="flex flex-col gap-2">
                {form.roomRows.map((row, index) => (
                  <div
                    key={row.id}
                    className="grid grid-cols-2 gap-2 rounded-lg border border-[#DCECF8] bg-white p-2 sm:grid-cols-[minmax(100px,1.1fr)_minmax(100px,1fr)_78px_minmax(112px,auto)_minmax(112px,126px)_auto] sm:items-center sm:border-0 sm:bg-transparent sm:p-0"
                  >
                    <label className="relative min-w-0">
                      <span className="sr-only">Loại phòng {index + 1}</span>
                      <img
                        src="/images/booking-form-bed.svg"
                        alt=""
                        aria-hidden="true"
                        className="pointer-events-none absolute left-2 top-3 h-4 w-4"
                      />
                      <select
                        aria-label={`Loại phòng ${index + 1}`}
                        value={row.roomType}
                        onChange={(event) =>
                          changeRoomType(row.id, event.target.value)
                        }
                        className="h-10 w-full min-w-0 appearance-none rounded-lg border border-[#DCECF8] bg-white pl-8 pr-2 text-sm text-[#526575]"
                      >
                        {['A', 'B', 'C'].map((type) => (
                          <option key={type} value={type}>
                            Loại {type}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="relative min-w-0">
                      <span className="sr-only">Số phòng {index + 1}</span>
                      <img
                        src="/images/booking-form-room.svg"
                        alt=""
                        aria-hidden="true"
                        className="pointer-events-none absolute left-2 top-3 h-4 w-4"
                      />
                      <select
                        aria-label={`Số phòng ${index + 1}`}
                        required
                        value={row.roomNumber}
                        onChange={(event) => changeRoom(row.id, event.target.value)}
                        className="h-10 w-full min-w-0 appearance-none rounded-lg border border-[#DCECF8] bg-white pl-8 pr-2 text-sm text-[#526575]"
                      >
                        {rooms.map((item) => (
                          <option key={item.number} value={item.number}>
                            P.{item.number}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="relative min-w-0">
                      <span className="sr-only">Sức chứa {index + 1}</span>
                      <img
                        src="/images/booking-form-guests.svg"
                        alt=""
                        aria-hidden="true"
                        className="pointer-events-none absolute left-2 top-3 h-4 w-4"
                      />
                      <input
                        aria-label={`Sức chứa ${index + 1}`}
                        type="number"
                        min="1"
                        max="20"
                        required
                        value={row.guests}
                        onChange={(event) =>
                          updateRoomRow(row.id, 'guests', event.target.value)
                        }
                        className="h-10 w-full min-w-0 rounded-lg border border-[#DCECF8] bg-white pl-8 pr-2 text-sm text-[#526575]"
                      />
                    </label>
                    <label className="flex h-10 min-w-0 items-center gap-2 rounded-lg border border-[#DCECF8] bg-white px-2 text-xs text-[#526575] sm:text-sm">
                      <input
                        type="checkbox"
                        checked={row.foreignGuest}
                        onChange={(event) =>
                          changeForeignGuest(row, event.target.checked)
                        }
                        className="peer sr-only"
                      />
                      <span
                        aria-hidden="true"
                        className={`relative flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded border ${
                          row.foreignGuest
                            ? 'border-[#DCECF8] bg-[#0D8BEA]'
                            : 'border-2 border-[#DCECF8] bg-white'
                        }`}
                      >
                        {row.foreignGuest && (
                          <img
                            src="/images/booking-form-check.svg"
                            alt=""
                            className="absolute left-0 top-0 h-5 w-5"
                          />
                        )}
                      </span>
                      <span className="truncate">Nước ngoài</span>
                    </label>
                    <label className="flex h-10 min-w-0 items-center justify-between gap-1 rounded-lg border border-[#DCECF8] bg-white px-2 text-xs text-[#526575] sm:px-3 sm:text-sm">
                      <span className="sr-only">Đơn giá phòng {index + 1}</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formatPrice(row.price)}
                        onChange={(event) => {
                          const amount = Number(
                            event.target.value.replace(/\D/g, ''),
                          );
                          updateRoomRow(row.id, 'price', amount);
                        }}
                        className="w-full min-w-0 bg-transparent text-right outline-none"
                      />
                      <span className="shrink-0">VNĐ</span>
                    </label>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={addRoom}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#0D8BEA] hover:text-[#075A9C]"
                >
                  <FiPlus aria-hidden="true" className="h-4 w-4" />
                  Thêm phòng khác
                </button>
                
                <button
                  type="button"
                  aria-label="Xóa một phòng khỏi đặt phòng"
                  onClick={() =>
                    removeRoom(form.roomRows[form.roomRows.length - 1].id)
                  }
                  disabled={form.roomRows.length === 1}
                  className="flex h-8 items-center justify-end gap-1 text-xs font-semibold text-[#D9534F] disabled:opacity-40"
                >
                  <img
                    src="/images/booking-form-delete.svg"
                    alt=""
                    aria-hidden="true"
                    className="h-4 w-4"
                  />
                  Xóa 1 phòng
                </button>
              </div>

              <FormField label="Ghi chú đơn đặt">
                <textarea
                  rows={3}
                  value={form.note}
                  onChange={(event) => updateForm('note', event.target.value)}
                  placeholder="VD: Cửa sổ hướng hồ bơi, giường King-size, trang bị minibar cao cấp"
                  className="w-full resize-y rounded-lg border border-[#DCECF8] bg-white px-4 py-2 text-sm text-[#526575] outline-none placeholder:text-[#526575]/80 focus:border-[#0D8BEA]"
                />
              </FormField>
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <SectionTitle>THÔNG TIN THANH TOÁN</SectionTitle>
            <div className="flex flex-col gap-4 rounded-xl border border-[#DCECF8] bg-[#F7FBFF] p-4">
              <div className="flex flex-col justify-between gap-2 rounded-lg border border-[#DCECF8] bg-[#F7FBFF] px-4 py-3 sm:flex-row sm:items-center">
                <div className="flex items-start gap-2">
                  <img
                    src="/images/booking-form-payment.svg"
                    alt=""
                    aria-hidden="true"
                    className="mt-0.5 shrink-0"
                  />
                  <p className="text-xs text-[#526575]">
                    Ước tính: Tổng {formatPrice(roomTotal)} đ/đêm × {nights} đêm
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 sm:justify-end">
                  <span className="text-sm font-bold text-[#075A9C]">
                    Tổng tiền phòng dự kiến:
                  </span>
                  <strong className="text-lg text-[#0D8BEA]">
                    {formatPrice(total)} VNĐ
                  </strong>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                <FormField label="Tiền cọc">
                  <div className="flex h-10 items-center justify-between rounded-lg border border-[#DCECF8] bg-white px-4 text-sm text-[#526575]">
                    <span>{formatPrice(deposit)}</span>
                    <span>VNĐ</span>
                  </div>
                </FormField>
                <FormField label="Hình thức thanh toán">
                  <select
                    value={form.paymentMethod}
                    onChange={(event) =>
                      updateForm('paymentMethod', event.target.value)
                    }
                    className={controlClass}
                  >
                    {paymentOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </FormField>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="mr-2 text-xs text-[#526575]">Gợi ý nhanh:</span>
                {[30, 50, 100].map((percentage) => {
                  const selected = form.depositPercent === percentage;
                  return (
                    <button
                      key={percentage}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => updateForm('depositPercent', percentage)}
                      className={`h-6 min-w-[58px] rounded-md px-3 text-xs ${
                        selected
                          ? 'bg-[#0D8BEA] text-white shadow-[0_1px_1px_rgba(0,0,0,0.05)]'
                          : 'border border-[#DCECF8] bg-white text-[#526575]'
                      }`}
                    >
                      {percentage}%
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-[#526575]">
                Hệ thống sẽ tự động xuất biên nhận thu tiền cọc kèm mã đặt phòng.
              </p>
            </div>
          </section>
        </div>

        <footer className="flex shrink-0 items-center justify-end gap-4 border-t border-[#DCECF8] pt-4">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#DCECF8] bg-[#E8F5FF] px-4 text-sm font-bold text-[#0D8BEA]"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#0D8BEA] px-4 text-sm font-bold text-white hover:bg-[#075A9C]"
          >
            {isEditing ? (
              <img
                src="/images/booking-form-save.svg"
                alt=""
                aria-hidden="true"
                className="h-4 w-4"
              />
            ) : (
              <img
                src="/images/booking-form-submit.svg"
                alt=""
                aria-hidden="true"
                className="h-4 w-4"
              />
            )}
            {isEditing ? 'Lưu thay đổi' : 'Tạo đặt phòng'}
          </button>
        </footer>
      </form>
    </div>
  );
}

export default BookingFormDialog;
