import { useEffect, useMemo, useRef, useState } from 'react';
import {
  FiArrowRight,
  FiCalendar,
  FiCheck,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiFacebook,
  FiFilter,
  FiInstagram,
  FiMapPin,
  FiMaximize2,
  FiMessageCircle,
  FiSearch,
  FiSend,
  FiStar,
  FiUser,
  FiWifi,
  FiX,
} from 'react-icons/fi';
import { FaHotel } from 'react-icons/fa6';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ToastNotification from '../components/ToastNotification';

const DEFAULT_SEARCH = {
  checkIn: '25/10/2026',
  checkOut: '27/10/2026',
  guests: 2,
};

const roomTypes = [
  {
    id: 'A',
    name: 'Phòng loại A',
    rank: 'Tiêu chuẩn',
    price: 150000,
    image: '/images/figma-room-type-a.png',
    gallery: ['/images/figma-room-type-a.png', '/images/figma-room-detail-workspace.png', '/images/figma-room-detail-bathroom.png'],
    description: 'Phòng tiêu chuẩn ấm cúng với nội thất hiện đại, ánh sáng dịu nhẹ, phù hợp cho kỳ nghỉ thư thái.',
    features: ['1 Giường Queen', 'Wi-Fi tốc độ cao', '28 m²'],
    roomNumbers: ['P101', 'P102', 'P105'],
    view: 'Hướng phố',
    area: '28m²',
  },
  {
    id: 'B',
    name: 'Phòng loại B',
    rank: 'Phổ biến',
    price: 170000,
    image: '/images/figma-room-type-b.png',
    gallery: ['/images/figma-room-detail-main.png', '/images/figma-room-detail-workspace.png', '/images/figma-room-detail-bathroom.png'],
    description: 'Phòng cao cấp rộng rãi với không gian thoáng đãng, tầm nhìn thành phố và bàn làm việc tiện nghi.',
    features: ['1 Giường King', 'Hướng phố', '38 m²'],
    roomNumbers: ['P201', 'P202'],
    view: 'Hướng phố',
    area: '38m²',
  },
  {
    id: 'C',
    name: 'Phòng loại C',
    rank: 'Thượng hạng',
    price: 200000,
    image: '/images/figma-room-type-c.png',
    gallery: ['/images/figma-room-type-c.png', '/images/figma-room-detail-workspace.png', '/images/figma-room-detail-bathroom.png'],
    description: 'Phòng Suite thượng hạng với phòng khách riêng biệt,bồn tắm thư giãn cao cấp và dịch vụ ưu tiên.',
    features: ['Suite Thượng Hạng', 'Bồn tắm nằm', '54 m²'],
    roomNumbers: ['P301', 'P302'],
    view: 'Ban công riêng',
    area: '54m²',
  },
];

const roomFacilities = [
  'Giường King / Queen',
  'Hướng phố / Ban công riêng',
  'Bồn tắm thư giãn',
];

const policies = [
  'Quy chế lưu trú khách sạn',
  'Chính sách đặt cọc 30%',
  'Quy định phụ thu khách & Quốc tịch',
  'Bảo mật thông tin khách hàng',
];

