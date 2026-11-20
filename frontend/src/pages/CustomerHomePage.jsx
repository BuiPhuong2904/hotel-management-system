import { useEffect, useRef, useState } from 'react';
import {
  FiArrowRight,
  FiAward,
  FiBriefcase,
  FiCalendar,
  FiCheck,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiFacebook,
  FiInstagram,
  FiLogOut,
  FiMapPin,
  FiMessageCircle,
  FiSend,
  FiSearch,
  FiShield,
  FiStar,
  FiWifi,
  FiX,
} from 'react-icons/fi';
import { FaHotel } from 'react-icons/fa6';
import { Link, useNavigate } from 'react-router-dom';
import ToastNotification from '../components/ToastNotification';

const createDate = (year, month, day) => new Date(year, month - 1, day);

const formatDate = (date) =>
  `${String(date.getDate()).padStart(2, '0')}/${String(
    date.getMonth() + 1,
  ).padStart(2, '0')}/${date.getFullYear()}`;

const addDays = (date, days) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);

const readCustomer = () => {
  const storedUser = localStorage.getItem('user');
  const storedCustomer = localStorage.getItem('customerUser');

  for (const value of [storedCustomer, storedUser]) {
    if (!value) {
      continue;
    }

    try {
      const customer = JSON.parse(value);
      if (
        customer &&
        typeof customer === 'object' &&
        (value === storedCustomer || !customer.role || customer.role === 'customer')
      ) {
        return customer;
      }
    } catch {
      continue;
    }
  }

  return null;
};

const roomTypes = [
  {
    name: 'Phòng loại A',
    badge: 'Tiêu chuẩn',
    description:
      'Phòng tiêu chuẩn ấm cúng, nội thất hiện đại tinh tế, ánh sáng êm dịu mang đến không gian thư giãn…',
    image: '/images/room-type-a.jpeg',
    features: ['1 Giường Queen', 'Wi-Fi tốc độ cao', '28 m²'],
    price: '150.000 VND',
  },
  {
    name: 'Phòng loại B',
    badge: 'Phổ biến',
    description:
      'Phòng cao cấp rộng rãi với không gian sinh hoạt nâng cao, tầm nhìn thoáng đãng và ban…',
    image: '/images/room-type-b.jpeg',
    features: ['1 Giường King', 'Hướng phố', '38 m²'],
    price: '170.000 VND',
  },
  {
    name: 'Phòng loại C',
    badge: 'Thượng hạng',
    description:
      'Phòng Suite thượng hạng với phòng khách riêng biệt, bồn tắm thư giãn cao cấp và dịch vụ…',
    image: '/images/room-type-c.jpeg',
    features: ['Suite Thượng Hạng', 'Bồn tắm nằm', '54 m²'],
    price: '200.000 VND',
  },
];

const facilities = [
  {
    icon: FiClock,
    title: 'Lễ tân trực 24/7',
    description:
      'Hỗ trợ nhận/trả phòng mọi thời điểm, hướng dẫn dịch vụ và tư vấn chu đáo suốt kỳ nghỉ.',
  },
  {
    icon: FiWifi,
    title: 'Wi-Fi tốc độ cao',
    description:
      'Kết nối Internet không dây ổn định, mượt mà trong toàn bộ khuôn viên.',
  },
  {
    icon: FiAward,
    title: 'Dọn phòng hàng ngày',
    description:
      'Chăm sóc buồng phòng chu đáo, thay drap gối cao cấp và đảm bảo tiêu chuẩn vệ sinh.',
  },
  {
    icon: FiBriefcase,
    title: 'Bảo quản hành lý',
    description:
      'Dịch vụ giữ hành lý an toàn, hỗ trợ sắp xếp trước giờ nhận phòng hoặc sau giờ trả phòng.',
  },
];

const navigation = [
  { label: 'Trang chủ', target: 'home', active: true },
  { label: 'Phòng nghỉ', target: 'rooms' },
  { label: 'Tiện ích', target: 'facilities' },
  { label: 'Về chúng tôi', target: 'about' },
  { label: 'Liên hệ', target: 'contact' },
];

const policies = [
  'Quy chế lưu trú khách sạn',
  'Chính sách đặt cọc 30%',
  'Quy định phụ thu khách & Quốc tịch',
  'Bảo mật thông tin khách hàng',
];

