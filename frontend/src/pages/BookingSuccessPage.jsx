import { useEffect, useRef, useState } from 'react';
import {
  FiArrowLeft,
  FiArrowRight,
  FiCheck,
  FiCheckCircle,
  FiChevronDown,
  FiCopy,
  FiFacebook,
  FiInstagram,
  FiLogOut,
  FiMail,
  FiMapPin,
  FiMessageCircle,
  FiPhone,
  FiSend,
  FiStar,
  FiUser,
  FiX,
} from 'react-icons/fi';
import { FaHotel } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import ToastNotification from '../components/ToastNotification';

const defaultFinal = {
  bookingCheckout: {
    booking: {
      rooms: [
        { number: 'P101', typeName: 'Phòng loại A (Tiêu chuẩn)', price: 150000, guests: 2 },
        { number: 'P201', typeName: 'Phòng loại B (Nâng cao)', price: 170000, guests: 2 },
      ],
      checkIn: '25/10/2026',
      checkOut: '27/10/2026',
    },
    contact: { name: 'Nguyễn Minh Anh', phone: '0912 839 221', email: 'minhanh.nguyen@email.com' },
    nights: 2,
    total: 729000,
  },
  paymentOption: 'deposit',
  paidAmount: 218700,
};

function readBookingFinal() {
  for (const key of ['bookingFinal', 'bookingCheckout']) {
    const value = sessionStorage.getItem(key);
    if (!value) continue;
    try {
      return JSON.parse(value);
    } catch (error) {
      console.error(`Không thể đọc dữ liệu ${key}.`, error);
    }
  }
  return defaultFinal;
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

function BookingSuccessPage() {
  const [customer, setCustomer] = useState(getCustomer);
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const [finalData] = useState(readBookingFinal);
  const [bookingCode] = useState(() => {
    const savedCode = finalData?.bookingCode || finalData?.booking?.code;
    return typeof savedCode === 'string' && /^BK-2026-\d{4}$/.test(savedCode)
      ? savedCode
      : 'BK-2026-9821';
  });

  const checkout = finalData?.bookingCheckout || finalData;
  const paymentOption = finalData?.paymentOption || 'deposit';
  const total = Number(checkout?.total || checkout?.subtotal || 729000);
  const paidAmount = paymentOption === 'full'
    ? total
    : Number(finalData?.paidAmount || (finalData?.deposit ? finalData.deposit : Math.round(total * 0.3)));
  const isFullPayment = paymentOption === 'full';
  const customerName = customer?.name || customer?.fullName || customer?.username || checkout?.contact?.name || 'Nguyễn Minh Anh';
  const customerInitials = customerName.trim().split(/\s+/).slice(-2).map((part) => part[0]).join('').toLocaleUpperCase('vi');

  useEffect(() => {
    const handleOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setMenuOpen(false);
    };
    const handleEscape = (event) => {
      if (event.key === 'Escape') setMenuOpen(false);
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

  useEffect(() => {
    const booking = {
      ...checkout,
      bookingCode,
      code: bookingCode,
      status: 'Đã xác nhận',
      paymentStatus: isFullPayment ? 'Đã thanh toán 100%' : 'Đã thanh toán cọc 30%',
      paidAmount,
      paymentOption,
    };
    try {
      const existing = JSON.parse(localStorage.getItem('customerBookings') || '[]');
      const list = Array.isArray(existing) ? existing : [];
      if (!list.some((item) => item.bookingCode === bookingCode || item.code === bookingCode)) {
        localStorage.setItem('customerBookings', JSON.stringify([booking, ...list]));
      }
    } catch (error) {
      console.error('Không thể lưu lịch sử đặt phòng.', error);
      localStorage.setItem('customerBookings', JSON.stringify([booking]));
    }
    sessionStorage.removeItem('pendingBooking');
    sessionStorage.removeItem('bookingCheckout');
  }, [bookingCode, checkout, isFullPayment, paidAmount, paymentOption]);

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

  const copyBookingCode = async () => {
    try {
      await navigator.clipboard.writeText(bookingCode);
    } catch (error) {
      console.error('Không thể sao chép mã đặt phòng.', error);
    }
    setToast({ message: `Đã sao chép mã đặt phòng ${bookingCode}!`, type: 'success' });
  };

  const formatPaidAmount = (amount) => `${Number(amount).toLocaleString('vi-VN')} đ`;
  const steps = [
    ['BƯỚC 1 • HOÀN THÀNH', 'Chọn phòng & Ngày nghỉ'],
    ['BƯỚC 2 • HOÀN THÀNH', 'Thông tin & Khách lưu trú'],
    ['BƯỚC 3 • HOÀN THÀNH', 'Xác nhận & Đặt cọc 30%'],
    ['BƯỚC 4 • HOÀN THÀNH', 'Hoàn tất lưu trú & Nhận phòng'],
  ];

  return (
    <div className="min-h-screen w-full bg-[#F7FBFF] font-['Open_Sans',sans-serif] text-[#526575]">
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
              <div className="relative" ref={menuRef}>
                <button type="button" aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)} className="inline-flex min-h-12 items-center gap-2.5 rounded-full border border-[#DCECF8] bg-white px-3 text-sm font-semibold text-[#075A9C] shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E8F5FF] text-xs font-bold text-[#075A9C]">{customerInitials}</span>
                  <span className="hidden max-w-40 truncate sm:inline">{customerName}</span>
                  <FiChevronDown aria-hidden="true" className="h-4 w-4 shrink-0" />
                </button>
                {menuOpen && (
                  <div role="menu" className="absolute right-0 mt-2 w-56 rounded-xl border border-[#DCECF8] bg-white p-2 shadow-lg">
                    <Link role="menuitem" to="/customer" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-[#526575] hover:bg-[#F7FBFF]"><FiUser />Thông tin tài khoản</Link>
                    <Link role="menuitem" to="/my-bookings" onClick={() => setMenuOpen(false)} className="block rounded-lg px-3 py-2 text-sm font-semibold text-[#526575] hover:bg-[#F7FBFF]">Lịch sử đặt phòng</Link>
                    <button type="button" onClick={logout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-[#526575] hover:bg-[#F7FBFF]"><FiLogOut />Đăng xuất</button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="text-sm font-bold text-[#075A9C]">Đăng nhập</Link>
            )}
            <Link to="/rooms" className="inline-flex h-10 items-center justify-center rounded-lg bg-[#0D8BEA] px-5 text-sm font-bold text-white">
              Đặt phòng
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-360 px-5 py-6 sm:px-8">
        <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-1 text-sm leading-normal text-[#526575]">
          <Link to="/" className="text-[#526575]">Trang chủ</Link><span aria-hidden="true" className="px-0.5">›</span>
          <Link to="/rooms" className="text-[#526575]">Phòng nghỉ</Link><span aria-hidden="true" className="px-0.5">›</span>
          <Link to="/booking-info" className="text-[#526575]">Thông tin đặt phòng</Link><span aria-hidden="true" className="px-0.5">›</span>
          <Link to="/booking-confirm" className="text-[#526575]">Xác nhận &amp; Thanh toán cọc</Link><span aria-hidden="true" className="px-0.5">›</span>
          <span className="font-semibold text-[#075A9C]">Kết quả đặt phòng</span>
        </nav>

        <div className="mb-6">
          <h1 className="text-[32px] leading-normal font-bold text-[#075A9C]">Kết quả đặt phòng</h1>
          <p className="mt-1 text-[16px] leading-normal text-[#526575]">Xác nhận hoàn tất quy trình đặt phòng và thanh toán tiền cọc trực tuyến.</p>
        </div>

        <section aria-label="Tiến trình đặt phòng" className="mb-6 rounded-xl border border-[#DCECF8] bg-white px-5 py-5 shadow-[0_1px_3px_0_rgba(13,139,234,0.04),0_1px_2px_-1px_rgba(13,139,234,0.02)]">
          <div className="flex flex-col items-stretch gap-5 md:flex-row md:flex-wrap md:items-center md:justify-between xl:flex-nowrap">
            {steps.map(([label, description], index) => (
              <div key={label} className="contents">
                <div className="flex items-center gap-3.5">
                  <span className={`flex size-10 shrink-0 items-center justify-center rounded-full ${index === 3 ? 'bg-[#2E8B57] text-white' : 'border-2 border-[#A7F3D0] bg-[#ECFDF5] text-[#2E8B57]'} ${index === 3 ? 'shadow-[0_1px_2px_rgba(0,0,0,0.05)]' : 'shadow-[0_0_0_8px_rgba(236,253,245,0.65)]'}`}>
                    <FiCheck aria-hidden="true" className="h-5 w-5" strokeWidth={3} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[14px] leading-normal font-bold text-[#2E8B57]">{label}</p>
                    <p className="text-[14px] leading-normal text-[#526575]">{description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <span aria-hidden="true" className="hidden h-0.5 min-w-4 flex-1 rounded-full bg-[#A7F3D0] md:block xl:block" />
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="relative overflow-hidden rounded-2xl border border-[#DCECF8] bg-white px-6 py-12 shadow-[0_1px_2px_rgba(0,0,0,0.05)] sm:px-8">
          <div className="pointer-events-none absolute left-1/2 -top-16 h-36 w-96 -translate-x-1/2 rounded-full bg-[#ECFDF5] blur-3xl" />
          <div className="relative flex flex-col items-center text-center">
            <div className="relative flex size-20 items-center justify-center rounded-full border-2 border-[#A7F3D0] bg-[#ECFDF5]">
              <span className="absolute -inset-0.5 rounded-full shadow-[0_0_0_8px_rgba(236,253,245,0.8),0_1px_2px_rgba(0,0,0,0.05)]" />
              <FiCheckCircle aria-hidden="true" className="relative h-10 w-10 text-[#2E8B57]" />
            </div>

            <h2 className="mt-8 text-[24px] leading-normal font-bold text-[#075A9C]">
              {isFullPayment ? 'Đặt phòng & Thanh toán thành công!' : 'Đặt phòng & Thanh toán cọc thành công!'}
            </h2>
            <p className="mt-2 max-w-2xl text-[16px] leading-normal text-[#526575]">
              Phiếu đặt phòng trực tuyến của quý khách đã được xác nhận trên hệ thống Grand Hotel.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <div className="flex items-center gap-2 rounded-full border border-[#DCECF8] bg-[#F7FBFF] px-4.25 py-2.25 text-[14px] leading-normal">
                <span className="text-[#526575]">Mã đặt phòng:</span>
                <strong className="font-bold text-[#0D8BEA]">{bookingCode}</strong>
                <button type="button" aria-label={`Sao chép mã ${bookingCode}`} onClick={copyBookingCode} className="ml-1 flex h-6 w-6 items-center justify-center text-[#526575] hover:text-[#0D8BEA]">
                  <FiCopy aria-hidden="true" className="h-4 w-4" />
                </button>
              </div>
              <div className="rounded-full border border-[#A7F3D0] bg-[#ECFDF5] px-4.25 py-2.25 text-[14px] leading-normal font-normal text-[#2E8B57]">
                Trạng thái đơn: Đã xác nhận
              </div>
              <div className="flex items-center gap-1.5 rounded-full border border-[#BAE6FD] bg-[#E8F5FF] px-4.25 py-2.25 text-[14px] leading-normal text-[#075A9C]">
                <FiCheckCircle aria-hidden="true" className="h-4 w-4 text-[#0D8BEA]" />
                <span>{isFullPayment ? `Đã thanh toán 100% (${formatPaidAmount(paidAmount)})` : `Đã thanh toán cọc 30% (${formatPaidAmount(paidAmount)})`}</span>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <button type="button" onClick={() => navigate('/')} className="flex min-h-12 items-center justify-center gap-1.5 rounded-xl border border-[#DCECF8] bg-[#F7FBFF] px-4.25 py-2.75 text-[14px] leading-normal font-bold text-[#0D8BEA]">
                <FiArrowLeft aria-hidden="true" className="h-4 w-4" />Về trang chủ
              </button>
              <button type="button" onClick={() => navigate('/my-bookings')} className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#0D8BEA] px-4 py-3.5 text-[14px] leading-normal font-bold text-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.10),0_2px_4px_-2px_rgba(0,0,0,0.10)]">
                Xem lịch sử đặt phòng <FiArrowRight aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>
      </main>

      <CustomerFooter />
      <FloatingAiChatbot />
      <ToastNotification message={toast?.message} type={toast?.type} />
    </div>
  );
}

function CustomerFooter() {
  const policies = ['Quy chế lưu trú khách sạn', 'Chính sách đặt cọc 30%', 'Quy định phụ thu khách & Quốc tịch', 'Bảo mật thông tin khách hàng'];
  return (
    <footer id="contact" className="border-t border-[#DCECF8] bg-white px-5 pb-8 pt-8 sm:px-8">
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
    setMessages((items) => [...items, { id: items.length, sender: 'user', text: message }, { id: items.length + 1, sender: 'bot', text: 'Mỗi phòng phục vụ tối đa 3 khách. Giá phòng được tính theo số đêm, phụ thu khách thứ 3 và khách nước ngoài.' }]);
    setInput('');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end sm:right-8" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      {open && (
        <section aria-label="Trò chuyện với Trợ lý AI Grand Hotel" className="mb-4 flex h-130 w-95 max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-[#DCECF8] bg-white shadow-2xl">
          <header className="flex items-center gap-3 bg-linear-to-r from-[#0D8BEA] to-[#075A9C] p-4 text-white"><img src="/images/chatbot-mascot.png" alt="" className="h-10 w-10 rounded-full bg-white object-contain" /><div className="min-w-0 flex-1"><h2 className="text-sm font-bold">Trợ lý AI Grand Hotel</h2><p className="text-[11px] text-blue-50">Trực tuyến • Hỗ trợ 24/7</p></div><button type="button" aria-label="Đóng cửa sổ chat" onClick={() => setOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/15"><FiX /></button></header>
          <div role="log" aria-live="polite" className="flex-1 space-y-3 overflow-y-auto bg-[#F7FBFF] p-4">{messages.map((message) => <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}><p className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${message.sender === 'user' ? 'bg-[#0D8BEA] text-white' : 'border border-[#DCECF8] bg-white text-[#526575]'}`}>{message.text}</p></div>)}</div>
          <form onSubmit={(event) => { event.preventDefault(); sendText(input); }} className="flex items-center gap-2 border-t border-[#DCECF8] bg-white p-3"><input aria-label="Nhập tin nhắn" value={input} onChange={(event) => setInput(event.target.value)} placeholder="Nhập câu hỏi của bạn..." className="h-10 min-w-0 flex-1 rounded-lg border border-[#DCECF8] px-3 text-sm outline-none focus:border-[#0D8BEA]" /><button type="submit" aria-label="Gửi tin nhắn" disabled={!input.trim()} className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0D8BEA] text-white disabled:opacity-50"><FiSend /></button></form>
        </section>
      )}
      {!open && hovered && !greetingDismissed && (
        <section className="relative mb-4 w-75 rounded-2xl border border-[#DCECF8] bg-white p-4 shadow-xl">
          <button type="button" aria-label="Ẩn thẻ chào" onClick={() => setGreetingDismissed(true)} className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full text-[#526575] hover:bg-[#F7FBFF]"><FiX /></button>
          <div className="mb-3 flex items-center gap-2 pr-5"><FiStar className="h-4 w-4 text-[#0D8BEA]" /><span className="text-[11px] font-bold text-[#075A9C]">TRỢ LÝ AI GRAND HOTEL</span></div>
          <p className="mb-3 text-xs leading-relaxed text-[#526575]">Dạ em chào quý khách! Em có thể giúp quý khách tìm phòng ưng ý, kiểm tra giá tốt nhất hoặc tư vấn dịch vụ tiện ích ngay nhé!</p>
          <div className="flex flex-wrap gap-2">
            {['Giá phòng các hạng', 'Gợi ý phòng cho 4 khách', 'Quy định phụ thu & đặt cọc'].map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => { setOpen(true); setHovered(false); sendText(suggestion); }}
                className="rounded-full border border-[#DCECF8] bg-[#F7FBFF] px-2.5 py-1 text-[11px] font-semibold text-[#075A9C]"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </section>
      )}
      {!open && hovered && <span className="absolute right-full top-1/2 mr-3 -translate-y-1/2 whitespace-nowrap rounded-full bg-slate-900/90 px-3.5 py-1.5 text-xs font-medium text-white shadow-lg">Bấm để chat với Trợ lý Grand Hotel</span>}
      {!open && <button type="button" aria-label="Mở Trợ lý AI Grand Hotel" onClick={() => setOpen(true)} className="relative flex h-24 w-24 items-center justify-center bg-transparent transition-transform duration-300 hover:scale-105"><img src="/images/chatbot-mascot.png" alt="Linh vật robot Grand Hotel" className="h-24 w-24 object-contain drop-shadow-xl" /></button>}
    </div>
  );
}

export default BookingSuccessPage;
