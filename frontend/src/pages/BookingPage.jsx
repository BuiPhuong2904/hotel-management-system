import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import ToastNotification from '../components/ToastNotification';
import { getRoomsAPI } from '../services/roomService';
import bookingService from '../services/bookingService';
import {
  formToApiPayload,
  mapBooking,
  mapGuestToApi,
  mapRoom,
  startOfDay,
  toDateInput,
} from '../utils/bookingMapper';

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

const weekdays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

const PAGE_SIZE = 10;
const ROOM_STATUS_FILTERS = ['Đang dọn', 'Bảo trì'];

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function startOfWeek(date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  return start;
}

function formatDate(date, includeYear = false) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return includeYear ? `${day}/${month}/${year}` : `${day}/${month}`;
}

// Vị trí thanh đặt phòng trong tuần đang xem (cột 0..6)
function getBookingPosition(weekStart, booking) {
  const bookingStart = startOfDay(booking.checkIn);
  const bookingEnd = addDays(bookingStart, booking.duration);
  const visibleStart = Math.max(
    0,
    Math.round((bookingStart.getTime() - weekStart.getTime()) / DAY_IN_MS),
  );
  const visibleEnd = Math.min(
    7,
    Math.round((bookingEnd.getTime() - weekStart.getTime()) / DAY_IN_MS),
  );

  if (visibleStart >= visibleEnd) {
    return null;
  }

  return { start: visibleStart, duration: visibleEnd - visibleStart };
}

