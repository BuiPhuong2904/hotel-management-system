import { useEffect, useState } from 'react';
import { FiCheck, FiEye, FiEyeOff, FiX } from 'react-icons/fi';
import { customerStatuses, maskIdentification } from '../utils/customerUtils';

function EditCustomerModal({ customer, onClose, onSave }) {
  const [form, setForm] = useState({ ...customer });
  const [showIdentification, setShowIdentification] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const updateField = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSave({
      ...form,
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      identification: form.identification.trim(),
      address: form.address.trim(),
      note: form.note.trim(),
    });
  };

  const inputClass =
    'h-10 w-full rounded-lg border border-[#DCECF8] bg-white px-4 text-sm font-normal text-[#526575] outline-none placeholder:text-[#526575]/80 focus:border-[#0D8BEA]';
  const labelClass = 'flex min-w-0 flex-col gap-2 text-sm font-bold text-[#075A9C]';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-customer-title"
        className="flex max-h-[90vh] w-full max-w-[600px] flex-col rounded-xl bg-white px-6 py-5 shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
      >
        <header className="flex shrink-0 items-center justify-between border-b border-[#DCECF8]">
          <h2 id="edit-customer-title" className="text-2xl font-bold text-[#075A9C]">
            Chỉnh Sửa Hồ Sơ
          </h2>
          <button
            type="button"
            aria-label="Đóng"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[#526575] hover:bg-[#F7FBFF]"
          >
            <FiX aria-hidden="true" className="h-6 w-6" />
          </button>
        </header>

        <form
          id="edit-customer-form"
          onSubmit={handleSubmit}
          className="min-h-0 flex-1 overflow-y-auto py-4"
        >
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
              <label className={labelClass}>
                HỌ VÀ TÊN *
                <input
                  required
                  name="name"
                  value={form.name}
                  onChange={updateField}
                  className={inputClass}
                />
              </label>
              <label className={labelClass}>
                SỐ ĐIỆN THOẠI *
                <input
                  required
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={updateField}
                  className={inputClass}
                />
              </label>
              <label className={labelClass}>
                EMAIL
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={updateField}
                  className={inputClass}
                />
              </label>
              <label className={labelClass}>
                CCCD / HỘ CHIẾU
                <span className="flex h-10 items-center overflow-hidden rounded-lg border border-[#DCECF8] bg-white focus-within:border-[#0D8BEA]">
                  <input
                    name="identification"
                    value={
                      showIdentification
                        ? form.identification
                        : maskIdentification(form.identification)
                    }
                    readOnly={!showIdentification}
                    onChange={(event) => {
                      if (showIdentification) {
                        setForm((current) => ({
                          ...current,
                          identification: event.target.value,
                        }));
                      }
                    }}
                    className="h-full min-w-0 flex-1 bg-transparent px-4 text-sm font-normal text-[#526575] outline-none"
                    aria-label="CCCD hoặc hộ chiếu"
                  />
                  <button
                    type="button"
                    aria-label={
                      showIdentification ? 'Ẩn CCCD / hộ chiếu' : 'Hiện CCCD / hộ chiếu'
                    }
                    onClick={() => setShowIdentification((visible) => !visible)}
                    className="flex h-full w-10 shrink-0 items-center justify-center text-[#526575] hover:bg-[#F7FBFF]"
                  >
                    {showIdentification ? (
                      <FiEyeOff aria-hidden="true" className="h-4 w-4" />
                    ) : (
                      <FiEye aria-hidden="true" className="h-4 w-4" />
                    )}
                  </button>
                </span>
              </label>
            </div>
            <label className={labelClass}>
              ĐỊA CHỈ
              <input
                name="address"
                value={form.address}
                onChange={updateField}
                placeholder="Nhập địa chỉ khách hàng"
                className={inputClass}
              />
            </label>
            <label className={labelClass}>
              TRẠNG THÁI
              <select
                name="status"
                value={form.status}
                onChange={updateField}
                className={inputClass}
              >
                {customerStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
            <label className={labelClass}>
              GHI CHÚ
              <textarea
                name="note"
                value={form.note}
                onChange={updateField}
                placeholder="Nhập thông tin..."
                className="h-20 w-full resize-y rounded-lg border border-[#DCECF8] bg-white px-4 py-2 text-sm font-normal text-[#526575] outline-none placeholder:text-[#526575] focus:border-[#0D8BEA]"
              />
            </label>
          </div>
        </form>

        <footer className="flex shrink-0 justify-end gap-4 border-t border-[#DCECF8] pt-4">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-lg border border-[#DCECF8] bg-[#F7FBFF] px-4 text-sm font-bold text-[#526575] hover:bg-[#E8F5FF]"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            form="edit-customer-form"
            className="flex h-10 items-center gap-2 rounded-lg bg-[#0D8BEA] px-4 text-sm font-bold text-white hover:bg-[#075A9C]"
          >
            <FiCheck aria-hidden="true" className="h-4 w-4" />
            Lưu thay đổi
          </button>
        </footer>
      </section>
    </div>
  );
}

export default EditCustomerModal;
