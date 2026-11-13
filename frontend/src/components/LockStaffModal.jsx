import { useEffect } from 'react';

function LockStaffModal({ staff, onClose, onConfirm }) {
  const isActive = staff.status === 'Đang hoạt động';

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="lock-staff-title"
        className="flex w-full max-w-[400px] flex-col gap-6 rounded-xl bg-white p-6 shadow-[0_12px_24px_rgba(0,0,0,0.2)]"
      >
        <div className="flex flex-col gap-2">
          <h2 id="lock-staff-title" className="text-2xl font-bold text-[#075A9C]">
            {isActive ? 'Khóa tài khoản?' : 'Mở khóa tài khoản?'}
          </h2>
          <p className="text-sm leading-5 text-[#526575]">
            {isActive ? (
              <>
                Tài khoản của nhân viên <strong className="font-bold">{staff.name}</strong>{' '}
                sẽ bị đăng xuất ngay lập tức và không thể truy cập vào hệ thống phần mềm
                được nữa.
              </>
            ) : (
              <>
                Tài khoản của nhân viên <strong className="font-bold">{staff.name}</strong>{' '}
                sẽ được kích hoạt lại và có thể truy cập vào hệ thống phần mềm.
              </>
            )}
          </p>
        </div>
        <footer className="flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            className="h-[39px] rounded-lg border border-[#DCECF8] bg-[#F7FBFF] px-4 text-sm font-bold text-[#526575] hover:bg-[#E8F5FF]"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`h-[39px] rounded-lg px-4 text-sm font-bold text-white hover:opacity-90 ${
              isActive ? 'bg-[#D9534F]' : 'bg-[#2E8B57]'
            }`}
          >
            {isActive ? 'Khóa' : 'Mở khóa'}
          </button>
        </footer>
      </section>
    </div>
  );
}

export default LockStaffModal;
