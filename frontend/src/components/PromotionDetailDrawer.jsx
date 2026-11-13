import { FiX } from 'react-icons/fi';

const formatMoney = (value) => `${new Intl.NumberFormat('vi-VN').format(value)} đ`;

function PromotionDetailDrawer({ promotion, onClose, onToggleStatus }) {
  if (!promotion) {
    return null;
  }

  const isActive = promotion.status === 'Đang áp dụng';

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <button
        type="button"
        aria-label="Đóng chi tiết khuyến mãi"
        onClick={onClose}
        className="fixed inset-0 cursor-default bg-black/20"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="promotion-drawer-title"
        className="relative z-10 flex h-full w-full max-w-[600px] flex-col border-l border-[#DCECF8] bg-white px-6"
        style={{ animation: 'promotion-drawer-in 200ms ease-out' }}
      >
        <header className="flex shrink-0 items-center gap-4 border-b border-[#DCECF8] py-1">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
            <h2
              id="promotion-drawer-title"
              className="text-2xl font-bold text-[#075A9C]"
            >
              {promotion.code}
            </h2>
            <span
              className={`inline-flex h-6 items-center rounded-full px-2.5 text-sm text-white ${
                isActive ? 'bg-[#2E8B57]' : 'bg-[#526575]'
              }`}
            >
              {promotion.status}
            </span>
          </div>
          <button
            type="button"
            aria-label="Đóng"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[#526575] hover:bg-[#F7FBFF]"
          >
            <FiX aria-hidden="true" className="h-5 w-5" />
          </button>
        </header>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto py-4">
          <section className="overflow-hidden rounded-xl border border-[#DCECF8] bg-white">
            <h3 className="border-b border-[#DCECF8] bg-[#F7FBFF] px-4 py-2.5 text-sm font-bold text-[#075A9C]">
              THÔNG TIN CHIẾN DỊCH
            </h3>
            <dl className="grid grid-cols-1 gap-x-4 px-4 py-2 sm:grid-cols-2">
              {[
                ['Mức giảm:', `${promotion.discountPercent}%`],
                ['Giảm tối đa:', formatMoney(promotion.maxDiscount)],
                ['Từ ngày:', promotion.startDate],
                ['Đến ngày:', promotion.endDate],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex min-w-0 items-center justify-between gap-2 border-b border-[#F1F5F9] py-2 text-sm"
                >
                  <dt className="shrink-0 text-[#526575]">{label}</dt>
                  <dd className="truncate text-right text-[#1E293B]">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="rounded-xl border border-[#DCECF8] bg-[#F7FBFF] p-4">
            <h3 className="text-sm font-bold text-[#075A9C]">GHI CHÚ</h3>
            <p className="mt-2 text-sm leading-5 text-[#526575]">
              {promotion.note || 'Không có ghi chú.'}
            </p>
          </section>

          <section className="grid grid-cols-2 divide-x divide-[#DCECF8] rounded-xl border border-[#DCECF8] bg-[#F7FBFF] p-4">
            <div className="min-w-0 pr-3">
              <h3 className="text-sm font-bold text-[#075A9C]">LƯỢT SỬ DỤNG</h3>
              <p className="mt-1 text-sm font-semibold text-[#526575]">
                {new Intl.NumberFormat('vi-VN').format(promotion.usageCount)} lượt
              </p>
            </div>
            <div className="min-w-0 pl-4">
              <h3 className="text-sm font-bold text-[#075A9C]">TỔNG CHIẾT KHẤU</h3>
              <p className="mt-1 truncate text-sm font-semibold text-[#526575]">
                {formatMoney(promotion.totalDiscounted)}
              </p>
            </div>
          </section>

          <section className="overflow-hidden rounded-xl border border-[#DCECF8] bg-white">
            <h3 className="border-b border-[#DCECF8] bg-[#F7FBFF] px-4 py-2.5 text-sm font-bold text-[#075A9C]">
              LỊCH SỬ SỬ DỤNG
            </h3>
            {promotion.usageHistory.length ? (
              <ul>
                {promotion.usageHistory.map((history) => (
                  <li
                    key={history.bookingCode}
                    className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b border-[#DCECF8] px-4 py-2 last:border-b-0"
                  >
                    <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#526575]">
                      <span className="font-semibold">{history.bookingCode}</span>
                      <span>{history.customerName}</span>
                      <span>{history.date}</span>
                    </div>
                    <span className="inline-flex h-6 shrink-0 items-center rounded-full bg-[#2E8B57] px-2.5 text-sm text-white">
                      {history.status}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-4 py-3 text-sm text-[#526575]">
                Chưa có lượt sử dụng.
              </p>
            )}
          </section>
        </div>

        <footer className="shrink-0 border-t border-[#DCECF8] py-4">
          <button
            type="button"
            onClick={() => onToggleStatus(promotion)}
            className={`flex h-10 w-full items-center justify-center rounded-lg border bg-white px-4 text-sm font-bold ${
              isActive
                ? 'border-[#D9534F] text-[#D9534F]'
                : 'border-[#2E8B57] text-[#2E8B57]'
            }`}
          >
            {isActive ? 'Tạm ngưng chiến dịch' : 'Kích hoạt lại chiến dịch'}
          </button>
        </footer>
      </aside>
    </div>
  );
}

export default PromotionDetailDrawer;
