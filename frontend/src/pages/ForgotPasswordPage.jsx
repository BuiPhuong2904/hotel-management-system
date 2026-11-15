import { useEffect, useRef, useState } from 'react';
import {
  FiArrowLeft,
  FiCheck,
  FiCheckCircle,
  FiClock,
  FiHeadphones,
  FiHome,
  FiInfo,
  FiLock,
  FiSend,
  FiShield,
  FiUser,
  FiEye,
  FiEyeOff,
} from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import ToastNotification from '../components/ToastNotification';

const securityBenefits = [
  {
    icon: FiShield,
    title: 'Xác thực an toàn',
    description:
      'Gửi mã OTP xác minh danh tính qua Số điện thoại hoặc Email chính chủ trong tích tắc.',
  },
  {
    icon: FiLock,
    title: 'Bảo vệ dữ liệu',
    description:
      'Thông tin thanh toán và lịch sử lưu trú được mã hóa hoàn toàn theo tiêu chuẩn bảo mật dữ liệu lưu trú.',
  },
  {
    icon: FiHeadphones,
    title: 'Hỗ trợ 24/7',
    description:
      'Đội ngũ CSKH và Quầy lễ tân luôn sẵn sàng hỗ trợ khôi phục tài khoản khi bạn cần hỗ trợ khẩn cấp.',
  },
];