const formatPrice = (price) => `${price.toLocaleString('vi-VN')} VNĐ`;
const parseDate = (value) => {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value || '');
  if (!match) return null;
  const [, day, month, year] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return date.getFullYear() === Number(year) &&
    date.getMonth() === Number(month) - 1 &&
    date.getDate() === Number(day)
    ? date
    : null;
};
const formatDate = (date) =>
  `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
const addDays = (date, days) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
const dayNumber = (date) =>
  Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000;
const getAvailableRoomNumbers = (room, checkIn, checkOut) => {
  const soldOutStart = parseDate('25/10/2026');
  const soldOutEnd = parseDate('27/10/2026');
  const overlapsSoldOutDates =
    dayNumber(checkIn) < dayNumber(soldOutEnd) &&
    dayNumber(checkOut) > dayNumber(soldOutStart);
  return room.id === 'C' && overlapsSoldOutDates ? [] : room.roomNumbers;
};

function readSearch(locationSearch) {
  const query = new URLSearchParams(locationSearch);
  let stored = {};
  const storedValue = sessionStorage.getItem('roomSearch');
  if (storedValue) {
    try {
      stored = JSON.parse(storedValue);
    } catch (error) {
      console.error('Không thể đọc thông tin tìm phòng đã lưu.', error);
    }
  }

  const checkIn = parseDate(query.get('checkIn')) || parseDate(stored.checkIn);
  const checkOut = parseDate(query.get('checkOut')) || parseDate(stored.checkOut);
  const requestedGuests = Number(query.get('guests') || stored.guests);
  const guests = Number.isInteger(requestedGuests)
    ? Math.max(1, Math.min(6, requestedGuests))
    : DEFAULT_SEARCH.guests;
  const safeCheckIn = checkIn || parseDate(DEFAULT_SEARCH.checkIn);
  const safeCheckOut = checkOut || parseDate(DEFAULT_SEARCH.checkOut);

  return {
    checkIn: safeCheckIn,
    checkOut: safeCheckOut > safeCheckIn ? safeCheckOut : addDays(safeCheckIn, 1),
    guests,
  };
}

function DatePicker({ label, value, minimumDate, onChange }) {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(() => new Date(value.getFullYear(), value.getMonth(), 1));
  const containerRef = useRef(null);
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const firstWeekday = (firstDay.getDay() + 6) % 7;
  const cells = Array.from({ length: 42 }, (_, index) => {
    const day = index - firstWeekday + 1;
    return day > 0 && day <= daysInMonth ? day : null;
  });

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (!containerRef.current?.contains(event.target)) setOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, []);

  return (
    <div className="relative flex flex-col gap-1.5 text-sm font-bold text-[#526575]" ref={containerRef}>
      <label>{label}</label>
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        onClick={() => {
          setMonth(new Date(value.getFullYear(), value.getMonth(), 1));
          setOpen((isOpen) => !isOpen);
        }}
        className="flex h-12 items-center justify-between rounded-lg border border-[#DCECF8] bg-white px-4 text-left text-sm font-normal text-[#526575] outline-none hover:border-[#0D8BEA] focus-visible:ring-2 focus-visible:ring-[#0D8BEA]"
      >
        {formatDate(value)}
        <FiCalendar aria-hidden="true" className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-30 mt-2 w-72 rounded-xl border border-[#DCECF8] bg-white p-3 shadow-xl">
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              aria-label="Tháng trước"
              onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
              className="flex h-8 w-8 items-center justify-center rounded-full text-[#075A9C] hover:bg-[#E8F5FF]"
            >
              <FiChevronLeft aria-hidden="true" />
            </button>
            <strong className="text-sm text-[#075A9C]">
              Tháng {month.getMonth() + 1}, {month.getFullYear()}
            </strong>
            <button
              type="button"
              aria-label="Tháng sau"
              onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
              className="flex h-8 w-8 items-center justify-center rounded-full text-[#075A9C] hover:bg-[#E8F5FF]"
            >
              <FiChevronRight aria-hidden="true" />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] leading-3.5 font-semibold text-[#526575]">
            {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day) => (
              <span key={day} className="py-1">{day}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {cells.map((day, index) => {
              if (!day) return <span key={`empty-${index}`} />;
              const date = new Date(month.getFullYear(), month.getMonth(), day);
              const selected = date.toDateString() === value.toDateString();
              const disabled = minimumDate && date < minimumDate;
              return (
                <button
                  key={day}
                  type="button"
                  disabled={disabled}
                  aria-pressed={selected}
                  onClick={() => {
                    onChange(date);
                    setOpen(false);
                  }}
                  className={`flex h-8 items-center justify-center rounded-full text-xs ${
                    selected
                      ? 'bg-[#0D8BEA] font-bold text-white'
                      : disabled
                        ? 'cursor-not-allowed text-[#CBD5E1]'
                        : 'text-[#526575] hover:bg-[#E8F5FF]'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function getCustomer() {
  for (const key of ['customerUser', 'user']) {
    const value = localStorage.getItem(key);
    if (!value) continue;
    try {
      const customer = JSON.parse(value);
      if (customer && typeof customer === 'object' &&
        (key === 'customerUser' || !customer.role || customer.role === 'customer')) {
        return customer;
      }
    } catch (error) {
      console.error(`Không thể đọc tài khoản từ ${key}.`, error);
    }
  }
  return null;
}

function CustomerHeader({ checkIn, checkOut, guests }) {
  const [customer, setCustomer] = useState(getCustomer);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef(null);
  const name = customer?.name || customer?.fullName || customer?.username || 'Khách hàng';
  const initials = name.trim().split(/\s+/).slice(-2).map((part) => part[0]).join('').toLocaleUpperCase('vi');
  const searchQuery = new URLSearchParams({
    checkIn: formatDate(checkIn),
    checkOut: formatDate(checkOut),
    guests: String(guests),
  }).toString();

  useEffect(() => {
    const syncCustomer = () => setCustomer(getCustomer());
    window.addEventListener('storage', syncCustomer);
    return () => window.removeEventListener('storage', syncCustomer);
  }, []);

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (!menuRef.current?.contains(event.target)) setMenuOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, []);

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

  const navigation = [
    { label: 'Trang chủ', to: '/' },
    { label: 'Phòng nghỉ', to: `/rooms?${searchQuery}`, active: location.pathname === '/rooms' },
    { label: 'Tiện ích', to: '/#facilities' },
    { label: 'Về chúng tôi', to: '/#about' },
    { label: 'Liên hệ', to: '/#contact' },
  ];

  return (
    <header className="sticky top-0 z-40 h-20 border-b border-[#DCECF8] bg-white/95 shadow-[0_2px_5px_rgba(7,90,156,0.04)] backdrop-blur-xl">
      <div className="mx-auto flex h-full w-full items-center justify-between gap-4 px-4 sm:px-8">
        <Link to="/" className="flex shrink-0 items-center gap-2 text-[#075A9C]" aria-label="Grand Hotel - Trang chủ">
          <FaHotel aria-hidden="true" className="h-5.5 w-5.5" />
          <span className="text-xl font-bold">Grand Hotel</span>
        </Link>
        <nav aria-label="Điều hướng chính" className="hidden items-center gap-8 lg:flex">
          {navigation.map(({ label, to, active }) => (
            <Link
              key={label}
              to={to}
              className={`whitespace-nowrap text-sm ${active ? 'font-bold text-[#0D8BEA]' : 'font-semibold text-[#526575]'}`}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          {customer ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                aria-expanded={menuOpen}
                aria-haspopup="menu"
                onClick={() => setMenuOpen((isOpen) => !isOpen)}
                className="inline-flex h-10 max-w-48 items-center gap-2 rounded-full border border-[#DCECF8] bg-white px-2.5 text-sm font-semibold text-[#075A9C] sm:max-w-56"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#E8F5FF] text-xs font-bold text-[#075A9C]">{initials}</span>
                <span className="truncate">{name}</span>
                <FiChevronDown aria-hidden="true" className="h-4 w-4 shrink-0" />
              </button>
              {menuOpen && (
                <div role="menu" className="absolute right-0 top-full z-50 mt-2 w-52 rounded-xl border border-[#DCECF8] bg-white p-1.5 shadow-xl">
                  <Link role="menuitem" to="/my-bookings" onClick={() => setMenuOpen(false)} className="block rounded-lg px-3 py-2 text-sm font-semibold text-[#526575] hover:bg-[#F7FBFF]">
                    Lịch sử đặt phòng
                  </Link>
                  <button type="button" role="menuitem" onClick={logout} className="w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-[#526575] hover:bg-[#F7FBFF]">
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="inline-flex h-10 items-center justify-center rounded-lg border border-[#DCECF8] bg-[#F7FBFF] px-3 text-sm font-bold text-[#526575] sm:px-4">
              Đăng nhập
            </Link>
          )}
          <Link to={`/rooms?${searchQuery}`} className="inline-flex h-10 items-center justify-center rounded-lg bg-[#0D8BEA] px-3 text-sm font-bold text-white shadow-[0_1px_1px_rgba(0,0,0,0.05)] sm:px-5">
            Đặt phòng
          </Link>
        </div>
      </div>
    </header>
  );
}

function CustomerFooter() {
  return (
    <footer id="contact" className="border-t border-[#DCECF8] bg-white px-5 pb-8 pt-8 sm:px-8">
      <div className="mx-auto max-w-344">
        <div className="grid grid-cols-1 gap-8 border-b border-[#DCECF8] pb-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col items-start gap-4">
            <Link to="/" className="flex items-center gap-2 text-[#075A9C]">
              <FaHotel aria-hidden="true" className="h-5.75 w-5.75" />
              <span className="text-xl font-bold">Grand Hotel</span>
            </Link>
            <p className="max-w-[320px] text-xs leading-normal text-[#526575]">
              Hệ thống nghỉ dưỡng cao cấp chuẩn mực quốc tế, mang lại trải nghiệm lưu trú sang trọng, chu đáo và thư thái cho quý khách.
            </p>
            <div className="flex gap-3 text-sm font-semibold text-[#075A9C]">
              <a href="/#contact" aria-label="Facebook"><FiFacebook aria-hidden="true" /></a>
              <a href="/#contact" aria-label="Instagram"><FiInstagram aria-hidden="true" /></a>
              <a href="/#contact" aria-label="Liên hệ"><FiMessageCircle aria-hidden="true" /></a>
            </div>
          </div>
          <div>
            <h2 className="mb-2 text-sm font-bold text-[#075A9C]">KHÁM PHÁ</h2>
            <ul className="flex flex-col gap-2 text-sm text-[#526575]">
              <li><Link to="/rooms">Danh sách hạng phòng</Link></li>
              <li><a href="/#facilities">Dịch vụ &amp; Tiện ích</a></li>
              <li>Ưu đãi đặc biệt</li>
              <li>Hỗ trợ check-in</li>
            </ul>
          </div>
          <div>
            <h2 className="mb-2 text-sm font-bold text-[#075A9C]">CHÍNH SÁCH &amp; QUY ĐỊNH</h2>
            <ul className="flex flex-col gap-1.5 text-sm text-[#526575]">
              {policies.map((policy) => <li key={policy}>{policy}</li>)}
            </ul>
          </div>
          <div className="flex flex-col items-start gap-2">
            <h2 className="mb-1 text-sm font-bold text-[#075A9C]">LIÊN HỆ</h2>
            <p className="flex items-start gap-1 text-sm text-[#526575]"><FiMapPin aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />120 Đại Lộ Hoàng Gia, TP. Hồ Chí Minh</p>
            <p className="text-sm text-[#526575]">+84 (0) 28 3822 8888</p>
            <p className="text-sm text-[#526575]">booking@grandhotel.vn</p>
          </div>
        </div>
        <div className="flex flex-col justify-between gap-3 pt-6 text-xs text-[#526575] sm:flex-row sm:items-center">
          <p>© 2026 Grand Hotel Group. Bảo lưu mọi quyền.</p>
          <div className="flex items-center gap-4"><span>Điều khoản</span><span>Bảo mật</span><span>Quy chế</span></div>
        </div>
      </div>
    </footer>
  );
}

function FloatingAiChatbot() {
  const [open, setOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [greetingDismissed, setGreetingDismissed] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { id: 0, sender: 'bot', text: 'Dạ em chào quý khách! Em có thể hỗ trợ tìm phòng, kiểm tra giá hoặc tư vấn quy định lưu trú.' },
  ]);
  const send = (event) => {
    event.preventDefault();
    sendText(input);
  };
  const sendText = (text) => {
    const message = text.trim();
    if (!message) return;
    setMessages((items) => [
      ...items,
      { id: items.length, sender: 'user', text: message },
      { id: items.length + 1, sender: 'bot', text: 'Mỗi phòng phục vụ tối đa 3 khách. Giá phòng từ 150.000 VND/đêm; đặt cọc tối thiểu 30% tổng tiền phòng.' },
    ]);
    setInput('');
  };

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex flex-col items-end sm:right-8"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {open && (
        <section aria-label="Trò chuyện với Trợ lý AI Grand Hotel" className="mb-4 flex h-130 w-95 max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-[#DCECF8] bg-white shadow-2xl">
          <header className="flex items-center gap-3 bg-linear-to-r from-[#0D8BEA] to-[#075A9C] p-4 text-white">
            <img src="/images/chatbot-mascot.png" alt="" className="h-10 w-10 rounded-full bg-white object-contain" />
            <div className="min-w-0 flex-1"><h2 className="text-sm font-bold">Trợ lý AI Grand Hotel</h2><p className="text-[11px] text-blue-50">● Trực tuyến • Hỗ trợ 24/7</p></div>
            <button type="button" aria-label="Đóng cửa sổ chat" onClick={() => setOpen(false)} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white hover:bg-white/15"><FiX aria-hidden="true" className="h-5 w-5" /></button>
          </header>
          <div role="log" aria-live="polite" className="flex-1 space-y-3 overflow-y-auto bg-[#F7FBFF] p-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <p className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${message.sender === 'user' ? 'bg-[#0D8BEA] text-white' : 'border border-[#DCECF8] bg-white text-[#526575]'}`}>{message.text}</p>
              </div>
            ))}
          </div>
          <form onSubmit={send} className="flex items-center gap-2 border-t border-[#DCECF8] bg-white p-3">
            <input aria-label="Nhập tin nhắn" value={input} onChange={(event) => setInput(event.target.value)} placeholder="Nhập câu hỏi của bạn..." className="h-10 min-w-0 flex-1 rounded-lg border border-[#DCECF8] px-3 text-sm outline-none focus:border-[#0D8BEA]" />
            <button type="submit" aria-label="Gửi tin nhắn" disabled={!input.trim()} className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0D8BEA] text-white disabled:opacity-50"><FiSend aria-hidden="true" /></button>
          </form>
        </section>
      )}
      {!open && isHovered && !greetingDismissed && (
        <section className="relative mb-4 w-75 rounded-2xl border border-[#DCECF8] bg-white p-4 shadow-xl">
          <button type="button" aria-label="Ẩn thẻ chào" onClick={() => setGreetingDismissed(true)} className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full text-[#526575] hover:bg-[#F7FBFF]">
            <FiX aria-hidden="true" className="h-4 w-4" />
          </button>
          <div className="mb-3 flex flex-wrap items-center gap-2 pr-5">
            <FiStar aria-hidden="true" className="h-4 w-4 text-[#0D8BEA]" />
            <span className="text-[11px] font-bold text-[#075A9C]">TRỢ LÝ AI GRAND HOTEL</span>
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">● Sẵn sàng 24/7</span>
          </div>
          <p className="mb-3 text-xs leading-relaxed text-[#526575]">
            Dạ em chào quý khách! Em có thể giúp quý khách tìm phòng ưng ý, kiểm tra giá tốt nhất hoặc tư vấn dịch vụ tiện ích ngay nhé!
          </p>
          <div className="flex flex-wrap gap-2">
            {['Giá phòng các hạng', 'Gợi ý phòng cho 4 khách', 'Quy định phụ thu & đặt cọc'].map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => {
                  setOpen(true);
                  setIsHovered(false);
                  sendText(suggestion);
                }}
                className="rounded-full border border-[#DCECF8] bg-[#F7FBFF] px-2.5 py-1 text-[11px] font-semibold text-[#075A9C] hover:bg-[#E8F5FF]"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </section>
      )}
      {!open && isHovered && (
        <span className="absolute right-full top-1/2 mr-3 -translate-y-1/2 whitespace-nowrap rounded-full bg-slate-900/90 px-3.5 py-1.5 text-xs font-medium text-white shadow-lg">
          Bấm để chat với Trợ lý Grand Hotel
        </span>
      )}
      {!open && (
        <button
          type="button"
          aria-label="Mở Trợ lý AI Grand Hotel"
          onClick={() => {
            setOpen(true);
            setIsHovered(false);
          }}
          className="relative flex h-24 w-24 cursor-pointer items-center justify-center bg-transparent transition-transform duration-300 hover:scale-105"
        >
          <img src="/images/chatbot-mascot.png" alt="Linh vật robot Grand Hotel" className="h-24 w-24 object-contain drop-shadow-xl" />
        </button>
      )}
    </div>
  );
}

