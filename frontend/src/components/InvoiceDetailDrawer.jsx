import { useEffect, useState } from 'react';
import { FiDownload, FiMail, FiX } from 'react-icons/fi';

const formatCurrency = (value) =>
  `${new Intl.NumberFormat('vi-VN').format(Math.round(value || 0))} đ`;

const getRoomTotal = (room) =>
  room.days * room.nightlyRate +
  room.timeSurcharge +
  room.services.reduce((sum, item) => sum + item.amount, 0);

const formatDateTime = (value) => {
  const date = new Date(value);
  return `${String(date.getDate()).padStart(2, '0')}/${String(
    date.getMonth() + 1,
  ).padStart(2, '0')}/${date.getFullYear()} ${String(
    date.getHours(),
  ).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

const statusStyles = {
  'Đã thanh toán': 'bg-[#2E8B57]',
  'Chờ thanh toán': 'bg-[#FFC542]',
  'Lỗi thanh toán': 'bg-[#D9534F]',
  'Đã hủy': 'bg-[#526575]',
};

function InvoiceDetailDrawer({ invoice, onClose, onPrint, onEmail }) {
  const [emailInput, setEmailInput] = useState('');
  const roomFeeTotal = invoice.rooms.reduce(
    (sum, room) => sum + room.days * room.nightlyRate,
    0,
  );
  const serviceTotal = invoice.rooms.reduce(
    (sum, room) =>
      sum + room.services.reduce((serviceSum, item) => serviceSum + item.amount, 0),
    0,
  );

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-40 flex justify-end bg-black/20"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="invoice-detail-title"
        className="flex h-full w-full max-w-[600px] flex-col border-l border-[#DCECF8] bg-white px-6 shadow-[-12px_0_24px_rgba(0,0,0,0.12)] motion-safe:animate-[service-usage-drawer-in_220ms_ease-out]"
      >
        <header className="shrink-0 border-b border-[#DCECF8] pb-[10px] pt-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 flex-wrap items-center gap-3">
              <h2
                id="invoice-detail-title"
                className="text-2xl font-bold text-[#075A9C]"
              >
                Hóa đơn: {invoice.code}
              </h2>
              <span
                className={`inline-flex h-6 items-center justify-center whitespace-nowrap rounded-full px-[10px] py-[2px] text-sm text-white ${statusStyles[invoice.status]}`}
              >
                {invoice.status}
              </span>
            </div>
            <button
              type="button"
              aria-label="Đóng chi tiết"
              onClick={onClose}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#526575] hover:bg-[#F7FBFF]"
            >
              <FiX aria-hidden="true" className="h-5 w-5" />
            </button>
          </div>
          <p className="mt-1 text-xs text-[#526575]">
            Thanh toán lúc: {formatDateTime(invoice.date)} • Thu ngân:{' '}
            {invoice.cashier} • Phiếu thuê: BK-{invoice.bookingId}
          </p>
        </header>

        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto py-6">
          <section
            aria-label="Tổng quan hóa đơn"
            className="grid grid-cols-1 gap-3 rounded-xl border border-[#DCECF8] bg-[#F7FBFF] p-4 sm:grid-cols-3 sm:gap-0"
          >
            <div className="border-b border-[#DCECF8]/70 pb-3 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-3">
              <h3 className="text-sm font-bold text-[#526575]">
                TỔNG TRỊ GIÁ
              </h3>
              <p className="mt-1 text-lg font-bold text-[#075A9C]">
                {formatCurrency(invoice.totalAmount)}
              </p>
            </div>
            <div className="border-b border-[#DCECF8]/70 pb-3 sm:border-b-0 sm:border-r sm:px-3 sm:pb-0">
              <h3 className="text-sm font-bold text-[#526575]">ĐÃ TRỪ CỌC</h3>
              <p className="mt-1 text-lg font-bold text-[#D97706]">
                {formatCurrency(invoice.deposit)}
              </p>
            </div>
            <div className="sm:pl-3">
              <h3 className="text-sm font-bold text-[#526575]">CẦN THU</h3>
              <p className="mt-1 text-lg font-bold text-[#D9534F]">
                {formatCurrency(invoice.amountDue)}
              </p>
            </div>
          </section>

          <section className="overflow-hidden rounded-xl border border-[#DCECF8]">
            <h3 className="border-b border-[#DCECF8] bg-[#F7FBFF] px-4 py-3 text-sm font-bold text-[#075A9C]">
              HỒ SƠ KHÁCH HÀNG &amp; XUẤT HÓA ĐƠN
            </h3>
            <dl className="px-4 py-1 text-sm">
              <div className="flex gap-4 border-b border-[#F1F5F9] py-[10px]">
                <dt className="w-40 shrink-0 text-[#526575]">Tên khách / Đơn vị:</dt>
                <dd className="min-w-0 text-[#1E293B]">{invoice.billingName}</dd>
              </div>
              <div className="flex gap-4 border-b border-[#F1F5F9] py-[10px]">
                <dt className="w-40 shrink-0 text-[#526575]">Số điện thoại:</dt>
                <dd className="min-w-0 text-[#1E293B]">{invoice.phone}</dd>
              </div>
              <div className="flex gap-4 py-[10px]">
                <dt className="w-40 shrink-0 text-[#526575]">
                  Địa chỉ xuất hóa đơn:
                </dt>
                <dd className="min-w-0 text-[#1E293B]">
                  {invoice.billingAddress || '—'}
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-xl border border-[#DCECF8] px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-bold text-[#075A9C]">
                CHI TIẾT CHI PHÍ THEO PHÒNG
              </h3>
              <span className="shrink-0 rounded-full border border-[#DCECF8] bg-[#F7FBFF] px-[11px] py-[3px] text-xs text-[#526575]">
                {invoice.rooms.length} phòng đặt
              </span>
            </div>
            <div className="mt-1 divide-y divide-[#DCECF8]">
              {invoice.rooms.map((room) => {
                return (
                  <article
                    key={room.number}
                    className="flex flex-col gap-3 py-4 text-sm"
                  >
                    <h4 className="font-bold text-[#075A9C]">
                      P.{room.number.replace(/^P\./, '')} ({room.type})
                    </h4>
                    <div className="flex justify-between gap-3">
                      <span className="text-[#526575]">
                        Tiền phòng ({room.days} ngày x{' '}
                        {formatCurrency(room.nightlyRate)})
                      </span>
                      <span className="shrink-0 text-[#1E293B]">
                        {formatCurrency(room.days * room.nightlyRate)}
                      </span>
                    </div>
                    <div className="flex justify-between gap-3 text-[#526575]">
                      <span>Dịch vụ phát sinh:</span>
                      <span className="text-right">
                        {room.services.length
                          ? `${room.services.length} mục`
                          : 'Không có phát sinh'}
                      </span>
                    </div>
                    {room.services.map((item) => (
                      <div
                        key={`${room.number}-${item.name}`}
                        className="flex justify-end gap-2 text-[#526575]"
                      >
                        <span className="text-right">
                          {item.name} ({item.quantity} {item.unit}) —{' '}
                          {formatCurrency(item.amount)}
                        </span>
                      </div>
                    ))}
                    {room.timeSurcharge > 0 && (
                      <div className="flex justify-between gap-3 text-[#526575]">
                        <span>Phụ thu nhận sớm / trả muộn:</span>
                        <span className="text-[#1E293B]">
                          {formatCurrency(room.timeSurcharge)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between gap-3 pt-1 font-bold">
                      <span className="text-[#526575]">
                        Tạm tính P.{room.number.replace(/^P\./, '')}:
                      </span>
                      <span className="text-[#075A9C]">
                        {formatCurrency(getRoomTotal(room))}
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="rounded-xl border border-[#DCECF8] px-4 py-3">
            <h3 className="text-sm font-bold text-[#075A9C]">TỔNG KẾT</h3>
            <dl className="mt-3 space-y-3 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-[#526575]">Tổng tiền phòng:</dt>
                <dd className="text-[#1E293B]">{formatCurrency(roomFeeTotal)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[#526575]">Phụ thu nhận sớm / trả muộn:</dt>
                <dd className="text-[#1E293B]">
                  {formatCurrency(invoice.timeSurchargeTotal)}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[#526575]">Tổng tiền dịch vụ:</dt>
                <dd className="text-[#1E293B]">{formatCurrency(serviceTotal)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[#526575]">Giảm giá (khuyến mãi):</dt>
                <dd className="text-[#D9534F]">
                  - {formatCurrency(invoice.discount)}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[#526575]">
                  Thuế VAT ({Math.round(invoice.vatRate * 10000) / 100}%):
                </dt>
                <dd className="text-[#1E293B]">
                  {formatCurrency(invoice.vatAmount)}
                </dd>
              </div>
              <div className="flex justify-between gap-3 border-t border-[#DCECF8] pt-3 font-bold">
                <dt className="text-[#526575]">TỔNG CỘNG:</dt>
                <dd className="text-[#075A9C]">
                  {formatCurrency(invoice.totalAmount)}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[#526575]">Đã trừ cọc:</dt>
                <dd className="text-[#D9534F]">
                  - {formatCurrency(invoice.deposit)}
                </dd>
              </div>
              <div className="flex justify-between gap-3 font-bold">
                <dt className="text-[#526575]">KHÁCH ĐÃ THANH TOÁN THÊM:</dt>
                <dd className="text-[#075A9C]">
                  {formatCurrency(invoice.amountDue)}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[#526575]">Phương thức thanh toán:</dt>
                <dd className="text-right text-[#1E293B]">
                  {invoice.paymentMethod || '—'}
                </dd>
              </div>
            </dl>
          </section>
        </div>

        <footer className="flex shrink-0 flex-col gap-3 border-t border-[#DCECF8] bg-white px-4 py-4">
          <button
            type="button"
            onClick={() => onPrint(invoice)}
            className="flex h-12 items-center justify-center gap-2 rounded-lg bg-[#0D8BEA] px-4 text-sm font-bold text-white hover:bg-[#075A9C]"
          >
            <FiDownload aria-hidden="true" className="h-4 w-4" />
            Tải hóa đơn PDF (VAT)
          </button>
          <div className="flex gap-2">
            <input
              type="email"
              value={emailInput}
              onChange={(event) => setEmailInput(event.target.value)}
              placeholder="Email nhận hóa đơn (bỏ trống = email của khách)"
              aria-label="Email nhận hóa đơn"
              className="h-10 min-w-0 flex-1 rounded-lg border border-[#DCECF8] bg-white px-3 text-xs text-[#526575] outline-none focus:border-[#0D8BEA]"
            />
            <button
              type="button"
              onClick={() => onEmail(invoice, emailInput.trim())}
              className="flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-[#DCECF8] bg-[#E8F5FF] px-4 text-sm font-bold text-[#0D8BEA] hover:bg-[#DCECF8]"
            >
              <FiMail aria-hidden="true" className="h-4 w-4" />
              Gửi email
            </button>
          </div>
        </footer>
      </aside>

    </div>
  );
}

export default InvoiceDetailDrawer;