function FormField({
  id,
  label,
  icon: Icon,
  type = 'text',
  value,
  onChange,
  placeholder,
  autoComplete,
  action,
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-bold text-[#075A9C]">
        {label} <span className="text-[#D9534F]">*</span>
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
          className="h-full min-w-0 flex-1 border-0 bg-transparent text-sm text-[#526575] outline-none placeholder:text-[#64748B]"
        />
        {action}
      </div>
    </div>
  );
}

function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [contact, setContact] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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

  const notify = (message, type = 'error', destination) => {
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

  const handleSendOtp = (event) => {
    event.preventDefault();
    if (!contact.trim()) {
      notify('Vui lòng nhập Số điện thoại hoặc Email đã đăng ký!');
      return;
    }

    notify('Mã OTP giả lập của bạn là: 123456', 'success');
    setStep(2);
  };

  const handleVerifyOtp = (event) => {
    event.preventDefault();
    if (!/^\d{6}$/.test(otp)) {
      notify('Vui lòng nhập đủ 6 chữ số OTP!');
      return;
    }

    notify('Xác thực mã OTP thành công!', 'success');
    setStep(3);
  };

  const handleUpdatePassword = (event) => {
    event.preventDefault();
    if (password.length < 6) {
      notify('Mật khẩu phải có tối thiểu 6 ký tự!');
      return;
    }
    if (password !== confirmPassword) {
      notify('Mật khẩu xác nhận không khớp!');
      return;
    }

    notify(
      'Cập nhật mật khẩu thành công! Đang chuyển về trang đăng nhập...',
      'success',
      '/login',
    );
  };

  const stepLabels = ['Thông tin', 'Xác thực OTP', 'Mật khẩu mới'];
  const passwordHasLettersAndNumbers =
    /[A-Za-z]/.test(password) && /\d/.test(password);

  return (
    <div className="flex min-h-screen w-full flex-col overflow-y-scroll bg-[#F8FAFC] lg:flex-row">
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
              Bảo mật tài khoản của bạn
            </h2>
            <p className="text-xl leading-relaxed text-blue-100">
              Hệ thống xác thực đa lớp của Grand Hotel giúp bảo vệ thông tin lưu
              trú và các đặc quyền thành viên của bạn một cách an toàn tuyệt đối.
            </p>
          </div>

          <div className="flex flex-col gap-3.5">
            {securityBenefits.map(({ icon: Icon, title, description }) => (
              <article
                key={title}
                className="flex items-start gap-3.5 rounded-xl border border-white/20 bg-white/10 p-4 text-white backdrop-blur-sm"
              >
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/15">
                  <Icon aria-hidden="true" className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="mb-1 text-sm font-bold">{title}</h3>
                  <p className="text-xs leading-relaxed text-blue-100">
                    {description}
                  </p>
                </div>
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

      <section className="flex min-h-screen w-full flex-col justify-between bg-[#F8FAFC] p-8 lg:w-1/2 lg:p-12">
        <div>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#64748B] hover:text-[#075A9C]"
          >
            <FiArrowLeft aria-hidden="true" className="h-4 w-4" />
            Quay lại Đăng nhập
          </Link>
        </div>

        <main className="my-auto mx-auto w-full max-w-[540px] py-6">
          <div className="mb-5 rounded-2xl border border-[#DCECF8] bg-white px-6 py-4 shadow-[0_2px_6px_rgba(7,90,156,0.04)]">
            <div className="flex items-start justify-between">
              {stepLabels.map((label, index) => {
                const stepNumber = index + 1;
                const isComplete = step > stepNumber;
                const isActive = step === stepNumber;
                return (
                  <div key={label} className="contents">
                    <div className="flex w-24 flex-col items-center gap-1.5 text-center">
                      <span
                        aria-current={isActive ? 'step' : undefined}
                        aria-label={`${label}${isComplete ? ', hoàn thành' : ''}`}
                        className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold ${
                          isActive || isComplete
                            ? 'border-[#0D8BEA] bg-[#0D8BEA] text-white'
                            : 'border-[#DCECF8] bg-[#F8FAFC] text-[#64748B]'
                        }`}
                      >
                        {isComplete ? (
                          <FiCheck aria-hidden="true" className="h-4 w-4" />
                        ) : (
                          stepNumber
                        )}
                      </span>
                      <span
                        className={`whitespace-nowrap text-xs ${
                          isActive ? 'font-medium text-[#0D8BEA]' : 'text-[#64748B]'
                        }`}
                      >
                        {label}
                      </span>
                    </div>

                    {index < stepLabels.length - 1 && (
                      <span
                        aria-hidden="true"
                        className={`mt-4 h-0.5 flex-1 ${
                          step > stepNumber ? 'bg-[#0D8BEA]' : 'bg-[#DCECF8]'
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-[#DCECF8] bg-white p-8 shadow-[0_4px_8px_rgba(7,90,156,0.06)] sm:p-10">
            {step === 1 && (
              <>
                <h2 className="text-2xl font-bold text-[#075A9C]">
                  Khôi phục mật khẩu
                </h2>
                <p className="mt-1.5 mb-6 text-sm text-[#64748B]">
                  Vui lòng nhập Số điện thoại hoặc Email bạn đã đăng ký trên hệ
                  thống Grand Hotel.
                </p>
                <form onSubmit={handleSendOtp}>
                  <FormField
                    id="contact"
                    label="SỐ ĐIỆN THOẠI HOẶC EMAIL"
                    icon={FiUser}
                    value={contact}
                    onChange={(event) => setContact(event.target.value)}
                    placeholder="Ví dụ: 0912839123 hoặc minhanh@gmail.com"
                    autoComplete="username"
                  />
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-[#64748B]">
                    <FiInfo
                      aria-hidden="true"
                      className="h-3 w-3 shrink-0 text-[#0D8BEA]"
                    />
                    Hệ thống sẽ gửi mã số xác thực gồm 6 chữ số đến thông tin này.
                  </p>
                  <button
                    type="submit"
                    className="mt-6 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#0D8BEA] text-sm font-bold text-white hover:bg-[#0D8BEA]/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#075A9C]"
                  >
                    <FiSend aria-hidden="true" className="h-4 w-4" />
                    Gửi mã xác thực
                  </button>
                </form>
              </>
            )}

            {step === 2 && (
              <>
                <h2 className="text-2xl font-bold text-[#075A9C]">
                  Xác thực danh tính
                </h2>
                <p className="mt-1.5 text-sm text-[#64748B]">
                  Mã xác thực gồm 6 chữ số đã được gửi tới
                </p>
                <p className="mt-1 break-all text-sm font-bold text-[#0D8BEA]">
                  {contact}
                </p>

                <form onSubmit={handleVerifyOtp}>
                  <label
                    htmlFor="otp"
                    className="mt-6 mb-2 block text-center text-sm font-bold text-[#075A9C]"
                  >
                    NHẬP MÃ XÁC THỰC OTP{' '}
                    <span className="text-[#D9534F]">*</span>
                  </label>
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={otp}
                    onChange={(event) =>
                      setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))
                    }
                    placeholder="- - - - - -"
                    className="h-12 w-full rounded-xl border border-[#DCECF8] bg-white text-center text-lg font-bold tracking-[0.5em] text-[#526575] outline-none placeholder:text-[#64748B] focus:border-[#0D8BEA] focus:ring-1 focus:ring-[#0D8BEA]"
                  />
                  <div className="mt-2.5 flex justify-between gap-3 text-xs text-[#64748B]">
                    <span>Không nhận được mã?</span>
                    <button
                      type="button"
                      onClick={() =>
                        notify('Đã gửi lại mã OTP mới (123456)!', 'success')
                      }
                      className="shrink-0 font-semibold text-[#0D8BEA] hover:underline"
                    >
                      Gửi lại mã OTP
                    </button>
                  </div>
                  <button
                    type="submit"
                    className="mt-5 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#0D8BEA] text-sm font-bold text-white hover:bg-[#0D8BEA]/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#075A9C]"
                  >
                    <FiCheckCircle aria-hidden="true" className="h-4 w-4" />
                    Xác nhận mã OTP
                  </button>
                </form>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="mt-3 w-full text-center text-sm font-medium text-[#64748B] hover:text-[#075A9C]"
                >
                  ← Đổi số điện thoại / email khác
                </button>

                <div className="mt-5 flex items-start gap-2 rounded-xl border border-[#DCECF8] bg-[#F0F7FF] p-3.5 text-xs text-[#526575]">
                  <FiClock
                    aria-hidden="true"
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#0D8BEA]"
                  />
                  <p>
                    Mã xác thực có hiệu lực trong vòng <strong>05 phút</strong>.
                    Vui lòng không chia sẻ mã này cho bất kỳ ai.
                  </p>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <h2 className="text-2xl font-bold text-[#075A9C]">
                  Tạo mật khẩu mới
                </h2>
                <p className="mt-1.5 mb-6 text-sm text-[#64748B]">
                  Vui lòng thiết lập mật khẩu mới an toàn cho tài khoản khách
                  hàng của bạn.
                </p>
                <form onSubmit={handleUpdatePassword}>
                  <div className="space-y-3.5">
                    <FormField
                      id="new-password"
                      label="MẬT KHẨU MỚI"
                      icon={FiLock}
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Tối thiểu 6 ký tự"
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
                    <FormField
                      id="confirm-password"
                      label="XÁC NHẬN MẬT KHẨU MỚI"
                      icon={FiCheckCircle}
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      placeholder="Nhập lại mật khẩu mới"
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

                  <div className="mt-4 rounded-xl border border-[#DCECF8] bg-[#F8FAFC] p-4">
                    <h3 className="mb-2 text-xs font-bold text-[#075A9C]">
                      Mật khẩu chuẩn bảo mật nên có:
                    </h3>
                    <ul className="space-y-1.5 text-xs">
                      <li
                        className={`flex items-center gap-2 ${
                          password.length >= 6
                            ? 'text-[#16A34A]'
                            : 'text-[#64748B]'
                        }`}
                      >
                        <FiCheck
                          aria-hidden="true"
                          className="h-3.5 w-3.5"
                        />
                        Độ dài từ 6 ký tự trở lên
                      </li>
                      <li
                        className={`flex items-center gap-2 ${
                          passwordHasLettersAndNumbers
                            ? 'text-[#16A34A]'
                            : 'text-[#64748B]'
                        }`}
                      >
                        <FiCheck
                          aria-hidden="true"
                          className="h-3.5 w-3.5"
                        />
                        Khuyên dùng kết hợp chữ cái và chữ số
                      </li>
                    </ul>
                  </div>

                  <button
                    type="submit"
                    className="mt-6 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#0D8BEA] text-sm font-bold text-white hover:bg-[#0D8BEA]/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#075A9C]"
                  >
                    <FiCheckCircle aria-hidden="true" className="h-4 w-4" />
                    Cập nhật mật khẩu
                  </button>
                </form>
              </>
            )}

            <p className="mt-6 border-t border-[#DCECF8] pt-5 text-center text-sm text-[#64748B]">
              Bạn đã nhớ mật khẩu cũ?{' '}
              <Link
                to="/login"
                className="font-bold text-[#0D8BEA] hover:underline"
              >
                Đăng nhập ngay
              </Link>
            </p>
          </div>
        </main>

        <p className="text-center text-xs text-[#64748B]">
          Nhân sự khách sạn vui lòng sử dụng tài khoản công vụ được cấp bởi Ban
          Quản lý.
        </p>
      </section>

      {toast && <ToastNotification message={toast.message} type={toast.type} />}
    </div>
  );
}

export default ForgotPasswordPage;
