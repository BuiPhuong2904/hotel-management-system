import { useCallback, useEffect, useRef, useState } from 'react';
import {
  FiAlertTriangle,
  FiCreditCard,
  FiEdit2,
  FiKey,
  FiMonitor,
  FiUserCheck,
  FiWind,
  FiWifi,
  FiX,
} from 'react-icons/fi';
import { MdCleaningServices, MdOutlineInventory2 } from 'react-icons/md';

const colors = {
  blue: '#0D8BEA',
  deepBlue: '#075A9C',
  blueGray: '#526575',
  text: '#1E293B',
  mutedText: '#475569',
  green: '#2E8B57',
  amber: '#E9A100',
  red: '#D9534F',
  lightBlue: '#F7FBFF',
  border: '#DCECF8',
  divider: '#F1F5F9',
};

const statusColors = {
  'Đang lưu trú': colors.blue,
  'Sẵn sàng': colors.green,
  'Đang dọn dẹp': '#FFC542',
  'Bảo trì': colors.red,
};

const defaultAmenities = [
  { label: 'Wi-Fi 5GHz', Icon: FiWifi },
  { label: 'Smart TV 43"', Icon: FiMonitor },
  { label: 'Điều hòa 2 chiều', Icon: FiWind },
  { label: 'Két an toàn', Icon: FiKey },
];

const defaultActivities = [
  {
    title: 'Dọn phòng định kỳ ca sáng',
    time: '09:15 Hôm nay',
    description:
      'Nhân viên Nguyễn Thị Lan thay khăn tắm, bổ sung 02 nước suối Lavie.',
    Icon: MdCleaningServices,
    iconColor: colors.blue,
  },
  {
    title: 'Kiểm tra Minibar',
    time: 'Hôm qua',
    description: 'Đã ghi nhận tiêu thụ: 01 Lon Bia Heineken, 01 Hạt điều.',
    Icon: MdOutlineInventory2,
    iconColor: '#F97316',
  },
];

function DetailRow({ label, value, valueClassName = '' }) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-2 border-b border-[#F1F5F9] pb-1.5 text-sm">
      <dt className="shrink-0 text-[#526575]">{label}</dt>
      <dd className={`min-w-0 truncate text-right text-[#1E293B] ${valueClassName}`}>
        {value}
      </dd>
    </div>
  );
}

function RoomSpecs({ room }) {
  const price = new Intl.NumberFormat('vi-VN').format(room.price ?? 150000);

  return (
    <section
      aria-label="Thông số phòng"
      className="grid grid-cols-1 gap-4 rounded-xl border border-[#DCECF8] bg-[#F7FBFF] p-[17px] min-[480px]:grid-cols-3 min-[480px]:gap-3"
    >
      <div className="min-w-0 border-b border-[#DCECF8]/70 pb-3 min-[480px]:border-r min-[480px]:border-b-0 min-[480px]:pb-0 min-[480px]:pr-2">
        <h3 className="text-sm font-bold text-[#526575]">ĐƠN GIÁ ĐÊM</h3>
        <p className="mt-1 text-lg font-bold text-[#075A9C]">{price} ₫</p>
        <p className="mt-1 text-xs text-[#526575]">Đã gồm VAT &amp; Phí</p>
      </div>
      <div className="min-w-0 border-b border-[#DCECF8]/70 pb-3 min-[480px]:border-r min-[480px]:border-b-0 min-[480px]:px-1 min-[480px]:pb-0">
        <h3 className="text-sm font-bold text-[#526575]">SỨC CHỨA</h3>
        <p className="mt-1 text-lg font-bold text-[#075A9C]">
          {room.capacity ?? 3} Khách
        </p>
        <p className="mt-1 text-xs text-[#526575]">Tối đa</p>
      </div>
      <div className="min-w-0 min-[480px]:pl-1">
        <h3 className="text-sm font-bold text-[#526575]">GIƯỜNG</h3>
        <p className="mt-1 truncate text-lg font-bold text-[#075A9C]">
          {room.bedType || '2 Twin Beds'}
        </p>
      </div>
    </section>
  );
}

