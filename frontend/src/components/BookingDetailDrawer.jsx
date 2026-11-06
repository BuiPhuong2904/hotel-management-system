import { useEffect, useMemo, useState } from 'react';
import {
  FiCheckCircle,
  FiClock,
  FiCreditCard,
  FiEdit2,
  FiFileText,
  FiGlobe,
  FiInfo,
  FiKey,
  FiPlus,
  FiPrinter,
  FiX,
  FiXCircle,
} from 'react-icons/fi';
import GuestListModal from './GuestListModal';

const formatCurrency = (value) =>
  `${new Intl.NumberFormat('vi-VN').format(Math.round(value || 0))} ₫`;

const formatRoomPrice = (value) =>
  `${new Intl.NumberFormat('vi-VN').format(Math.round(value || 0))} đ/đêm`;

const getAmount = (value) =>
  Number(String(value ?? '').replace(/[^\d]/g, '')) || 0;

const toDate = (value, startDay = 0) => {
  if (value) {
    const parsedDate = new Date(`${value}T00:00:00`);
    if (!Number.isNaN(parsedDate.getTime())) return parsedDate;
  }
  const date = new Date('2026-10-26T00:00:00');
  date.setDate(date.getDate() + startDay);
  return date;
};

const formatDate = (date) =>
  `${String(date.getDate()).padStart(2, '0')}/${String(
    date.getMonth() + 1,
  ).padStart(2, '0')}/${date.getFullYear()}`;

const getStatusKind = (status = '') => {
  if (status === 'Đang lưu trú') return 'staying';
  if (status === 'Đã xác nhận') return 'confirmed';
  if (status === 'Chờ xác nhận') return 'pending';
  if (status.includes('hủy') || status.includes('trả/hủy')) return 'cancelled';
  return 'pending';
};

const statusStyles = {
  staying: 'bg-[#0D8BEA]',
  confirmed: 'bg-[#00C8B3]',
  pending: 'bg-[#6155F5]',
  cancelled: 'bg-[#526575]',
};

function DetailRow({ label, value, valueClass = '' }) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-3 border-b border-[#F1F5F9] py-1.5 last:border-0">
      <span className="shrink-0 text-sm text-[#526575]">{label}</span>
      <span className={`min-w-0 truncate text-right text-sm text-[#1E293B] ${valueClass}`}>
        {value || '—'}
      </span>
    </div>
  );
}

