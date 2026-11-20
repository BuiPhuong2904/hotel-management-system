import { useMemo, useRef, useState } from 'react';
import {
  FiArrowLeft,
  FiArrowRight,
  FiCheck,
  FiChevronDown,
  FiEdit3,
  FiFacebook,
  FiHome,
  FiInfo,
  FiInstagram,
  FiMail,
  FiMapPin,
  FiMessageCircle,
  FiMinus,
  FiPhone,
  FiPlus,
  FiSend,
  FiStar,
  FiTag,
  FiUser,
  FiX,
} from 'react-icons/fi';
import { FaHotel } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import ToastNotification from '../components/ToastNotification';

const formatPrice = (price) => `${Number(price).toLocaleString('vi-VN')} đ`;

const defaultBooking = {
  rooms: [
    { number: 'P101', typeId: 'A', typeName: 'Phòng loại A (Tiêu chuẩn)', price: 150000, guests: 2, hasForeigner: false },
    { number: 'P201', typeId: 'B', typeName: 'Phòng loại B (Nâng cao)', price: 170000, guests: 2, hasForeigner: true },
  ],
  checkIn: '25/10/2026',
  checkOut: '27/10/2026',
  guests: 4,
};

const policies = [
  'Quy chế lưu trú khách sạn',
  'Chính sách đặt cọc 30%',
  'Quy định phụ thu khách & Quốc tịch',
  'Bảo mật thông tin khách hàng',
];

function readPendingBooking() {
  const savedBooking = sessionStorage.getItem('pendingBooking');
  if (!savedBooking) return defaultBooking;
  try {
    const booking = JSON.parse(savedBooking);
    if (!Array.isArray(booking.rooms) || booking.rooms.length === 0) return defaultBooking;
    return {
      ...booking,
      rooms: booking.rooms.map((room) => ({
        ...room,
        guests: Number(room.guests || 2),
        hasForeigner: Boolean(room.hasForeigner),
        price: Number(room.price || (room.typeId === 'A' ? 150000 : room.typeId === 'B' ? 170000 : 200000)),
        typeName: room.typeName || (room.typeId === 'A' ? 'Phòng loại A (Tiêu chuẩn)' : room.typeId === 'B' ? 'Phòng loại B (Nâng cao)' : 'Phòng loại C (Thương gia)'),
      })),
    };
  } catch (error) {
    console.error('Không thể đọc thông tin đặt phòng đã lưu.', error);
    return defaultBooking;
  }
}

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

function getInitialContact() {
  const customer = getCustomer();
  return {
    name: customer?.fullName || customer?.name || 'Nguyễn Minh Anh',
    phone: customer?.phone || '0912839221',
    email: customer?.email || 'minhanh.nguyen@email.com',
    note: '',
  };
}