function RoomInformation({ room }) {
  const amenities = room.amenities || defaultAmenities;

  return (
    <section className="rounded-xl border border-[#DCECF8] p-[17px]">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-[#075A9C]">
          THÔNG TIN CHI TIẾT PHÒNG
        </h3>
        <span
          className="inline-flex h-6 items-center rounded-full px-2.5 text-sm text-white"
          style={{ backgroundColor: statusColors[room.status] || colors.blueGray }}
        >
          {room.status}
        </span>
      </div>
      <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
        <DetailRow label="Diện tích:" value={room.area || '28 m²'} />
        <DetailRow label="Hướng nhìn:" value={room.view || 'Cửa sổ sân vườn'} />
        <DetailRow label="Hút thuốc:" value={room.smoking || 'Không hút thuốc'} />
        <DetailRow label="Khóa từ thông minh:" value={room.keyLock || 'Pin 94%'} />
      </dl>
      <ul className="mt-3 flex flex-wrap gap-1.5 border-t border-[#F1F5F9] pt-3">
        {amenities.map(({ label, Icon }) => (
          <li
            key={label}
            className="inline-flex items-center gap-1 rounded-md border border-[#DCECF8] px-2 py-1 text-xs text-[#526575]"
          >
            <Icon aria-hidden="true" className="h-3 w-3 shrink-0" />
            {label}
          </li>
        ))}
      </ul>
    </section>
  );
}

function GuestProfile({ room }) {
  return (
    <section className="rounded-xl border border-[#DCECF8] p-[17px]">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-[#075A9C]">
          HỒ SƠ KHÁCH ĐANG LƯU TRÚ
        </h3>
        <span className="inline-flex h-6 items-center rounded-full bg-[#0D8BEA] px-2.5 text-sm text-white">
          Đang lưu trú
        </span>
      </div>
      <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
        <DetailRow label="Tên khách:" value={room.guestName || 'Nguyễn Văn A'} />
        <DetailRow label="Số điện thoại:" value={room.guestPhone || '0912345678'} />
        <DetailRow
          label="Giờ Check-in:"
          value={room.checkInTime || '14:00 - Hôm qua'}
        />
        <DetailRow
          label="Dự kiến Check-out:"
          value={room.expectedCheckOut || '29/10/2026'}
          valueClassName="text-[#F97316]"
        />
      </dl>
    </section>
  );
}

function ActivityLog({ activities = defaultActivities }) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-[#075A9C]">NHẬT KÝ VẬN HÀNH</h3>
        <span className="text-xs text-[#526575]">2 sự kiện ghi nhận gần nhất</span>
      </div>
      <ul className="flex flex-col gap-3">
        {activities.map(({ title, time, description, Icon, iconColor }) => (
          <li
            key={`${title}-${time}`}
            className="flex min-w-0 items-center gap-2 rounded-xl border border-[#DCECF8] bg-[#F7FBFF] px-[13px] py-[11px]"
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center">
              <Icon
                aria-hidden="true"
                className="h-[17px] w-[17px]"
                style={{ color: iconColor }}
              />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 items-center justify-between gap-2">
                <h4 className="truncate text-sm font-bold text-[#526575]">
                  {title}
                </h4>
                <time className="shrink-0 rounded border border-[#DCECF8] bg-white/80 px-1.5 py-0.5 text-xs text-[#526575]">
                  {time}
                </time>
              </div>
              <p className="mt-1 text-xs leading-4 text-[#475569]">
                {description}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function RoomDetailDrawer({
  room,
  onClose,
  onEdit,
  onAssign,
  onReissueKey,
  onReport,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const closeTimer = useRef(null);
  const isOccupied = room.status === 'Đang lưu trú';
  const canAssign = room.status === 'Sẵn sàng';
  const floorNumber = room.floor?.replace(/^T/i, '') || '1';

  const dismiss = useCallback(
    (callback = onClose) => {
      setIsOpen(false);
      closeTimer.current = window.setTimeout(callback, 250);
    },
    [onClose],
  );

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const frame = window.requestAnimationFrame(() => setIsOpen(true));
    document.body.style.overflow = 'hidden';

    return () => {
      window.cancelAnimationFrame(frame);
      if (closeTimer.current) window.clearTimeout(closeTimer.current);
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') dismiss();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dismiss]);

  const handleEdit = () => {
    dismiss(() => {
      onClose();
      onEdit?.(room);
    });
  };

  return (
    <>
      <button
        type="button"
        aria-label="Đóng chi tiết phòng"
        onClick={() => dismiss()}
        className={`fixed inset-0 z-50 cursor-default bg-black/40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="room-detail-title"
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-[600px] flex-col gap-6 overflow-hidden border-l border-[#DCECF8] bg-white px-6 py-0 shadow-[-12px_0_32px_rgba(15,23,42,0.12)] transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <header className="flex min-h-[66px] shrink-0 items-center justify-between border-b border-[#DCECF8] pb-[5px] pt-1">
          <div className="flex min-w-0 flex-col gap-0.5">
            <h2
              id="room-detail-title"
              className="truncate text-2xl font-bold text-[#075A9C]"
            >
              Phòng {room.number}
            </h2>
            <p className="text-xs leading-4 text-[#526575]">
              Tầng {floorNumber} — {room.areaName || 'Khu vực trung tâm'}
            </p>
          </div>
          <button
            type="button"
            aria-label="Đóng"
            onClick={() => dismiss()}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#526575] hover:bg-[#F7FBFF]"
          >
            <FiX aria-hidden="true" className="h-5 w-5" />
          </button>
        </header>

        <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto pb-1">
          <RoomSpecs room={room} />
          {isOccupied ? <GuestProfile room={room} /> : <RoomInformation room={room} />}
          <ActivityLog activities={room.activities || defaultActivities} />

          <section className="flex flex-col gap-3">
            <h3 className="text-sm font-bold text-[#075A9C]">
              THAO TÁC NHANH CHO PHÒNG
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => onReissueKey?.(room)}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[#DCECF8] px-3 py-2 text-sm text-[#526575] hover:bg-[#F7FBFF]"
              >
                <FiCreditCard aria-hidden="true" className="h-4 w-4" />
                Cấp lại thẻ từ
              </button>
              <button
                type="button"
                onClick={() => onReport?.(room)}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[#DCECF8] px-3 py-2 text-sm text-[#526575] hover:bg-[#F7FBFF]"
              >
                <FiAlertTriangle
                  aria-hidden="true"
                  className="h-4 w-4 text-[#F97316]"
                />
                Báo sự cố kỹ thuật
              </button>
            </div>
          </section>
        </div>

        <footer className="grid min-h-[70px] shrink-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-3 border-t border-[#DCECF8] px-4 py-3 sm:flex sm:justify-between sm:py-4">
          <button
            type="button"
            onClick={() => dismiss()}
            className="flex h-10 shrink-0 items-center justify-center rounded-lg border border-[#DCECF8] bg-[#F7FBFF] px-4 text-xs text-[#526575] hover:bg-[#E8F5FF]"
          >
            Đóng
          </button>
          <div className="flex min-w-0 flex-col items-stretch justify-end gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <button
              type="button"
              onClick={handleEdit}
              className={`inline-flex h-10 items-center justify-center gap-1.5 rounded-lg px-3 text-sm font-bold ${
                isOccupied
                  ? 'bg-[#0D8BEA] text-white hover:bg-[#075A9C]'
                  : 'border border-[#DCECF8] bg-[#E8F5FF] text-[#0D8BEA] hover:bg-[#DCECF8]'
              }`}
            >
              <FiEdit2 aria-hidden="true" className="h-4 w-4" />
              Chỉnh sửa phòng
            </button>
            {!isOccupied && (
              <button
                type="button"
                disabled={!canAssign}
                onClick={() => onAssign?.(room)}
                className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg px-3 text-sm font-bold ${
                  canAssign
                    ? 'bg-[#0D8BEA] text-white hover:bg-[#075A9C]'
                    : 'cursor-not-allowed bg-[#DCECF8] text-[#526575]'
                }`}
              >
                <FiUserCheck aria-hidden="true" className="h-4 w-4" />
                Gán nhận phòng ngay
              </button>
            )}
          </div>
        </footer>
      </aside>
    </>
  );
}
