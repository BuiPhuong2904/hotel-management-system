import { useEffect, useRef, useState } from 'react';
import {
  FiArrowLeft,
  FiArrowRight,
  FiChevronDown,
  FiCreditCard,
  FiFacebook,
  FiFileText,
  FiInstagram,
  FiLogOut,
  FiMapPin,
  FiMessageCircle,
  FiPhone,
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

const defaultCheckout = {
  booking: {
    rooms: [
      { number: 'P101', typeId: 'A', typeName: 'Phòng loại A (Tiêu chuẩn)', price: 150000, guests: 2, hasForeigner: false },
      { number: 'P201', typeId: 'B', typeName: 'Phòng loại B (Nâng cao)', price: 170000, guests: 2, hasForeigner: true },
    ],
    checkIn: '25/10/2026',
    checkOut: '27/10/2026',
  },
  contact: { name: 'Nguyễn Minh Anh', phone: '0912 839 221', email: 'minhanh.nguyen@email.com' },
  nights: 2,
  roomSubtotals: [300000, 510000],
  subtotal: 810000,
  promotion: { code: 'SUMMER2026', discountPercent: 10, discount: 81000 },
  total: 729000,
  deposit: 218700,
  remaining: 510300,
};

const policies = [
  'Quy chế lưu trú khách sạn',
  'Chính sách đặt cọc 30%',
  'Quy định phụ thu khách & Quốc tịch',
  'Bảo mật thông tin khách hàng',
];

function readCheckout() {
  const value = sessionStorage.getItem('bookingCheckout');
  if (!value) return defaultCheckout;
  try {
    const checkout = JSON.parse(value);
    if (!checkout?.booking?.rooms?.length) return defaultCheckout;
    return checkout;
  } catch (error) {
    console.error('Không thể đọc dữ liệu bookingCheckout.', error);
    return defaultCheckout;
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

function BookingConfirmPage() {
  const [checkout] = useState(readCheckout);
  const [customer, setCustomer] = useState(getCustomer);
  const [menuOpen, setMenuOpen] = useState(false);
  const [paymentOption, setPaymentOption] = useState('deposit');
  const [paymentMethod, setPaymentMethod] = useState('vietqr');
  const [toast, setToast] = useState(null);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const rooms = checkout.booking?.rooms || defaultCheckout.booking.rooms;
  const contact = checkout.contact || defaultCheckout.contact;
  const nights = Number(checkout.nights || 2);
  const roomSubtotals = Array.isArray(checkout.roomSubtotals)
    ? checkout.roomSubtotals
    : rooms.map((room) => Number(room.price) * nights);
  const subtotal = Number(checkout.subtotal || roomSubtotals.reduce((sum, value) => sum + Number(value), 0));
  const promotion = checkout.promotion;
  const total = Number(checkout.total || subtotal);
  const deposit = Number(checkout.deposit || Math.round(total * 0.3));
  const remaining = Number(checkout.remaining || total - deposit);
  const paidAmount = paymentOption === 'deposit' ? deposit : total;
  const remainingAtCounter = paymentOption === 'deposit' ? remaining : 0;
  const customerName = customer?.name || customer?.fullName || customer?.username || contact.name;
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

  const confirmPayment = () => {
    sessionStorage.setItem('bookingFinal', JSON.stringify({
      bookingCheckout: checkout,
      paymentOption,
      paymentMethod,
      paidAmount,
      remainingAtCounter,
    }));
    setToast({ message: 'Đã xác nhận thông tin thanh toán thành công.', type: 'success' });
    window.setTimeout(() => navigate('/booking-success'), 300);
  };

  const paymentMethods = [
    { id: 'vietqr', title: 'Chuyển khoản nhanh qua VietQR 24/7', icon: 'qr', pills: ['Vietcombank', 'MBBank', '+40 Ngân hàng'] },
    { id: 'ewallet', title: 'Ví điện tử (VNPAY-QR, MoMo, ZaloPay)', icon: 'wallet', pills: ['MoMo', 'VNPAY', 'ZaloPay'] },
    { id: 'card', title: 'Thẻ Quốc tế & Nội địa (Visa, Mastercard, NAPAS)', icon: 'card', pills: ['VISA', 'MC', 'NAPAS'] },
  ];

  return (
    <div className="min-h-screen w-full bg-[#F7FBFF] font-['Open_Sans',sans-serif] text-[#526575]">
      <header className="sticky top-0 z-40 border-b border-[#DCECF8] bg-white/95 shadow-[0_2px_5px_rgba(7,90,156,0.04)] backdrop-blur-xl">
        <div className="mx-auto flex h-20 w-full max-w-360 items-center justify-between gap-4 px-8">
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
                <button type="button" aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)} className="inline-flex h-12 max-w-56 items-center gap-2.5 rounded-full border border-[#DCECF8] bg-white px-3 text-[14px] font-semibold text-[#075A9C] shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#E8F5FF] text-xs font-bold text-[#075A9C]">{customerInitials}</span>
                  <span className="truncate">{customerName}</span>
                  <FiChevronDown aria-hidden="true" className="h-4 w-4 shrink-0" />
                </button>
                {menuOpen && (
                  <div role="menu" className="absolute right-0 top-full z-50 mt-2 w-52 rounded-xl border border-[#DCECF8] bg-white p-1.5 shadow-xl">
                    <Link role="menuitem" to="/my-bookings" onClick={() => setMenuOpen(false)} className="block rounded-lg px-3 py-2 text-sm font-semibold text-[#526575] hover:bg-[#F7FBFF]">Lịch sử đặt phòng</Link>
                    <button type="button" role="menuitem" onClick={logout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-[#526575] hover:bg-[#F7FBFF]"><FiLogOut aria-hidden="true" />Đăng xuất</button>
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
            <nav aria-label="Đường dẫn" className="flex flex-wrap items-center gap-1 text-[14px] leading-normal text-[#526575]">
              <Link to="/" className="hover:text-[#0D8BEA]">Trang chủ</Link><span>›</span>
              <Link to="/rooms" className="hover:text-[#0D8BEA]">Phòng nghỉ</Link><span>›</span>
              <Link to="/booking-info" className="hover:text-[#0D8BEA]">Thông tin đặt phòng</Link><span>›</span>
              <span className="font-semibold text-[#075A9C]">Xác nhận &amp; Thanh toán cọc</span>
            </nav>
            <h1 className="mt-2 text-[32px] leading-normal font-bold text-[#075A9C]">Xác nhận đặt phòng &amp; Thanh toán cọc</h1>
            <p className="mt-1 text-[16px] leading-relaxed text-[#526575]">Rà soát phiếu đặt phòng trực tuyến và chọn phương thức thanh toán cọc để giữ phòng.</p>
          </div>

          <section aria-label="Tiến trình đặt phòng" className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#DCECF8] bg-white px-6 py-5 shadow-[0_1px_3px_rgba(13,139,234,0.04),0_1px_2px_-1px_rgba(13,139,234,0.02)]">
            {[
              { circle: '✓', title: 'BƯỚC 1 • HOÀN THÀNH', label: 'Chọn phòng & Ngày nghỉ', state: 'done' },
              { circle: '✓', title: 'BƯỚC 2 • HOÀN THÀNH', label: 'Thông tin & Khách lưu trú', state: 'done' },
              { circle: '03', title: 'BƯỚC 3 • ĐANG THỰC HIỆN', label: 'Xác nhận & Đặt cọc 30%', state: 'active' },
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
                  }`}>{step.circle}</span>
                  <div>
                    <p className={`text-[13px] leading-normal ${step.state === 'done' ? 'font-bold text-[#2E8B57]' : step.state === 'active' ? 'font-bold text-[#0D8BEA]' : 'font-bold text-[#526575]'}`}>{step.title}</p>
                    <p className="text-[13px] leading-normal text-[#526575]">{step.label}</p>
                  </div>
                </div>
                {index < 3 && <div aria-hidden="true" className={`mx-4 hidden h-0.5 flex-1 xl:block ${index < 2 ? 'bg-[#2E8B57]' : 'bg-[#DCECF8]'}`} />}
              </div>
            ))}
          </section>

          <div className="mt-6 grid items-start gap-7 lg:grid-cols-12">
            <div className="flex min-w-0 flex-col gap-6 lg:col-span-8">
              <section className="rounded-xl border border-[#DCECF8] bg-white p-6.25 shadow-[0_1px_3px_rgba(13,139,234,0.04),0_1px_2px_-1px_rgba(13,139,234,0.02)]">
                <header className="flex items-center gap-3 border-b border-[#DCECF8] pb-[17px]">
                  <span className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-[#E8F5FF] text-[#075A9C]"><FiFileText aria-hidden="true" className="h-4 w-4" /></span>
                  <div>
                    <h2 className="text-[18px] leading-normal font-bold text-[#075A9C]">Phiếu Đặt Phòng Trực Tuyến</h2>
                    <p className="text-[14px] leading-normal text-[#526575]">Hệ thống bảo lưu danh sách phòng và giữ chỗ chính thức khi hoàn tất cọc</p>
                  </div>
                </header>

                <div className="mt-[17px] grid gap-x-6 gap-y-4 rounded-[8px] border border-[#DCECF8] bg-[#F7FBFF] px-[25px] py-4 sm:grid-cols-2">
                  <div className="flex items-start gap-2.5">
                    <FiUser aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-[#526575]" />
                    <p className="text-[14px] leading-normal"><span className="text-[#526575]">Khách hàng đại diện (Trưởng đoàn):</span><br /><strong className="text-[#075A9C]">{contact.name}</strong></p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <FiPhone aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-[#526575]" />
                    <p className="text-[14px] leading-normal"><span className="text-[#526575]">Số điện thoại liên hệ:</span><br /><strong className="text-[#075A9C]">{contact.phone}</strong></p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <FiArrowRight aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-[#526575]" />
                    <p className="text-[14px] leading-normal"><span className="text-[#526575]">Ngày dự kiến đến (Check-in):</span><br /><strong className="text-[#075A9C]">14:00 — {checkout.booking?.checkIn || '25/10/2026'}</strong></p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <FiArrowLeft aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-[#526575]" />
                    <p className="text-[14px] leading-normal"><span className="text-[#526575]">Ngày dự kiến đi (Check-out):</span><br /><strong className="text-[#075A9C]">12:00 — {checkout.booking?.checkOut || '27/10/2026'}</strong></p>
                  </div>
                </div>

                <div className="mt-5 overflow-x-auto rounded-[8px] border-t border-[#DCECF8]">
                  <table className="w-full min-w-[760px] border-collapse">
                    <thead>
                      <tr className="border-b border-[#DCECF8] bg-[#F7FBFF] text-left text-[12px] font-bold text-[#075A9C]">
                        <th className="px-3.5 py-3">STT</th>
                        <th className="px-3.5 py-3">SỐ PHÒNG</th>
                        <th className="px-3.5 py-3">HẠNG PHÒNG &amp; ĐƠN GIÁ</th>
                        <th className="px-3.5 py-3">SỐ LƯỢNG &amp; PHÂN LOẠI KHÁCH</th>
                        <th className="px-3.5 py-3 text-right">THÀNH TIỀN</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rooms.map((room, index) => (
                        <tr key={room.number} className="border-b border-[#DCECF8] text-[14px]">
                          <td className="px-3.5 py-5 text-[#1E293B]">{index + 1}</td>
                          <td className="px-3.5 py-5 font-bold text-[#075A9C]">{room.number}</td>
                          <td className="px-3.5 py-5">
                            <strong className="block text-[14px] text-[#075A9C]">{room.typeName}</strong>
                            <span className="text-[12px] leading-normal text-[#526575]">{formatPrice(room.price)} / đêm • {room.typeId === 'A' ? '1 Giường Queen' : '1 Giường King'}</span>
                          </td>
                          <td className="px-3.5 py-5">
                            <strong className="block text-[14px] text-[#1E293B]">{Number(room.guests || 2)} khách</strong>
                            <span className="text-[12px] leading-normal text-[#526575]">{room.hasForeigner ? '2 người, khách nước ngoài' : 'Nguyễn Minh Anh, Trần Thị Mai'}</span>
                          </td>
                          <td className="px-3.5 py-5 text-right">
                            <strong className="block text-[14px] text-[#075A9C]">{formatPrice(roomSubtotals[index])}</strong>
                            {room.hasForeigner && <span className="text-[12px] leading-normal text-[#526575]">(340.000 đ × 1.5)</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {promotion && (
                  <div className="mt-4 flex items-center justify-between gap-3 rounded-[8px] border border-[#DCECF8] bg-[#E8F5FF] px-4 py-3">
                    <p className="text-[12px] leading-normal text-[#075A9C]"><FiTag aria-hidden="true" className="mr-1.5 inline h-3.5 w-3.5" />Mã khuyến mãi áp dụng: <strong>{promotion.code}</strong> — Giảm 10% tiền phòng (Tối đa 100.000 đ)</p>
                    <p className="shrink-0 text-[12px] font-bold text-[#0D8BEA]">Tiết kiệm {formatPrice(promotion.discount)}</p>
                  </div>
                )}
              </section>

              <section className="rounded-[12px] border border-[#DCECF8] bg-white p-[25px] shadow-[0_1px_3px_rgba(13,139,234,0.04),0_1px_2px_-1px_rgba(13,139,234,0.02)]">
                <header className="flex items-center gap-3 border-b border-[#DCECF8] pb-[17px]">
                  <span className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-[#E8F5FF] text-[#075A9C]"><FiCreditCard aria-hidden="true" className="h-4 w-4" /></span>
                  <h2 className="text-[18px] leading-normal font-bold text-[#075A9C]">Chọn mức thanh toán &amp; Cổng thanh toán</h2>
                </header>

                <div className="mt-5">
                  <p className="mb-3 text-[14px] leading-normal font-bold text-[#075A9C]">MỨC THANH TOÁN TRỰC TUYẾN:</p>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <button type="button" onClick={() => setPaymentOption('deposit')} className={`relative flex min-h-[140px] flex-col items-start justify-center rounded-[12px] p-[17px] text-left ${paymentOption === 'deposit' ? 'border-2 border-[#0D8BEA] bg-[#F7FBFF]' : 'border border-[#DCECF8] bg-white'}`}>
                      <span className="mb-2 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#0D8BEA]"><span className="h-2.5 w-2.5 rounded-full bg-[#0D8BEA]" /></span>
                      <span className="absolute right-4 top-4 rounded-full bg-[#E8F5FF] px-2.5 py-1 text-[12px] font-semibold text-[#2E8B57]">Khuyên chọn</span>
                      <span className="text-[14px] font-bold text-[#526575]">Thanh toán cọc tối thiểu 30%</span>
                      <strong className="mt-1 text-[18px] leading-normal text-[#075A9C]">{formatPrice(deposit)}</strong>
                      <span className="mt-1 text-[12px] leading-normal text-[#526575]">Thanh toán <strong className="text-[#1E293B]">{formatPrice(remaining)}</strong> còn lại khi làm thủ tục Check-out tại quầy lễ tân.</span>
                    </button>
                    <button type="button" onClick={() => setPaymentOption('full')} className={`flex min-h-[140px] flex-col items-start justify-center rounded-[12px] p-[17px] text-left ${paymentOption === 'full' ? 'border-2 border-[#0D8BEA] bg-[#F7FBFF]' : 'border border-[#DCECF8] bg-white'}`}>
                      <span className={`mb-2 flex h-5 w-5 items-center justify-center rounded-full border-2 ${paymentOption === 'full' ? 'border-[#0D8BEA]' : 'border-[#CBD5E1]'}`}>{paymentOption === 'full' && <span className="h-2.5 w-2.5 rounded-full bg-[#0D8BEA]" />}</span>
                      <span className="text-[14px] font-bold text-[#526575]">Thanh toán trước toàn bộ 100%</span>
                      <strong className="mt-1 text-[18px] leading-normal text-[#075A9C]">{formatPrice(total)}</strong>
                      <span className="mt-1 text-[12px] leading-normal text-[#526575]">Không cần thanh toán tiền phòng khi làm thủ tục Check-out tại quầy lễ tân.</span>
                    </button>
                  </div>
                </div>

                <div className="mt-6">
                  <p className="mb-3 text-[14px] leading-normal font-bold text-[#075A9C]">PHƯƠNG THỨC THANH TOÁN TRỰC TUYẾN:</p>
                  <div className="space-y-3">
                    {paymentMethods.map((method) => (
                      <button type="button" key={method.id} onClick={() => setPaymentMethod(method.id)} className={`flex w-full items-center justify-between gap-4 rounded-[12px] p-[17px] text-left ${paymentMethod === method.id ? 'border border-[#0D8BEA] bg-[#F7FBFF]' : 'border border-[#DCECF8] bg-white'}`}>
                        <span className="flex min-w-0 items-center gap-3">
                          <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${paymentMethod === method.id ? 'border-[#0D8BEA]' : 'border-[#CBD5E1]'}`}>{paymentMethod === method.id && <span className="h-2.5 w-2.5 rounded-full bg-[#0D8BEA]" />}</span>
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] border border-[#DCECF8] bg-[#E8F5FF] text-[#075A9C]">
                            {method.icon === 'qr' ? <span className="text-[12px] font-bold">QR</span> : method.icon === 'wallet' ? <FiUser aria-hidden="true" /> : <FiCreditCard aria-hidden="true" />}
                          </span>
                          <span className="text-[14px] font-bold text-[#526575]">{method.title}</span>
                        </span>
                        <span className="hidden flex-wrap justify-end gap-1.5 sm:flex">
                          {method.pills.map((pill) => <span key={pill} className="rounded-[4px] border border-[#DCECF8] bg-white px-[9px] py-[5px] text-[12px] text-[#526575]">{pill}</span>)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </section>
            </div>

            <aside className="lg:sticky lg:top-24 lg:col-span-4">
              <section className="rounded-[12px] border border-[#DCECF8] bg-white p-[21px] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.10),0_2px_4px_-2px_rgba(0,0,0,0.10)]">
                <header className="flex items-center justify-between gap-3 border-b border-[#DCECF8] pb-[17px]">
                  <h2 className="text-[18px] leading-normal font-bold text-[#075A9C]">Chi tiết thanh toán</h2>
                  <span className="rounded-full border border-[#DCECF8] bg-white px-[10px] py-[4px] text-[11px] font-bold tracking-[0.44px] text-[#0D8BEA]">{rooms.length} phòng</span>
                </header>
                <div className="mt-4 flex flex-col gap-2 rounded-[8px] border border-[#DCECF8] bg-[#F7FBFF] p-[13px] text-[14px] leading-normal">
                  <p className="flex justify-between"><span>Nhận phòng:</span><strong className="font-normal text-[#1E293B]">{checkout.booking?.checkIn || '25/10/2026'} (14:00)</strong></p>
                  <p className="flex justify-between"><span>Trả phòng:</span><strong className="font-normal text-[#1E293B]">{checkout.booking?.checkOut || '27/10/2026'} (12:00)</strong></p>
                  <p className="mt-1 flex justify-between border-t border-[#DCECF8] pt-[9px]"><span>Thời gian lưu trú:</span><strong className="font-normal text-[#075A9C]">{nights} đêm - {rooms.reduce((sum, room) => sum + Number(room.guests || 2), 0)} khách</strong></p>
                </div>
                <div className="mt-4 space-y-3">
                  {rooms.map((room, index) => (
                    <div key={room.number} className="text-[14px] leading-normal">
                      <div className="flex justify-between gap-3"><p className="text-[#1E293B]">Phòng {room.number} ({room.typeId === 'A' ? 'Loại A' : 'Loại B'} - {Number(room.guests || 2)} khách)</p><strong className="text-[#526575]">{formatPrice(roomSubtotals[index])}</strong></div>
                      <p className="mt-1 text-[12px] leading-normal text-[#526575]">{room.hasForeigner ? `Có khách nước ngoài ×1.5 (${nights} đêm)` : `Đơn giá ${formatPrice(room.price)} × ${nights} đêm`}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 space-y-2 border-t border-[#DCECF8] pt-[11px] text-[14px] leading-normal">
                  <div className="flex justify-between text-[#1E293B]"><span>Tạm tính tiền phòng:</span><strong className="text-[#526575]">{formatPrice(subtotal)}</strong></div>
                  {promotion && <div className="flex justify-between text-[#0D8BEA]"><span>🏷 Mã SUMMER2026 (-10%):</span><strong>- {formatPrice(promotion.discount)}</strong></div>}
                  <div className="flex items-center justify-between border-t border-[#DCECF8] pt-[11px]"><span className="font-semibold text-[#1E293B]">TỔNG CHI PHÍ SAU GIẢM</span><strong className="text-[18px] text-[#075A9C]">{formatPrice(total)}</strong></div>
                </div>
                <div className="mt-4 rounded-[12px] border border-[#DCECF8] bg-[#F7FBFF] p-[17px]">
                  <div className="flex items-center justify-between gap-3 border-b border-[#DCECF8] pb-[16px]">
                    <span className="text-[14px] font-bold text-[#075A9C]">{paymentOption === 'deposit' ? 'TIỀN CỌC TỐI THIỂU (30%):' : 'THANH TOÁN TOÀN BỘ (100%):'}</span>
                    <strong className="text-[24px] leading-normal text-[#075A9C]">{formatPrice(paidAmount)}</strong>
                  </div>
                  <div className="mt-2 flex justify-between gap-3 pt-2 text-[14px] leading-normal text-[#1E293B]"><span>Còn lại thanh toán tại quầy:</span><strong className="text-[16px] text-[#0D8BEA]">{formatPrice(remainingAtCounter)}</strong></div>
                </div>
                <button type="button" onClick={confirmPayment} className="mt-4 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-[12px] bg-[#0D8BEA] px-4 py-[14px] text-[14px] leading-normal font-bold text-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.10),0_2px_4px_-2px_rgba(0,0,0,0.10)]">
                  {paymentOption === 'deposit' ? 'Xác nhận & Thanh toán cọc' : 'Xác nhận & Thanh toán'} <FiArrowRight aria-hidden="true" className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => navigate('/booking-info')} className="mt-[10px] flex min-h-[40px] w-full items-center justify-center gap-1.5 rounded-[12px] border border-[#DCECF8] bg-[#F7FBFF] px-[17px] py-[11px] text-[14px] leading-normal font-bold text-[#526575]"><FiArrowLeft aria-hidden="true" className="h-4 w-4" />Quay lại chỉnh sửa thông tin</button>
              </section>
            </aside>
          </div>
        </div>
      </main>

      <CustomerFooter />
      <FloatingAiChatbot />
      <ToastNotification message={toast?.message} type={toast?.type} />
    </div>
  );
}

function CustomerFooter() {
  return (
    <footer id="contact" className="border-t border-[#DCECF8] bg-white px-8 pb-8 pt-8">
      <div className="mx-auto max-w-344">
        <div className="grid grid-cols-1 gap-8 border-b border-[#DCECF8] pb-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col items-start gap-4">
            <Link to="/" className="flex items-center gap-2 text-[#075A9C]"><FaHotel aria-hidden="true" className="h-5 w-5" /><span className="text-[20px] font-bold">Grand Hotel</span></Link>
            <p className="max-w-[320px] text-xs leading-normal text-[#526575]">Hệ thống nghỉ dưỡng cao cấp chuẩn mực quốc tế, mang lại trải nghiệm lưu trú sang trọng, chu đáo và thư thái cho quý khách.</p>
            <div className="flex gap-3 text-[#075A9C]"><a href="/#contact" aria-label="Facebook"><FiFacebook /></a><a href="/#contact" aria-label="Instagram"><FiInstagram /></a><a href="/#contact" aria-label="Liên hệ"><FiMessageCircle /></a></div>
          </div>
          <div><h2 className="mb-2 text-sm font-bold text-[#075A9C]">KHÁM PHÁ</h2><ul className="flex flex-col gap-2 text-sm text-[#526575]"><li><Link to="/rooms">Danh sách hạng phòng</Link></li><li><a href="/#facilities">Dịch vụ &amp; Tiện ích</a></li><li>Ưu đãi đặc biệt</li><li>Hỗ trợ check-in</li></ul></div>
          <div><h2 className="mb-2 text-sm font-bold text-[#075A9C]">CHÍNH SÁCH &amp; QUY ĐỊNH</h2><ul className="flex flex-col gap-1.5 text-sm text-[#526575]">{policies.map((policy) => <li key={policy}>{policy}</li>)}</ul></div>
          <div className="flex flex-col items-start gap-2"><h2 className="mb-1 text-sm font-bold text-[#075A9C]">LIÊN HỆ</h2><p className="flex items-start gap-1 text-sm text-[#526575]"><FiMapPin aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />120 Đại Lộ Hoàng Gia, TP. Hồ Chí Minh</p><p className="text-sm text-[#526575]">+84 (0) 28 3822 8888</p><p className="text-sm text-[#526575]">booking@grandhotel.vn</p></div>
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
          <form onSubmit={(event) => { event.preventDefault(); sendText(input); }} className="flex items-center gap-2 border-t border-[#DCECF8] bg-white p-3">
            <input aria-label="Nhập tin nhắn" value={input} onChange={(event) => setInput(event.target.value)} placeholder="Nhập câu hỏi của bạn..." className="h-10 min-w-0 flex-1 rounded-lg border border-[#DCECF8] px-3 text-sm outline-none focus:border-[#0D8BEA]" />
            <button type="submit" aria-label="Gửi tin nhắn" disabled={!input.trim()} className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0D8BEA] text-white disabled:opacity-50"><FiSend /></button>
          </form>
        </section>
      )}
      {!open && hovered && !greetingDismissed && (
        <section className="relative mb-4 w-75 rounded-2xl border border-[#DCECF8] bg-white p-4 shadow-xl">
          <button type="button" aria-label="Ẩn thẻ chào" onClick={() => setGreetingDismissed(true)} className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full text-[#526575] hover:bg-[#F7FBFF]"><FiX /></button>
          <div className="mb-3 flex items-center gap-2 pr-5"><FiStar className="h-4 w-4 text-[#0D8BEA]" /><span className="text-[11px] font-bold text-[#075A9C]">TRỢ LÝ AI GRAND HOTEL</span></div>
          <p className="mb-3 text-xs leading-relaxed text-[#526575]">Dạ em chào quý khách! Em có thể giúp quý khách tìm phòng ưng ý, kiểm tra giá tốt nhất hoặc tư vấn dịch vụ tiện ích ngay nhé!</p>
          <div className="flex flex-wrap gap-2">{['Giá phòng các hạng', 'Gợi ý phòng cho 4 khách', 'Quy định phụ thu & đặt cọc'].map((suggestion) => <button key={suggestion} type="button" onClick={() => { setOpen(true); setHovered(false); sendText(suggestion); }} className="rounded-full border border-[#DCECF8] bg-[#F7FBFF] px-2.5 py-1 text-[11px] font-semibold text-[#075A9C]">{suggestion}</button>)}</div>
        </section>
      )}
      {!open && hovered && <span className="absolute right-full top-1/2 mr-3 -translate-y-1/2 whitespace-nowrap rounded-full bg-slate-900/90 px-3.5 py-1.5 text-xs font-medium text-white shadow-lg">Bấm để chat với Trợ lý Grand Hotel</span>}
      {!open && <button type="button" aria-label="Mở Trợ lý AI Grand Hotel" onClick={() => setOpen(true)} className="relative flex h-24 w-24 items-center justify-center bg-transparent transition-transform duration-300 hover:scale-105"><img src="/images/chatbot-mascot.png" alt="Linh vật robot Grand Hotel" className="h-24 w-24 object-contain drop-shadow-xl" /></button>}
    </div>
  );
}

export default BookingConfirmPage;
