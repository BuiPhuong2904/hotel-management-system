function DeleteConfirmModal({ service, onCancel, onConfirm }) {
  if (!service) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onCancel();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-service-title"
        className="flex w-full max-w-[400px] flex-col gap-6 rounded-xl bg-white p-6 shadow-[0_12px_16px_rgba(0,0,0,0.2)]"
      >
        <div className="flex w-full flex-col gap-2">
          <h2
            id="delete-service-title"
            className="text-2xl font-bold leading-normal text-[#075A9C]"
          >
            Xóa ghi nhận dịch vụ?
          </h2>
          <p className="text-sm leading-normal text-[#526575]">
            Ghi nhận &quot;{service.name}&quot; cho phòng {service.room} sẽ bị
            xóa khỏi hệ thống. Hành động này không thể hoàn tác.
          </p>
        </div>
        <div className="flex w-full flex-wrap items-center justify-end gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex h-[39px] items-center justify-center rounded-lg border border-[#DCECF8] bg-[#F7FBFF] px-4 py-2 text-sm font-bold text-[#526575] transition-colors hover:bg-[#DCECF8]"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex h-[35px] items-center justify-center rounded-lg bg-[#D9534F] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#D9534F]"
          >
            Xóa ghi nhận
          </button>
        </div>
      </section>
    </div>
  );
}

export default DeleteConfirmModal;
