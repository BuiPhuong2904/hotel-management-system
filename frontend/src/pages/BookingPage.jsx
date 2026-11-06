import { useMemo, useState } from 'react';
import {
  FiChevronLeft,
  FiChevronRight,
  FiGlobe,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiTool,
  FiUsers,
} from 'react-icons/fi';
import BookingDetailDrawer from '../components/BookingDetailDrawer';
import BookingFormDialog from '../components/BookingFormDialog';

const BASE_WEEK = new Date('2026-10-26T00:00:00.000Z');
const DAY_IN_MS = 24 * 60 * 60 * 1000;

const statusColors = {
  'Đang lưu trú': 'rgba(13,139,234,0.8)',
  'Đã xác nhận': 'rgba(0,200,179,0.8)',
  'Chờ xác nhận': 'rgba(97,85,245,0.8)',
  'Đang dọn': 'rgba(255,197,66,0.8)',
  'Bảo trì': 'rgba(217,83,79,0.8)',
  'Đã trả/hủy': 'rgba(142,142,147,0.8)',
};

const statusFilters = [
  { label: 'Đang lưu trú', color: '#0D8BEA' },
  { label: 'Đã xác nhận', color: '#00C8B3' },
  { label: 'Chờ xác nhận', color: '#6155F5' },
  { label: 'Đang dọn', color: '#FFC542' },
  { label: 'Bảo trì', color: '#D9534F' },
  { label: 'Đã trả/hủy', color: 'rgba(142,142,147,0.8)' },
];