function DatePickerPopover({
  month,
  selectedDate,
  minimumDate,
  onMonthChange,
  onSelect,
}) {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const daysInMonth = new Date(
    month.getFullYear(),
    month.getMonth() + 1,
    0,
  ).getDate();
  const leadingDays = (firstDay.getDay() + 6) % 7;
  const cells = Array.from({ length: 42 }, (_, index) => {
    const day = index - leadingDays + 1;
    return day > 0 && day <= daysInMonth ? day : null;
  });
  const weekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

  return (
    <div className="absolute left-0 top-full z-30 mt-2 w-72 rounded-xl border border-[#DCECF8] bg-white p-3 shadow-xl">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          aria-label="Tháng trước"
          onClick={() => onMonthChange(-1)}
          className="flex h-8 w-8 items-center justify-center rounded-full text-[#075A9C] hover:bg-[#E8F5FF]"
        >
          <FiChevronLeft aria-hidden="true" className="h-4 w-4" />
        </button>
        <p className="text-sm font-bold text-[#075A9C]">
          Tháng {month.getMonth() + 1}, {month.getFullYear()}
        </p>
        <button
          type="button"
          aria-label="Tháng sau"
          onClick={() => onMonthChange(1)}
          className="flex h-8 w-8 items-center justify-center rounded-full text-[#075A9C] hover:bg-[#E8F5FF]"
        >
          <FiChevronRight aria-hidden="true" className="h-4 w-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {weekDays.map((day) => (
          <span
            key={day}
            className="py-1 text-[11px] font-semibold text-[#526575]"
          >
            {day}
          </span>
        ))}
        {cells.map((day, index) => {
          if (!day) {
            return <span key={`empty-${index}`} />;
          }
          const date = new Date(month.getFullYear(), month.getMonth(), day);
          const isSelected =
            date.getFullYear() === selectedDate.getFullYear() &&
            date.getMonth() === selectedDate.getMonth() &&
            date.getDate() === selectedDate.getDate();
          const isBeforeMinimum = minimumDate && date < minimumDate;

          return (
            <button
              key={day}
              type="button"
              disabled={isBeforeMinimum}
              aria-pressed={isSelected}
              onClick={() => onSelect(date)}
              className={`flex h-8 items-center justify-center rounded-full text-xs font-medium ${
                isSelected
                  ? 'bg-[#0D8BEA] text-white'
                  : isBeforeMinimum
                    ? 'cursor-not-allowed text-slate-300'
                    : 'text-[#526575] hover:bg-[#E8F5FF]'
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const normalizeText = (value) =>
  value
    .toLocaleLowerCase('vi')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const getChatReply = (question) => {
  const normalized = normalizeText(question);

  if (
    normalized.includes('dat coc') ||
    normalized.includes('phu thu') ||
    normalized.includes('khach thu 3') ||
    normalized.includes('quy dinh') ||
    normalized.includes('quoc tich')
  ) {
    return 'Grand Hotel yêu cầu đặt cọc trước 30% tổng giá trị đặt phòng. Mỗi phòng tối đa 3 khách; khách thứ 3 phụ thu 25%. Khách nước ngoài áp dụng hệ số giá ×1.5.';
  }

  if (
    normalized.includes('nuoc ngoai') ||
    normalized.includes('quoc te') ||
    normalized.includes('quoc tich')
  ) {
    return 'Khách nước ngoài áp dụng hệ số giá ×1.5. Mỗi phòng tối đa 3 khách, khách thứ 3 phụ thu 25% và đặt cọc trước 30% tổng giá trị đặt phòng.';
  }

  if (
    normalized.includes('4 khach') ||
    normalized.includes('bon khach') ||
    normalized.includes('suc chua') ||
    normalized.includes('may nguoi')
  ) {
    return 'Mỗi phòng phục vụ tối đa 3 khách. Với 4 khách, quý khách nên đặt 2 phòng để đảm bảo tiện nghi; giá từ 150.000 VND/phòng/đêm (Loại A), 170.000 VND (Loại B) và 200.000 VND (Loại C).';
  }

  if (
    normalized.includes('gia') ||
    normalized.includes('phong loai') ||
    normalized.includes('bao nhieu tien')
  ) {
    return 'Giá mỗi đêm: Phòng loại A 150.000 VND, Phòng loại B 170.000 VND và Phòng loại C 200.000 VND. Mức giá khách nước ngoài áp dụng hệ số ×1.5.';
  }

  if (
    normalized.includes('xin chao') ||
    normalized.includes('chao') ||
    normalized.includes('hello')
  ) {
    return 'Dạ em chào quý khách! Em có thể giúp quý khách tìm phòng ưng ý, kiểm tra giá tốt nhất hoặc tư vấn dịch vụ tiện ích ngay nhé!';
  }

  return 'Dạ, em sẵn sàng hỗ trợ quý khách. Quý khách có thể hỏi về giá phòng, sức chứa, phụ thu khách thứ 3, đặt cọc hoặc quy định dành cho khách nước ngoài ạ.';
};

function CustomerHomePage() {
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(readCustomer);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [checkIn, setCheckIn] = useState(() => createDate(2026, 10, 25));
  const [checkOut, setCheckOut] = useState(() => createDate(2026, 10, 27));
  const [guests, setGuests] = useState('2 khách');
  const [openCalendar, setOpenCalendar] = useState(null);
  const [checkInMonth, setCheckInMonth] = useState(() => createDate(2026, 10, 1));
  const [checkOutMonth, setCheckOutMonth] = useState(() => createDate(2026, 10, 1));
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [isChatHovered, setIsChatHovered] = useState(false);
  const [greetingDismissed, setGreetingDismissed] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 0,
      sender: 'bot',
      text: 'Dạ em chào quý khách! Em có thể giúp quý khách tìm phòng ưng ý, kiểm tra giá tốt nhất hoặc tư vấn dịch vụ tiện ích ngay nhé!',
    },
  ]);
  const messageId = useRef(1);
  const checkInRef = useRef(null);
  const checkOutRef = useRef(null);
  const accountRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setToast(null), 3500);
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        openCalendar === 'checkIn' &&
        !checkInRef.current?.contains(event.target)
      ) {
        setOpenCalendar(null);
      }

      if (
        openCalendar === 'checkOut' &&
        !checkOutRef.current?.contains(event.target)
      ) {
        setOpenCalendar(null);
      }

      if (!accountRef.current?.contains(event.target)) {
        setAccountMenuOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setOpenCalendar(null);
        setAccountMenuOpen(false);
        setSelectedRoom(null);
        setChatOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [openCalendar]);

  useEffect(() => {
    const syncCustomer = () => setCustomer(readCustomer());
    window.addEventListener('storage', syncCustomer);
    return () => window.removeEventListener('storage', syncCustomer);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatOpen]);

  const scrollTo = (target) => {
    document.getElementById(target)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  const navigateToRooms = () => {
    const search = {
      checkIn: formatDate(checkIn),
      checkOut: formatDate(checkOut),
      guests: Number.parseInt(guests, 10),
    };
    sessionStorage.setItem('roomSearch', JSON.stringify(search));
    const query = new URLSearchParams(search).toString();
    navigate(`/rooms?${query}`);
  };

  const handleNavigation = (event, target) => {
    event.preventDefault();
    if (target === 'rooms') {
      navigateToRooms();
      return;
    }
    scrollTo(target);
  };

  const handleSearch = (event) => {
    event.preventDefault();
    navigateToRooms();
  };

  const openDatePicker = (calendar, selectedDate) => {
    setOpenCalendar((current) => (current === calendar ? null : calendar));
    if (calendar === 'checkIn') {
      setCheckInMonth(createDate(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1));
    } else {
      setCheckOutMonth(createDate(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1));
    }
  };

  const selectDate = (calendar, selectedDate) => {
    if (calendar === 'checkIn') {
      setCheckIn(selectedDate);
      if (selectedDate >= checkOut) {
        setCheckOut(addDays(selectedDate, 1));
      }
    } else if (selectedDate > checkIn) {
      setCheckOut(selectedDate);
    }
    setOpenCalendar(null);
  };

  const changeCalendarMonth = (calendar, direction) => {
    const updateMonth = (month) =>
      new Date(month.getFullYear(), month.getMonth() + direction, 1);
    if (calendar === 'checkIn') {
      setCheckInMonth(updateMonth);
    } else {
      setCheckOutMonth(updateMonth);
    }
  };

  const sendChatMessage = (message) => {
    const text = message.trim();
    if (!text) {
      return;
    }
    setMessages((currentMessages) => [
      ...currentMessages,
      { id: messageId.current++, sender: 'user', text },
      { id: messageId.current++, sender: 'bot', text: getChatReply(text) },
    ]);
    setChatInput('');
  };

  const handleLogout = () => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        if (JSON.parse(storedUser)?.role === 'customer') {
          localStorage.removeItem('user');
        }
      } catch {
        localStorage.removeItem('user');
      }
    }
    localStorage.removeItem('customerUser');
    setCustomer(null);
    setAccountMenuOpen(false);
  };

  const customerName =
    customer?.name || customer?.fullName || customer?.username || 'Khách hàng';
  const customerInitials = customerName
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((part) => part[0])
    .join('')
    .toLocaleUpperCase('vi');

  return (
    <div className="min-h-screen w-full bg-[#F7FBFF] text-[#526575]">
      <header className="sticky top-0 z-40 h-20 border-b border-[#DCECF8] bg-white/95 shadow-[0_2px_5px_rgba(7,90,156,0.04)] backdrop-blur-xl">
        <div className="mx-auto flex h-full w-full items-center justify-between px-4 sm:px-8">
          <Link
            to="/"
            className="flex shrink-0 items-center gap-2 text-[#075A9C]"
            aria-label="Grand Hotel - Trang chủ"
          >
            <FaHotel aria-hidden="true" className="h-5.5 w-5.5" />
            <span className="text-xl font-bold">Grand Hotel</span>
          </Link>

          <nav
            aria-label="Điều hướng chính"
            className="hidden items-center gap-8 lg:flex"
          >
            {navigation.map(({ label, target, active }) => (
              <a
                key={target}
                href={`#${target}`}
                onClick={(event) => handleNavigation(event, target)}
                className={`whitespace-nowrap text-sm ${
                  active
                    ? 'font-bold text-[#0D8BEA]'
                    : 'font-semibold text-[#526575]'
                }`}
              >
                {label}
              </a>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2 sm:gap-4">
            {customer ? (
              <div className="relative" ref={accountRef}>
                <button
                  type="button"
                  aria-expanded={accountMenuOpen}
                  aria-haspopup="menu"
                  onClick={() => setAccountMenuOpen((isOpen) => !isOpen)}
                  className="inline-flex h-10 max-w-48 items-center gap-2 rounded-full border border-[#DCECF8] bg-white px-2.5 text-sm font-semibold text-[#075A9C] sm:max-w-56"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#E8F5FF] text-xs font-bold text-[#075A9C]">
                    {customerInitials}
                  </span>
                  <span className="truncate">{customerName}</span>
                  <FiChevronDown aria-hidden="true" className="h-4 w-4 shrink-0" />
                </button>
                {accountMenuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 top-full z-50 mt-2 w-52 rounded-xl border border-[#DCECF8] bg-white p-1.5 shadow-xl"
                  >
                    <Link
                      role="menuitem"
                      to="/my-bookings"
                      onClick={() => setAccountMenuOpen(false)}
                      className="block rounded-lg px-3 py-2 text-sm font-semibold text-[#526575] hover:bg-[#F7FBFF]"
                    >
                      Lịch sử đặt phòng
                    </Link>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-[#526575] hover:bg-[#F7FBFF]"
                    >
                      <FiLogOut aria-hidden="true" className="h-4 w-4" />
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex h-10 items-center justify-center rounded-lg border border-[#DCECF8] bg-[#F7FBFF] px-3 text-sm font-bold text-[#526575] sm:px-4"
              >
                Đăng nhập
              </Link>
            )}
            <button
              type="button"
              onClick={() => scrollTo('booking-search')}
              className="inline-flex h-10 items-center justify-center rounded-lg bg-[#0D8BEA] px-3 text-sm font-bold text-white shadow-[0_1px_1px_rgba(0,0,0,0.05)] sm:px-5"
            >
              Đặt phòng
            </button>
          </div>
        </div>
      </header>

      <main>
        <section
          id="home"
          className="flex h-125 scroll-mt-20 items-center justify-center overflow-hidden bg-cover bg-center px-5 pb-40 pt-24 text-center text-white sm:px-8"
          style={{
            backgroundImage:
              'linear-gradient(to bottom, rgba(7,90,156,0.8), rgba(7,90,156,0.6) 50%, rgba(7,90,156,0.9)), url("/images/customer-home-hero.jpeg")',
          }}
        >
          <div className="flex w-full max-w-5xl flex-col items-center">
            <h1 className="mb-4 max-w-4xl text-4xl font-extrabold leading-tight drop-shadow-[0_1px_1px_rgba(0,0,0,0.05)] sm:text-5xl">
              Bắt đầu kỳ nghỉ trọn vẹn của bạn
            </h1>
            <p className="mb-8 max-w-2xl text-base font-bold leading-normal sm:text-lg">
              Khám phá không gian nghỉ dưỡng tiện nghi, dịch vụ tận tâm và những
              trải nghiệm đáng nhớ được chuẩn bị chu đáo tại Grand Hotel.
            </p>
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <button
                type="button"
                onClick={() => scrollTo('rooms')}
                className="inline-flex h-11.75 items-center justify-center gap-2 rounded-xl bg-[#0D8BEA] px-8 text-sm font-bold text-white shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-4px_rgba(0,0,0,0.1)]"
              >
                <FiSearch aria-hidden="true" className="h-4 w-4" />
                Khám phá phòng nghỉ
              </button>
              <button
                type="button"
                onClick={() => scrollTo('about')}
                className="inline-flex h-12.25 items-center justify-center gap-2 rounded-xl border border-white/35 bg-white/15 px-8.25 text-sm font-bold text-white backdrop-blur-md"
              >
                Khám phá khách sạn
                <FiArrowRight aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>

        <section
          id="booking-search"
          aria-labelledby="booking-search-title"
          className="relative z-10 mx-auto -mt-24 w-[calc(100%-2rem)] max-w-300 rounded-2xl border border-[#DCECF8] bg-white p-5 shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)] sm:p-8"
        >
          <h2
            id="booking-search-title"
            className="mb-6 flex items-center gap-2 text-xl font-bold text-[#075A9C]"
          >
            <FiCalendar aria-hidden="true" className="h-5 w-4.5" />
            Lên kế hoạch đặt phòng
          </h2>
          <form
            onSubmit={handleSearch}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            <div className="relative flex flex-col gap-1.5 text-sm font-bold text-[#526575]" ref={checkInRef}>
              <label htmlFor="check-in-date">Ngày nhận phòng</label>
              <div className="relative">
                <input
                  id="check-in-date"
                  aria-label="Ngày nhận phòng"
                  type="text"
                  value={formatDate(checkIn)}
                  readOnly
                  onClick={() => openDatePicker('checkIn', checkIn)}
                  className="h-12 w-full cursor-pointer rounded-lg border border-[#DCECF8] bg-white px-4.25 pr-11 text-sm font-normal text-[#526575] outline-none focus:border-[#0D8BEA]"
                />
                <button
                  type="button"
                  aria-label="Mở lịch ngày nhận phòng"
                  aria-expanded={openCalendar === 'checkIn'}
                  onClick={() => openDatePicker('checkIn', checkIn)}
                  className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-[#526575]"
                >
                  <FiCalendar aria-hidden="true" className="h-4 w-4" />
                </button>
              </div>
              {openCalendar === 'checkIn' && (
                <DatePickerPopover
                  month={checkInMonth}
                  selectedDate={checkIn}
                  onMonthChange={(direction) =>
                    changeCalendarMonth('checkIn', direction)
                  }
                  onSelect={(date) => selectDate('checkIn', date)}
                />
              )}
            </div>
            <div className="relative flex flex-col gap-1.5 text-sm font-bold text-[#526575]" ref={checkOutRef}>
              <label htmlFor="check-out-date">Ngày trả phòng</label>
              <div className="relative">
                <input
                  id="check-out-date"
                  aria-label="Ngày trả phòng"
                  type="text"
                  value={formatDate(checkOut)}
                  readOnly
                  onClick={() => openDatePicker('checkOut', checkOut)}
                  className="h-12 w-full cursor-pointer rounded-lg border border-[#DCECF8] bg-white px-4.25 pr-11 text-sm font-normal text-[#526575] outline-none focus:border-[#0D8BEA]"
                />
                <button
                  type="button"
                  aria-label="Mở lịch ngày trả phòng"
                  aria-expanded={openCalendar === 'checkOut'}
                  onClick={() => openDatePicker('checkOut', checkOut)}
                  className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-[#526575]"
                >
                  <FiCalendar aria-hidden="true" className="h-4 w-4" />
                </button>
              </div>
              {openCalendar === 'checkOut' && (
                <DatePickerPopover
                  month={checkOutMonth}
                  selectedDate={checkOut}
                  minimumDate={addDays(checkIn, 1)}
                  onMonthChange={(direction) =>
                    changeCalendarMonth('checkOut', direction)
                  }
                  onSelect={(date) => selectDate('checkOut', date)}
                />
              )}
            </div>
            <label className="flex flex-col gap-1.5 text-sm font-bold text-[#526575]">
              <span className="flex items-center gap-1.5">
                Số khách
              </span>
              <select
                aria-label="Số khách"
                value={guests}
                onChange={(event) => setGuests(event.target.value)}
                className="h-12 w-full appearance-none rounded-lg border border-[#DCECF8] bg-white px-4.25 text-sm font-normal text-[#526575] outline-none focus:border-[#0D8BEA]"
              >
                {['1 khách', '2 khách', '3 khách', '4 khách'].map((guest) => (
                  <option key={guest} value={guest}>
                    {guest}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="submit"
              className="mt-auto inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#0D8BEA] px-6 text-sm font-bold text-white shadow-[0_1px_1px_rgba(0,0,0,0.05)]"
            >
              <FiSearch aria-hidden="true" className="h-3.75 w-3.75" />
              Tìm phòng
            </button>
          </form>
        </section>

        <section
          id="rooms"
          aria-labelledby="rooms-title"
          className="scroll-mt-20 bg-[#F7FBFF] px-5 py-12 sm:px-8"
        >
          <div className="mx-auto flex max-w-344 flex-col items-center gap-10">
            <div className="flex max-w-2xl flex-col items-center gap-2 text-center">
              <p className="text-sm font-bold text-[#0D8BEA]">HẠNG PHÒNG</p>
              <h2
                id="rooms-title"
                className="text-[28px] font-bold leading-tight text-[#075A9C] sm:text-[32px]"
              >
                Tìm phòng nghỉ phù hợp
              </h2>
              <p className="text-base leading-normal text-[#526575]">
                Lựa chọn không gian nghỉ ngơi lý tưởng được thiết kế tinh tế,
                mang lại sự thoải mái và trải nghiệm lưu trú trọn vẹn.
              </p>
            </div>

            <div className="grid w-full grid-cols-1 gap-8 lg:grid-cols-3">
              {roomTypes.map((room) => (
                <article
                  key={room.name}
                  className="flex h-124.25 min-w-0 flex-col overflow-hidden rounded-2xl border border-[#DCECF8] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
                >
                  <div className="relative h-60 shrink-0">
                    <img
                      src={room.image}
                      alt={room.name}
                      className="h-full w-full object-cover"
                    />
                    <span
                      className={`absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-semibold shadow-[0_1px_1px_rgba(0,0,0,0.05)] ${
                        room.name === 'Phòng loại A'
                          ? 'border border-[#DCECF8] bg-white text-[#075A9C] backdrop-blur-md'
                          : room.name === 'Phòng loại B'
                            ? 'bg-[#0D8BEA] text-white'
                            : 'bg-[#075A9C] text-white'
                      }`}
                    >
                      {room.badge}
                    </span>
                  </div>
                  <div className="flex min-h-0 flex-1 flex-col justify-between p-6">
                    <div className="flex min-h-0 flex-col">
                      <h3 className="mb-2 text-xl font-bold text-[#075A9C]">
                        {room.name}
                      </h3>
                      <p className="line-clamp-3 min-h-16.75 text-sm leading-normal text-[#526575]">
                        {room.description}
                      </p>
                      <ul className="mt-2 flex flex-wrap gap-2">
                        {room.features.map((feature, index) => (
                          <li
                            key={feature}
                            className="inline-flex h-6.5 items-center gap-1 rounded-md border border-[#DCECF8] bg-[#E8F5FF] px-2.75 text-xs font-semibold text-[#075A9C]"
                          >
                            {index === 0 ? (
                              <FiCheck aria-hidden="true" className="h-3 w-3" />
                            ) : index === 1 ? (
                              <FiWifi aria-hidden="true" className="h-3 w-3" />
                            ) : (
                              <FiAward aria-hidden="true" className="h-3 w-3" />
                            )}
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex items-end justify-between border-t border-[#DCECF8] pt-2.25">
                      <div>
                        <p className="text-xs text-[#526575]">Giá từ</p>
                        <p className="whitespace-nowrap text-xl font-bold text-[#0D8BEA]">
                          {room.price}
                          <span className="ml-1 text-xs font-normal text-[#526575]">
                            {' / đêm'}
                          </span>
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedRoom(room)}
                        className="inline-flex h-10 items-center gap-1 rounded-lg bg-white text-sm font-bold text-[#0D8BEA] underline"
                      >
                        Xem chi tiết
                        <FiArrowRight aria-hidden="true" className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          id="facilities"
          aria-labelledby="facilities-title"
          className="scroll-mt-20 border-y border-[#DCECF8] bg-[#E8F5FF]/60 px-5 py-12.25 sm:px-8"
        >
          <div className="mx-auto flex max-w-344 flex-col items-center gap-10">
            <div className="flex max-w-2xl flex-col items-center gap-2 text-center">
              <p className="text-sm font-bold text-[#0D8BEA]">
                TIỆN ÍCH VÀ DỊCH VỤ
              </p>
              <h2
                id="facilities-title"
                className="text-[28px] font-bold leading-tight text-[#075A9C] sm:text-[32px]"
              >
                Tiện nghi dành cho bạn
              </h2>
              <p className="text-base leading-normal text-[#526575]">
                Dịch vụ lưu trú chu đáo được tuyển chọn nhằm mang đến kỳ nghỉ
                nhẹ nhàng, thư thái và thuận tiện nhất.
              </p>
            </div>

            <div className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
              {facilities.map(({ icon: Icon, title, description }) => (
                <article
                  key={title}
                  className="flex min-h-51 flex-col items-center rounded-2xl border border-[#DCECF8] bg-white p-6.25 text-center shadow-[0_1px_1px_rgba(0,0,0,0.05)]"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#DCECF8] bg-[#E8F5FF] text-[#0D8BEA]">
                    <Icon aria-hidden="true" className="h-6 w-6" />
                  </span>
                  <h3 className="mt-4 whitespace-nowrap text-lg font-bold text-[#075A9C]">
                    {title}
                  </h3>
                  <p className="mt-2 max-w-51.5 text-sm leading-normal text-[#526575]">
                    {description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          id="about"
          aria-labelledby="about-title"
          className="scroll-mt-20 bg-[#F7FBFF] px-5 py-12 sm:px-8"
        >
          <div className="mx-auto grid max-w-344 grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-12">
            <div className="overflow-hidden rounded-2xl border border-[#DCECF8] shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)]">
              <img
                src="/images/room-type-c.jpeg"
                alt="Sảnh tiếp đón Grand Hotel"
                className="h-100 w-full object-cover"
              />
            </div>
            <div>
              <p className="mb-1.5 text-sm font-bold text-[#0D8BEA]">
                VỀ GRAND HOTEL
              </p>
              <h2
                id="about-title"
                className="mb-4 text-[28px] font-bold leading-tight text-[#075A9C] sm:text-[32px]"
              >
                Dịch vụ tận tâm, trải nghiệm thoải mái
              </h2>
              <p className="mb-6 text-base leading-normal text-[#526575]">
                Tại Grand Hotel, chúng tôi tin rằng trải nghiệm lưu trú tuyệt
                vời bắt nguồn từ sự tỉ mỉ trong từng chi tiết. Từ không gian
                phòng nghỉ thanh lịch đến quy trình đặt phòng trực tuyến thuận
                tiện, mọi trải nghiệm đều hướng đến sự an tâm và hài lòng của
                quý khách.
              </p>
              <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[
                  {
                    icon: FiClock,
                    title: 'Nhanh chóng',
                    description: 'Đặt phòng trực tuyến nhanh',
                  },
                  {
                    icon: FiCheck,
                    title: 'Minh bạch',
                    description: 'Giá phòng niêm yết rõ ràng',
                  },
                  {
                    icon: FiShield,
                    title: 'Tận tâm',
                    description: 'Hỗ trợ khách hàng tận tâm',
                  },
                ].map(({ icon: Icon, title, description }) => (
                  <article
                    key={title}
                    className="flex min-h-19 flex-col gap-1 rounded-xl border border-[#DCECF8] bg-white p-4.25"
                  >
                    <h3 className="flex items-center gap-1.5 whitespace-nowrap text-sm font-bold text-[#0D8BEA]">
                      <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
                      {title}
                    </h3>
                    <p className="text-sm leading-normal text-[#526575]">
                      {description}
                    </p>
                  </article>
                ))}
              </div>
              <a
                href="#rooms"
                onClick={(event) => handleNavigation(event, 'rooms')}
                className="inline-flex items-center gap-1.5 text-sm font-bold text-[#0D8BEA]"
              >
                Tìm hiểu thêm về các hạng phòng
                <FiArrowRight aria-hidden="true" className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>
      </main>

      {selectedRoom && (
        <div
          className="fixed inset-0 z-70 flex items-center justify-center bg-slate-950/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedRoom(null);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="room-detail-title"
            className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-[#DCECF8] bg-white shadow-2xl"
          >
            <button
              type="button"
              aria-label="Đóng chi tiết hạng phòng"
              onClick={() => setSelectedRoom(null)}
              className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#075A9C] shadow"
            >
              <FiX aria-hidden="true" className="h-5 w-5" />
            </button>
            <img
              src={selectedRoom.image}
              alt={selectedRoom.name}
              className="h-56 w-full object-cover"
            />
            <div className="p-6">
              <span className="rounded-full bg-[#E8F5FF] px-3 py-1 text-xs font-semibold text-[#075A9C]">
                {selectedRoom.badge}
              </span>
              <h2
                id="room-detail-title"
                className="mt-3 text-2xl font-bold text-[#075A9C]"
              >
                {selectedRoom.name}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[#526575]">
                {selectedRoom.description}
              </p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {selectedRoom.features.map((feature) => (
                  <li
                    key={feature}
                    className="rounded-md border border-[#DCECF8] bg-[#E8F5FF] px-3 py-1.5 text-xs font-semibold text-[#075A9C]"
                  >
                    {feature}
                  </li>
                ))}
              </ul>
              <p className="mt-5 border-t border-[#DCECF8] pt-4 text-lg font-bold text-[#0D8BEA]">
                {selectedRoom.price} / đêm
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedRoom(null);
                  setToast({
                    message: `Đang tìm phòng phù hợp với ${selectedRoom.name}.`,
                    type: 'success',
                  });
                  scrollTo('booking-search');
                }}
                className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-lg bg-[#0D8BEA] text-sm font-bold text-white"
              >
                Tìm phòng này
              </button>
            </div>
          </section>
        </div>
      )}

      <footer
        id="contact"
        className="scroll-mt-20 border-t border-[#DCECF8] bg-white px-5 pb-8 pt-8 sm:px-8"
      >
        <div className="mx-auto max-w-344">
          <div className="grid grid-cols-1 gap-8 border-b border-[#DCECF8] pb-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col items-start gap-4">
              <Link
                to="/"
                className="flex items-center gap-2 text-[#075A9C]"
                aria-label="Grand Hotel - Trang chủ"
              >
                <FaHotel aria-hidden="true" className="h-5.75 w-5.75" />
                <span className="text-xl font-bold">Grand Hotel</span>
              </Link>
              <p className="max-w-[320px] text-xs leading-normal text-[#526575]">
                Hệ thống nghỉ dưỡng cao cấp chuẩn mực quốc tế, mang lại trải
                nghiệm lưu trú sang trọng, chu đáo và thư thái cho quý khách.
              </p>
              <div className="flex items-center gap-3 text-[#075A9C]">
                <a
                  href="#contact"
                  aria-label="Facebook"
                  className="flex h-6 w-6 items-center justify-center rounded-full border border-[#DCECF8]"
                >
                  <FiFacebook aria-hidden="true" className="h-3.5 w-3.5" />
                </a>
                <a
                  href="#contact"
                  aria-label="Instagram"
                  className="flex h-6 w-6 items-center justify-center rounded-full border border-[#DCECF8]"
                >
                  <FiInstagram aria-hidden="true" className="h-3.5 w-3.5" />
                </a>
                <a
                  href="#contact"
                  aria-label="Liên hệ"
                  className="flex h-6 w-6 items-center justify-center rounded-full border border-[#DCECF8]"
                >
                  <FiMessageCircle aria-hidden="true" className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>

            <div>
              <h2 className="mb-2 text-sm font-bold text-[#075A9C]">
                KHÁM PHÁ
              </h2>
              <ul className="flex flex-col gap-2 text-sm text-[#526575]">
                <li>
                  <a
                    href="#rooms"
                    onClick={(event) => handleNavigation(event, 'rooms')}
                  >
                    Danh sách hạng phòng
                  </a>
                </li>
                <li>
                  <a
                    href="#facilities"
                    onClick={(event) => handleNavigation(event, 'facilities')}
                  >
                    Dịch vụ &amp; Tiện ích
                  </a>
                </li>
                <li>Ưu đãi đặc biệt</li>
                <li>Hỗ trợ check-in</li>
              </ul>
            </div>

            <div>
              <h2 className="mb-2 text-sm font-bold text-[#075A9C]">
                CHÍNH SÁCH &amp; QUY ĐỊNH
              </h2>
              <ul className="flex flex-col gap-1.5 text-sm text-[#526575]">
                {policies.map((policy) => (
                  <li key={policy}>{policy}</li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col items-start gap-2">
              <h2 className="mb-1 text-sm font-bold text-[#075A9C]">
                LIÊN HỆ
              </h2>
              <p className="flex items-start gap-1 text-sm text-[#526575]">
                <FiMapPin aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
                120 Đại Lộ Hoàng Gia, TP. Hồ Chí Minh
              </p>
              <p className="text-sm text-[#526575]">+84 (0) 28 3822 8888</p>
              <p className="text-sm text-[#526575]">booking@grandhotel.vn</p>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-3 pt-6 text-xs text-[#526575] sm:flex-row sm:items-center">
            <p>© 2026 Grand Hotel Group. Bảo lưu mọi quyền.</p>
            <div className="flex items-center gap-4">
              <span>Điều khoản</span>
              <span>Bảo mật</span>
              <span>Quy chế</span>
            </div>
          </div>
        </div>
      </footer>

      <div
        className="group fixed bottom-6 right-6 z-50 flex flex-col items-end sm:right-8"
        onMouseEnter={() => setIsChatHovered(true)}
        onMouseLeave={() => setIsChatHovered(false)}
      >
        {chatOpen ? (
          <section
            aria-label="Trò chuyện với Trợ lý AI Grand Hotel"
            className="mb-4 flex h-130 w-95 max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-[#DCECF8] bg-white shadow-2xl"
          >
            <header className="flex items-center gap-3 bg-linear-to-r from-[#0D8BEA] to-[#075A9C] p-4 text-white">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white">
                <img
                  src="/images/chatbot-mascot.png"
                  alt=""
                  className="h-10 w-10 object-contain"
                />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-sm font-bold">
                  Trợ lý AI Grand Hotel
                </h2>
                <p className="mt-0.5 text-[11px] text-blue-50">
                  ● Trực tuyến • Hỗ trợ 24/7
                </p>
              </div>
              <button
                type="button"
                aria-label="Đóng cửa sổ chat"
                onClick={() => setChatOpen(false)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white hover:bg-white/15"
              >
                <FiX aria-hidden="true" className="h-5 w-5" />
              </button>
            </header>
            <div
              role="log"
              aria-live="polite"
              className="flex-1 space-y-3 overflow-y-auto bg-[#F7FBFF] p-4"
            >
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <p
                    className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                      message.sender === 'user'
                        ? 'rounded-br-md bg-[#0D8BEA] text-white'
                        : 'rounded-bl-md border border-[#DCECF8] bg-white text-[#526575]'
                    }`}
                  >
                    {message.text}
                  </p>
                </div>
              ))}
              {messages.length === 1 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {[
                    'Giá phòng các hạng',
                    'Gợi ý phòng cho 4 khách',
                    'Quy định phụ thu & đặt cọc',
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => sendChatMessage(suggestion)}
                      className="rounded-full border border-[#DCECF8] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#075A9C] hover:bg-[#E8F5FF]"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                sendChatMessage(chatInput);
              }}
              className="flex items-center gap-2 border-t border-[#DCECF8] bg-white p-3"
            >
              <input
                aria-label="Nhập tin nhắn"
                value={chatInput}
                onChange={(event) => setChatInput(event.target.value)}
                placeholder="Nhập câu hỏi của bạn..."
                className="h-10 min-w-0 flex-1 rounded-lg border border-[#DCECF8] px-3 text-sm text-[#526575] outline-none focus:border-[#0D8BEA]"
              />
              <button
                type="submit"
                aria-label="Gửi tin nhắn"
                disabled={!chatInput.trim()}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#0D8BEA] text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FiSend aria-hidden="true" className="h-4 w-4" />
              </button>
            </form>
          </section>
        ) : (
          isChatHovered &&
          !greetingDismissed && (
            <section className="relative mb-4 w-75 rounded-2xl border border-[#DCECF8] bg-white p-4 shadow-xl">
              <button
                type="button"
                aria-label="Ẩn thẻ chào"
                onClick={() => setGreetingDismissed(true)}
                className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full text-[#526575] hover:bg-[#F7FBFF]"
              >
                <FiX aria-hidden="true" className="h-4 w-4" />
              </button>
              <div className="mb-3 flex flex-wrap items-center gap-2 pr-5">
                <FiStar
                  aria-hidden="true"
                  className="h-4 w-4 text-[#0D8BEA]"
                />
                <span className="text-[11px] font-bold text-[#075A9C]">
                  TRỢ LÝ AI GRAND HOTEL
                </span>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
                  ● Sẵn sàng 24/7
                </span>
              </div>
              <p className="mb-3 text-xs leading-relaxed text-[#526575]">
                Dạ em chào quý khách! Em có thể giúp quý khách tìm phòng ưng ý,
                kiểm tra giá tốt nhất hoặc tư vấn dịch vụ tiện ích ngay nhé!
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  'Giá phòng các hạng',
                  'Gợi ý phòng cho 4 khách',
                  'Quy định phụ thu & đặt cọc',
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => {
                      setChatOpen(true);
                      setIsChatHovered(false);
                      sendChatMessage(suggestion);
                    }}
                    className="rounded-full border border-[#DCECF8] bg-[#F7FBFF] px-2.5 py-1 text-[11px] font-semibold text-[#075A9C] hover:bg-[#E8F5FF]"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </section>
          )
        )}
        {!chatOpen && isChatHovered && (
          <span className="absolute right-full top-1/2 mr-3 -translate-y-1/2 whitespace-nowrap rounded-full bg-slate-900/90 px-3.5 py-1.5 text-xs font-medium text-white shadow-lg">
            Bấm để chat với Trợ lý Grand Hotel
          </span>
        )}
        {!chatOpen && (
          <button
            type="button"
            aria-label="Mở Trợ lý AI Grand Hotel"
            onClick={() => {
              setChatOpen(true);
              setIsChatHovered(false);
            }}
            className="relative flex h-24 w-24 cursor-pointer items-center justify-center bg-transparent transition-transform duration-300 hover:scale-105"
          >
            <img
              src="/images/chatbot-mascot.png"
              alt="Linh vật robot Grand Hotel"
              className="h-24 w-24 object-contain drop-shadow-xl"
            />
          </button>
        )}
      </div>

      <ToastNotification message={toast?.message} type={toast?.type} />
    </div>
  );
}

export default CustomerHomePage;
