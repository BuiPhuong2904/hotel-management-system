import { useCallback, useEffect, useRef, useState } from 'react';
import { FiEdit2, FiUserCheck, FiX } from 'react-icons/fi';

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
  const price = new Intl.NumberFormat('vi-VN').format(room.price);

  return (
    <section
      aria-label="Thông số phòng"
      className="grid grid-cols-1 gap-4 rounded-xl border border-[#DCECF8] bg-[#F7FBFF] p-[17px] min-[480px]:grid-cols-2 min-[480px]:gap-3"
    >
      <div className="min-w-0 border-b border-[#DCECF8]/70 pb-3 min-[480px]:border-r min-[480px]:border-b-0 min-[480px]:pb-0 min-[480px]:pr-2">
        <h3 className="text-sm font-bold text-[#526575]">ĐƠN GIÁ ĐÊM</h3>
        <p className="mt-1 text-lg font-bold text-[#075A9C]">{price} ₫</p>
      </div>
      <div className="min-w-0 border-b border-[#DCECF8]/70 pb-3 min-[480px]:border-r min-[480px]:border-b-0 min-[480px]:px-1 min-[480px]:pb-0">
        <h3 className="text-sm font-bold text-[#526575]">SỨC CHỨA</h3>
        <p className="mt-1 text-lg font-bold text-[#075A9C]">
          {room.capacity} Khách
        </p>
        <p className="mt-1 text-xs text-[#526575]">Tối đa</p>
      </div>
    </section>
  );
}

function RoomInformation({ room }) {
  return (
    <dl className="rounded-xl border border-[#DCECF8] p-4">
      <DetailRow label="Hạng phòng" value={room.type} />
      <DetailRow label="Trạng thái" value={room.status} />
      <DetailRow label="Ghi chú" value={room.note || '—'} />
    </dl>
  );
}

export default function RoomDetailDrawer({
  room,
  onClose,
  onEdit,
  onAssign,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const closeTimer = useRef(null);
  const isOccupied = room.status === 'Đang lưu trú';
  const canAssign = room.status === 'Sẵn sàng';
  const floorNumber = room.floor?.replace(/^T/i, '') || '—';

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
              Tầng {floorNumber}
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
          <RoomInformation room={room} />
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
              disabled={!onEdit}
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
            {onAssign && !isOccupied && (
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