const initialRooms = [
  {
    number: '101',
    floor: 'T1',
    type: 'A',
    description: 'Giường đôi Deluxe',
    price: '150.000 đ',
    roomStatus: 'Đang lưu trú',
    bookings: [
      {
        guest: 'Nguyễn Văn A',
        code: 'BK-1011',
        guests: 4,
        status: 'Đang lưu trú',
        startDay: 0,
        duration: 3,
      },
    ],
  },
  {
    number: '102',
    floor: 'T1',
    type: 'A',
    description: 'Giường đôi Standard',
    price: '150.000 đ',
    roomStatus: 'Sẵn sàng',
    bookings: [
      {
        guest: 'Trần Thị B',
        code: 'BK-1012',
        guests: 2,
        status: 'Đã xác nhận',
        startDay: 2,
        duration: 3,
      },
    ],
  },
  {
    number: '103',
    floor: 'T1',
    type: 'B',
    description: '2 giường đơn',
    price: '170.000 đ',
    roomStatus: 'Sẵn sàng',
    bookings: [
      {
        guest: 'Lê Văn C',
        code: 'BK-1013',
        guests: 1,
        status: 'Chờ xác nhận',
        startDay: 2,
        duration: 2,
      },
    ],
  },
  {
    number: '104',
    floor: 'T1',
    type: 'B',
    description: 'Giường đôi Deluxe',
    price: '170.000 đ',
    roomStatus: 'Đang dọn',
    bookings: [
      {
        guest: 'Dọn dẹp',
        status: 'Đang dọn',
        startDay: 2,
        duration: 1,
      },
      {
        guest: 'Phạm Thị D',
        code: 'BK-1014',
        guests: 2,
        status: 'Đã xác nhận',
        startDay: 3,
        duration: 3,
      },
    ],
  },
  {
    number: '105',
    floor: 'T1',
    type: 'A',
    description: 'Giường đôi Standard',
    price: '150.000 đ',
    roomStatus: 'Đang dọn',
    bookings: [
      {
        guest: 'Khách trả phòng (11:00)',
        status: 'Đã trả/hủy',
        startDay: 1,
        duration: 1,
      },
      {
        guest: 'Dọn dẹp',
        status: 'Đang dọn',
        startDay: 2,
        duration: 1,
      },
      {
        guest: 'Quách Anh M',
        code: 'BK-1022',
        guests: 2,
        status: 'Đang lưu trú',
        startDay: 3,
        duration: 1,
      },
    ],
  },
  {
    number: '106',
    floor: 'T1',
    type: 'A',
    description: 'Giường đôi Deluxe',
    price: '150.000 đ',
    roomStatus: 'Bảo trì',
    bookings: [
      {
        guest: 'Bảo trì vòi sen',
        status: 'Bảo trì',
        startDay: 1,
        duration: 1,
      },
      {
        guest: 'Vũ Minh K',
        code: 'BK-1016',
        guests: 2,
        status: 'Đang lưu trú',
        startDay: 3,
        duration: 2,
      },
    ],
  },
  {
    number: '107',
    floor: 'T1',
    type: 'C',
    description: 'Phòng VIP hướng phố',
    price: '200.000 đ',
    roomStatus: 'Đang lưu trú',
    bookings: [
      {
        guest: 'Đỗ Xuân B',
        code: 'BK-1021',
        guests: 2,
        status: 'Đang lưu trú',
        startDay: 0,
        duration: 2,
      },
    ],
  },
  {
    number: '108',
    floor: 'T1',
    type: 'C',
    description: 'Phòng view biển',
    price: '200.000 đ',
    roomStatus: 'Sẵn sàng',
    bookings: [
      {
        guest: 'Đã hủy',
        status: 'Đã trả/hủy',
        startDay: 1,
        duration: 2,
      },
      {
        guest: 'Nguyễn Thị G',
        code: 'BK-1018',
        guests: 2,
        status: 'Đã xác nhận',
        startDay: 4,
        duration: 3,
      },
    ],
  },
  {
    number: '109',
    floor: 'T1',
    type: 'B',
    description: '2 giường đơn',
    price: '170.000 đ',
    roomStatus: 'Sẵn sàng',
    bookings: [
      {
        guest: 'Phạm Văn H',
        code: 'BK-1019',
        guests: 1,
        status: 'Chờ xác nhận',
        startDay: 3,
        duration: 2,
      },
    ],
  },
  {
    number: '110',
    floor: 'T1',
    type: 'C',
    description: 'Phòng VIP hướng phố',
    price: '200.000 đ',
    roomStatus: 'Đang lưu trú',
    bookings: [
      {
        guest: 'Lê Thị I',
        code: 'BK-1020',
        guests: 2,
        status: 'Đang lưu trú',
        startDay: 0,
        duration: 2,
      },
    ],
  },
];

const summaryCards = [
  {
    title: 'TỔNG LƯỢT ĐẶT',
    value: '42',
    detail: 'hồ sơ',
    note: 'khoảng 7 ngày tới',
    color: '#075A9C',
  },
  {
    title: 'ĐANG LƯU TRÚ',
    value: '36',
    detail: '/ 48 phòng',
    note: 'Công suất hiện tại: 75.0%',
    color: '#0D8BEA',
  },
  {
    title: 'ĐẾN HÔM NAY',
    value: '07',
    detail: 'lượt nhận',
    note: 'Check-in từ 14:00',
    color: '#2E8B57',
  },
  {
    title: 'ĐI HÔM NAY',
    value: '05',
    detail: 'lượt trả',
    note: 'Check-out trước 12:00',
    color: '#D97706',
  },
  {
    title: 'LẤP ĐẦY BÌNH QUÂN',
    value: '78.4%',
    note: '+3.2% tuần này',
    color: '#075A9C',
    progress: 81.88,
  },
  {
    title: 'XUNG ĐỘT LỊCH',
    value: '0',
    detail: 'không đè lịch',
    note: 'Hệ thống đồng bộ chuẩn',
    color: 'rgba(217,83,79,0.9)',
  },
];

const weekdays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

function addDays(date, days) {
  return new Date(date.getTime() + days * DAY_IN_MS);
}