function BookingDetailDrawer({
  booking,
  room,
  onClose,
  onEdit,
  onPrimaryAction,
  onCancelBooking,
  onGuestsChange,
  onAddService,
}) {
  const [guestModalOpen, setGuestModalOpen] = useState(false);
  const [guestProfiles, setGuestProfiles] = useState(
    () => booking?.guestProfiles || [],
  );

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      if (guestModalOpen) {
        setGuestModalOpen(false);
      } else {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [guestModalOpen, onClose]);

  const statusKind = getStatusKind(booking.status);
  const isCancelled = statusKind === 'cancelled';
  const checkInDate = toDate(booking.checkIn, booking.startDay);
  const checkOutDate = toDate(
    booking.checkOut,
    (booking.startDay || 0) + (booking.duration || 2),
  );
  const roomRows = useMemo(() => {
    if (booking.roomRows?.length) return booking.roomRows;
    return room
      ? [
          {
            roomNumber: room.number,
            roomType: room.type,
            guests: booking.guests || 2,
            price: getAmount(booking.price) || getAmount(room.price),
          },
        ]
      : [];
  }, [booking, room]);
  const nights = Math.max(booking.duration || 1, 1);
  const total = booking.totalAmount
    ? getAmount(booking.totalAmount)
    : roomRows.reduce(
        (sum, roomRow) => sum + getAmount(roomRow.price) * nights,
        0,
      );
  const depositPercent = Number(booking.depositPercent ?? 30);
  const deposit = booking.depositAmount
    ? getAmount(booking.depositAmount)
    : Math.round((total * depositPercent) / 100);
  const remaining = isCancelled ? 0 : Math.max(total - deposit, 0);
  const services = booking.services || [];
  const servicesTotal = services.reduce(
    (sum, service) => sum + getAmount(service.amount ?? service.price),
    0,
  );
  const primaryGuest = guestProfiles.find((guest) => guest.name)?.name || booking.guest;
  const filledGuests = guestProfiles.filter(
    (guest) => guest.name?.trim() && guest.identity?.trim(),
  ).length || (booking.guest ? 1 : 0);
  const guestCapacity = roomRows.reduce(
    (sum, roomRow) => sum + Number(roomRow.guests || 0),
    0,
  ) || Number(booking.guests || 2);

  const openPrint = () => window.print();
  const confirmCancel = () => {
    onCancelBooking?.(booking);
    onClose();
  };
  const saveGuests = (updatedGuests) => {
    setGuestProfiles(updatedGuests);
    onGuestsChange?.(booking, updatedGuests);
    setGuestModalOpen(false);
  };

  const primaryAction =
    statusKind === 'staying'
      ? 'Thanh toán và trả phòng'
      : statusKind === 'confirmed'
        ? 'Nhận phòng ngay (Check-in)'
        : 'Xác nhận đặt phòng & Duyệt cọc';
  const creationDate = booking.createdAt
    ? formatDate(new Date(booking.createdAt))
    : formatDate(checkInDate);
  const source = booking.source?.replace(/\s*\(.*\)$/, '') || 'Website online';

  return (
    <>
      <div
        className="fixed inset-0 z-[50] bg-black/30"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={`Chi tiết đặt phòng ${booking.code || ''}`}
        onClick={(event) => event.stopPropagation()}
        className="fixed inset-y-0 right-0 z-[51] flex h-full w-full max-w-[600px] flex-col border-l border-[#DCECF8] bg-white shadow-2xl"
      >
        <header className="shrink-0 border-b border-[#DCECF8] bg-white px-5 pb-3 pt-4 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-xl font-bold text-[#075A9C] sm:text-2xl">
                  {booking.code || 'Chi tiết đặt phòng'}
                </h2>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold text-white ${statusStyles[statusKind]}`}
                >
                  {isCancelled ? 'Đã hủy' : booking.status}
                </span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#526575]">
                <span className="inline-flex items-center gap-1">
                  <FiClock aria-hidden="true" />
                  Thời gian lập: {creationDate}
                </span>
                <span aria-hidden="true">•</span>
                <span className="inline-flex items-center gap-1">
                  <FiGlobe aria-hidden="true" />
                  Nguồn: {source}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-[#526575] hover:bg-[#F7FBFF]"
              aria-label="Đóng chi tiết đặt phòng"
            >
              <FiX aria-hidden="true" />
            </button>
          </div>
        </header>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
          <section className="grid grid-cols-1 gap-4 rounded-xl border border-[#DCECF8] bg-[#F7FBFF] p-4 sm:grid-cols-3 sm:gap-3">
            <div className="border-b border-[#DCECF8] pb-3 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-3">
              <p className="text-xs font-bold text-[#526575]">
                {statusKind === 'staying' ? 'TỔNG TIỀN' : 'TỔNG TIỀN PHÒNG'}
              </p>
              <p className="mt-1 text-lg font-bold text-[#075A9C]">
                {formatCurrency(total)}
              </p>
              <p className="text-xs text-[#526575]">Đã gồm VAT &amp; Phí</p>
            </div>
            <div className="border-b border-[#DCECF8] pb-3 sm:border-b-0 sm:border-r sm:px-1 sm:pb-0 sm:pr-3">
              <p className="text-xs font-bold text-[#526575]">CÒN PHẢI THU</p>
              <p className="mt-1 text-lg font-bold text-[#D97706]">
                {formatCurrency(remaining)}
              </p>
            </div>
            <div className="sm:pl-1">
              <p className="text-xs font-bold text-[#526575]">TRẠNG THÁI CỌC</p>
              <p className="mt-1 text-lg font-bold text-[#2E8B57]">
                {isCancelled
                  ? 'Đã hoàn cọc'
                  : deposit > 0
                    ? `Đã cọc ${depositPercent}%`
                    : 'Chưa thanh toán'}
              </p>
            </div>
          </section>

          <section className="rounded-xl border border-[#DCECF8] p-4">
            <h3 className="mb-2 text-sm font-bold text-[#075A9C]">
              HỒ SƠ KHÁCH ĐẶT PHÒNG
            </h3>
            <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
              <DetailRow label="Tên khách:" value={booking.guest} />
              <DetailRow label="Số điện thoại:" value={booking.phone} />
              <DetailRow
                label={statusKind === 'staying' ? 'Giờ Check-in:' : 'Dự kiến Check-in:'}
                value={
                  statusKind === 'staying'
                    ? `14:00 - ${formatDate(checkInDate).slice(0, 5)}`
                    : formatDate(checkInDate)
                }
                valueClass="text-[#D97706]"
              />
              <DetailRow
                label="Dự kiến Check-out:"
                value={formatDate(checkOutDate)}
                valueClass="text-[#D97706]"
              />
              {isCancelled && (
                <div className="sm:col-span-2">
                  <DetailRow
                    label="Lý do hủy:"
                    value={booking.cancelReason || 'Khách đổi lịch trình / Quá hạn thanh toán cọc.'}
                  />
                </div>
              )}
            </div>
          </section>

          <section className="rounded-xl border border-[#DCECF8] p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-[#075A9C]">
                PHÒNG &amp; KHÁCH LƯU TRÚ
              </h3>
              <span className="shrink-0 rounded-full border border-[#DCECF8] bg-[#F7FBFF] px-2.5 py-1 text-xs text-[#526575]">
                {roomRows.length} phòng đặt
              </span>
            </div>
            <div className="divide-y divide-[#DCECF8]">
              {roomRows.map((roomRow, index) => {
                const hasGuestList =
                  Boolean(guestProfiles.length) && index === 0;
                const roomProfiles = hasGuestList ? guestProfiles : [];
                const completedCount = roomProfiles.filter(
                  (guest) => guest.name?.trim() && guest.identity?.trim(),
                ).length;

                return (
                  <div
                    key={`${roomRow.roomNumber || roomRow.roomType}-${index}`}
                    className="flex min-w-0 items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-[#1E293B]">
                        Phòng {roomRow.roomNumber || room?.number || '—'} - Loại{' '}
                        {roomRow.roomType || room?.type || 'A'}
                      </p>
                      {!isCancelled && (
                        <button
                          type="button"
                          onClick={() => setGuestModalOpen(true)}
                          className="mt-1 text-left text-xs text-[#0D8BEA] hover:underline"
                        >
                          [+] Cập nhật danh sách khách (Đã nhập{' '}
                          {hasGuestList ? completedCount : filledGuests}/
                          {roomRow.guests || guestCapacity})
                        </button>
                      )}
                    </div>
                    <span className="shrink-0 rounded-md bg-[#F1F5F9] px-2.5 py-1 text-xs text-[#526575]">
                      {formatRoomPrice(getAmount(roomRow.price))}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          {statusKind === 'staying' && (
            <section className="rounded-xl border border-[#DCECF8] p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-bold text-[#075A9C]">
                  DỊCH VỤ PHÁT SINH
                </h3>
                <span className="text-sm font-bold text-[#1E293B]">
                  Tổng tiền dịch vụ: {formatCurrency(servicesTotal)}
                </span>
              </div>
              {services.length ? (
                <div className="mt-3 divide-y divide-[#F1F5F9]">
                  {services.map((service, index) => (
                    <div
                      key={`${service.name}-${index}`}
                      className="flex justify-between gap-3 py-2 text-sm"
                    >
                      <span className="text-[#526575]">
                        {service.quantity ? `${service.quantity}x ` : ''}
                        {service.name}
                      </span>
                      <span className="font-medium text-[#1E293B]">
                        {formatCurrency(getAmount(service.amount ?? service.price))}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-[#526575]">
                  Chưa phát sinh dịch vụ.
                </p>
              )}
              {onAddService && (
                <button
                  type="button"
                  onClick={() => onAddService(booking)}
                  className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[#DCECF8] text-sm font-bold text-[#526575] hover:bg-[#F7FBFF]"
                >
                  <FiPlus aria-hidden="true" />
                  Thêm dịch vụ phòng
                </button>
              )}
            </section>
          )}

          <section className="flex gap-2.5 rounded-xl border border-[#DCECF8] bg-[#F7FBFF] p-3 text-xs leading-5 text-[#526575]">
            <FiInfo aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-[#0D8BEA]" />
            {isCancelled ? (
              <p>Đơn đặt phòng này đã bị hủy. Không phát sinh thêm giao dịch tài chính.</p>
            ) : (
              <p>
                Khách đã thanh toán cọc{' '}
                <strong className="font-bold">{formatCurrency(deposit)}</strong>{' '}
                {booking.paymentMethod
                  ? `qua ${booking.paymentMethod.toLocaleLowerCase('vi')}.`
                  : 'qua chuyển khoản ngân hàng.'}
                <br />
                Thu bổ sung{' '}
                <strong className="font-bold">{formatCurrency(remaining)}</strong>{' '}
                khi hoàn tất thủ tục trả phòng.
              </p>
            )}
          </section>
        </div>

        <footer className="shrink-0 border-t border-[#DCECF8] bg-white px-5 pb-4 pt-3 sm:px-6">
          {isCancelled ? (
            <button
              type="button"
              onClick={openPrint}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#E8F5FF] text-sm font-bold text-[#0D8BEA] hover:bg-[#DCECF8]"
            >
              <FiPrinter aria-hidden="true" />
              In phiếu hủy (Audit Log)
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => onPrimaryAction?.(booking)}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#0D8BEA] text-sm font-bold text-white shadow-md hover:bg-[#075A9C]"
              >
                {statusKind === 'staying' ? (
                  <FiCreditCard aria-hidden="true" />
                ) : statusKind === 'confirmed' ? (
                  <FiKey aria-hidden="true" />
                ) : (
                  <FiCheckCircle aria-hidden="true" />
                )}
                {primaryAction}
              </button>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={
                    statusKind === 'staying'
                      ? openPrint
                      : () => onEdit?.(booking, room)
                  }
                  className="flex h-10 items-center justify-center gap-2 rounded-lg border border-[#DCECF8] bg-[#E8F5FF] px-2 text-sm font-bold text-[#0D8BEA] hover:bg-[#DCECF8]"
                >
                  {statusKind === 'staying' ? (
                    <FiFileText aria-hidden="true" />
                  ) : (
                    <FiEdit2 aria-hidden="true" />
                  )}
                  {statusKind === 'staying' ? 'Lập hóa đơn (VAT)' : 'Chỉnh sửa đặt phòng'}
                </button>
                <button
                  type="button"
                  onClick={openPrint}
                  className="flex h-10 items-center justify-center gap-2 rounded-lg border border-[#DCECF8] bg-[#E8F5FF] px-2 text-sm font-bold text-[#0D8BEA] hover:bg-[#DCECF8]"
                >
                  <FiPrinter aria-hidden="true" />
                  {statusKind === 'staying' ? 'In phiếu tạm tính' : 'In phiếu xác nhận'}
                </button>
              </div>
              {statusKind !== 'staying' && (
                <button
                  type="button"
                  onClick={confirmCancel}
                  className={`mt-3 flex w-full items-center justify-center gap-2 py-1 text-sm font-semibold text-[#D9534F] hover:underline ${
                    statusKind === 'pending'
                      ? 'rounded-lg border border-[#D9534F] py-2'
                      : ''
                  }`}
                >
                  <FiXCircle aria-hidden="true" />
                  {statusKind === 'pending'
                    ? 'Hủy đơn (Quá hạn cọc)'
                    : 'Hủy đặt phòng này'}
                </button>
              )}
              {statusKind === 'staying' && onEdit && (
                <button
                  type="button"
                  onClick={() => onEdit(booking, room)}
                  className="mt-2 flex w-full items-center justify-center gap-2 py-1 text-sm font-semibold text-[#0D8BEA] hover:underline"
                >
                  <FiEdit2 aria-hidden="true" />
                  Chỉnh sửa đặt phòng
                </button>
              )}
            </>
          )}
        </footer>
      </aside>

      {guestModalOpen && (
        <GuestListModal
          isOpen={guestModalOpen}
          room={roomRows[0] || room}
          guests={guestProfiles}
          primaryGuest={primaryGuest}
          onClose={() => setGuestModalOpen(false)}
          onSave={saveGuests}
        />
      )}
    </>
  );
}

export default BookingDetailDrawer;
