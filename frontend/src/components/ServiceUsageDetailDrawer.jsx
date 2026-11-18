
import { FiX } from 'react-icons/fi';

const formatPrice = (price) =>
  `${new Intl.NumberFormat('vi-VN').format(Number(price || 0))} đ`;

function ServiceUsageDetailDrawer({ usage, onClose, onDelete }) {
  if (!usage) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-40 flex justify-end bg-black/20"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="service-usage-detail-title"
        className="flex h-full w-full max-w-[480px] flex-col border-l border-[#DCECF8] bg-white px-6 shadow-[-12px_0_24px_rgba(0,0,0,0.12)] motion-safe:animate-[service-usage-drawer-in_220ms_ease-out]"
      >
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#DCECF8]">
          <h2
            id="service-usage-detail-title"
            className="min-w-0 truncate text-xl font-bold text-[#075A9C] sm:text-2xl"
          >
            {usage.code} - {usage.service}
          </h2>
          <button
            type="button"
            aria-label="Đóng chi tiết"
            onClick={onClose}
            className="ml-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[#526575] hover:bg-[#F7FBFF]"
          >
            <FiX aria-hidden="true" className="h-5 w-5" />
          </button>
        </header>

        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto py-6">
          <section
            aria-label="Tóm tắt dịch vụ"
            className="grid grid-cols-1 gap-4 rounded-xl border border-[#DCECF8] bg-[#F7FBFF] p-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)_minmax(0,1.2fr)] sm:gap-0"
          >
            <div className="border-b border-[#DCECF8]/70 pb-3 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-3">
              <h3 className="text-sm font-bold text-[#526575]">THÀNH TIỀN</h3>
              <p className="mt-1 text-lg font-bold text-[#075A9C]">
                {formatPrice(usage.subtotal)}
              </p>
            </div>
            <div className="border-b border-[#DCECF8]/70 pb-3 sm:border-b-0 sm:border-r sm:px-3 sm:pb-0">
              <h3 className="text-sm font-bold text-[#526575]">PHÒNG</h3>
              <p className="mt-1 break-words text-lg font-bold text-[#075A9C]">
                {usage.room} - {usage.customer}
              </p>
            </div>
            <div className="sm:pl-3">
              <h3 className="text-sm font-bold text-[#526575]">SỐ LƯỢNG</h3>
              <p className="mt-1 text-lg font-bold text-[#075A9C]">
                {usage.quantity} {usage.unit}
              </p>
            </div>
          </section>

          <section className="rounded-xl border border-[#DCECF8] p-4">
            <h3 className="text-sm font-bold text-[#075A9C]">
              CHI TIẾT DỊCH VỤ
            </h3>
            <dl className="mt-3 space-y-3 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <dt className="text-[#526575]">Thời gian ghi nhận:</dt>
                <dd className="text-right text-[#1E293B]">{usage.date}</dd>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <dt className="text-[#526575]">Đơn giá:</dt>
                <dd className="text-right text-[#1E293B]">
                  {formatPrice(usage.unitPrice)}
                </dd>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <dt className="text-[#526575]">Trạng thái hóa đơn:</dt>
                <dd className="text-right text-[#1E293B]">
                  {usage.isInvoiced ? 'Đã lập hóa đơn' : 'Chưa lập hóa đơn'}
                </dd>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <dt className="text-[#526575]">Ghi chú:</dt>
                <dd className="break-words text-right text-[#1E293B]">
                  {usage.note || 'Chưa có dữ liệu ghi chú'}
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-xl border border-[#DCECF8] p-4">
            <h3 className="text-sm font-bold text-[#075A9C]">
              LỊCH SỬ THAO TÁC
            </h3>
            <p className="mt-3 text-sm leading-normal text-[#526575]">
              {usage.date} | Ghi nhận dịch vụ
            </p>
            <p className="mt-2 text-xs text-[#526575]">
              Người ghi nhận chưa được lưu trong database.
            </p>
          </section>
        </div>

        <footer className="flex h-[70px] shrink-0 items-center justify-between border-t border-[#DCECF8] bg-white px-2">
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 items-center justify-center rounded-lg border border-[#DCECF8] bg-[#F7FBFF] px-4 text-xs text-[#526575]"
          >
            Đóng
          </button>
          <button
            type="button"
            disabled={!usage.isEditable}
            onClick={() => onDelete(usage)}
            className="flex min-h-[43px] items-center justify-center rounded-lg bg-[#D9534F] px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40 sm:px-6"
          >
            Xóa / Hủy ghi nhận
          </button>
        </footer>
      </aside>
    </div>
  );
}

export default ServiceUsageDetailDrawer;