function formatDate(date, includeYear = false) {
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const year = date.getUTCFullYear();

  return includeYear ? `${day}/${month}/${year}` : `${day}/${month}`;
}

function getBookingPosition(weekStart, booking) {
  const bookingStart = addDays(BASE_WEEK, booking.startDay);
  const bookingEnd = addDays(bookingStart, booking.duration);
  const visibleStart = Math.max(
    0,
    Math.floor((bookingStart.getTime() - weekStart.getTime()) / DAY_IN_MS),
  );
  const visibleEnd = Math.min(
    7,
    Math.ceil((bookingEnd.getTime() - weekStart.getTime()) / DAY_IN_MS),
  );

  if (visibleStart >= visibleEnd) {
    return null;
  }

  return { start: visibleStart, duration: visibleEnd - visibleStart };
}

function SummaryCard({ card }) {
  return (
    <article className="flex min-h-[136px] min-w-0 flex-col gap-2 rounded-xl border border-[#DCECF8] bg-white p-[17px] shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
      <h2
        className="text-sm font-bold"
        style={{ color: card.color }}
      >
        {card.title}
      </h2>
      <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-1 pt-2">
        <span className="text-xl font-bold" style={{ color: card.color }}>
          {card.value}
        </span>
        {card.detail && (
          <span className="text-xs text-[#526575]">{card.detail}</span>
        )}
      </div>
      {card.progress ? (
        <div className="mt-auto">
          <p className="mb-2 text-xs text-[#2E8B57]">{card.note}</p>
          <div className="h-1.5 overflow-hidden rounded-full bg-[#DCECF8]">
            <div
              className="h-full rounded-full bg-[#0D8BEA]"
              style={{ width: `${card.progress}%` }}
            />
          </div>
        </div>
      ) : (
        <p className="mt-auto text-xs text-[#526575]">{card.note}</p>
      )}
    </article>
  );
}

