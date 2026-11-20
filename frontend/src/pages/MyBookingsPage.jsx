import { useEffect, useMemo, useRef, useState } from 'react';
import {
  FiChevronDown,
  FiChevronUp,
  FiFacebook,
  FiInfo,
  FiInstagram,
  FiLogOut,
  FiMail,
  FiMapPin,
  FiMessageCircle,
  FiPhone,
  FiPrinter,
  FiRefreshCw,
  FiSearch,
  FiSend,
  FiStar,
  FiUser,
  FiX,
} from 'react-icons/fi';
import { FaHotel } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import ToastNotification from '../components/ToastNotification';

const sampleBookings = [
  {
    bookingCode: 'BK-2026-9821',
    status: 'Đã xác nhận',
    paymentStatus: '✓ Đã cọc 30%',
    dateText: '25/10/2026 (14:00) - 27/10/2026 (12:00)',
    nights: 2,
    guests: 4,
    promotionCode: 'SUMMER2026',
    extraText: null,
    roomTotal: 810000,
    total: 729000,
    deposit: 218700,
    remaining: 510300,
    contact: { name: 'Nguyễn Minh Anh', phone: '0912 839 221', email: 'minhanh.nguyen@email.com' },
    rooms: [
      { number: 'P101', typeName: 'Phòng loại A (Tiêu chuẩn)', guests: 2, guestType: 'Nội địa', amount: 300000 },
      { number: 'P201', typeName: 'Phòng loại B (Nâng cao)', guests: 2, guestType: 'Có khách nước ngoài ×1.5', amount: 510000 },
    ],
  },
  {
    bookingCode: 'BK-2026-7734',
    status: 'Chờ thanh toán cọc',
    paymentStatus: null,
    dateText: '02/11/2026 - 05/11/2026',
    nights: 3,
    guests: 3,
    promotionCode: null,
    extraText: '+25% phụ thu',
    roomTotal: 750000,
    total: 750000,
    deposit: 225000,
    remaining: 525000,
    contact: { name: 'Nguyễn Minh Anh', phone: '0912 839 221', email: 'minhanh.nguyen@email.com' },
    rooms: [
      { number: 'P102', typeName: 'Phòng loại A (Tiêu chuẩn)', guests: 2, guestType: 'Nội địa', amount: 450000 },
      { number: 'P301', typeName: 'Phòng loại C (Phòng gia đình)', guests: 1, guestType: 'Nội địa', amount: 300000 },
    ],
  },
  {
    bookingCode: 'BK-2026-6190',
    status: 'Đang lưu trú',
    paymentStatus: null,
    dateText: '17/11/2026 - 19/11/2026',
    nights: 2,
    guests: 2,
    promotionCode: null,
    extraText: 'Đã phát sinh 2 dịch vụ',
    roomTotal: 300000,
    total: 500000,
    deposit: 300000,
    remaining: 200000,
    contact: { name: 'Nguyễn Minh Anh', phone: '0912 839 221', email: 'minhanh.nguyen@email.com' },
    rooms: [
      { number: 'P103', typeName: 'Phòng loại A (Tiêu chuẩn)', guests: 2, guestType: 'Nội địa', amount: 300000 },
    ],
    services: [
      { name: 'Ăn sáng phòng', amount: 120000 },
      { name: 'Giặt là', amount: 80000 },
    ],
  },
  {
    bookingCode: 'BK-2026-4512',
    status: 'Đã hoàn tất',
    paymentStatus: '✓ Đã thanh toán đủ',
    dateText: '15/09/2026 - 17/09/2026',
    nights: 2,
    guests: 2,
    promotionCode: null,
    extraText: null,
    roomTotal: 490000,
    total: 490000,
    deposit: 490000,
    remaining: 0,
    contact: { name: 'Nguyễn Minh Anh', phone: '0912 839 221', email: 'minhanh.nguyen@email.com' },
    rooms: [
      { number: 'P104', typeName: 'Phòng loại A (Tiêu chuẩn)', guests: 2, guestType: 'Nội địa', amount: 490000 },
    ],
  },
];

function getCustomer() {
  for (const key of ['customerUser', 'user']) {
    const value = localStorage.getItem(key);
    if (!value) continue;
    try {
      const customer = JSON.parse(value);
      if (customer && typeof customer === 'object') return customer;
    } catch (error) {
      console.error(`Không thể đọc tài khoản từ ${key}.`, error);
    }
  }
  return null;
}

