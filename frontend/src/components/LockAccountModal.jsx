import { useEffect } from 'react';

function LockAccountModal({ customer, onClose, onConfirm }) {
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
        aria-labelledby="lock-customer-title"
        className="flex w-full max-w-[400px] flex-col gap-6 rounded-xl bg-white p-6 shadow-[0_12px_24px_rgba(0,0,0,0.2)]"
      >
        <div className="flex flex-col gap-2">
          <h2 id="lock-customer-title" className="text-2xl font-bold text-[#075A9C]">
            Khóa tài khoản?
          </h2>
          <p className="text-sm leading-5 text-[#526575]">
            Khách hàng <strong className="font-bold">{customer.name}</strong> sẽ không
            thể tự đặt phòng online được nữa.
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
            className="h-[39px] rounded-lg bg-[#D9534F] px-4 text-sm font-bold text-white hover:opacity-90"
          >
            Khóa
          </button>
        </footer>
      </section>
    </div>
  );
}

export default LockAccountModal;
