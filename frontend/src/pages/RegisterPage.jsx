import { useEffect, useRef, useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import {
  FiArrowLeft,
  FiAtSign,
  FiAward,
  FiCheckCircle,
  FiClock,
  FiEye,
  FiEyeOff,
  FiHome,
  FiLock,
  FiMail,
  FiPhone,
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

function RegisterField({
  id,
  label,
  icon: Icon,
  placeholder,
  type = 'text',
  value,
  onChange,
  action,
  autoComplete,
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-bold text-[#075A9C]">
        {label}
      </label>
      <div className="flex h-10 items-center gap-3 rounded-lg border border-[#DCECF8] bg-white px-3 focus-within:border-[#0D8BEA] focus-within:ring-1 focus-within:ring-[#0D8BEA]">
        <Icon aria-hidden="true" className="h-4 w-4 shrink-0 text-[#64748B]" />
        <input
          id={id}
          name={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="h-full min-w-0 flex-1 border-0 bg-transparent text-sm text-[#075A9C] outline-none placeholder:text-[#64748B]"
        />
        {action}
      </div>
    </div>
  );
}

function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
    }, destination ? 1000 : 3000);
  };

  const handleRegister = (event) => {
    event.preventDefault();

    if (
      !fullName.trim() ||
      !phone.trim() ||
      !username.trim() ||
      !password ||
      !confirmPassword
    ) {
      notify('Vui lòng điền đầy đủ các thông tin bắt buộc!', 'error');
      return;
    }

    if (password.length < 6) {
      notify('Mật khẩu phải có tối thiểu 6 ký tự!', 'error');
      return;
    }

    if (password !== confirmPassword) {
      notify('Mật khẩu xác nhận không khớp!', 'error');
      return;
    }

    if (!agreeTerms) {
      notify(
        'Vui lòng đồng ý với Điều khoản dịch vụ & Chính sách bảo mật!',
        'error',
      );
      return;
    }

    let registeredUsers;
    try {
      const savedUsers = localStorage.getItem('registeredUsers');
      registeredUsers = savedUsers ? JSON.parse(savedUsers) : [];
    } catch {
      notify('Không thể đọc danh sách tài khoản đã đăng ký.', 'error');
      return;
    }

    if (!Array.isArray(registeredUsers)) {
      notify('Không thể đọc danh sách tài khoản đã đăng ký.', 'error');
      return;
    }

    const customer = {
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      username: username.trim(),
      role: 'customer',
      name: fullName.trim(),
    };

    try {
      localStorage.setItem(
        'registeredUsers',
        JSON.stringify([...registeredUsers, customer]),
      );
      localStorage.setItem(
        'user',
        JSON.stringify({ role: 'customer', name: fullName.trim() }),
      );
    } catch {
      notify('Không thể lưu tài khoản vào trình duyệt này.', 'error');
      return;
    }

    notify(
      'Đăng ký tài khoản thành công! Đang chuyển hướng...',
      'success',
      '/customer',
    );
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#F8FAFC] lg:flex-row">
      <section
        className="flex min-h-[680px] w-full flex-col justify-between bg-[#075A9C] bg-cover bg-center p-8 lg:sticky lg:top-0 lg:h-screen lg:w-1/2 lg:p-12"
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
              Trở thành thành viên Grand Hotel
            </h2>
            <p className="max-w-2xl text-xl leading-relaxed text-blue-100">
              Tạo tài khoản miễn phí để nhận ngay đặc quyền đặt phòng giá ưu đãi và quản lý kỳ nghỉ của bạn mọi lúc, mọi nơi.
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

      <section className="flex min-h-screen w-full flex-col justify-between overflow-y-auto bg-[#F8FAFC] p-8 lg:w-1/2 lg:p-12">
        <div>
          <Link
            to="/customer"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#64748B] hover:text-[#075A9C]"
          >
            <FiArrowLeft aria-hidden="true" className="h-4 w-4" />
            Quay lại trang chủ
          </Link>
        </div>

        <main className="my-auto mx-auto w-full max-w-[540px] py-6">
          <div className="rounded-2xl border border-[#DCECF8] bg-white p-8 sm:p-10 shadow-[0_4px_8px_rgba(7,90,156,0.06)]">
            <h2 className="mb-5 text-center text-2xl font-bold text-[#075A9C]">
              Đăng ký tài khoản mới
            </h2>

            <form noValidate onSubmit={handleRegister}>
              <div className="space-y-3.5">
                <RegisterField
                  id="fullName"
                  label="HỌ VÀ TÊN"
                  icon={FiUser}
                  placeholder="Ví dụ: Nguyễn Minh Anh"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  autoComplete="name"
                />
                <RegisterField
                  id="phone"
                  label="SỐ ĐIỆN THOẠI"
                  icon={FiPhone}
                  type="tel"
                  placeholder="Ví dụ: 0912839123"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  autoComplete="tel"
                />
                <RegisterField
                  id="email"
                  label={
                    <>
                      EMAIL <span className="font-normal">(tùy chọn)</span>
                    </>
                  }
                  icon={FiMail}
                  type="email"
                  placeholder="Ví dụ: minhanh@gmail.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                />
                <RegisterField
                  id="username"
                  label="TÊN ĐĂNG NHẬP"
                  icon={FiAtSign}
                  placeholder="Ví dụ: minhanh_cus"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  autoComplete="username"
                />
                <RegisterField
                  id="password"
                  label="MẬT KHẨU"
                  icon={FiLock}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Tối thiểu 6 ký tự"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="new-password"
                  action={
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
                  }
                />
                <RegisterField
                  id="confirmPassword"
                  label="XÁC NHẬN MẬT KHẨU"
                  icon={FiCheckCircle}
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Nhập lại mật khẩu"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  autoComplete="new-password"
                  action={
                    <button
                      type="button"
                      aria-label={
                        showConfirmPassword
                          ? 'Ẩn mật khẩu xác nhận'
                          : 'Hiện mật khẩu xác nhận'
                      }
                      onClick={() =>
                        setShowConfirmPassword((visible) => !visible)
                      }
                      className="shrink-0 text-[#64748B] hover:text-[#075A9C]"
                    >
                      {showConfirmPassword ? (
                        <FiEyeOff aria-hidden="true" className="h-4 w-4" />
                      ) : (
                        <FiEye aria-hidden="true" className="h-4 w-4" />
                      )}
                    </button>
                  }
                />
              </div>

              <label className="mt-3 flex cursor-pointer items-start gap-2 text-xs text-[#64748B]">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(event) => setAgreeTerms(event.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-[#DCECF8] accent-[#0D8BEA]"
                />
                <span>
                  Tôi đồng ý với{' '}
                  <span className="font-bold text-[#0D8BEA]">
                    Điều khoản dịch vụ
                  </span>{' '}
                  và{' '}
                  <span className="font-bold text-[#0D8BEA]">
                    Chính sách bảo mật
                  </span>{' '}
                  của Grand Hotel.
                </span>
              </label>

              <button
                type="submit"
                className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#0D8BEA] text-sm font-bold text-white hover:bg-[#0D8BEA]/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#075A9C]"
              >
                <FiUser aria-hidden="true" className="h-4 w-4" />
                Hoàn tất đăng ký
              </button>
            </form>

            <div className="my-4 flex items-center gap-3 text-xs text-[#64748B]">
              <span className="h-px flex-1 bg-[#DCECF8]" />
              <span className="shrink-0">Hoặc đăng ký nhanh với</span>
              <span className="h-px flex-1 bg-[#DCECF8]" />
            </div>

            <button
              type="button"
              className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-[#DCECF8] bg-white text-sm font-bold text-[#526575] shadow-[0_1px_1px_rgba(0,0,0,0.05)]"
            >
              <FcGoogle aria-hidden="true" className="h-4 w-4" />
              Tiếp tục với tài khoản Google
            </button>

            <p className="mt-5 border-t border-[#DCECF8] pt-5 text-center text-sm text-[#64748B]">
              Bạn đã có tài khoản Grand Hotel?{' '}
              <Link
                to="/login"
                className="font-bold text-[#0D8BEA] hover:underline"
              >
                Đăng nhập ngay
              </Link>
            </p>
          </div>
        </main>

        <p className="mt-4 text-center text-xs text-[#64748B]">
          Nhân sự khách sạn vui lòng sử dụng tài khoản công vụ được cấp bởi Ban
          Quản lý.
        </p>
      </section>

      {toast && <ToastNotification message={toast.message} type={toast.type} />}
    </div>
  );
}

export default RegisterPage;