function readBookings() {
  let stored = [];
  try {
    const value = JSON.parse(localStorage.getItem('customerBookings') || '[]');
    if (Array.isArray(value)) stored = value;
  } catch (error) {
    console.error('Không thể đọc danh sách customerBookings.', error);
  }

  const storedByCode = new Map(
    stored
      .map((item) => [item.bookingCode || item.code, item])
      .filter(([code]) => Boolean(code)),
  );

  const samples = sampleBookings.map((sample) => {
    const saved = storedByCode.get(sample.bookingCode);
    return saved ? { ...sample, ...saved, bookingCode: sample.bookingCode } : sample;
  });
  const knownCodes = new Set(sampleBookings.map((item) => item.bookingCode));
  const newBookings = stored
    .map((item) => ({ ...item, bookingCode: item.bookingCode || item.code }))
    .filter((item) => item.bookingCode && !knownCodes.has(item.bookingCode));

  return [...newBookings, ...samples];
}

const formatPrice = (amount) => `${Number(amount).toLocaleString('vi-VN')} đ`;

function MyBookingsPage() {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(getCustomer);
  const [bookings, setBookings] = useState(readBookings);
  const [expandedId, setExpandedId] = useState('BK-2026-9821');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tất cả');
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const accountRef = useRef(null);

  const customerName = customer?.name || customer?.fullName || customer?.username || 'Nguyễn Minh Anh';
  const customerInitials = customerName.trim().split(/\s+/).slice(-2).map((part) => part[0]).join('').toLocaleUpperCase('vi');

  useEffect(() => {
    const handleOutside = (event) => {
      if (accountRef.current && !accountRef.current.contains(event.target)) setAccountMenuOpen(false);
    };
    const handleEscape = (event) => {
      if (event.key === 'Escape') setAccountMenuOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), 3000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const logout = () => {
    localStorage.removeItem('customerUser');
    setCustomer(null);
    setAccountMenuOpen(false);
    navigate('/');
  };

  const filteredBookings = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('vi');
    return bookings.filter((booking) => {
      const roomText = (booking.rooms || []).map((room) => `${room.number || ''} ${room.typeName || ''}`).join(' ');
      const matchesSearch = !query || [booking.bookingCode, booking.code, roomText]
        .some((value) => String(value || '').toLocaleLowerCase('vi').includes(query));
      const matchesStatus = statusFilter === 'Tất cả' || booking.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [bookings, search, statusFilter]);

  const kpis = useMemo(() => [
    { title: 'TẤT CẢ ĐẶT PHÒNG', value: bookings.length, unit: 'phiếu', note: 'Hồ sơ tài khoản', color: '#075A9C' },
    { title: 'ĐÃ XÁC NHẬN / SẮP ĐẾN', value: bookings.filter((item) => item.status === 'Đã xác nhận').length, unit: 'phiếu', note: 'Đã hoàn tất đặt cọc 30%', color: '#2E8B57' },
    { title: 'ĐANG LƯU TRÚ', value: bookings.filter((item) => item.status === 'Đang lưu trú').length, unit: 'phiếu', note: 'Đã nhận phòng tại quầy', color: '#0D8BEA' },
    { title: 'CHỜ CỌC & HOÀN TẤT', value: bookings.filter((item) => ['Chờ thanh toán cọc', 'Đã hoàn tất'].includes(item.status)).length, unit: 'phiếu', note: '1 chờ cọc • 1 đã hoàn tất', color: '#D97706' },
  ], [bookings]);

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('Tất cả');
  };

  const persistBookings = (next) => {
    setBookings(next);
    try {
      localStorage.setItem('customerBookings', JSON.stringify(next));
    } catch (error) {
      console.error('Không thể lưu danh sách đặt phòng.', error);
    }
  };

  const cancelBooking = (booking) => {
    if (!window.confirm(`Xác nhận hủy đặt phòng ${booking.bookingCode}?`)) return;
    persistBookings(bookings.map((item) => item.bookingCode === booking.bookingCode
      ? { ...item, status: 'Đã hủy', paymentStatus: null }
      : item));
    setExpandedId(null);
    setToast({ message: `Đã hủy đặt phòng ${booking.bookingCode}.`, type: 'success' });
  };

  const printBooking = (bookingCode) => {
    setToast({ message: `Đang chuẩn bị phiếu PDF ${bookingCode}.`, type: 'success' });
    window.print();
  };

  return (
    <div className="min-h-screen w-full bg-[#F7FBFF] font-['Open_Sans',sans-serif] text-[#526575]">
      <CustomerHeader
        customer={customer}
        customerName={customerName}
        customerInitials={customerInitials}
        accountMenuOpen={accountMenuOpen}
        setAccountMenuOpen={setAccountMenuOpen}
        accountRef={accountRef}
        logout={logout}
      />

      <main className="mx-auto w-full max-w-360 px-5 py-6 sm:px-8">
        <div className="flex flex-col gap-6">
          <section>
            <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-sm leading-normal text-[#526575]">
              <Link to="/">Trang chủ</Link><span aria-hidden="true">›</span>
              <Link to="/customer">Tài khoản</Link><span aria-hidden="true">›</span>
              <span className="text-[#075A9C]">Lịch sử đặt phòng</span>
            </nav>
            <h1 className="mt-2 text-[32px] leading-normal font-bold text-[#075A9C]">Lịch sử đặt phòng</h1>
            <p className="mt-1 text-[16px] leading-normal text-[#526575]">
              Theo dõi lịch sử lưu trú, phiếu đặt phòng trực tuyến và trạng thái thanh toán cọc.
            </p>
          </section>

          <section aria-label="Thống kê đặt phòng" className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {kpis.map((kpi) => (
              <article key={kpi.title} className="rounded-xl border border-[#DCECF8] bg-white p-4.25 shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
                <h2 className="text-[18px] leading-normal font-bold" style={{ color: kpi.color }}>{kpi.title}</h2>
                <div className="mt-2 flex items-end gap-2">
                  <strong className="text-[24px] leading-normal" style={{ color: kpi.color }}>{String(kpi.value).padStart(2, '0')}</strong>
                  <span className="pb-0.5 text-[14px] leading-normal text-[#526575]">{kpi.unit}</span>
                </div>
                <p className="mt-1 text-[14px] leading-normal text-[#526575]">{kpi.note}</p>
              </article>
            ))}
          </section>

          <section aria-label="Bộ lọc lịch sử đặt phòng" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#DCECF8] bg-white p-6.25">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <label className="flex min-h-12 min-w-0 flex-1 items-center gap-3 rounded-lg border border-[#DCECF8] bg-[#F7FBFF] px-4 sm:max-w-133.5">
                <FiSearch aria-hidden="true" className="h-4 w-4 shrink-0 text-[#526575]" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Tìm theo mã đặt phòng (BK-...) hoặc số phòng, loại phòng..."
                  className="min-w-0 flex-1 bg-transparent text-[14px] leading-normal outline-none placeholder:text-[#526575]"
                />
              </label>
              <button type="button" aria-label="Làm mới bộ lọc" onClick={resetFilters} className="flex size-12 shrink-0 items-center justify-center rounded-lg border border-[#DCECF8] bg-white text-[#526575]">
                <FiRefreshCw aria-hidden="true" className="h-5 w-5" />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <label className="relative">
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  aria-label="Lọc trạng thái đặt phòng"
                  className="min-h-12 appearance-none rounded-lg border border-[#DCECF8] bg-white py-3 pl-3 pr-9 text-[14px] leading-normal text-[#526575] outline-none"
                >
                  {['Tất cả', 'Đã xác nhận', 'Chờ thanh toán cọc', 'Đang lưu trú', 'Đã hoàn tất', 'Đã hủy'].map((status) => (
                    <option key={status} value={status}>Trạng thái: {status}</option>
                  ))}
                </select>
                <FiChevronDown aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2" />
              </label>
              <button type="button" onClick={() => navigate('/rooms')} className="flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#0D8BEA] px-4 text-[14px] leading-normal font-bold text-white shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
                <span className="text-lg" aria-hidden="true">+</span> Đặt thêm phòng
              </button>
            </div>
          </section>

          <section aria-label="Danh sách phiếu đặt phòng" className="flex flex-col gap-4">
            {filteredBookings.map((booking) => (
              <BookingCard
                key={booking.bookingCode}
                booking={booking}
                expanded={expandedId === booking.bookingCode}
                onToggle={() => setExpandedId((current) => current === booking.bookingCode ? null : booking.bookingCode)}
                onCancel={() => cancelBooking(booking)}
                onPrint={() => printBooking(booking.bookingCode)}
                navigate={navigate}
              />
            ))}
            {filteredBookings.length === 0 && (
              <div className="rounded-xl border border-[#DCECF8] bg-white p-6 text-center text-[14px] text-[#526575]">Không tìm thấy phiếu đặt phòng phù hợp.</div>
            )}
          </section>
        </div>
      </main>

      <CustomerFooter />
      <FloatingAiChatbot />
      <ToastNotification message={toast?.message} type={toast?.type} />
    </div>
  );
}

function CustomerHeader({ customer, customerName, customerInitials, accountMenuOpen, setAccountMenuOpen, accountRef, logout }) {
  return (
    <header className="sticky top-0 z-40 border-b border-[#DCECF8] bg-white/95 shadow-[0_2px_5px_rgba(7,90,156,0.04)] backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-360 items-center justify-between gap-4 px-5 py-5.5 sm:px-8">
        <Link to="/" className="flex shrink-0 items-center gap-2 text-[#075A9C]" aria-label="Grand Hotel - Trang chủ">
          <FaHotel aria-hidden="true" className="h-5 w-5" />
          <span className="text-[20px] leading-normal font-bold">Grand Hotel</span>
        </Link>
        <nav aria-label="Điều hướng chính" className="hidden items-center gap-8 lg:flex">
          <Link to="/" className="text-sm font-semibold text-[#526575]">Trang chủ</Link>
          <Link to="/rooms" className="text-sm font-bold text-[#0D8BEA]">Phòng nghỉ</Link>
          <Link to="/#facilities" className="text-sm font-semibold text-[#526575]">Tiện ích</Link>
          <Link to="/#about" className="text-sm font-semibold text-[#526575]">Về chúng tôi</Link>
          <Link to="/#contact" className="text-sm font-semibold text-[#526575]">Liên hệ</Link>
        </nav>
        <div className="flex shrink-0 items-center gap-4">
          {customer ? (
            <div className="relative" ref={accountRef}>
              <button type="button" aria-haspopup="menu" aria-expanded={accountMenuOpen} onClick={() => setAccountMenuOpen((open) => !open)} className="inline-flex min-h-12 items-center gap-2.5 rounded-full border border-[#DCECF8] bg-white px-3 text-sm font-semibold text-[#075A9C] shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E8F5FF] text-xs font-bold text-[#075A9C]">{customerInitials}</span>
                <span className="hidden max-w-40 truncate sm:inline">{customerName}</span>
                <FiChevronDown aria-hidden="true" className="h-4 w-4 shrink-0" />
              </button>
              {accountMenuOpen && (
                <div role="menu" className="absolute right-0 mt-2 w-56 rounded-xl border border-[#DCECF8] bg-white p-2 shadow-lg">
                  <Link role="menuitem" to="/customer" onClick={() => setAccountMenuOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-[#526575] hover:bg-[#F7FBFF]"><FiUser />Thông tin tài khoản</Link>
                  <Link role="menuitem" to="/my-bookings" onClick={() => setAccountMenuOpen(false)} className="block rounded-lg px-3 py-2 text-sm font-semibold text-[#526575] hover:bg-[#F7FBFF]">Lịch sử đặt phòng</Link>
                  <button type="button" onClick={logout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-[#526575] hover:bg-[#F7FBFF]"><FiLogOut />Đăng xuất</button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="text-sm font-bold text-[#075A9C]">Đăng nhập</Link>
          )}
          <Link to="/rooms" className="inline-flex min-h-10 items-center justify-center rounded-lg bg-[#0D8BEA] px-5 text-sm font-bold text-white">Đặt phòng</Link>
        </div>
      </div>
    </header>
  );
}

function BookingCard({ booking, expanded, onToggle, onCancel, onPrint, navigate }) {
  const statusStyles = {
    'Đã xác nhận': 'bg-[#ECFDF5] text-[#2E8B57]',
    'Chờ thanh toán cọc': 'bg-[#FFFBEB] text-[#D97706]',
    'Đang lưu trú': 'border border-[#DCECF8] bg-[#F7FBFF] text-[#0D8BEA]',
    'Đã hoàn tất': 'bg-[rgba(200,220,239,0.4)] text-[#526575]',
    'Đã hủy': 'border border-[#FECACA] bg-[#FEF2F2] text-[#D9534F]',
  };
  const rooms = booking.rooms || [
    { number: 'P101', typeName: 'Phòng loại A (Tiêu chuẩn)', guests: Number(booking.guests || 2), guestType: 'Nội địa', amount: Number(booking.roomTotal || booking.total || 0) },
  ];
  const dateText = booking.dateText
    || (booking.booking?.checkIn && booking.booking?.checkOut ? `${booking.booking.checkIn} - ${booking.booking.checkOut}` : '25/10/2026 - 27/10/2026');
  const nights = Number(booking.nights || 2);
  const guests = Number(booking.guests || rooms.reduce((sum, room) => sum + Number(room.guests || 0), 0) || 2);
  const isPending = booking.status === 'Chờ thanh toán cọc';
  const isStay = booking.status === 'Đang lưu trú';
  const isCompleted = booking.status === 'Đã hoàn tất';
  const canCancel = !['Đã hoàn tất', 'Đã hủy', 'Đang lưu trú'].includes(booking.status);

  let amountLabel = `Tổng hóa đơn: ${formatPrice(booking.total || booking.roomTotal || 0)}`;
  let amountColor = 'text-[#075A9C]';
  if (booking.status === 'Đã xác nhận') {
    amountLabel = `Còn lại tại quầy: ${formatPrice(booking.remaining ?? 510300)}`;
  } else if (isPending) {
    amountLabel = `Cần cọc tối thiểu (30%): ${formatPrice(booking.deposit ?? 225000)}`;
    amountColor = 'text-[#D97706]';
  } else if (isStay) {
    amountLabel = `Tạm tính lưu trú: ${formatPrice(booking.total ?? 500000)}`;
  }

  const detailLabel = isStay
    ? 'Xem chi tiết & Dịch vụ đã gọi'
    : expanded ? 'Thu gọn' : 'Xem chi tiết';

  return (
    <article className={`overflow-hidden rounded-xl border bg-white ${expanded ? 'border-[#0D8BEA] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.10),0_2px_4px_-2px_rgba(0,0,0,0.10)]' : 'border-[#DCECF8] shadow-[0_1px_1px_rgba(0,0,0,0.05)]'}`}>
      <header className="flex flex-col items-start justify-between gap-4 p-5 lg:flex-row lg:items-center">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap gap-2">
            <span className={`rounded-full px-2.5 py-1 text-[12px] leading-normal ${statusStyles[booking.status] || statusStyles['Đã hủy']}`}>{booking.status}</span>
            {booking.paymentStatus && (
              <span className="rounded-full bg-[#E8F5FF] px-2.5 py-1 text-[12px] leading-normal text-[#075A9C]">{booking.paymentStatus}</span>
            )}
          </div>
          <p className="mt-2 text-[18px] leading-normal font-bold text-[#075A9C]">{booking.bookingCode}</p>
          <p className="mt-1 text-[14px] leading-normal text-[#526575]">
            {dateText} | {nights} đêm - {guests} khách
            {booking.extraText && ` (${booking.extraText})`}
            {booking.promotionCode && <> | Mã ưu đãi: <span className="text-[#0D8BEA]">{booking.promotionCode}</span></>}
          </p>
        </div>
        <div className="flex w-full flex-col items-start gap-2 lg:w-auto lg:items-end">
          {booking.status === 'Đã xác nhận' && (
            <p className="text-[14px] leading-normal text-[#526575]">Tổng sau giảm: {formatPrice(booking.total || 729000)}</p>
          )}
          {isPending && (
            <p className="text-[14px] leading-normal text-[#526575]">Tổng tiền phòng: {formatPrice(booking.roomTotal || booking.total || 750000)}</p>
          )}
          {isStay && (
            <p className="text-[14px] leading-normal text-[#526575]">Tổng tiền phòng: {formatPrice(booking.roomTotal || 300000)}</p>
          )}
          {isCompleted && (
            <p className="text-[14px] leading-normal text-[#526575]">Đã thanh toán đầy đủ tại quầy</p>
          )}
          <p className={`text-[18px] leading-normal font-bold ${amountColor}`}>{amountLabel}</p>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <button type="button" onClick={onToggle} className="flex items-center gap-1.5 rounded-lg bg-[#E8F5FF] px-3 py-2 text-[12px] leading-normal text-[#0D8BEA]">
              {detailLabel}
              {expanded ? <FiChevronUp aria-hidden="true" className="h-4 w-4" /> : <FiChevronDown aria-hidden="true" className="h-4 w-4" />}
            </button>
            {isPending && (
              <button type="button" onClick={() => navigate('/booking-confirm')} className="rounded-lg bg-[#0D8BEA] px-3 py-2 text-[12px] leading-normal font-bold text-white">Thanh toán cọc ngay</button>
            )}
          </div>
        </div>
      </header>

      {expanded && (
        <div className="bg-[#F6F9FF] p-5">
          <div className="grid gap-5 lg:grid-cols-12">
            <div className="flex min-w-0 flex-col gap-3 lg:col-span-8">
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#DCECF8] bg-[#F7FBFF] px-4 py-3 text-[14px]">
                <p>Người đại diện: <strong className="font-normal text-[#1E293B]">{booking.contact?.name || 'Nguyễn Minh Anh'}</strong></p>
                <p>SĐT: <strong className="font-normal text-[#1E293B]">{booking.contact?.phone || '0912 839 221'}</strong></p>
                <p>Email: <strong className="font-normal text-[#1E293B]">{booking.contact?.email || 'minhanh.nguyen@email.com'}</strong></p>
              </div>

              <div className="overflow-x-auto rounded-lg border border-[#DCECF8] bg-white">
                <table className="w-full min-w-190 text-left text-[14px]">
                  <thead className="bg-[#F7FBFF] text-[12px] font-bold text-[#075A9C]">
                    <tr>
                      <th className="px-3 py-3">Số phòng</th>
                      <th className="px-3 py-3">Hạng phòng</th>
                      <th className="px-3 py-3">Số lượng khách</th>
                      <th className="px-3 py-3 text-right">Thành tiền ({nights} đêm)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rooms.map((room) => (
                      <tr key={room.number} className="border-t border-[#DCECF8] text-[#1E293B]">
                        <td className="px-3 py-3">{room.number}</td>
                        <td className="px-3 py-3">{room.typeName}</td>
                        <td className="px-3 py-3">{room.guests || 2} khách ({room.guestType || 'Nội địa'})</td>
                        <td className="px-3 py-3 text-right">{formatPrice(room.amount || 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {isStay && booking.services?.length > 0 && (
                <div className="rounded-lg border border-[#DCECF8] bg-white p-3">
                  <p className="mb-2 text-[14px] font-bold text-[#075A9C]">Dịch vụ đã gọi</p>
                  {booking.services.map((service) => (
                    <div key={service.name} className="flex justify-between border-t border-[#DCECF8] py-2 text-[14px]">
                      <span>{service.name}</span><strong className="text-[#075A9C]">{formatPrice(service.amount)}</strong>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-start gap-3 rounded-lg bg-[#E8F5FF] p-3 text-[12px] leading-normal text-[#075A9C]">
                <FiInfo aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
                <p>Vui lòng xuất trình mã <strong>{booking.bookingCode}</strong> và bản gốc CCCD/Passport của các khách lưu trú khi làm thủ tục nhận phòng tại sảnh lễ tân tầng 1.</p>
              </div>
            </div>

            <aside className="lg:col-span-4">
              <div className="rounded-lg border border-[#DCECF8] bg-white p-3 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                <h2 className="border-b border-[#DCECF8] pb-2 text-[14px] font-bold text-[#075A9C]">Tóm tắt thanh toán</h2>
                <div className="mt-2 space-y-2 text-[14px] text-[#526575]">
                  <div className="flex justify-between gap-3"><span>Tiền phòng ({rooms.length} phòng)</span><span>{formatPrice(booking.roomTotal || booking.total || 0)}</span></div>
                  {booking.promotionCode && (
                    <div className="flex justify-between gap-3 text-[#0D8BEA]"><span>Ưu đãi {booking.promotionCode} (-10%)</span><span>-81.000 đ</span></div>
                  )}
                  <div className="flex justify-between gap-3 border-t border-[#DCECF8] pt-2 text-[16px] font-semibold text-[#1E293B]"><span>Tổng cộng</span><span>{formatPrice(booking.total || 0)}</span></div>
                  {booking.deposit > 0 && booking.status !== 'Đã hoàn tất' && (
                    <div className="flex justify-between gap-3 rounded-lg bg-[#ECFDF5] p-2.5 text-[14px] font-semibold text-[#2E8B57]"><span>{booking.status === 'Đã xác nhận' ? 'Đã cọc 30% (VietQR)' : 'Tạm thanh toán'}</span><span>{formatPrice(booking.deposit)}</span></div>
                  )}
                  {booking.remaining !== undefined && (
                    <div className="flex justify-between gap-3 text-[16px] font-semibold text-[#075A9C]"><span>Còn lại tại quầy</span><span>{formatPrice(booking.remaining)}</span></div>
                  )}
                </div>
                <div className="mt-3 flex flex-col gap-1">
                  <button type="button" onClick={() => onPrint()} className="flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[#DCECF8] bg-[#F7FBFF] px-3 text-[14px] font-bold text-[#0D8BEA]">
                    <FiPrinter aria-hidden="true" className="h-4 w-4" /> In phiếu PDF
                  </button>
                  {canCancel && (
                    <button type="button" onClick={onCancel} className="min-h-10 rounded-lg px-3 text-[14px] font-bold text-[#D9534F]">Hủy đặt phòng này</button>
                  )}
                </div>
              </div>
            </aside>
          </div>
        </div>
      )}
    </article>
  );
}

function CustomerFooter() {
  const policies = ['Quy chế lưu trú khách sạn', 'Chính sách đặt cọc 30%', 'Quy định phụ thu khách & Quốc tịch', 'Bảo mật thông tin khách hàng'];
  return (
    <footer id="contact" className="border-t border-[#DCECF8] bg-white px-5 pt-8 pb-8 sm:px-8">
      <div className="mx-auto max-w-344">
        <div className="grid grid-cols-1 gap-8 border-b border-[#DCECF8] pb-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col items-start gap-4">
            <Link to="/" className="flex items-center gap-2 text-[#075A9C]"><FaHotel aria-hidden="true" className="h-5 w-5" /><span className="text-[20px] font-bold">Grand Hotel</span></Link>
            <p className="max-w-[320px] text-xs leading-normal text-[#526575]">Hệ thống nghỉ dưỡng cao cấp chuẩn mực quốc tế, mang lại trải nghiệm lưu trú sang trọng, chu đáo và thư thái cho quý khách.</p>
            <div className="flex gap-3 text-[#075A9C]"><a href="/#contact" aria-label="Facebook"><FiFacebook /></a><a href="/#contact" aria-label="Instagram"><FiInstagram /></a><a href="/#contact" aria-label="Liên hệ"><FiMessageCircle /></a></div>
          </div>
          <div><h2 className="mb-2 text-sm font-bold text-[#075A9C]">KHÁM PHÁ</h2><ul className="flex flex-col gap-2 text-sm text-[#526575]"><li><Link to="/rooms">Danh sách hạng phòng</Link></li><li><a href="/#facilities">Dịch vụ &amp; Tiện ích</a></li><li>Ưu đãi đặc biệt</li><li>Hỗ trợ check-in</li></ul></div>
          <div><h2 className="mb-2 text-sm font-bold text-[#075A9C]">CHÍNH SÁCH &amp; QUY ĐỊNH</h2><ul className="flex flex-col gap-1.5 text-sm text-[#526575]">{policies.map((policy) => <li key={policy}>{policy}</li>)}</ul></div>
          <div className="flex flex-col items-start gap-2"><h2 className="mb-1 text-sm font-bold text-[#075A9C]">LIÊN HỆ</h2><p className="flex items-start gap-1 text-sm text-[#526575]"><FiMapPin aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />120 Đại Lộ Hoàng Gia, TP. Hồ Chí Minh</p><p className="flex items-center gap-1 text-sm text-[#526575]"><FiPhone />+84 (0) 28 3822 8888</p><p className="flex items-center gap-1 text-sm text-[#526575]"><FiMail />booking@grandhotel.vn</p></div>
        </div>
        <div className="flex flex-col justify-between gap-3 pt-6 text-xs text-[#526575] sm:flex-row sm:items-center"><p>© 2026 Grand Hotel Group. Bảo lưu mọi quyền.</p><div className="flex gap-4"><span>Điều khoản</span><span>Bảo mật</span><span>Quy chế</span></div></div>
      </div>
    </footer>
  );
}

function FloatingAiChatbot() {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [greetingDismissed, setGreetingDismissed] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([{ id: 0, sender: 'bot', text: 'Dạ em chào quý khách! Em có thể hỗ trợ tìm phòng, kiểm tra giá hoặc tư vấn quy định lưu trú.' }]);

  const sendText = (text) => {
    const message = text.trim();
    if (!message) return;
    setMessages((items) => [
      ...items,
      { id: items.length, sender: 'user', text: message },
      { id: items.length + 1, sender: 'bot', text: 'Mỗi phòng phục vụ tối đa 3 khách. Giá phòng được tính theo số đêm, phụ thu khách thứ 3 và khách nước ngoài.' },
    ]);
    setInput('');
  };

  const send = (event) => {
    event.preventDefault();
    sendText(input);
  };

  return (
    <div className="fixed right-6 bottom-6 z-50 flex flex-col items-end sm:right-8" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      {open && (
        <section aria-label="Trò chuyện với Trợ lý AI Grand Hotel" className="mb-4 flex h-130 w-95 max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-[#DCECF8] bg-white shadow-2xl">
          <header className="flex items-center gap-3 bg-linear-to-r from-[#0D8BEA] to-[#075A9C] p-4 text-white">
            <img src="/images/chatbot-mascot.png" alt="" className="h-10 w-10 rounded-full bg-white object-contain" />
            <div className="min-w-0 flex-1"><h2 className="text-sm font-bold">Trợ lý AI Grand Hotel</h2><p className="text-[11px] text-blue-50">● Trực tuyến • Hỗ trợ 24/7</p></div>
            <button type="button" aria-label="Đóng cửa sổ chat" onClick={() => setOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-full"><FiX aria-hidden="true" /></button>
          </header>
          <div role="log" aria-live="polite" className="flex-1 space-y-3 overflow-y-auto bg-[#F7FBFF] p-4">
            {messages.map((message) => <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}><p className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${message.sender === 'user' ? 'bg-[#0D8BEA] text-white' : 'border border-[#DCECF8] bg-white text-[#526575]'}`}>{message.text}</p></div>)}
          </div>
          <form onSubmit={send} className="flex items-center gap-2 border-t border-[#DCECF8] bg-white p-3">
            <input value={input} onChange={(event) => setInput(event.target.value)} aria-label="Nhập tin nhắn" placeholder="Nhập câu hỏi của bạn..." className="min-h-10 min-w-0 flex-1 rounded-lg border border-[#DCECF8] px-3 text-sm outline-none" />
            <button type="submit" aria-label="Gửi tin nhắn" disabled={!input.trim()} className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0D8BEA] text-white disabled:opacity-50"><FiSend aria-hidden="true" /></button>
          </form>
        </section>
      )}
      {!open && hovered && !greetingDismissed && (
        <section className="relative mb-4 w-75 rounded-2xl border border-[#DCECF8] bg-white p-4 shadow-xl">
          <button type="button" aria-label="Ẩn thẻ chào" onClick={() => setGreetingDismissed(true)} className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full text-[#526575]"><FiX aria-hidden="true" /></button>
          <div className="mb-3 flex flex-wrap items-center gap-2 pr-5"><FiStar aria-hidden="true" className="h-4 w-4 text-[#0D8BEA]" /><span className="text-[11px] font-bold text-[#075A9C]">TRỢ LÝ AI GRAND HOTEL</span></div>
          <p className="mb-3 text-xs leading-relaxed text-[#526575]">Dạ em chào quý khách! Em có thể giúp quý khách tìm phòng ưng ý, kiểm tra giá tốt nhất hoặc tư vấn dịch vụ tiện ích ngay nhé!</p>
          <div className="flex flex-wrap gap-2">
            {['Giá phòng các hạng', 'Gợi ý phòng cho 4 khách', 'Quy định phụ thu & đặt cọc'].map((suggestion) => (
              <button key={suggestion} type="button" onClick={() => { setOpen(true); setHovered(false); sendText(suggestion); }} className="rounded-full border border-[#DCECF8] bg-[#F7FBFF] px-2.5 py-1 text-[11px] font-semibold text-[#075A9C]">{suggestion}</button>
            ))}
          </div>
        </section>
      )}
      {!open && hovered && <span className="absolute top-1/2 right-full mr-3 -translate-y-1/2 whitespace-nowrap rounded-full bg-slate-900/90 px-3.5 py-1.5 text-xs text-white shadow-lg">Bấm để chat với Trợ lý Grand Hotel</span>}
      {!open && (
        <button type="button" aria-label="Mở Trợ lý AI Grand Hotel" onClick={() => setOpen(true)} className="h-24 w-24 overflow-hidden rounded-full border-0 bg-transparent p-0">
          <img src="/images/chatbot-mascot.png" alt="" className="h-full w-full object-contain" />
        </button>
      )}
    </div>
  );
}

export default MyBookingsPage;