function BookingInfoPage() {
  const [booking] = useState(readPendingBooking);
  const [rooms, setRooms] = useState(() => readPendingBooking().rooms);
  const [contact, setContact] = useState(getInitialContact);
  const [promoInput, setPromoInput] = useState('SUMMER2026');
  const [promoApplied, setPromoApplied] = useState(true);
  const [promoLocked, setPromoLocked] = useState(true);
  const [toast, setToast] = useState(null);
  const [customer, setCustomer] = useState(getCustomer);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const nights = useMemo(() => {
    const start = Date.parse(booking.checkIn.split('/').reverse().join('-'));
    const end = Date.parse(booking.checkOut.split('/').reverse().join('-'));
    return Math.max(1, Math.round((end - start) / 86400000));
  }, [booking.checkIn, booking.checkOut]);

  const roomSubtotals = rooms.map((room) =>
    Math.round(
      Number(room.price) *
      nights *
      (Number(room.guests) === 3 ? 1.25 : 1) *
      (room.hasForeigner ? 1.5 : 1),
    ),
  );
  const subtotal = roomSubtotals.reduce((sum, value) => sum + value, 0);
  const discount = promoApplied && promoInput.trim().toUpperCase() === 'SUMMER2026'
    ? Math.min(100000, Math.round(subtotal * 0.1))
    : 0;
  const total = subtotal - discount;
  const deposit = Math.round(total * 0.3);
  const remaining = total - deposit;
  const totalGuests = rooms.reduce((sum, room) => sum + Number(room.guests), 0);
  const customerName = customer?.name || customer?.fullName || customer?.username || 'Nguyễn Minh Anh';
  const customerInitials = customerName.trim().split(/\s+/).slice(-2).map((part) => part[0]).join('').toLocaleUpperCase('vi');

  const updateRoom = (index, update) => {
    setRooms((current) => current.map((room, roomIndex) =>
      roomIndex === index ? { ...room, ...update } : room,
    ));
  };

  const applyPromo = () => {
    if (promoLocked) return;
    const code = promoInput.trim().toUpperCase();
    if (code === 'SUMMER2026') {
      setPromoApplied(true);
      setPromoLocked(true);
    } else {
      setPromoApplied(false);
      setToast({ message: 'Mã ưu đãi không hợp lệ.', type: 'error' });
    }
  };

  const logout = () => {
    localStorage.removeItem('customerUser');
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        if (JSON.parse(storedUser)?.role === 'customer') localStorage.removeItem('user');
      } catch (error) {
        console.error('Không thể xác thực vai trò tài khoản đã lưu.', error);
      }
    }
    setCustomer(null);
    setMenuOpen(false);
    navigate('/');
  };

  const continueCheckout = () => {
    if (!contact.name.trim() || !contact.phone.trim() || !contact.email.trim()) {
      setToast({ message: 'Vui lòng nhập họ tên, số điện thoại và email.', type: 'error' });
      return;
    }
    const checkout = {
      booking: { ...booking, rooms, guests: totalGuests },
      contact,
      nights,
      roomSubtotals,
      subtotal,
      promotion: promoApplied ? { code: 'SUMMER2026', discountPercent: 10, discount } : null,
      total,
      deposit,
      remaining,
    };
    sessionStorage.setItem('bookingCheckout', JSON.stringify(checkout));
    setToast({ message: 'Thông tin đặt phòng đã được lưu.', type: 'success' });
    window.setTimeout(() => navigate('/booking-confirm'), 300);
  };

  return (
    <div className="min-h-screen w-full bg-[#F7FBFF] font-['Open_Sans',sans-serif] text-[#526575]">
      <header className="sticky top-0 z-40 h-20 border-b border-[#DCECF8] bg-white/95 shadow-[0_2px_5px_rgba(7,90,156,0.04)] backdrop-blur-xl">
        <div className="mx-auto flex h-full w-full max-w-360 items-center justify-between gap-4 px-8">
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
              <div className="relative" ref={menuRef}>
                <button type="button" aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)} className="inline-flex h-12 max-w-56 items-center gap-2.5 rounded-full border border-[#DCECF8] bg-white px-3.75y-[7px] text-[14px] font-semibold text-[#075A9C] shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#E8F5FF] text-xs font-bold text-[#075A9C]">{customerInitials}</span>
                  <span className="truncate">{customerName}</span>
                  <FiChevronDown aria-hidden="true" className="h-4 w-4 shrink-0" />
                </button>
                {menuOpen && (
                  <div role="menu" className="absolute right-0 top-full z-50 mt-2 w-52 rounded-xl border border-[#DCECF8] bg-white p-1.5 shadow-xl">
                    <Link role="menuitem" to="/my-bookings" onClick={() => setMenuOpen(false)} className="block rounded-lg px-3 py-2 text-sm font-semibold text-[#526575] hover:bg-[#F7FBFF]">Lịch sử đặt phòng</Link>
                    <button type="button" role="menuitem" onClick={logout} className="w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-[#526575] hover:bg-[#F7FBFF]">Đăng xuất</button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="inline-flex h-10 items-center justify-center rounded-lg border border-[#DCECF8] bg-[#F7FBFF] px-4 text-sm font-bold text-[#526575]">Đăng nhập</Link>
            )}
            <Link to="/rooms" className="inline-flex h-10 items-center justify-center rounded-lg bg-[#0D8BEA] px-5 text-sm font-bold text-white">Đặt phòng</Link>
          </div>
        </div>
      </header>

      <main className="border-t border-[#DCECF8] px-8 py-6">
        <div className="mx-auto w-full max-w-344">
          <div className="mb-6 flex flex-col gap-1.5 px-2">
            <nav aria-label="Đường dẫn" className="flex items-center gap-1 text-[14px] leading-normal text-[#526575]">
              <Link to="/" className="hover:text-[#0D8BEA]">Trang chủ</Link>
              <span>›</span>
              <Link to="/rooms" className="hover:text-[#0D8BEA]">Phòng nghỉ</Link>
              <span>›</span>
              <span>Kết quả tìm kiếm</span>
              <span>›</span>
              <span className="font-semibold text-[#075A9C]">Thông tin đặt phòng</span>
            </nav>
            <h1 className="mt-2 text-[32px] leading-normal font-bold text-[#075A9C]">Thông tin đặt phòng</h1>
            <p className="mt-1 text-[16px] leading-relaxed text-[#526575]">Điền thông tin liên hệ người đặt, xác nhận số lượng khách từng phòng và áp dụng mã ưu đãi.</p>
          </div>

          <section aria-label="Tiến trình đặt phòng" className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#DCECF8] bg-white px-6 py-5 shadow-[0_1px_3px_rgba(13,139,234,0.04),0_1px_2px_rgba(13,139,234,0.02)]">
            {[
              { circle: '✓', title: 'BƯỚC 1 • HOÀN THÀNH', label: 'Chọn phòng & Ngày nghỉ', state: 'done' },
              { circle: '02', title: 'BƯỚC 2 • ĐANG THỰC HIỆN', label: 'Thông tin Khách lưu trú', state: 'active' },
              { circle: '03', title: 'BƯỚC 3', label: 'Xác nhận & Đặt cọc 30%', state: 'todo' },
              { circle: '04', title: 'BƯỚC 4', label: 'Hoàn tất lưu trú & Nhận phòng', state: 'todo' },
            ].map((step, index) => (
              <div key={step.title} className={`flex items-center ${index < 3 ? 'flex-1' : 'shrink-0'}`}>
                <div className="flex shrink-0 items-center gap-3">
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[14px] font-bold ${
                    step.state === 'done'
                      ? 'bg-[#2E8B57] text-white'
                      : step.state === 'active'
                        ? 'bg-[#0D8BEA] text-white shadow-[0_0_0_4px_#E8F5FF]'
                        : 'border border-[#E2E8F0] bg-[#F1F5F9] text-[#94A3B8]'
                  }`}>
                    {step.circle}
                  </span>
                  <div>
                    <p className={`text-[13px] leading-snug ${
                      step.state === 'done'
                        ? 'font-bold text-[#2E8B57]'
                        : step.state === 'active'
                          ? 'font-bold text-[#0D8BEA]'
                          : 'font-bold text-[#526575]'
                    }`}>
                      {step.title}
                    </p>
                    <p className="text-[13px] leading-snug text-[#526575]">{step.label}</p>
                  </div>
                </div>
                {index < 3 && (
                  <div
                    aria-hidden="true"
                    className={`mx-4 hidden h-0.5 min-w-6 flex-1 xl:block ${
                      index === 0 ? 'bg-[#2E8B57]' : 'bg-[#DCECF8]'
                    }`}
                  />
                )}
              </div>
            ))}
          </section>

          <div className="mt-6 grid items-start gap-7 lg:grid-cols-12">
            <div className="flex min-w-0 flex-col gap-6 lg:col-span-8">
              <section className="rounded-2xl border border-[#DCECF8] bg-white p-[25px] shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
                <header className="flex items-center justify-between gap-3 border-b border-[#DCECF8] pb-[17px]">
                  <div className="flex items-center gap-[10px]">
                    <span className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-[#E8F5FF] text-[#075A9C]"><FiUser aria-hidden="true" className="h-4 w-4" /></span>
                    <h2 className="text-[18px] leading-normal font-bold text-[#075A9C]">Thông tin người liên hệ đặt phòng</h2>
                  </div>
                  <span className="text-[12px] leading-normal text-[#D9534F]">* Bắt buộc</span>
                </header>
                <div className="mt-5 flex items-center gap-[10px] rounded-[8px] border border-[#DCECF8] bg-[#E8F5FF] px-4 py-3 text-[12px] leading-normal text-[#075A9C]">
                  <FiInfo aria-hidden="true" className="h-[15px] w-[15px] shrink-0" />
                  Mã phiếu đặt phòng và thông tin xác nhận sẽ được gửi qua số điện thoại và email dưới đây.
                </div>
                <div className="mt-5 grid gap-x-[20px] gap-y-[20px] sm:grid-cols-2">
                  {[
                    { key: 'name', label: 'Họ và tên người đại diện', icon: FiUser, type: 'text' },
                    { key: 'phone', label: 'Số điện thoại liên hệ', icon: FiPhone, type: 'tel' },
                    { key: 'email', label: 'Email nhận phiếu xác nhận', icon: FiMail, type: 'email' },
                    { key: 'note', label: 'Ghi chú yêu cầu (Tùy chọn)', icon: FiEdit3, type: 'text', placeholder: 'Căn phòng tầng cao, yên tĩnh.' },
                  ].map(({ key, label, icon: Icon, type, placeholder }) => (
                    <label key={key} className="flex flex-col gap-[6px] text-[14px] leading-normal font-bold text-[#075A9C]">
                      {label}
                      <span className="relative flex h-[40px] items-center rounded-[8px] border border-[#DCECF8] pl-[15px] pr-[41px] focus-within:border-[#0D8BEA]">
                        <Icon aria-hidden="true" className="absolute right-[10px] h-3.5 w-3.5 text-[#526575]" />
                        <input
                          type={type}
                          value={contact[key]}
                          placeholder={placeholder}
                          onChange={(event) => setContact((current) => ({ ...current, [key]: event.target.value }))}
                          className="h-full min-w-0 flex-1 border-0 bg-transparent text-[14px] leading-normal font-normal text-[#526575] outline-none placeholder:text-[#94A3B8]"
                        />
                      </span>
                    </label>
                  ))}
                </div>
              </section>

              <section className="rounded-[16px] border border-[#DCECF8] bg-white p-[25px] shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
                <header className="flex items-center gap-[10px] border-b border-[#DCECF8] pb-[17px]">
                  <span className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-[#E8F5FF] text-[#075A9C]"><FiHome aria-hidden="true" className="h-4 w-4" /></span>
                  <div>
                    <h2 className="text-[18px] leading-normal font-bold text-[#075A9C]">Cấu hình khách lưu trú theo từng phòng</h2>
                    <p className="text-[14px] leading-normal text-[#526575]">Chi tiết số khách &amp; Quốc tịch từng phòng</p>
                  </div>
                </header>
                <div className="mt-5 space-y-4">
                  {rooms.map((room, index) => (
                    <article key={room.number} className="rounded-[12px] border border-[#DCECF8] bg-[#F7FBFF] p-[21px]">
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#DCECF8] pb-3">
                        <div className="flex items-center gap-2">
                          <span className="rounded-[4px] bg-[#0D8BEA] px-[10px] py-[4px] text-[14px] leading-normal font-bold text-white">{room.number}</span>
                          <div>
                            <p className="text-[14px] leading-normal font-bold text-[#075A9C]">{room.typeName}</p>
                            <p className="text-[12px] leading-normal text-[#526575]">{formatPrice(room.price)} / đêm</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[14px] leading-normal font-bold text-[#075A9C]">{formatPrice(roomSubtotals[index])}</p>
                          <p className="text-[12px] leading-normal text-[#526575]">{nights} đêm{room.hasForeigner ? ' (Đã nhân ×1.5)' : ''}</p>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-4 rounded-[8px] border border-[#DCECF8] bg-white p-[13px]">
                        <div className="flex items-center gap-[12px] text-[14px] leading-normal text-[#526575]">
                          <span>Số lượng khách:</span>
                          <button type="button" aria-label={`Giảm khách phòng ${room.number}`} disabled={room.guests <= 1} onClick={() => updateRoom(index, { guests: Math.max(1, room.guests - 1) })} className="flex h-[28px] w-[27px] items-center justify-center rounded-[4px] border border-[#DCECF8] bg-white text-[16px] leading-[24px] text-[#526575] disabled:opacity-40"><FiMinus aria-hidden="true" className="h-3 w-3" /></button>
                          <strong className="min-w-[60px] text-center text-[14px] leading-normal text-[#526575]">{room.guests} khách</strong>
                          <button type="button" aria-label={`Tăng khách phòng ${room.number}`} disabled={room.guests >= 3} onClick={() => updateRoom(index, { guests: Math.min(3, room.guests + 1) })} className="flex h-[28px] w-[27px] items-center justify-center rounded-[4px] border border-[#DCECF8] bg-white text-[16px] leading-[24px] text-[#526575] disabled:opacity-40"><FiPlus aria-hidden="true" className="h-3 w-3" /></button>
                          <span>(Tối đa 3 khách)</span>
                        </div>
                        <label className="flex cursor-pointer items-center gap-[8px] text-[14px] leading-normal text-[#526575]">
                          <input type="checkbox" checked={room.hasForeigner} onChange={(event) => updateRoom(index, { hasForeigner: event.target.checked })} className="h-4 w-4 accent-[#0D8BEA]" />
                          Phòng có khách nước ngoài (×1.5 đơn giá)
                        </label>
                      </div>
                    </article>
                  ))}
                </div>
                <div className="mt-5 flex items-start gap-[10px] rounded-[12px] border border-[#DCECF8] bg-[#E8F5FF] px-4 py-3 text-[12px] leading-normal text-[#075A9C]">
                  <FiInfo aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
                  Thông tin CCCD / Hộ chiếu chi tiết của từng thành viên lưu trú sẽ được lễ tân đối chiếu và ghi nhận trực tiếp tại quầy khi làm thủ tục nhận phòng.
                </div>
              </section>

              <section className="rounded-[16px] border border-[#DCECF8] bg-white p-[25px] shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
                <header className="flex items-center gap-[10px] border-b border-[#DCECF8] pb-[17px]">
                  <span className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-[#E8F5FF] text-[#075A9C]"><FiTag aria-hidden="true" className="h-4 w-4" /></span>
                  <h2 className="text-[18px] leading-normal font-bold text-[#075A9C]">Mã khuyến mãi &amp; Ưu đãi</h2>
                </header>
                <div className="mt-5 flex gap-[12px]">
                  <div className="relative h-[44px] flex-1">
                    <input
                      value={promoInput}
                      readOnly={promoLocked}
                      onChange={(event) => setPromoInput(event.target.value)}
                      className="h-full w-full rounded-[8px] border border-[#DCECF8] bg-[#F7FBFF] px-[17px] pr-28 text-[14px] leading-normal font-bold text-[#526575] outline-none focus:border-[#0D8BEA]"
                    />
                    {promoApplied && promoLocked && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] leading-normal text-[#0D8BEA]"><FiCheck aria-hidden="true" className="mr-1 inline h-3 w-3" />Đã áp dụng</span>}
                  </div>
                  <button type="button" onClick={() => promoLocked ? (setPromoLocked(false), setPromoApplied(false), setPromoInput('')) : applyPromo()} className="h-[44px] rounded-[8px] border border-[#DCECF8] px-[21px] text-[14px] leading-[20px] font-semibold text-[#526575] hover:bg-[#F7FBFF]">
                    {promoLocked ? 'Đổi mã' : 'Áp dụng'}
                  </button>
                </div>
                {promoApplied && (
                  <div className="mt-5 flex items-center gap-[8px] rounded-[8px] border border-[#DCECF8] bg-[#E8F5FF] px-4 py-3 text-[14px] leading-normal text-[#1760A3]">
                    <FiCheck aria-hidden="true" className="h-[15px] w-[15px] text-[#0D8BEA]" />
                    <span>Đã áp dụng mã <strong className="text-[#005EA2]">SUMMER2026</strong>: Giảm 10% tiền phòng (Tối đa 100.000 đ) — Tiết kiệm <strong className="text-[#075A9C]">{formatPrice(discount)}</strong></span>
                  </div>
                )}
              </section>
            </div>

            <aside className="lg:sticky lg:top-24 lg:col-span-4">
              <section className="rounded-[16px] border border-[#DCECF8] bg-white p-[21px] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.10),0_2px_4px_-2px_rgba(0,0,0,0.10)]">
                <header className="flex items-center justify-between gap-3 border-b border-[#DCECF8] pb-[17px]">
                  <h2 className="text-[18px] leading-normal font-bold text-[#075A9C]">Tóm tắt chi phí đặt phòng</h2>
                  <span className="rounded-full border border-[#DCECF8] bg-white px-[10px] py-[4px] text-[11px] leading-[14px] font-bold tracking-[0.44px] text-[#0D8BEA]">{rooms.length} phòng</span>
                </header>
                <div className="mt-4 flex flex-col gap-[8px] rounded-[8px] border border-[#DCECF8] bg-[#F7FBFF] p-[13px] text-[14px] leading-normal text-[#526575]">
                  <p className="flex justify-between"><span>Nhận phòng:</span><strong className="font-normal text-[#1E293B]">{booking.checkIn} (14:00)</strong></p>
                  <p className="flex justify-between"><span>Trả phòng:</span><strong className="font-normal text-[#1E293B]">{booking.checkOut} (12:00)</strong></p>
                  <p className="mt-1 flex justify-between border-t border-[#DCECF8] pt-[9px]"><span>Thời gian lưu trú:</span><strong className="font-normal text-[#075A9C]">{nights} đêm - {totalGuests} khách</strong></p>
                </div>
                <div className="mt-4 space-y-3">
                  {rooms.map((room, index) => (
                    <div key={room.number} className="text-[14px] leading-normal">
                      <div className="flex justify-between gap-3">
                        <p className="font-normal text-[#1E293B]">Phòng {room.number} ({room.typeId === 'A' ? 'Loại A' : room.typeId === 'B' ? 'Loại B' : 'Loại C'} - {room.guests} khách)</p>
                        <strong className="font-bold text-[#526575]">{formatPrice(roomSubtotals[index])}</strong>
                      </div>
                      <p className="mt-1 text-[12px] leading-normal text-[#526575]">
                        {room.hasForeigner ? `Có khách nước ngoài ×1.5 (${nights} đêm)` : `Đơn giá ${formatPrice(room.price)} × ${nights} đêm`}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 space-y-2 border-t border-[#DCECF8] pt-[11px] text-[14px] leading-normal">
                  <div className="flex justify-between text-[#1E293B]"><span>Tạm tính tiền phòng:</span><strong className="text-[#526575]">{formatPrice(subtotal)}</strong></div>
                  {promoApplied && <div className="flex justify-between text-[#0D8BEA]"><span>🏷 Mã SUMMER2026 (-10%):</span><strong className="font-semibold">- {formatPrice(discount)}</strong></div>}
                  <div className="flex items-center justify-between border-t border-[#DCECF8] pt-[11px]">
                    <span className="font-semibold text-[#1E293B]">TỔNG CHI PHÍ SAU GIẢM:</span>
                    <strong className="text-[18px] text-[#075A9C]">{formatPrice(total)}</strong>
                  </div>
                </div>
                <div className="mt-4 rounded-[12px] border border-[#DCECF8] bg-[#F7FBFF] p-[17px]">
                  <div className="flex items-center justify-between gap-3 border-b border-[#DCECF8] pb-[16px]">
                    <span className="text-[14px] leading-normal font-bold text-[#075A9C]">TIỀN CỌC TỐI THIỂU (30%):</span>
                    <strong className="text-[24px] leading-normal text-[#075A9C]">{formatPrice(deposit)}</strong>
                  </div>
                  <div className="mt-[8px] flex justify-between gap-3 pt-[8px] text-[14px] leading-normal text-[#1E293B]">
                    <span>Còn lại thanh toán tại quầy:</span>
                    <strong className="text-[16px] leading-normal text-[#0D8BEA]">{formatPrice(remaining)}</strong>
                  </div>
                </div>
                <button type="button" onClick={continueCheckout} className="mt-4 flex h-[48px] w-full items-center justify-center gap-[8px] rounded-[12px] bg-[#0D8BEA] px-[16px] py-[14px] text-[14px] leading-normal font-bold text-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.10),0_2px_4px_-2px_rgba(0,0,0,0.10)]">
                  Tiếp tục xác nhận &amp; Đặt cọc <FiArrowRight aria-hidden="true" className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => navigate('/rooms')} className="mt-[10px] flex h-[40px] w-full items-center justify-center gap-[6px] rounded-[12px] border border-[#DCECF8] bg-[#F7FBFF] px-[17px] py-[11px] text-[14px] leading-normal font-bold text-[#526575]">
                  <FiArrowLeft aria-hidden="true" className="h-4 w-4" />Quay lại chọn phòng
                </button>
              </section>
            </aside>
          </div>
        </div>
      </main>

      <footer className="border-t border-[#DCECF8] bg-white px-8 py-8">
        <div className="mx-auto max-w-[1376px]">
          <div className="grid grid-cols-1 gap-8 border-b border-[#DCECF8] pb-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col items-start gap-4">
              <Link to="/" className="flex items-center gap-2 text-[#075A9C]"><FaHotel aria-hidden="true" className="h-5 w-5" /><span className="text-xl font-bold">Grand Hotel</span></Link>
              <p className="max-w-[320px] text-xs leading-normal text-[#526575]">Hệ thống nghỉ dưỡng cao cấp chuẩn mực quốc tế, mang lại trải nghiệm lưu trú sang trọng, chu đáo và thư thái cho quý khách.</p>
              <div className="flex gap-3 text-[#075A9C]">
                <a href="/#contact" aria-label="Facebook" className="flex h-6 w-6 items-center justify-center rounded-full border border-[#DCECF8]"><FiFacebook aria-hidden="true" /></a>
                <a href="/#contact" aria-label="Instagram" className="flex h-6 w-6 items-center justify-center rounded-full border border-[#DCECF8]"><FiInstagram aria-hidden="true" /></a>
                <a href="/#contact" aria-label="Liên hệ" className="flex h-6 w-6 items-center justify-center rounded-full border border-[#DCECF8]"><FiMessageCircle aria-hidden="true" /></a>
              </div>
            </div>
            <div>
              <h2 className="mb-2 text-sm font-bold text-[#075A9C]">KHÁM PHÁ</h2>
              <ul className="flex flex-col gap-2 text-sm text-[#526575]"><li><Link to="/rooms">Danh sách hạng phòng</Link></li><li><Link to="/#facilities">Dịch vụ &amp; Tiện ích</Link></li><li>Ưu đãi đặc biệt</li><li>Hỗ trợ check-in</li></ul>
            </div>
            <div>
              <h2 className="mb-2 text-sm font-bold text-[#075A9C]">CHÍNH SÁCH &amp; QUY ĐỊNH</h2>
              <ul className="flex flex-col gap-1.5 text-sm text-[#526575]">{policies.map((policy) => <li key={policy}>{policy}</li>)}</ul>
            </div>
            <div className="flex flex-col items-start gap-2">
              <h2 className="mb-1 text-sm font-bold text-[#075A9C]">LIÊN HỆ</h2>
              <p className="flex items-start gap-1 text-sm text-[#526575]"><FiMapPin aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />120 Đại Lộ Hoàng Gia, TP. Hồ Chí Minh</p>
              <p className="text-sm text-[#526575]">+84 (0) 28 3822 8888</p>
              <p className="text-sm text-[#526575]">booking@grandhotel.vn</p>
            </div>
          </div>
          <div className="flex flex-col justify-between gap-3 pt-6 text-xs text-[#526575] sm:flex-row sm:items-center"><p>© 2026 Grand Hotel Group. Bảo lưu mọi quyền.</p><div className="flex gap-4"><span>Điều khoản</span><span>Bảo mật</span><span>Quy chế</span></div></div>
        </div>
      </footer>

      <FloatingAiChatbot />
      <ToastNotification message={toast?.message} type={toast?.type} />
    </div>
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
    setMessages((current) => [...current, { id: current.length, sender: 'user', text: message }, { id: current.length + 1, sender: 'bot', text: 'Mỗi phòng phục vụ tối đa 3 khách. Giá phòng được tính theo số đêm, phụ thu khách thứ 3 và khách nước ngoài.' }]);
    setInput('');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end sm:right-8" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      {open && (
        <section aria-label="Trò chuyện với Trợ lý AI Grand Hotel" className="mb-4 flex h-130 w-95 max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-[#DCECF8] bg-white shadow-2xl">
          <header className="flex items-center gap-3 bg-linear-to-r from-[#0D8BEA] to-[#075A9C] p-4 text-white">
            <img src="/images/chatbot-mascot.png" alt="" className="h-10 w-10 rounded-full bg-white object-contain" />
            <div className="min-w-0 flex-1"><h2 className="text-sm font-bold">Trợ lý AI Grand Hotel</h2><p className="text-[11px] text-blue-50">● Trực tuyến • Hỗ trợ 24/7</p></div>
            <button type="button" aria-label="Đóng cửa sổ chat" onClick={() => setOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/15"><FiX aria-hidden="true" className="h-5 w-5" /></button>
          </header>
          <div role="log" aria-live="polite" className="flex-1 space-y-3 overflow-y-auto bg-[#F7FBFF] p-4">
            {messages.map((message) => <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}><p className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${message.sender === 'user' ? 'bg-[#0D8BEA] text-white' : 'border border-[#DCECF8] bg-white text-[#526575]'}`}>{message.text}</p></div>)}
          </div>
          <form onSubmit={(event) => { event.preventDefault(); sendText(input); }} className="flex items-center gap-2 border-t border-[#DCECF8] bg-white p-3">
            <input aria-label="Nhập tin nhắn" value={input} onChange={(event) => setInput(event.target.value)} placeholder="Nhập câu hỏi của bạn..." className="h-10 min-w-0 flex-1 rounded-lg border border-[#DCECF8] px-3 text-sm outline-none focus:border-[#0D8BEA]" />
            <button type="submit" aria-label="Gửi tin nhắn" disabled={!input.trim()} className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0D8BEA] text-white disabled:opacity-50"><FiSend aria-hidden="true" /></button>
          </form>
        </section>
      )}
      {!open && hovered && !greetingDismissed && (
        <section className="relative mb-4 w-75 rounded-2xl border border-[#DCECF8] bg-white p-4 shadow-xl">
          <button type="button" aria-label="Ẩn thẻ chào" onClick={() => setGreetingDismissed(true)} className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full text-[#526575] hover:bg-[#F7FBFF]"><FiX aria-hidden="true" className="h-4 w-4" /></button>
          <div className="mb-3 flex items-center gap-2 pr-5"><FiStar aria-hidden="true" className="h-4 w-4 text-[#0D8BEA]" /><span className="text-[11px] font-bold text-[#075A9C]">TRỢ LÝ AI GRAND HOTEL</span></div>
          <p className="mb-3 text-xs leading-relaxed text-[#526575]">Dạ em chào quý khách! Em có thể giúp quý khách tìm phòng ưng ý, kiểm tra giá tốt nhất hoặc tư vấn dịch vụ tiện ích ngay nhé!</p>
          <div className="flex flex-wrap gap-2">{['Giá phòng các hạng', 'Gợi ý phòng cho 4 khách', 'Quy định phụ thu & đặt cọc'].map((suggestion) => <button key={suggestion} type="button" onClick={() => { setOpen(true); setHovered(false); sendText(suggestion); }} className="rounded-full border border-[#DCECF8] bg-[#F7FBFF] px-2.5 py-1 text-[11px] font-semibold text-[#075A9C]">{suggestion}</button>)}</div>
        </section>
      )}
      {!open && hovered && <span className="absolute right-full top-1/2 mr-3 -translate-y-1/2 whitespace-nowrap rounded-full bg-slate-900/90 px-3.5 py-1.5 text-xs font-medium text-white shadow-lg">Bấm để chat với Trợ lý Grand Hotel</span>}
      {!open && <button type="button" aria-label="Mở Trợ lý AI Grand Hotel" onClick={() => setOpen(true)} className="relative flex h-24 w-24 items-center justify-center bg-transparent transition-transform duration-300 hover:scale-105"><img src="/images/chatbot-mascot.png" alt="Linh vật robot Grand Hotel" className="h-24 w-24 object-contain drop-shadow-xl" /></button>}
    </div>
  );
}

export default BookingInfoPage;