const apiError = (error) =>
  error.response?.data?.message || 'Không thể kết nối máy chủ, vui lòng thử lại!';

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
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [weekBookings, setWeekBookings] = useState([]);
  const [todayBookings, setTodayBookings] = useState([]);
  const [loadError, setLoadError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);
  const [floorFilter, setFloorFilter] = useState('Tất cả');
  const [typeFilter, setTypeFilter] = useState('Tất cả');
  const [statusFilter, setStatusFilter] = useState('Tất cả');
  const [query, setQuery] = useState('');
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [page, setPage] = useState(1);
  const [bookingDialog, setBookingDialog] = useState(null);
  const [bookingDetail, setBookingDetail] = useState(null);

  const refresh = () => setReloadKey((key) => key + 1);

  const notify = (message, type = 'success') => {
    window.clearTimeout(toastTimer.current);
    setToast({ message, type });
    toastTimer.current = window.setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => () => window.clearTimeout(toastTimer.current), []);


  useEffect(() => {
    let cancelled = false;
    const today = toDateInput(new Date());

    (async () => {
      try {
        const [roomsRes, weekRes, todayRes] = await Promise.all([
          getRoomsAPI(),
          bookingService.getBookings({
            from: toDateInput(weekStart),
            to: toDateInput(addDays(weekStart, 6)),
          }),
          bookingService.getBookings({ from: today, to: today }),
        ]);
        if (cancelled) return;
        setRooms(roomsRes.data.map(mapRoom));
        setWeekBookings(weekRes.data.map(mapBooking));
        setTodayBookings(todayRes.data.map(mapBooking));
        setLoadError('');
      } catch (error) {
        if (!cancelled) setLoadError(apiError(error));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [weekStart, reloadKey]);

  const roomsWithBookings = useMemo(() => {
    const byId = new Map(rooms.map((room) => [room.id, { ...room, bookings: [] }]));
    const ordered = [...weekBookings].sort(
      (a, b) => (a.apiStatus === 'Pending' ? 0 : 1) - (b.apiStatus === 'Pending' ? 0 : 1),
    );

    ordered.forEach((booking) => {
      if (booking.apiStatus === 'Cancelled') return;
      booking.roomRows.forEach((row) => {
        const room = byId.get(row.roomId);
        if (!room) return;
        room.bookings.push({
          id: booking.id,
          code: booking.code,
          guest: booking.guest,
          guests: row.guests,
          status: booking.status,
          checkIn: booking.checkIn,
          duration: booking.duration,
        });
      });
    });

    return [...byId.values()];
  }, [rooms, weekBookings]);

  const summaryCards = useMemo(() => {
    const today = toDateInput(new Date());
    const occupied = rooms.filter((room) => room.apiStatus === 'Occupied').length;
    const arrivals = todayBookings.filter(
      (b) => b.checkIn === today && ['Pending', 'Confirmed'].includes(b.apiStatus),
    ).length;
    const departures = todayBookings.filter(
      (b) => b.checkOut === today && b.apiStatus === 'CheckedIn',
    ).length;
    const pending = weekBookings.filter((b) => b.apiStatus === 'Pending').length;

    let usedNights = 0;
    weekBookings
      .filter((b) => ['Confirmed', 'CheckedIn', 'Completed'].includes(b.apiStatus))
      .forEach((booking) => {
        booking.roomRows.forEach(() => {
          const position = getBookingPosition(weekStart, booking);
          if (position) usedNights += position.duration;
        });
      });
    const fillRate = rooms.length ? (usedNights / (rooms.length * 7)) * 100 : 0;
    const capacity = rooms.length ? (occupied / rooms.length) * 100 : 0;
    const pad = (n) => String(n).padStart(2, '0');

    return [
      {
        title: 'TỔNG LƯỢT ĐẶT',
        value: String(weekBookings.filter((b) => b.apiStatus !== 'Cancelled').length),
        detail: 'hồ sơ',
        note: 'trong tuần đang xem',
        color: '#075A9C',
      },
      {
        title: 'ĐANG LƯU TRÚ',
        value: pad(occupied),
        detail: `/ ${rooms.length} phòng`,
        note: `Công suất hiện tại: ${capacity.toFixed(1)}%`,
        color: '#0D8BEA',
      },
      {
        title: 'ĐẾN HÔM NAY',
        value: pad(arrivals),
        detail: 'lượt nhận',
        note: 'Check-in từ 14:00',
        color: '#2E8B57',
      },
      {
        title: 'ĐI HÔM NAY',
        value: pad(departures),
        detail: 'lượt trả',
        note: 'Check-out trước 12:00',
        color: '#D97706',
      },
      {
        title: 'LẤP ĐẦY TRONG TUẦN',
        value: `${fillRate.toFixed(1)}%`,
        note: 'Đêm có khách / tổng đêm phòng',
        color: '#075A9C',
        progress: Math.min(fillRate, 100),
      },
      {
        title: 'CHỜ DUYỆT CỌC',
        value: pad(pending),
        detail: 'đơn',
        note: 'Chưa giữ phòng',
        color: 'rgba(217,83,79,0.9)',
      },
    ];
  }, [rooms, weekBookings, todayBookings, weekStart]);

  const visibleRooms = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('vi');
    const isRoomStatusFilter = ROOM_STATUS_FILTERS.includes(statusFilter);

    return roomsWithBookings
      .map((room) => {
        const roomMatchesQuery =
          !normalizedQuery ||
          `${room.number} ${room.floor} ${room.type} ${room.description}`
            .toLocaleLowerCase('vi')
            .includes(normalizedQuery);
        const filteredBookings = room.bookings.filter((booking) => {
          const matchesStatus =
            statusFilter === 'Tất cả' ||
            isRoomStatusFilter ||
            booking.status === statusFilter;
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
          statusFilter === 'Tất cả' ||
          (isRoomStatusFilter
            ? room.roomStatus === statusFilter
            : room.filteredBookings.length > 0);
        const matchesQuery =
          !normalizedQuery ||
          room.roomMatchesQuery ||
          room.filteredBookings.length > 0;

        return matchesFloor && matchesType && matchesStatus && matchesQuery;
      });
  }, [floorFilter, query, roomsWithBookings, statusFilter, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(visibleRooms.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedRooms = visibleRooms.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const resetFilters = () => {
    setFloorFilter('Tất cả');
    setTypeFilter('Tất cả');
    setStatusFilter('Tất cả');
    setQuery('');
    setPage(1);
  };

  const run = async (action, successMessage) => {
    if (busy) return false;
    setBusy(true);
    try {
      await action();
      notify(successMessage, 'success');
      refresh();
      return true;
    } catch (error) {
      notify(apiError(error), 'error');
      return false;
    } finally {
      setBusy(false);
    }
  };

  // Mở chi tiết: tải đủ thông tin (kèm danh sách khách) rồi mới mở
  const openDetail = async (item, room) => {
    try {
      const res = await bookingService.getBookingById(item.id);
      setBookingDetail({ booking: mapBooking(res.data), room });
    } catch (error) {
      notify(apiError(error), 'error');
    }
  };

  const handleSaveBooking = async (form) => {
    const editing = bookingDialog?.booking;
    const payload = formToApiPayload(form, rooms);

    if (payload.Rooms.some((row) => !row.RoomID)) {
      notify('Vui lòng chọn phòng hợp lệ cho từng dòng.', 'error');
      return;
    }

    const roomTotal =
      form.roomRows.reduce((sum, row) => sum + Number(row.price || 0), 0) *
      form.duration;
    const ok = await run(
      async () => {
        if (editing) {
          await bookingService.updateBooking(editing.id, payload);
        } else {
          await bookingService.reserve({
            ...payload,
            Deposit: Math.ceil((roomTotal * form.depositPercent) / 100),
          });
        }
      },
      editing ? 'Đã cập nhật đặt phòng' : 'Đã tạo đặt phòng',
    );
    if (ok) setBookingDialog(null);
  };

  const handleBookingPrimaryAction = async (booking) => {
    if (booking.apiStatus === 'CheckedIn') {
      setBookingDetail(null);
      navigate('/invoices', { state: { createInvoiceForBookingId: booking.id } });
      return;
    }

    let ok = false;
    if (booking.apiStatus === 'Pending') {
      ok = await run(
        () =>
          bookingService.confirmDeposit(
            booking.id,
            Math.ceil(booking.totalAmount * 0.3),
          ),
        'Đã xác nhận cọc, đơn được giữ phòng',
      );
    } else if (booking.apiStatus === 'Confirmed') {
      ok = await run(() => bookingService.checkIn(booking.id), 'Nhận phòng thành công');
    }
    if (ok) setBookingDetail(null);
  };

  const handleCancelBooking = (booking) =>
    run(() => bookingService.cancelBooking(booking.id), 'Đã hủy đặt phòng');

  // Trả về true/false để drawer biết có đóng cửa sổ nhập khách hay không
  const handleGuestsChange = (booking, guests, roomRow) =>
    run(
      () =>
        bookingService.updateRoomGuests(
          booking.id,
          roomRow.detailId,
          guests.map(mapGuestToApi),
        ),
      'Đã lưu danh sách khách',
    );

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
      {loadError && (
        <p
          role="alert"
          className="rounded-lg border border-[#D9534F] bg-white px-4 py-3 text-sm text-[#D9534F]"
        >
          {loadError}
        </p>
      )}
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
                  key={toDateInput(date)}
                  className="flex flex-col items-center justify-center border-r border-[#DCECF8] text-xs leading-4 last:border-r-0"
                >
                  <span className="text-[#526575]">{label}</span>
                  <span className="font-bold text-[#075A9C]">
                    {formatDate(date)}
                  </span>
                </div>
              ))}
            </div>

            {pagedRooms.length > 0 ? (
              pagedRooms.map((room) => {
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
                          key={toDateInput(date)}
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
                            key={`${booking.code}-${index}`}
                            type="button"
                            title={`${booking.guest}${booking.code ? ` (${booking.code})` : ''}`}
                            onClick={() => openDetail(booking, room)}
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

            <div className="flex flex-col items-center gap-1 bg-[#F8FAFC] px-4 py-2 text-xs text-[#526575]">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label="Trang trước"
                  onClick={() => setPage(Math.max(1, currentPage - 1))}
                  className="rounded px-2 py-1 hover:bg-[#E8F5FF]"
                >
                  ‹
                </button>
                {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                  (pageNumber) => (
                    <button
                      key={pageNumber}
                      type="button"
                      aria-current={currentPage === pageNumber ? 'page' : undefined}
                      onClick={() => setPage(pageNumber)}
                      className={`h-6 min-w-6 rounded px-2 text-sm ${
                        currentPage === pageNumber
                          ? 'bg-[#0D8BEA] font-bold text-white'
                          : 'hover:bg-[#E8F5FF]'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  ),
                )}
                <button
                  type="button"
                  aria-label="Trang sau"
                  onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
                  className="rounded px-2 py-1 hover:bg-[#E8F5FF]"
                >
                  ›
                </button>
              </div>
              <p>
                Hiển thị{' '}
                {visibleRooms.length ? (currentPage - 1) * PAGE_SIZE + 1 : 0}–
                {Math.min(currentPage * PAGE_SIZE, visibleRooms.length)} trên tổng{' '}
                {visibleRooms.length} phòng
              </p>
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
          key={bookingDetail.booking.id}
          booking={bookingDetail.booking}
          room={bookingDetail.room}
          onClose={() => setBookingDetail(null)}
          onEdit={(booking, selectedRoom) => {
            setBookingDetail(null);
            setBookingDialog({ booking, room: selectedRoom });
          }}
          onPrimaryAction={handleBookingPrimaryAction}
          onCancelBooking={handleCancelBooking}
          onGuestsChange={handleGuestsChange}
        />
      )}
      {toast && <ToastNotification message={toast.message} type={toast.type} />}
    </section>
  );
}

export default BookingPage;