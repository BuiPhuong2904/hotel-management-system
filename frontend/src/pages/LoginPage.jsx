import { useEffect, useRef, useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import {
  FiArrowLeft,
  FiAtSign,
  FiAward,
  FiClock,
  FiEye,
  FiEyeOff,
  FiHome,
  FiLogIn,
  FiLock,
  FiPhone,
  FiShield,
  FiSmartphone,
  FiUser,
} from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import ToastNotification from '../components/ToastNotification';

const hotelBenefits = [
  {
    icon: FiAward,
    title: 'Ưu đãi Thành viên',
    description: 'Giảm trực tiếp tới 15% giá phòng & tích điểm',
  },
  {
    icon: FiClock,
    title: 'Nhận phòng Ưu tiên',
    description: 'Check-in nhanh tại quầy và hỗ trợ nhận phòng sớm',
  },
  {
    icon: FiSmartphone,
    title: 'Quản lý Linh hoạt',
    description: 'Theo dõi lịch trình, dịch vụ phòng & hóa đơn 24/7',
  },
];

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState(null);
  const timeoutRef = useRef(null);
  const navigate = useNavigate();

  useEffect(
    () => () => {
      window.clearTimeout(timeoutRef.current);
    },
    [],
  );

  const notify = (message, type, destination) => {
    window.clearTimeout(timeoutRef.current);
    setToast({ message, type });
    timeoutRef.current = window.setTimeout(() => {
      if (destination) {
        navigate(destination);
      } else {
        setToast(null);
      }
    }, destination ? 800 : 3000);
  };

  const handleLogin = (event) => {
    event.preventDefault();

    if (!username.trim() || !password.trim()) {
      notify(
        'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu!',
        'error',
      );
      return;
    }

    const isStaff = /admin|staff/i.test(username);
    const role = isStaff ? 'staff' : 'customer';
    localStorage.setItem(
      'user',
      JSON.stringify({ role, name: username.trim() }),
    );
    notify(
      'Đăng nhập thành công!',
      'success',
      isStaff ? '/dashboard' : '/customer',
    );
  };

  const enterDemo = (role) => {
    const isStaff = role === 'staff';
    const name = isStaff ? 'Quản trị viên' : 'Nguyễn Văn A';

    localStorage.setItem('user', JSON.stringify({ role, name }));
    notify(
      isStaff
        ? 'Đang truy cập giao diện Quản trị viên...'
        : 'Đang truy cập giao diện Khách hàng...',
      'success',
      isStaff ? '/dashboard' : '/customer',
    );
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#F8FAFC] lg:flex-row">
      <section
        className="flex min-h-[680px] w-full flex-col justify-between bg-[#075A9C] bg-cover bg-center p-8 lg:min-h-screen lg:w-1/2 lg:p-12"
        style={{
          backgroundImage:
            "linear-gradient(125deg, rgb(7 90 156 / 88%), rgb(10 77 130 / 92%)), url('/images/login-hotel.jpeg')",
        }}
      >
        <header className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/25 bg-white/15 text-white backdrop-blur-sm">
            <FiHome aria-hidden="true" className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">GRAND HOTEL</h1>
            <p className="text-xs text-blue-100">
              Nghỉ dưỡng Đẳng cấp &amp; Dịch vụ Tận tâm
            </p>
          </div>
        </header>

        <div className="my-12 flex flex-col gap-6 lg:my-0">
          <div className="space-y-3">
            <h2 className="text-4xl font-bold text-white">
              Chào mừng đến với Grand Hotel
            </h2>
            <p className="max-w-2xl text-xl leading-relaxed text-blue-100">
              Trải nghiệm không gian lưu trú sang trọng, đặt phòng trực tuyến
              dễ dàng và tận hưởng trọn vẹn các đặc quyền dành riêng cho thành viên.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {hotelBenefits.map(({ icon: Icon, title, description }) => (
              <article
                key={title}
                className="rounded-xl border border-white/20 bg-white/10 p-4 text-white backdrop-blur-sm"
              >
                <span className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">
                  <Icon aria-hidden="true" className="h-4 w-4" />
                </span>
                <h3 className="mb-1 text-sm font-bold">{title}</h3>
                <p className="text-xs leading-relaxed text-blue-100">
                  {description}
                </p>
              </article>
            ))}
          </div>
        </div>

        <footer className="flex flex-wrap justify-between gap-3 border-t border-white/15 pt-5 text-xs text-blue-200">
          <p>
            Hotline hỗ trợ 24/7: <strong>1900 6868</strong> • © 2026 Grand Hotel
          </p>
          <p>Điều khoản • Chính sách bảo mật</p>
        </footer>
      </section>

      <section className="flex min-h-screen w-full flex-col justify-between bg-[#F8FAFC] p-6 lg:w-1/2 lg:p-12">
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#64748B] hover:text-[#075A9C]"
          >
            <FiArrowLeft aria-hidden="true" className="h-4 w-4" />
            Quay lại trang chủ
          </Link>
        </div>

        <main className="my-auto mx-auto w-full max-w-md py-8">
          <div className="rounded-2xl border border-[#DCECF8] bg-white p-8 shadow-[0_4px_8px_rgba(7,90,156,0.06)]">
            <h2 className="mb-6 text-center text-2xl font-bold text-[#075A9C]">
              Đăng nhập
            </h2>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="username"
                  className="block text-sm font-bold text-[#075A9C]"
                >
                  TÊN ĐĂNG NHẬP <span className="text-[#D9534F]">*</span>
                </label>
                <div className="flex h-10 items-center gap-3 rounded-lg border border-[#DCECF8] bg-white px-3 focus-within:border-[#0D8BEA] focus-within:ring-1 focus-within:ring-[#0D8BEA]">
                  <FiAtSign
                    aria-hidden="true"
                    className="h-4 w-4 shrink-0 text-[#64748B]"
                  />
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    placeholder="Nhập tên tài khoản hoặc email..."
                    className="h-full min-w-0 flex-1 border-0 bg-transparent text-sm text-[#526575] outline-none placeholder:text-[#64748B]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="password"
                  className="block text-sm font-bold text-[#075A9C]"
                >
                  MẬT KHẨU <span className="text-[#D9534F]">*</span>
                </label>
                <div className="flex h-10 items-center gap-3 rounded-lg border border-[#DCECF8] bg-white px-3 focus-within:border-[#0D8BEA] focus-within:ring-1 focus-within:ring-[#0D8BEA]">
                  <FiLock
                    aria-hidden="true"
                    className="h-4 w-4 shrink-0 text-[#64748B]"
                  />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Nhập mật khẩu..."
                    className="h-full min-w-0 flex-1 border-0 bg-transparent text-sm text-[#526575] outline-none placeholder:text-[#64748B]"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    onClick={() => setShowPassword((visible) => !visible)}
                    className="shrink-0 text-[#64748B] hover:text-[#075A9C]"
                  >
                    {showPassword ? (
                      <FiEyeOff aria-hidden="true" className="h-4 w-4" />
                    ) : (
                      <FiEye aria-hidden="true" className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 text-sm">
                <label className="inline-flex cursor-pointer items-center gap-2 text-[#64748B]">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                    className="h-4 w-4 rounded border-[#DCECF8] accent-[#0D8BEA]"
                  />
                  Ghi nhớ đăng nhập
                </label>
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="font-semibold text-[#0D8BEA] hover:underline"
                >
                  Quên mật khẩu?
                </button>
              </div>

              <button
                type="submit"
                className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#0D8BEA] text-sm font-bold text-white hover:bg-[#0D8BEA]/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#075A9C]"
              >
                Đăng nhập
                <FiLogIn aria-hidden="true" className="h-4 w-4" />
              </button>
            </form>

            <div className="my-4 flex items-center gap-3 text-xs text-[#64748B]">
              <span className="h-px flex-1 bg-[#DCECF8]" />
              <span>Hoặc</span>
              <span className="h-px flex-1 bg-[#DCECF8]" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className="flex h-10 items-center justify-center gap-2 rounded-lg border border-[#DCECF8] bg-white text-sm font-semibold text-[#1E293B] hover:bg-[#F8FAFC]"
              >
                <FcGoogle aria-hidden="true" className="h-4 w-4" />
                Google
              </button>
              <button
                type="button"
                className="flex h-10 items-center justify-center gap-2 rounded-lg border border-[#DCECF8] bg-white text-sm font-semibold text-[#64748B] hover:bg-[#F8FAFC]"
              >
                <FiPhone aria-hidden="true" className="h-4 w-4" />
                OTP qua SĐT
              </button>
            </div>

            <p className="mt-6 border-t border-[#DCECF8] pt-5 text-center text-sm text-[#64748B]">
              Bạn là khách hàng mới?{' '}
              <Link
                to="/register"
                className="font-bold text-[#0D8BEA] hover:underline"
              >
                Đăng ký tài khoản
              </Link>
            </p>
          </div>

          <div className="mx-auto mt-4 w-full max-w-md rounded-xl border border-dashed border-[#0D8BEA]/50 bg-[#F0F7FF] p-3.5">
            <h3 className="mb-2 text-center text-[11px] font-semibold text-[#075A9C]">
              Chế độ Demo (Chưa kết nối CSDL):
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => enterDemo('customer')}
                className="flex h-10 items-center justify-center gap-1.5 rounded-lg border border-[#0D8BEA] bg-white px-2 text-xs font-bold text-[#0D8BEA] hover:bg-[#EAF5FF]"
              >
                <FiUser aria-hidden="true" className="h-4 w-4 shrink-0" />
                Vào trang Khách hàng
              </button>
              <button
                type="button"
                onClick={() => enterDemo('staff')}
                className="flex h-10 items-center justify-center gap-1.5 rounded-lg bg-[#075A9C] px-2 text-xs font-bold text-white hover:bg-[#075A9C]/90"
              >
                <FiShield aria-hidden="true" className="h-4 w-4 shrink-0" />
                Vào trang Nhân viên
              </button>
            </div>
          </div>
        </main>

        <p className="text-center text-xs text-[#64748B]">
          Nhân sự khách sạn vui lòng sử dụng tài khoản công vụ được cấp bởi Ban Quản lý.
        </p>
      </section>

      {toast && <ToastNotification message={toast.message} type={toast.type} />}
    </div>
  );
}

export default LoginPage;
