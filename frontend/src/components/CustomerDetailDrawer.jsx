import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiKey, FiPlus, FiUnlock, FiX } from 'react-icons/fi';
import CustomerStatusBadge from './CustomerStatusBadge';
import {
  formatCustomerCurrency,
  getCustomerInitials,
} from '../utils/customerUtils';

function CustomerDetailDrawer({
  customer,
  onClose,
  onLock,
  onUnlock,
  onToast,
}) {
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
        aria-labelledby="customer-detail-title"
        className="flex h-full w-full max-w-[600px] flex-col border-l border-[#DCECF8] bg-white px-6 shadow-[-12px_0_24px_rgba(0,0,0,0.12)] motion-safe:animate-[service-usage-drawer-in_220ms_ease-out]"
      >
        <header className="flex shrink-0 items-center gap-4 border-b border-[#DCECF8] py-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#E8F5FF] text-2xl font-bold text-[#075A9C]">
            {getCustomerInitials(customer.name)}
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <h2
                id="customer-detail-title"
                className="truncate text-2xl font-bold text-[#075A9C]"
              >
                {customer.name}
              </h2>
              <CustomerStatusBadge status={customer.status} />
            </div>
            <p className="truncate text-sm text-[#526575]">{customer.username}</p>
          </div>
          <button
            type="button"
            aria-label="Đóng chi tiết khách hàng"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[#526575] hover:bg-[#F7FBFF]"
          >
            <FiX aria-hidden="true" className="h-5 w-5" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto py-4">
          <div className="flex flex-col gap-4">
            <section className="overflow-hidden rounded-xl border border-[#DCECF8]">
              <h3 className="border-b border-[#DCECF8] bg-[#F7FBFF] px-4 py-[10px] text-sm font-bold text-[#075A9C]">
                THÔNG TIN CÁ NHÂN
              </h3>
              <dl className="px-4 py-1 text-sm">
                <div className="flex items-center justify-between gap-4 border-b border-[#DCECF8] py-1">
                  <dt className="text-[#526575]">Số điện thoại:</dt>
                  <dd className="text-right text-[#1E293B]">{customer.phone}</dd>
                </div>
                <div className="flex items-center justify-between gap-4 border-b border-[#DCECF8] py-1">
                  <dt className="text-[#526575]">Email:</dt>
                  <dd className="break-all text-right text-[#1E293B]">
                    {customer.email || '—'}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4 border-b border-[#DCECF8] py-1">
                  <dt className="text-[#526575]">CCCD/Hộ chiếu:</dt>
                  <dd className="text-right text-[#1E293B]">
                    {customer.identification || '—'}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4 py-1">
                  <dt className="text-[#526575]">Địa chỉ:</dt>
                  <dd className="max-w-[65%] text-right text-[#1E293B]">
                    {customer.address || '—'}
                  </dd>
                </div>
              </dl>
            </section>

            <section className="flex flex-col gap-2 rounded-xl border border-[#DCECF8] bg-[#F8FAFC] px-4 py-3 text-sm">
              <h3 className="font-bold text-[#075A9C]">GHI CHÚ HỒ SƠ</h3>
              <p className="leading-5 text-[#526575]">{customer.note || 'Chưa có ghi chú.'}</p>
            </section>

            <section className="flex gap-5 rounded-xl border border-[#DCECF8] bg-[#F7FBFF] p-4 text-sm font-bold">
              <div className="flex min-w-0 flex-1 flex-col gap-1.5 border-r border-[#DCECF8] pr-3">
                <h3 className="text-[#075A9C]">LỊCH SỬ LƯU TRÚ</h3>
                <p className="text-[#526575]">{customer.stayCount} lượt</p>
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <h3 className="text-[#075A9C]">TỔNG CHI TIÊU</h3>
                <p className="text-[#526575]">
                  {formatCustomerCurrency(customer.totalSpent)}
                </p>
              </div>
            </section>

            <section className="overflow-hidden rounded-xl border border-[#DCECF8]">
              <h3 className="border-b border-[#DCECF8] bg-[#F7FBFF] px-4 py-[10px] text-sm font-bold text-[#075A9C]">
                LỊCH SỬ ĐẶT PHÒNG
              </h3>
              {customer.bookingHistory.length ? (
                <ul className="divide-y divide-[#DCECF8]">
                  {customer.bookingHistory.map((booking) => (
                    <li
                      key={booking.code}
                      className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-2 text-sm"
                    >
                      <span className="font-semibold text-[#526575]">{booking.code}</span>
                      <span className="text-[#526575]">{booking.date}</span>
                      <span className="min-w-[90px] flex-1 text-right font-bold text-[#075A9C]">
                        {formatCustomerCurrency(booking.total)}
                      </span>
                      <span
                        className={`inline-flex min-h-6 items-center whitespace-nowrap rounded-full px-[10px] py-[2px] text-sm text-white ${
                          booking.status === 'Đang lưu trú'
                            ? 'bg-[#0D8BEA]'
                            : 'bg-[#526575]'
                        }`}
                      >
                        {booking.status}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="px-4 py-3 text-sm text-[#526575]">
                  Khách hàng chưa có lịch sử đặt phòng.
                </p>
              )}
            </section>
          </div>
        </div>

        <footer className="flex shrink-0 flex-col gap-3 border-t border-[#DCECF8] py-4">
          <Link
            to="/bookings"
            className="flex h-12 items-center justify-center gap-2 rounded-lg bg-[#0D8BEA] px-4 text-sm font-bold text-white hover:bg-[#075A9C]"
          >
            <FiPlus aria-hidden="true" className="h-4 w-4" />
            Tạo đặt phòng mới
          </Link>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() =>
                onToast(
                  `Đã gửi mật khẩu mới cho ${customer.name} qua SMS/Email thành công.`,
                  'success',
                )
              }
              className="flex h-10 items-center justify-center gap-2 rounded-lg border border-[#DCECF8] bg-[#F7FBFF] px-3 text-sm font-bold text-[#526575] hover:bg-[#E8F5FF]"
            >
              <FiKey aria-hidden="true" className="h-4 w-4" />
              Cấp lại mật khẩu
            </button>
            {customer.status === 'Bị khóa' ? (
              <button
                type="button"
                onClick={() => onUnlock(customer)}
                className="flex h-10 items-center justify-center gap-2 rounded-lg border border-[#2E8B57] bg-white px-3 text-sm font-bold text-[#2E8B57] hover:bg-[#F7FBFF]"
              >
                <FiUnlock aria-hidden="true" className="h-4 w-4" />
                Mở khóa tài khoản
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onLock(customer)}
                className="h-10 rounded-lg border border-[#D9534F] bg-white px-3 text-sm font-bold text-[#D9534F] hover:bg-[#F7FBFF]"
              >
                Khóa tài khoản
              </button>
            )}
          </div>
        </footer>
      </aside>
    </div>
  );
}

export default CustomerDetailDrawer;