function FilterGroup({ label, options, value, onChange, className = '' }) {
  return (
    <div
      className={`flex min-w-0 flex-wrap items-center gap-1 rounded-lg border border-[#DCECF8] bg-[#F7FBFF] p-1 ${className}`}
    >
      <span className="px-2 text-[11px] font-semibold text-[#64748B]">
        {label}:
      </span>
      {options.map((option) => {
        const selected = value === option;

        return (
          <button
            key={option}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option)}
            className={`rounded px-2.5 py-1 text-xs font-semibold transition-colors ${
              selected
                ? 'bg-[#0D8BEA] text-white'
                : 'text-[#526575] hover:bg-[#E8F5FF]'
            }`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

function BookingPage() {
  const [rooms, setRooms] = useState(initialRooms);
  const [floorFilter, setFloorFilter] = useState('Tất cả');
  const [typeFilter, setTypeFilter] = useState('Tất cả');
  const [statusFilter, setStatusFilter] = useState('Tất cả');
  const [query, setQuery] = useState('');
  const [weekStart, setWeekStart] = useState(BASE_WEEK);
  const [page, setPage] = useState(1);
  const [bookingDialog, setBookingDialog] = useState(null);
  const [bookingDetail, setBookingDetail] = useState(null);

  const visibleRooms = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('vi');

    return rooms
      .map((room) => {
        const roomMatchesQuery =
          !normalizedQuery ||
          `${room.number} ${room.floor} ${room.type} ${room.description}`
            .toLocaleLowerCase('vi')
            .includes(normalizedQuery);
        const filteredBookings = room.bookings.filter((booking) => {
          const matchesStatus =
            statusFilter === 'Tất cả' || booking.status === statusFilter;
          const matchesQuery =
            !normalizedQuery ||
            roomMatchesQuery ||
            `${booking.guest} ${booking.code || ''}`
              .toLocaleLowerCase('vi')
              .includes(normalizedQuery);

          return matchesStatus && matchesQuery;
        });

        return { ...room, filteredBookings, roomMatchesQuery };
      })
      .filter((room) => {
        const matchesFloor =
          floorFilter === 'Tất cả' || room.floor === floorFilter;
        const matchesType =
          typeFilter === 'Tất cả' || room.type === typeFilter.at(-1);
        const matchesStatus =
          statusFilter === 'Tất cả' || room.filteredBookings.length > 0;
        const matchesQuery =
          !normalizedQuery ||
          room.roomMatchesQuery ||
          room.filteredBookings.length > 0;

        return matchesFloor && matchesType && matchesStatus && matchesQuery;
      });
  }, [floorFilter, query, rooms, statusFilter, typeFilter]);

  const resetFilters = () => {
    setFloorFilter('Tất cả');
    setTypeFilter('Tất cả');
    setStatusFilter('Tất cả');
    setQuery('');
  };

  const handleSaveBooking = (bookingData) => {
    const editingBooking = bookingDialog?.booking;
    const bookingCode =
      editingBooking?.code ||
      `BK-${weekStart.getFullYear()}-${1023 + rooms.reduce(
        (totalCount, roomItem) => totalCount + roomItem.bookings.length,
        0,
      )}`;
    const selectedRows = bookingData.roomRows;
    const bookingBase = {
      ...editingBooking,
      guest: bookingData.guest,
      phone: bookingData.phone,
      source: bookingData.source,
      checkIn: bookingData.checkIn,
      checkOut: bookingData.checkOut,
      code: bookingCode,
      status: editingBooking?.status || 'Đã xác nhận',
      startDay: bookingData.startDay,
      duration: bookingData.duration,
      note: bookingData.note,
      paymentMethod: bookingData.paymentMethod,
      depositPercent: bookingData.depositPercent,
      roomRows: selectedRows,
    };

    setRooms((currentRooms) =>
      currentRooms.map((room) => {
        const remainingBookings = editingBooking
          ? room.bookings.filter((item) => item.code !== editingBooking.code)
          : room.bookings;
        const row = selectedRows.find(
          (selectedRoom) => selectedRoom.roomNumber === room.number,
        );

        if (!row) {
          return remainingBookings === room.bookings
            ? room
            : { ...room, bookings: remainingBookings };
        }

        return {
          ...room,
          bookings: [
            ...remainingBookings,
            {
              ...bookingBase,
              guests: Number(row.guests),
              foreignGuest: row.foreignGuest,
              price: Number(row.price),
            },
          ],
        };
      }),
    );
    setBookingDialog(null);
  };

  const updateBookingByCode = (booking, updates) => {
    if (!booking?.code) return;

    setRooms((currentRooms) =>
      currentRooms.map((roomItem) => ({
        ...roomItem,
        ...(updates.status === 'Đang lưu trú' &&
        roomItem.bookings.some((item) => item.code === booking.code)
          ? { roomStatus: 'Đang lưu trú' }
          : updates.status === 'Đã trả/hủy' &&
              roomItem.bookings.some((item) => item.code === booking.code)
            ? { roomStatus: 'Sẵn sàng' }
            : {}),
        bookings: roomItem.bookings.map((item) =>
          item.code === booking.code ? { ...item, ...updates } : item,
        ),
      })),
    );
  };

  const handleBookingPrimaryAction = (booking) => {
    const nextStatus =
      booking.status === 'Đang lưu trú'
        ? 'Đã trả/hủy'
        : booking.status === 'Đã xác nhận'
          ? 'Đang lưu trú'
          : 'Đã xác nhận';
    updateBookingByCode(booking, { status: nextStatus });
    setBookingDetail(null);
  };

  const handleCancelBooking = (booking) => {
    updateBookingByCode(booking, { status: 'Đã trả/hủy' });
  };

  const handleGuestProfilesChange = (booking, guestProfiles) => {
    updateBookingByCode(booking, { guestProfiles });
  };

  const weekDays = weekdays.map((label, index) => ({
    label,
    date: addDays(weekStart, index),
  }));
  const rangeLabel = `${formatDate(weekStart, true)} — ${formatDate(
    addDays(weekStart, 6),
    true,
  )}`;

  return (
    <section className="flex w-full min-w-0 flex-col gap-4">
      <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {summaryCards.map((card) => (
          <SummaryCard key={card.title} card={card} />
        ))}
      </div>

      <section
        aria-label="Bộ lọc và tìm kiếm đặt phòng"
        className="grid min-w-0 gap-4 rounded-xl border border-[#DCECF8] bg-white p-3 sm:p-[17px] xl:grid-cols-[minmax(0,1fr)_25rem] xl:items-center"
      >
        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex min-w-0 flex-wrap items-center gap-1 rounded-lg border border-[#DCECF8] bg-[#F7FBFF] p-1">
            <span className="shrink-0 px-2 text-[11px] font-semibold text-[#64748B]">
              TRẠNG THÁI:
            </span>
            <button
              type="button"
              aria-pressed={statusFilter === 'Tất cả'}
              onClick={() => setStatusFilter('Tất cả')}
              className={`shrink-0 rounded px-2 py-1 text-xs font-semibold ${
                statusFilter === 'Tất cả'
                  ? 'bg-[#0D8BEA] text-white'
                  : 'text-[#526575] hover:bg-[#E8F5FF]'
              }`}
            >
              Tất cả
            </button>
            {statusFilters.map(({ label, color }) => (
              <button
                key={label}
                type="button"
                aria-pressed={statusFilter === label}
                onClick={() => setStatusFilter(label)}
                className={`flex shrink-0 items-center gap-1 rounded px-2 py-1 text-xs font-semibold transition-colors ${
                  statusFilter === label
                    ? 'bg-[#E8F5FF] text-[#075A9C]'
                    : 'text-[#526575] hover:bg-[#E8F5FF]'
                }`}
              >
                <span
                  aria-hidden="true"
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: color }}
                />
                {label}
              </button>
            ))}
          </div>

          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <FilterGroup
              label="TẦNG"
              options={['Tất cả', 'T1', 'T2', 'T3', 'T4']}
              value={floorFilter}
              onChange={setFloorFilter}
            />
            <FilterGroup
              label="LOẠI"
              options={['Tất cả', 'Loại A', 'Loại B', 'Loại C']}
              value={typeFilter}
              onChange={setTypeFilter}
              className="bg-[#F4F9FD]"
            />
            <button
              type="button"
              aria-label="Đặt lại bộ lọc"
              onClick={resetFilters}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#DCECF8] bg-white text-[#526575] hover:bg-[#F7FBFF]"
            >
              <FiRefreshCw aria-hidden="true" className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center xl:justify-end">
          <label className="relative min-w-0 flex-1 sm:basis-full xl:basis-72">
            <FiSearch
              aria-hidden="true"
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#526575]"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm số phòng, tên khách, mã đặt,..."
              className="h-10 w-full rounded-lg border border-[#DCECF8] bg-[#F8FAFC] pl-9 pr-3 text-sm text-[#526575] outline-none placeholder:text-[#64748B] focus:border-[#0D8BEA]"
            />
          </label>

          <div className="flex min-w-0 items-center gap-2 sm:ml-auto">
            <div className="flex h-10 min-w-0 items-center rounded border border-[#DCECF8] bg-white p-[3px]">
              <button
                type="button"
                aria-label="Tuần trước"
                onClick={() =>
                  setWeekStart((current) => addDays(current, -7))
                }
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-[#526575] hover:bg-[#E8F5FF]"
              >
                <FiChevronLeft aria-hidden="true" className="h-4 w-4" />
              </button>
              <span className="flex min-w-0 items-center gap-1 rounded bg-[#E8F5FF] px-2 py-1 text-xs font-semibold text-[#0D8BEA]">
                <span className="truncate">{rangeLabel}</span>
              </span>
              <button
                type="button"
                aria-label="Tuần sau"
                onClick={() =>
                  setWeekStart((current) => addDays(current, 7))
                }
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-[#526575] hover:bg-[#E8F5FF]"
              >
                <FiChevronRight aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>
            <button
              type="button"
              onClick={() => setBookingDialog({ booking: null, room: null })}
              className="flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#0D8BEA] px-3 text-sm font-bold text-white transition-colors hover:bg-[#075A9C]"
            >
              <FiPlus aria-hidden="true" className="h-4 w-4" />
              <span className="hidden sm:inline">Tạo đặt phòng</span>
              <span className="sm:hidden">Tạo mới</span>
            </button>
          </div>
        </div>
      </section>

      <section
        aria-label="Lịch đặt phòng theo tuần"
        className="min-w-0 overflow-hidden rounded-lg border border-[#DCECF8] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
      >
        <div className="overflow-x-auto">
          <div className="min-w-[1132px]">
            <div className="grid h-12 grid-cols-[18rem_repeat(7,minmax(0,1fr))] border-b border-[#DCECF8] bg-[#F8FAFC]">
              <div className="flex items-center justify-center border-r border-[#DCECF8] px-4 text-sm font-bold text-[#075A9C]">
                PHÒNG
              </div>
              {weekDays.map(({ label, date }) => (
                <div
                  key={date.toISOString()}
                  className="flex flex-col items-center justify-center border-r border-[#DCECF8] text-xs leading-4 last:border-r-0"
                >
                  <span className="text-[#526575]">{label}</span>
                  <span className="font-bold text-[#075A9C]">
                    {formatDate(date)}
                  </span>
                </div>
              ))}
            </div>

            {visibleRooms.length > 0 ? (
              visibleRooms.map((room) => {
                const roomColor =
                  room.roomStatus === 'Đang lưu trú'
                    ? '#0D8BEA'
                    : room.roomStatus === 'Đang dọn'
                      ? '#FFC542'
                      : room.roomStatus === 'Bảo trì'
                        ? '#D9534F'
                        : '#2E8B57';

                return (
                  <div
                    key={room.number}
                    className="grid h-16 grid-cols-[18rem_repeat(7,minmax(0,1fr))] border-b border-[#DCECF8] last:border-b-0"
                  >
                    <div className="flex min-w-0 items-center justify-between gap-2 border-r border-[#DCECF8] px-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded border border-[#DCECF8] bg-white text-sm font-bold text-[#0D8BEA]">
                          {room.number}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="rounded-sm bg-[#E8F5FF] px-1.5 py-0.5 text-[10px] font-semibold text-[#526575]">
                              Loại {room.type}
                            </span>
                            <span
                              aria-label={room.roomStatus}
                              title={room.roomStatus}
                              className="h-1.5 w-1.5 shrink-0 rounded-full"
                              style={{ backgroundColor: roomColor }}
                            />
                          </div>
                          <p className="truncate text-xs text-[#526575]">
                            {room.description}
                          </p>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-xs font-bold text-[#526575]">
                          {room.price}
                        </p>
                        <p className="text-[11px] text-[#526575]">/đêm</p>
                      </div>
                    </div>

                    <div className="col-span-7 grid h-full min-w-0 grid-cols-7 grid-rows-1">
                      {weekDays.map(({ date }, index) => (
                        <div
                          key={date.toISOString()}
                          className="row-start-1 border-r border-[#DCECF8] bg-[rgba(232,245,255,0.5)] last:border-r-0"
                          style={{ gridColumn: index + 1 }}
                        />
                      ))}
                      {room.filteredBookings.map((booking, index) => {
                        const position = getBookingPosition(weekStart, booking);
                        if (!position) {
                          return null;
                        }

                        const Icon =
                          booking.status === 'Bảo trì'
                            ? FiTool
                            : booking.status === 'Đã trả/hủy'
                              ? FiGlobe
                              : FiUsers;
                        const isShort = position.duration < 2;

                        return (
                          <button
                            key={`${booking.code || booking.guest}-${index}`}
                            type="button"
                            title={`${booking.guest}${booking.code ? ` (${booking.code})` : ''}`}
                            onClick={() =>
                              booking.code &&
                              setBookingDetail({ booking, room })
                            }
                            className={`row-start-1 my-3 flex min-w-0 items-center gap-1 overflow-hidden rounded px-2 text-left text-white ${
                              isShort ? 'justify-center px-1 text-[11px]' : 'text-xs font-bold'
                            }`}
                            style={{
                              gridColumn: `${position.start + 1} / span ${position.duration}`,
                              gridRow: 1,
                              zIndex: 1,
                              backgroundColor: statusColors[booking.status],
                            }}
                          >
                            {!isShort && (
                              <Icon
                                aria-hidden="true"
                                className="h-4 w-4 shrink-0"
                              />
                            )}
                            <span className="truncate">
                              {booking.code
                                ? `${booking.guest} - (${booking.code}) • ${booking.guests} Khách`
                                : booking.guest}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="px-4 py-10 text-center text-sm text-[#526575]">
                Không tìm thấy phòng phù hợp với bộ lọc.
              </p>
            )}

            <div className="flex flex-col items-center gap-1 bg-[#F8FAFC] px-4 py-2 text-xs text-[#526575] sm:flex-row sm:justify-center sm:gap-4">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label="Trang trước"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  className="rounded px-2 py-1 hover:bg-[#E8F5FF]"
                >
                  ‹
                </button>
                {[1, 2, 3].map((pageNumber) => (
                  <button
                    key={pageNumber}
                    type="button"
                    aria-current={page === pageNumber ? 'page' : undefined}
                    onClick={() => setPage(pageNumber)}
                    className={`h-6 min-w-6 rounded px-2 ${
                      page === pageNumber
                        ? 'bg-[#0D8BEA] font-bold text-white'
                        : 'hover:bg-[#E8F5FF]'
                    }`}
                  >
                    {pageNumber}
                  </button>
                ))}
                <span className="px-1">…</span>
                <button
                  type="button"
                  aria-current={page === 10 ? 'page' : undefined}
                  onClick={() => setPage(10)}
                  className={`h-6 min-w-6 rounded px-2 ${
                    page === 10
                      ? 'bg-[#0D8BEA] font-bold text-white'
                      : 'hover:bg-[#E8F5FF]'
                  }`}
                >
                  10
                </button>
                <button
                  type="button"
                  aria-label="Trang sau"
                  onClick={() => setPage((current) => Math.min(10, current + 1))}
                  className="rounded px-2 py-1 hover:bg-[#E8F5FF]"
                >
                  ›
                </button>
              </div>
              <p>Hiển thị 1–10 trên tổng 100 phòng</p>
            </div>
          </div>
        </div>
      </section>

      {bookingDialog && (
        <BookingFormDialog
          key={bookingDialog.booking?.code || 'new-booking'}
          booking={bookingDialog.booking}
          room={bookingDialog.room}
          rooms={rooms}
          onClose={() => setBookingDialog(null)}
          onSave={handleSaveBooking}
        />
      )}
      {bookingDetail && (
        <BookingDetailDrawer
          key={bookingDetail.booking.code}
          booking={bookingDetail.booking}
          room={bookingDetail.room}
          onClose={() => setBookingDetail(null)}
          onEdit={(booking, selectedRoom) => {
            setBookingDetail(null);
            setBookingDialog({ booking, room: selectedRoom });
          }}
          onPrimaryAction={handleBookingPrimaryAction}
          onCancelBooking={handleCancelBooking}
          onGuestsChange={handleGuestProfilesChange}
        />
      )}
    </section>
  );
}

export default BookingPage;
