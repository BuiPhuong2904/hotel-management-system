import { useEffect } from 'react';
import { FiKey, FiX } from 'react-icons/fi';

function StaffDetailDrawer({ staff, onClose, onToggleStatus, onToast, lockModalOpen }) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !lockModalOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lockModalOpen, onClose]);

  const nameParts = staff.name.trim().split(/\s+/);
  const initials = `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toLocaleUpperCase(
    'vi',
  );
  const isActive = staff.status === 'Đang hoạt động';

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
        aria-labelledby="staff-detail-title"
        className="flex h-full w-full max-w-[600px] flex-col border-l border-[#DCECF8] bg-white px-6 shadow-[-12px_0_24px_rgba(0,0,0,0.12)] motion-safe:animate-[service-usage-drawer-in_220ms_ease-out]"
      >
        <header className="flex shrink-0 items-center gap-4 border-b border-[#DCECF8] py-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#E8F5FF] text-2xl font-bold text-[#075A9C]">
            {initials}
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <h2
                id="staff-detail-title"
                className="truncate text-2xl font-bold text-[#075A9C]"
              >
                {staff.name}
              </h2>
              <span
                className={`inline-flex min-h-6 items-center rounded-full border px-3 text-sm ${
                  staff.role === 'Quản trị viên'
                    ? 'border-[#075A9C] bg-[#075A9C] text-white'
                    : 'border-[#0D8BEA] bg-white text-[#0D8BEA]'
                }`}
              >
                {staff.role}
              </span>
            </div>
            <p className="truncate text-sm text-[#526575]">{staff.email}</p>
          </div>
          <button
            type="button"
            aria-label="Đóng chi tiết nhân viên"
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
                  <dd className="text-right text-[#1E293B]">{staff.phone}</dd>
                </div>
                <div className="flex items-center justify-between gap-4 border-b border-[#DCECF8] py-1">
                  <dt className="text-[#526575]">CCCD/Hộ chiếu:</dt>
                  <dd className="text-right text-[#1E293B]">{staff.identification}</dd>
                </div>
                <div className="flex items-center justify-between gap-4 py-1">
                  <dt className="text-[#526575]">Trạng thái:</dt>
                  <dd className="text-right text-[#1E293B]">{staff.status}</dd>
                </div>
              </dl>
            </section>

            <section className="flex flex-col gap-2 rounded-xl border border-[#DCECF8] bg-[#F7FBFF] px-4 py-3 text-sm">
              <h3 className="font-bold text-[#075A9C]">GHI CHÚ HỒ SƠ</h3>
              <p className="leading-5 text-[#526575]">
                {staff.note || 'Chưa có ghi chú hồ sơ.'}
              </p>
            </section>

            <section className="grid grid-cols-2 rounded-xl border border-[#DCECF8] bg-[#F7FBFF] p-4 text-sm">
              <div className="flex min-w-0 flex-col gap-1.5 border-r border-[#DCECF8] pr-4">
                <h3 className="font-bold text-[#075A9C]">VAI TRÒ</h3>
                <p className="text-[#526575]">{staff.role}</p>
              </div>
              <div className="flex min-w-0 flex-col gap-1.5 pl-4">
                <h3 className="font-bold text-[#075A9C]">PHẠM VI TRUY CẬP</h3>
                <p className="text-[#526575]">{staff.accessScope}</p>
              </div>
            </section>

            <section className="overflow-hidden rounded-xl border border-[#DCECF8]">
              <h3 className="border-b border-[#DCECF8] bg-[#F7FBFF] px-4 py-[10px] text-sm font-bold text-[#075A9C]">
                NHẬT KÝ HOẠT ĐỘNG
              </h3>
              {staff.activityLogs.length ? (
                <ul className="divide-y divide-[#DCECF8]">
                  {staff.activityLogs.map((log) => (
                    <li
                      key={`${log.action}-${log.date}`}
                      className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-2 text-sm"
                    >
                      <span className="font-semibold text-[#526575]">{log.action}</span>
                      <span className="text-[#526575]">{log.date}</span>
                      <span className="ml-auto inline-flex min-h-6 items-center whitespace-nowrap rounded-full bg-[#2E8B57] px-[10px] py-[2px] text-sm text-white">
                        {log.status}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="px-4 py-3 text-sm text-[#526575]">
                  Chưa có nhật ký hoạt động.
                </p>
              )}
            </section>
          </div>
        </div>

        <footer className="grid shrink-0 grid-cols-2 gap-3 border-t border-[#DCECF8] py-4">
          <button
            type="button"
            onClick={() =>
              onToast(
                `Đã gửi link cài đặt mật khẩu mới đến ${staff.email} thành công.`,
                'success',
              )
            }
            className="flex h-10 items-center justify-center gap-2 rounded-lg border border-[#DCECF8] bg-[#F7FBFF] px-3 text-sm font-bold text-[#526575] hover:bg-[#E8F5FF]"
          >
            <FiKey aria-hidden="true" className="h-4 w-4" />
            Cấp lại mật khẩu
          </button>
          <button
            type="button"
            onClick={() => onToggleStatus(staff)}
            className={`h-10 rounded-lg border px-3 text-sm font-bold ${
              isActive
                ? 'border-[#D9534F] bg-white text-[#D9534F] hover:bg-[#F7FBFF]'
                : 'border-[#2E8B57] bg-white text-[#2E8B57] hover:bg-[#F7FBFF]'
            }`}
          >
            {isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
          </button>
        </footer>
      </aside>
    </div>
  );
}

export default StaffDetailDrawer;
