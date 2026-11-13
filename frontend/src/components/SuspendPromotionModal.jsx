import { FiX } from 'react-icons/fi';

function SuspendPromotionModal({ promotion, onCancel, onConfirm }) {
  if (!promotion) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/20 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="suspend-promotion-title"
        className="flex w-full max-w-[400px] flex-col gap-6 rounded-xl bg-white p-6 shadow-[0_12px_16px_rgba(0,0,0,0.2)]"
      >
        <header className="flex items-start justify-between gap-3">
          <h2
            id="suspend-promotion-title"
            className="text-2xl font-bold leading-normal text-[#075A9C]"
          >
            Tạm ngưng chiến dịch?
          </h2>
          <button
            type="button"
            aria-label="Đóng"
            onClick={onCancel}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#526575] hover:bg-[#F7FBFF]"
          >
            <FiX aria-hidden="true" className="h-5 w-5" />
          </button>
        </header>
        <p className="text-sm leading-normal text-[#526575]">
          Khách hàng sẽ không thể tiếp tục nhập mã{' '}
          <strong className="font-bold">{promotion.code}</strong> khi đặt phòng
          được nữa.
        </p>
        <div className="flex w-full flex-wrap items-center justify-end gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex h-[39px] items-center justify-center rounded-lg border border-[#DCECF8] bg-[#F7FBFF] px-4 py-2 text-sm font-bold text-[#526575] hover:bg-[#DCECF8]"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex h-[35px] items-center justify-center rounded-lg bg-[#D9534F] px-4 py-2 text-sm font-bold text-white"
          >
            Tạm ngưng
          </button>
        </div>
      </section>
    </div>
  );
}

export default SuspendPromotionModal;