function RoomSearchResults({ initialSearch }) {
  const navigate = useNavigate();
  const [checkIn, setCheckIn] = useState(initialSearch.checkIn);
  const [checkOut, setCheckOut] = useState(initialSearch.checkOut);
  const [guests, setGuests] = useState(initialSearch.guests);
  const [sortOrder, setSortOrder] = useState('recommended');
  const [selectedTypes, setSelectedTypes] = useState(['A', 'B', 'C']);
  const [selectedFacilities, setSelectedFacilities] = useState([]);
  const [maxPrice, setMaxPrice] = useState(200000);
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [detailRoom, setDetailRoom] = useState(null);
  const [toast, setToast] = useState(null);
  const toastTimeout = useRef(null);

  useEffect(() => () => window.clearTimeout(toastTimeout.current), []);

  useEffect(() => {
    if (!detailRoom) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setDetailRoom(null);
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [detailRoom]);

  const nights = Math.max(1, dayNumber(checkOut) - dayNumber(checkIn));
  const guestCount = guests;
  const total = selectedRooms.reduce((sum, room) => sum + room.price * nights, 0);
  const maximumCapacity = selectedRooms.length * 3;
  const capacityAvailable = selectedRooms.length > 0 && maximumCapacity >= guestCount;

  const filteredRooms = useMemo(() => {
    let rooms = roomTypes.filter((room) => selectedTypes.includes(room.id) && room.price <= maxPrice);
    if (selectedFacilities.includes(roomFacilities[0])) {
      rooms = rooms.filter((room) => room.id !== 'C');
    }
    if (selectedFacilities.includes(roomFacilities[1])) {
      rooms = rooms.filter((room) => room.id !== 'A');
    }
    if (selectedFacilities.includes(roomFacilities[2])) {
      rooms = rooms.filter((room) => room.id === 'C');
    }
    if (sortOrder === 'ascending') rooms = [...rooms].sort((a, b) => a.price - b.price);
    if (sortOrder === 'descending') rooms = [...rooms].sort((a, b) => b.price - a.price);
    return rooms;
  }, [maxPrice, selectedFacilities, selectedTypes, sortOrder]);

  const searchRooms = (event) => {
    event.preventDefault();
    if (checkOut <= checkIn) setCheckOut(addDays(checkIn, 1));
    setSelectedRooms([]);
    const search = {
      checkIn: formatDate(checkIn),
      checkOut: formatDate(checkOut <= checkIn ? addDays(checkIn, 1) : checkOut),
      guests: guestCount,
    };
    sessionStorage.setItem('roomSearch', JSON.stringify(search));
    navigate(`/rooms?${new URLSearchParams(search).toString()}`);
  };

  const toggleType = (typeId) => {
    setSelectedTypes((current) =>
      current.includes(typeId)
        ? current.filter((value) => value !== typeId)
        : [...current, typeId],
    );
  };
  const toggleFacility = (facility) => {
    setSelectedFacilities((current) =>
      current.includes(facility)
        ? current.filter((value) => value !== facility)
        : [...current, facility],
    );
  };
  const toggleRoom = (roomType, number) => {
    setSelectedRooms((current) => {
      const exists = current.some((room) => room.number === number);
      return exists
        ? current.filter((room) => room.number !== number)
        : [...current, {
          number,
          typeId: roomType.id,
          typeName: roomType.name,
          price: roomType.price,
        }];
    });
  };
  const clearFilters = () => {
    setSelectedTypes(['A', 'B', 'C']);
    setSelectedFacilities([]);
    setMaxPrice(200000);
    setSortOrder('recommended');
  };
  const continueBooking = () => {
    if (!capacityAvailable) return;
    const booking = {
      rooms: selectedRooms,
      checkIn: formatDate(checkIn),
      checkOut: formatDate(checkOut),
      guests: guestCount,
    };
    sessionStorage.setItem('pendingBooking', JSON.stringify(booking));
    const customer = getCustomer();
    if (customer) {
      navigate('/booking-info');
      return;
    }
    setToast({ message: 'Vui lòng đăng nhập để tiếp tục hoàn tất đặt phòng', type: 'error' });
    window.clearTimeout(toastTimeout.current);
    toastTimeout.current = window.setTimeout(
      () => navigate(`/login?${new URLSearchParams({ redirect: '/booking-info' })}`),
      900,
    );
  };

  return (
    <div className="min-h-screen w-full bg-[#F7FBFF] text-[#526575]">
      <CustomerHeader checkIn={checkIn} checkOut={checkOut} guests={guestCount} />
      <main className="mx-auto w-full max-w-360 px-4 py-6 sm:px-8">
        <nav aria-label="Đường dẫn" className="mb-5 text-[14px] leading-3.5 text-[#526575]">
          <Link to="/" className="hover:text-[#0D8BEA]">Trang chủ</Link>
          <span className="mx-2">›</span>
          <Link to={`/rooms?${new URLSearchParams({ checkIn: formatDate(checkIn), checkOut: formatDate(checkOut), guests: String(guestCount) })}`} className="hover:text-[#0D8BEA]">Phòng nghỉ</Link>
          <span className="mx-2">›</span>
          <span className="font-semibold text-[#075A9C]">Kết quả tìm kiếm</span>
        </nav>
        <section className="mb-6">
          <h1 className="text-[32px] leading-8 tracking-normal font-bold text-[#075A9C]">Tìm phòng nghỉ phù hợp</h1>
          <p className="mt-1 text-[16px] leading-4 tracking-normal font-normal text-[#526575]">
            Khám phá không gian nghỉ ngơi lý tưởng và lựa chọn hạng phòng phù hợp nhất cho kỳ lưu trú của bạn.
          </p>
        </section>

        <form onSubmit={searchRooms} className="mb-6 grid grid-cols-1 gap-6 rounded-2xl border border-[#DCECF8] bg-white p-5.25 shadow-[0_4px_10px_rgba(7,90,156,0.06)] sm:grid-cols-2 lg:grid-cols-4">
          <DatePicker
            label="Ngày nhận phòng"
            value={checkIn}
            onChange={(date) => {
              setCheckIn(date);
              if (date >= checkOut) setCheckOut(addDays(date, 1));
            }}
          />
          <DatePicker
            label="Ngày trả phòng"
            value={checkOut}
            minimumDate={addDays(checkIn, 1)}
            onChange={setCheckOut}
          />
          <label className="flex flex-col gap-1.5 text-[14px] leading-3.5 font-bold text-[#526575]">
            Số khách
            <select value={guestCount} onChange={(event) => setGuests(Number(event.target.value))} className="h-12 rounded-lg border border-[#DCECF8] bg-white px-4.25 text-[14px] leading-3.5 font-normal text-[#526575] outline-none focus:border-[#0D8BEA]">
              {Array.from({ length: 6 }, (_, index) => index + 1).map((count) => (
                <option key={count} value={count}>{count} khách</option>
              ))}
            </select>
          </label>
          <button type="submit" className="mt-auto inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#0D8BEA] px-6 text-sm font-bold text-white hover:bg-[#0878CC] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D8BEA]">
            <FiSearch aria-hidden="true" className="h-4 w-4" />
            Tìm phòng
          </button>
        </form>

        <div className="grid items-start gap-6 xl:grid-cols-12">
          <aside className="rounded-xl border border-[#DCECF8] bg-white p-5.25 shadow-[0_1px_1px_rgba(7,90,156,0.05)] xl:col-span-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 text-sm font-bold text-[#526575]">
                <FiFilter aria-hidden="true" className="h-5 w-5" />
                Bộ lọc
              </h2>
              <button type="button" onClick={clearFilters} className="text-xs font-normal text-[#0D8BEA]">Xóa bộ lọc</button>
            </div>
              <div className="space-y-5 pt-4">
                <label className="block text-sm font-bold text-[#526575]">
                  Sắp xếp theo
                  <select value={sortOrder} onChange={(event) => setSortOrder(event.target.value)} className="mt-2 h-10 w-full rounded-lg border border-[#DCECF8] bg-white px-3 text-sm font-normal outline-none focus:border-[#0D8BEA]">
                    <option value="recommended">Đề xuất</option>
                    <option value="ascending">Giá tăng dần</option>
                    <option value="descending">Giá giảm dần</option>
                  </select>
                </label>
                <fieldset className="space-y-3">
                  <legend className="mb-2 text-sm font-bold text-[#075A9C]">Hạng phòng</legend>
                  {roomTypes.map((room) => (
                    <label key={room.id} className="flex cursor-pointer items-start gap-2 text-xs leading-5 text-[#526575]">
                      <input type="checkbox" checked={selectedTypes.includes(room.id)} onChange={() => toggleType(room.id)} className="mt-1 accent-[#0D8BEA]" />
                      <span>
                        {room.id === 'A' && 'Phòng loại A (Tiêu chuẩn)'}
                        {room.id === 'B' && 'Phòng loại B (Cao cấp)'}
                        {room.id === 'C' && 'Phòng loại C (Thương gia)'}
                        {' '}
                        {room.id === 'A' ? '150.000 VNĐ' : room.id === 'B' ? '170.000 VNĐ' : '200.000 VNĐ'}
                      </span>
                    </label>
                  ))}
                </fieldset>
                <fieldset className="space-y-3">
                  <legend className="mb-2 text-sm font-bold text-[#075A9C]">Tiện nghi phòng</legend>
                  {roomFacilities.map((facility) => (
                    <label key={facility} className="flex cursor-pointer items-start gap-2 text-xs text-[#526575]">
                      <input type="checkbox" checked={selectedFacilities.includes(facility)} onChange={() => toggleFacility(facility)} className="mt-0.5 accent-[#0D8BEA]" />
                      {facility}
                    </label>
                  ))}
                </fieldset>
                <label className="block text-sm font-bold text-[#526575]">
                  Giá tối đa / đêm
                  <input type="range" min="150000" max="200000" step="10000" value={maxPrice} onChange={(event) => setMaxPrice(Number(event.target.value))} className="mt-3 w-full accent-[#0D8BEA]" />
                  <span className="mt-1 flex justify-between text-[12px] leading-3.5 font-normal text-[#526575]">
                    <span>150.000 VNĐ</span><span className="text-[#0D8BEA]">{formatPrice(maxPrice)}</span><span>200.000 VNĐ</span>
                  </span>
                </label>
                <div className="rounded-xl border border-[#DCECF8] bg-[#F7FBFF] p-3.5 text-xs leading-5 text-[#526575]">
                  <strong className="mb-1 block text-xs font-semibold text-[#075A9C]">Quy định lưu trú:</strong>
                  Tối đa 3 khách/phòng. Phụ thu 25% khách thứ 3, hệ số 1.5 nếu có khách nước ngoài.
                </div>
              </div>
          </aside>

          <section aria-label="Danh sách hạng phòng" className="flex min-w-0 flex-col gap-4 xl:col-span-6">
            {filteredRooms.map((room) => {
              const availableRoomNumbers = getAvailableRoomNumbers(room, checkIn, checkOut);
              const displayRoom = { ...room, roomNumbers: availableRoomNumbers };
              const available = availableRoomNumbers.length > 0;
              return (
                <article key={room.id} className="overflow-hidden rounded-xl border border-[#DCECF8] bg-white p-px shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                  <div className="grid md:grid-cols-[237.59px_minmax(0,1fr)]">
                    <div className="relative min-h-50 md:min-h-full">
                      <img src={room.image} alt={room.name} className="absolute inset-0 h-full w-full object-cover" />
                      <span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold ${room.id === 'B' ? 'bg-[#0D8BEA] text-white' : room.id === 'C' ? 'bg-[#075A9C] text-white' : 'border border-[#DCECF8] bg-white/95 text-[#075A9C] backdrop-blur-sm'}`}>{room.rank}</span>
                    </div>
                    <div className="flex min-w-0 flex-col justify-between p-4">
                      <div className="flex flex-col justify-between gap-3 sm:flex-row">
                        <div>
                          <h2 className="text-[20px] leading-5 tracking-normal font-bold text-[#075A9C]">{room.name}</h2>
                          <p className={`mt-1 inline-flex rounded-[9999px] border px-2.25 py-0.75 text-[12px] leading-normal font-normal ${available ? 'border-[#A7F3D0] bg-[#ECFDF5] text-[#2E8B57]' : 'border-[#FECDD3] bg-[#FFF1F2] text-[#B45353]'}`}>
                            {available ? `Còn ${room.roomNumbers.length} phòng trống` : 'Đã hết phòng trong ngày này'}
                          </p>
                        </div>
                        <p className="shrink-0 text-left text-[16px] leading-normal font-bold text-[#0D8BEA] sm:text-right">
                          {formatPrice(room.price)}<span className="ml-1 text-[14px] leading-normal font-normal text-[#526575]">/ đêm</span>
                        </p>
                      </div>
                      <p className="mt-3 text-[14px] leading-5 tracking-normall font-normal text-[#526575]">{room.description}</p>
                      <ul className="mt-3 flex min-h-6.5 flex-wrap gap-3">
                        {room.features.map((feature) => (
                          <li key={feature} className="flex h-6.5 items-center gap-1.5 rounded-md border border-[#DCECF8] bg-white px-2.75 text-xs font-semibold text-[#075A9C]">
                            {feature.includes('Giường') && <FiUser aria-hidden="true" className="h-3.5 w-3.5" />}
                            {feature.includes('Wi-Fi') && <FiWifi aria-hidden="true" className="h-3.5 w-3.5" />}
                            {feature.includes('m²') && <FiMaximize2 aria-hidden="true" className="h-3.5 w-3.5" />}
                            {feature.includes('Hướng') && <FiMapPin aria-hidden="true" className="h-3.5 w-3.5" />}
                            {feature.includes('Bồn tắm') && <FiStar aria-hidden="true" className="h-3.5 w-3.5" />}
                            {feature.includes('Suite') && <FiStar aria-hidden="true" className="h-3.5 w-3.5" />}
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-[#DCECF8] pt-3.25">
                        {available ? (
                          <div>
                            <p className="mb-2 text-sm font-semibold text-[#526575]">Chọn số phòng cụ thể:</p>
                            <div className="flex flex-wrap gap-2">
                              {availableRoomNumbers.map((number) => {
                                const isSelected = selectedRooms.some((selected) => selected.number === number);
                                return (
                                  <button key={number} type="button" aria-pressed={isSelected} onClick={() => toggleRoom(room, number)} className={`inline-flex h-7.5 items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-normal transition-colors ${isSelected ? 'border-[#DCECF8] bg-[#0D8BEA] text-white' : 'border-[#DCECF8] bg-white text-[#526575] hover:border-[#0D8BEA]'}`}>
                                    {isSelected && <FiCheck aria-hidden="true" className="h-3.5 w-3.5" />}
                                    {number}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          <p className="max-w-md text-xs leading-5 text-[#B45353]">
                            Không còn phòng trống từ {formatDate(checkIn)} đến {formatDate(checkOut)}. Vui lòng chọn ngày khác hoặc hạng phòng khác.
                          </p>
                        )}
                        <button type="button" onClick={() => setDetailRoom(displayRoom)} className="inline-flex shrink-0 items-center gap-1 text-sm font-bold text-[#0D8BEA] hover:underline">
                          Xem chi tiết <FiArrowRight aria-hidden="true" className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
            {filteredRooms.length === 0 && (
              <div className="rounded-xl border border-[#DCECF8] bg-white p-8 text-center text-[14px] leading-normal text-[#526575]">
                Không có hạng phòng phù hợp với bộ lọc. Vui lòng điều chỉnh tiêu chí tìm kiếm.
              </div>
            )}
          </section>

          <aside className="xl:sticky xl:top-24 xl:col-span-3">
            <section className="rounded-xl border border-[#DCECF8] bg-white p-5.25 shadow-[0_4px_10px_rgba(7,90,156,0.06)]">
              <header className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-bold text-[#075A9C]">Phòng bạn đã chọn</h2>
                <span className="flex size-5 items-center justify-center rounded-full bg-[#0D8BEA] text-xs font-bold text-white">{selectedRooms.length}</span>
              </header>
              <div className="mt-4 space-y-2 rounded-lg border border-[#DCECF8] bg-[#F7FBFF] p-3.25 text-sm leading-normal text-[#526575]">
                <p className="flex justify-between"><span>Nhận phòng:</span><span className="text-[#526575]">{formatDate(checkIn)} (14:00)</span></p>
                <p className="flex justify-between"><span>Trả phòng:</span><span className="text-[#526575]">{formatDate(checkOut)} (12:00)</span></p>
                <p className="flex justify-between border-t border-[#DCECF8] pt-2.25"><span>Thời gian lưu trú:</span><strong className="text-[#075A9C]">{nights} đêm - {guestCount} khách</strong></p>
              </div>
              <div className="max-h-64 space-y-3 overflow-y-auto py-4">
                {selectedRooms.length ? selectedRooms.map((room) => (
                  <article key={room.number} className="relative rounded-lg border border-[#DCECF8] bg-[#F7FBFF] p-2.75 pr-9">
                    <button type="button" aria-label={`Bỏ chọn phòng ${room.number}`} onClick={() => toggleRoom(roomTypes.find((type) => type.id === room.typeId), room.number)} className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full text-[#526575] hover:bg-white hover:text-[#B45353]">
                      <FiX aria-hidden="true" className="h-4 w-4" />
                    </button>
                    <p className="text-sm text-[#526575]">Phòng {room.number} — {room.typeName}</p>
                    <p className="mt-1 text-sm text-[#0D8BEA]">{formatPrice(room.price).replace(' VNĐ', 'đ')} × {nights} đêm = {formatPrice(room.price * nights)}</p>
                  </article>
                )) : <p className="py-2 text-center text-[12px] leading-normal text-[#526575]">Chưa có phòng nào được chọn.</p>}
              </div>
              {selectedRooms.length > 0 && (
                <div className={`mb-4 rounded-lg border p-2.25 text-[12px] leading-normal ${capacityAvailable ? 'border-[#A7F3D0] bg-[#ECFDF5] text-[#2E8B57]' : 'border-[#FDE68A] bg-[#FFFBEB] text-[#92400E]'}`}>
                  {capacityAvailable
                    ? `✓ Đủ sức chứa cho ${guestCount} khách (tối đa ${maximumCapacity} khách)`
                    : `⚠ Chưa đủ sức chứa: Mới đáp ứng tối đa ${maximumCapacity}/${guestCount} khách. Vui lòng chọn thêm ít nhất 1 phòng.`}
                </div>
              )}
              <div className="space-y-3 border-t border-[#DCECF8] pt-4 text-[14px] leading-normal">
                <div className="flex justify-between gap-2 text-[#526575]"><span>Tổng tiền phòng:</span><strong className="text-[#526575]">{formatPrice(total)}</strong></div>
                <div className="flex items-baseline justify-between gap-2 text-[#526575]"><span>Cọc tối thiểu (30%):</span><strong className="text-[18px] leading-4.5 text-[#0D8BEA]">{formatPrice(Math.round(total * 0.3))}</strong></div>
                <p className="pt-1 text-[12px] leading-normal text-[#526575]">* Chưa bao gồm phụ thu 25% khách thứ 3 hoặc hệ số 1.5 khách nước ngoài (nếu có).</p>
              </div>
              <button type="button" disabled={!capacityAvailable} onClick={continueBooking} className="mt-4 inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-lg bg-[#0D8BEA] px-4 py-3 text-[14px] leading-normal font-bold text-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.10),0_4px_6px_-2px_rgba(0,0,0,0.10)] hover:bg-[#0878CC] disabled:cursor-not-allowed disabled:bg-[#CBD5E1] disabled:text-[#94A3B8]">
                Tiếp tục đặt phòng <FiArrowRight aria-hidden="true" className="h-4 w-4" />
              </button>
            </section>
          </aside>
        </div>
      </main>
      <CustomerFooter />
      <FloatingAiChatbot />
      <ToastNotification message={toast?.message} type={toast?.type} />

      {detailRoom && (
        <div className="fixed inset-0 z-70 flex items-center justify-center bg-[rgba(0,0,0,0.50)] p-3 sm:p-5" onMouseDown={(event) => { if (event.target === event.currentTarget) setDetailRoom(null); }} >
          <section role="dialog" aria-modal="true" aria-labelledby="room-detail-title" className="flex max-h-[95vh] w-179.5 max-w-[calc(100vw-24px)] flex-col overflow-hidden rounded-2xl border border-[#DCECF8] bg-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)]">
            <div className="grid h-65 shrink-0 grid-cols-12 gap-1.5 bg-[#020617] p-1.5">
              <div className="relative col-span-8 min-w-0 overflow-hidden rounded-l-xl">
                <img src={detailRoom.gallery[0]} alt={`${detailRoom.name} - tổng quan`} className="h-full w-full object-cover" />
                <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                  <span className={`rounded-[9999px] px-3 py-1 text-[12px] leading-normal font-semibold ${detailRoom.rank === 'Phổ biến' ? 'bg-[#0D8BEA] text-white' : 'bg-white/95 text-[#075A9C]'}`}>{detailRoom.rank}</span>
                  <span className={`rounded-[9999px] px-2.5 py-1 text-[12px] leading-normal font-semibold ${detailRoom.roomNumbers.length ? 'bg-[#2E8B57] text-white' : 'bg-[#FFF1F2] text-[#B45353]'}`}>
                    {detailRoom.roomNumbers.length ? `Còn ${detailRoom.roomNumbers.length} phòng trống` : 'Đã hết phòng trong ngày này'}
                  </span>
                </div>
                <span className="absolute bottom-3 left-3 rounded-lg bg-[rgba(0,0,0,0.60)] px-2.75 py-1.25 text-[12px] leading-normal font-normal text-white">▧ 3 hình ảnh</span>
              </div>
              <div className="relative col-span-4 flex min-w-0 flex-col gap-1.5 overflow-hidden">
                <div className="relative min-h-0 flex-1">
                  <img src={detailRoom.gallery[1]} alt="Góc làm việc" className="h-full w-full object-cover" />
                  <button type="button" aria-label="Đóng chi tiết hạng phòng" onClick={() => setDetailRoom(null)} className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-[rgba(15,23,42,0.70)] text-white backdrop-blur-md">
                    <FiX aria-hidden="true" className="h-5 w-5" />
                  </button>
                  <span className="absolute bottom-2 right-2 rounded-sm bg-[rgba(0,0,0,0.60)] px-2 py-0.5 text-[12px] leading-normal font-normal text-white backdrop-blur-xs">Góc làm việc</span>
                </div>
                <div className="relative min-h-0 flex-1">
                  <img src={detailRoom.gallery[2]} alt="Phòng tắm kính" className="h-full w-full object-cover" />
                  <span className="absolute bottom-2 right-2 rounded-sm bg-[rgba(0,0,0,0.60)] px-2 py-0.5 text-[12px] leading-normal font-normal text-white backdrop-blur-xs">Phòng tắm kính</span>
                </div>
              </div>
            </div>
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-6">
              <div className="flex flex-col justify-between gap-3 border-b border-[#DCECF8] pb-4.25 sm:flex-row sm:items-start">
                <div>
                  <h2 id="room-detail-title" className="text-[24px] leading-normal tracking-normal font-bold text-[#075A9C]">{detailRoom.name} — Hạng {detailRoom.id === 'B' ? 'Cao Cấp' : detailRoom.id === 'A' ? 'Tiêu chuẩn' : 'Thượng hạng'}</h2>
                  <p className="mt-1 text-[14px] leading-normal tracking-normal font-normal text-[#526575]">Vị trí: Tầng 2 &amp; Tầng 3</p>
                </div>
                <p className="shrink-0 text-left text-[24px] leading-normal font-bold text-[#0D8BEA] sm:text-right">{formatPrice(detailRoom.price)}<span className="block text-[12px] leading-normal font-normal text-[#526575]">/ đêm (chưa gồm thuế &amp; phụ thu)</span></p>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  ['Giường ngủ', detailRoom.id === 'B' ? '1 Giường King' : detailRoom.id === 'A' ? '1 Giường Queen' : '1 Giường King'],
                  ['Hướng nhìn', detailRoom.view],
                  ['Diện tích', detailRoom.area],
                  ['Sức chứa', 'Tối đa 3 khách'],
                ].map(([label, value], index) => (
                  <div key={label} className="flex items-start gap-3 rounded-xl border border-[#DCECF8] bg-[#F7FBFF] px-3.25 py-4.25">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center text-[#0D8BEA]">
                      {index === 0 && <FiUser aria-hidden="true" className="h-5 w-5" />}
                      {index === 1 && <FiMapPin aria-hidden="true" className="h-5 w-5" />}
                      {index === 2 && <FiMaximize2 aria-hidden="true" className="h-5 w-5" />}
                      {index === 3 && <FiUser aria-hidden="true" className="h-5 w-5" />}
                    </span>
                    <div>
                      <p className="text-[12px] leading-normal font-normal text-[#526575]">{label}</p>
                      <p className="mt-1 text-[12px] leading-normal font-bold text-[#075A9C]">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
              <section className="space-y-3">
                <h3 className="text-sm font-bold text-[#075A9C]">MÔ TẢ &amp; TIỆN ÍCH TIÊU CHUẨN</h3>
                <p className="text-sm leading-5 text-[#526575]">{detailRoom.id === 'B'
                  ? 'Phòng cao cấp rộng rãi với không gian thoáng đãng, sàn lát gỗ sồi cao cấp cùng cửa sổ vòm lớn đón trọn tầm nhìn thành phố biển. Được thiết kế tối ưu hóa cho cả khách công tác lẫn gia đình nghỉ dưỡng ngắn ngày.'
                  : detailRoom.description}</p>
                <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {['Wi-Fi tốc độ cao', 'Điều hòa 2 chiều', 'Bàn làm việc gỗ', 'Smart TV 50 inch', 'Minibar & Ấm siêu tốc', 'Phòng tắm vòi sen đứng'].map((amenity) => (
                    <li key={amenity} className="flex items-center gap-2 text-xs leading-5 text-[#526575]"><FiCheck aria-hidden="true" className="h-4 w-4 shrink-0 text-[#2E8B57]" />{amenity}</li>
                  ))}
                </ul>
              </section>
              <div className="rounded-xl border border-[#DCECF8] bg-[#F7FBFF] p-3.75 text-xs leading-5 text-[#526575]">
                <strong className="text-[#075A9C]">Quy định lưu trú:</strong>{' '}<span className="text-[#526575]">Đơn giá áp dụng cho 2 khách tiêu chuẩn. Tối đa 3 khách/phòng (khách thứ 3 phụ thu 25%). Phòng có khách nước ngoài nhân hệ số 1.5.</span>
              </div>
            </div>
            <footer className="flex shrink-0 flex-col items-stretch justify-between gap-4 border-t border-[#DCECF8] bg-[#F8FAFC] px-6 py-4 sm:flex-row sm:items-center">
              <div>
                <p className="mb-2 text-xs font-semibold text-[#526575]">Chọn nhanh phòng trống:</p>
                <div className="flex gap-2">
                  {detailRoom.roomNumbers.length ? detailRoom.roomNumbers.map((number) => {
                    const isSelected = selectedRooms.some((room) => room.number === number);
                    return (
                      <button key={number} type="button" aria-pressed={isSelected} onClick={() => toggleRoom(detailRoom, number)} className={`rounded-lg border px-3.25 py-1.75 text-xs ${isSelected ? 'border-[#0D8BEA] bg-[#0D8BEA] font-bold text-white shadow-[0_2px_2px_rgba(13,139,234,0.15)]' : 'border-[#CBD5E1] bg-white font-semibold text-[#334155]'}`}>
                        {isSelected ? '✓ ' : ''}{number}
                      </button>
                    );
                  }) : <span className="text-[12px] leading-normal text-[#526575]">Không còn phòng trống</span>}
                </div>
              </div>
              <button type="button" onClick={() => setDetailRoom(null)} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#0D8BEA] px-5 py-2 text-sm font-bold text-white hover:bg-[#0878CC]">
                Xác nhận chọn phòng <FiArrowRight aria-hidden="true" className="h-4 w-4" />
              </button>
            </footer>
          </section>
        </div>
      )}
    </div>
  );
}

function RoomSearchPage() {
  const location = useLocation();
  return (
    <RoomSearchResults
      key={location.search}
      initialSearch={readSearch(location.search)}
    />
  );
}

export default RoomSearchPage;
