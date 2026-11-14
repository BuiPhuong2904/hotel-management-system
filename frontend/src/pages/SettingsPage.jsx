import { useState } from 'react';
import {
  FiCalendar,
  FiCheck,
  FiChevronDown,
  FiClock,
  FiFileText,
  FiGlobe,
  FiHome,
  FiLogIn,
  FiLogOut,
  FiPercent,
  FiRefreshCw,
  FiSettings,
} from 'react-icons/fi';

const initialSettings = {
  hotelName: 'Grand Hotel Saigon',
  timezone: 'GMT+7 (Hà Nội, Bằng Cốc)',
  checkIn: '02:00 PM',
  checkOut: '12:00 PM',
  onlineDeposit: '30',
  earlyCheckInFee: '30',
  lateCheckOutFee: '30',
  thirdGuestFee: '25',
  foreignGuestMultiplier: '1.5',
  vat: '8% (Theo nghị định giảm thuế)',
};

function FormGroup({
  id,
  label,
  value,
  onChange,
  helpText,
  icon: Icon,
  suffix,
  options,
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-bold text-[#075A9C]">
        {label}
      </label>
      <div className="relative flex h-10 min-w-0 items-center rounded-lg border border-[#DCECF8] bg-white focus-within:border-[#0D8BEA]">
        {Icon && (
          <Icon
            aria-hidden="true"
            className="pointer-events-none absolute left-3 h-4 w-4 shrink-0 text-[#526575]"
          />
        )}
        {options ? (
          <>
            <select
              id={id}
              value={value}
              onChange={onChange}
              className={`h-full min-w-0 flex-1 appearance-none rounded-lg bg-transparent py-2 text-sm text-[#526575] outline-none ${
                Icon ? 'pl-9' : 'pl-3'
              } pr-9`}
            >
              {options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <FiChevronDown
              aria-hidden="true"
              className="pointer-events-none absolute right-3 h-4 w-4 text-[#526575]"
            />
          </>
        ) : (
          <>
            <input
              id={id}
              type="text"
              value={value}
              onChange={onChange}
              className={`h-full min-w-0 flex-1 rounded-lg bg-transparent py-2 text-sm text-[#526575] outline-none ${
                Icon ? 'pl-9' : 'pl-3'
              } ${suffix ? 'pr-2' : 'pr-3'}`}
            />
            {suffix && (
              <span className="shrink-0 pr-3 text-xs text-[#526575]">
                {suffix}
              </span>
            )}
          </>
        )}
      </div>
      {helpText && (
        <p className="text-xs leading-4 text-[#64748B]">{helpText}</p>
      )}
    </div>
  );
}

function CardHeader({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex items-center gap-3 border-b border-[#DCECF8] pb-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#E8F5FF] text-[#0D8BEA]">
        <Icon aria-hidden="true" className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <h2 className="text-base font-bold text-[#075A9C]">{title}</h2>
        <p className="text-xs text-[#64748B]">{subtitle}</p>
      </div>
    </div>
  );
}

function SettingsCard({ children, icon, title, subtitle }) {
  return (
    <section className="flex min-w-0 flex-col gap-5 rounded-xl border border-[#DCECF8] bg-white p-5 shadow-[0_1px_1px_rgba(0,0,0,0.05)] sm:p-6">
      <CardHeader icon={icon} title={title} subtitle={subtitle} />
      {children}
    </section>
  );
}

function SettingsPage() {
  const [settings, setSettings] = useState(initialSettings);
  const [savedSettings, setSavedSettings] = useState(initialSettings);

  const updateSetting = (key) => (event) => {
    setSettings((current) => ({ ...current, [key]: event.target.value }));
  };

  const resetChanges = () => setSettings(savedSettings);
  const saveChanges = (event) => {
    event.preventDefault();
    setSavedSettings(settings);
  };

  const field = (key, props) => (
    <FormGroup
      key={key}
      id={`setting-${key}`}
      value={settings[key]}
      onChange={updateSetting(key)}
      {...props}
    />
  );

  return (
    <form
      onSubmit={saveChanges}
      className="flex w-full min-w-0 flex-1 flex-col gap-6"
    >
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-lg font-bold text-[#075A9C]">
          Quản lý các tham số vận hành toàn hệ thống
        </h1>
        <div className="flex flex-wrap items-center justify-end gap-3">
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded bg-[#F7FBFF] px-2 py-1 text-xs text-[#64748B]">
            <FiClock aria-hidden="true" className="h-3.5 w-3.5" />
            Lần cập nhật cuối: 24/10/2026 14:15
          </span>
          <button
            type="button"
            onClick={resetChanges}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#0D8BEA] bg-white px-4 text-sm font-bold text-[#0D8BEA] hover:bg-[#F7FBFF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D8BEA]"
          >
            <FiRefreshCw aria-hidden="true" className="h-4 w-4" />
            Hủy thay đổi
          </button>
          <button
            type="submit"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#0D8BEA] px-4 text-sm font-bold text-white shadow-[0_1px_1px_rgba(0,0,0,0.05)] hover:bg-[#0878CB] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D8BEA]"
          >
            <FiCheck aria-hidden="true" className="h-4 w-4" />
            Lưu thay đổi
          </button>
        </div>
      </header>

      <div className="flex min-w-0 flex-col gap-6">
        <SettingsCard
          icon={FiSettings}
          title="1. Quy định chung"
          subtitle="Thông tin nhận diện cơ sở lưu trú và mốc thời gian quy chuẩn"
        >
          <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
            {field('hotelName', {
              label: 'Tên cơ sở khách sạn',
              icon: FiHome,
              helpText:
                'Tên hiển thị trên hóa đơn, phiếu xác nhận và cổng đặt phòng',
            })}
            {field('timezone', {
              label: 'Múi giờ vận hành',
              icon: FiGlobe,
              options: [
                'GMT+7 (Hà Nội, Bằng Cốc)',
                'GMT+8 (Singapore)',
                'UTC',
              ],
              helpText:
                'Áp dụng cho việc tính toán ca trực và tự động chốt ngày',
            })}
          </div>
        </SettingsCard>

        <SettingsCard
          icon={FiCalendar}
          title="2. Quy định Đặt phòng & Lưu trú"
          subtitle="Khung giờ giao nhận phòng và các tỷ lệ đặt cọc, tính phụ thu ngoài giờ"
        >
          <div className="grid min-w-0 grid-cols-1 gap-x-4 gap-y-5 md:grid-cols-3">
            {field('checkIn', {
              label: 'Giờ nhận phòng tiêu chuẩn',
              icon: FiLogIn,
              helpText: 'Thời gian chính thức giao buồng cho khách',
            })}
            {field('checkOut', {
              label: 'Giờ trả phòng tiêu chuẩn',
              icon: FiLogOut,
              helpText: 'Thời gian kiểm phòng và xuất hóa đơn',
            })}
            {field('onlineDeposit', {
              label: 'Tỷ lệ cọc trực tuyến tối thiểu',
              suffix: '%',
              helpText: 'Yêu cầu giữ phòng qua cổng trực tuyến',
            })}
            {field('earlyCheckInFee', {
              label: 'Tỷ lệ phụ thu nhận phòng sớm',
              suffix: '%',
              helpText: 'Áp dụng khi nhận phòng từ 06:00 đến 12:00',
            })}
            {field('lateCheckOutFee', {
              label: 'Tỷ lệ phụ thu trả phòng trễ',
              suffix: '%',
              helpText: 'Áp dụng khi trả phòng từ 12:00 đến 18:00',
            })}
          </div>
        </SettingsCard>

        <SettingsCard
          icon={FiFileText}
          title="3. Cấu hình Phụ thu Khách & Thuế"
          subtitle="Phụ thu định mức lưu trú thực tế, hệ số ngoại quốc và cấu hình chính sách thuế VAT"
        >
          <div className="grid min-w-0 grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2 sm:gap-x-6">
            {field('thirdGuestFee', {
              label: 'Tỷ lệ phụ thu khách thứ 3',
              suffix: '%',
              helpText:
                'Phụ thu người lớn thứ 3 phát sinh vượt định mức phòng standard (2 người)',
            })}
            {field('foreignGuestMultiplier', {
              label: 'Hệ số phụ thu khách nước ngoài',
              suffix: 'hệ số',
              helpText:
                'Áp dụng nhận đơn giá gốc (Hỗ trợ thủ tục đăng ký tạm trú quốc tế)',
            })}
            {field('vat', {
              label: 'Cấu hình Thuế GTGT (VAT) mặc định',
              icon: FiPercent,
              options: [
                '8% (Theo nghị định giảm thuế)',
                '10% (Thuế suất tiêu chuẩn)',
                '5%',
              ],
              helpText: 'Thuế suất tính trên hóa đơn điện tử VAT xuất cho khách',
            })}
          </div>
        </SettingsCard>
      </div>
    </form>
  );
}

export default SettingsPage;
