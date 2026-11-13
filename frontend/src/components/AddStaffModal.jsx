import { useEffect, useState } from 'react';
import { FiInfo, FiPlus, FiX } from 'react-icons/fi';

const initialForm = {
  name: '',
  phone: '',
  email: '',
  identification: '',
  role: 'Lễ tân',
  note: '',
};

function AddStaffModal({ onClose, onCreate }) {
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const updateField = (event) => {
    event.target.setCustomValidity('');
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const missingField = ['name', 'phone', 'email', 'identification'].find(
      (field) => !form[field].trim(),
    );
    if (missingField) {
      const input = event.currentTarget.elements.namedItem(missingField);
      input.setCustomValidity('Vui lòng nhập thông tin này.');
      input.reportValidity();
      return;
    }
    onCreate({
      ...form,
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      identification: form.identification.trim(),
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
        aria-labelledby="add-staff-title"
        className="flex max-h-[90vh] w-full max-w-[600px] flex-col rounded-xl bg-white px-6 py-5 shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
      >
        <header className="flex shrink-0 items-center justify-between border-b border-[#DCECF8]">
          <h2 id="add-staff-title" className="text-2xl font-bold text-[#075A9C]">
            Thêm Nhân Viên Mới
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
          id="add-staff-form"
          onSubmit={handleSubmit}
          className="min-h-0 flex-1 overflow-y-auto py-4"
        >
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
              <label className={labelClass}>
                HỌ VÀ TÊN
                <input
                  autoFocus
                  required
                  name="name"
                  value={form.name}
                  onChange={updateField}
                  placeholder="VD: Nguyễn Minh Anh"
                  className={inputClass}
                />
              </label>
              <label className={labelClass}>
                SỐ ĐIỆN THOẠI
                <input
                  required
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={updateField}
                  placeholder="VD: 0912..."
                  className={inputClass}
                />
              </label>
              <label className={labelClass}>
                EMAIL CÔNG VIỆC
                <input
                  required
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={updateField}
                  placeholder="VD: name@grandhotel.vn"
                  className={inputClass}
                />
              </label>
              <label className={labelClass}>
                CCCD / HỘ CHIẾU
                <input
                  required
                  name="identification"
                  value={form.identification}
                  onChange={updateField}
                  placeholder="Nhập số CCCD/Hộ chiếu"
                  className={inputClass}
                />
              </label>
            </div>
            <label className={labelClass}>
              VAI TRÒ
              <select
                name="role"
                value={form.role}
                onChange={updateField}
                className={inputClass}
              >
                <option>Lễ tân</option>
                <option>Quản trị viên</option>
              </select>
            </label>
            <label className={labelClass}>
              GHI CHÚ (nếu có)
              <textarea
                name="note"
                value={form.note}
                onChange={updateField}
                placeholder="Nhập thông tin..."
                className="h-20 w-full resize-y rounded-lg border border-[#DCECF8] bg-white px-4 py-2 text-sm font-normal text-[#526575] outline-none placeholder:text-[#526575] focus:border-[#0D8BEA]"
              />
            </label>
            <div className="flex items-center gap-4 rounded-lg border border-[#DCECF8] bg-[#F7FBFF] p-4 text-sm leading-5 text-[#075A9C]">
              <FiInfo aria-hidden="true" className="h-5 w-5 shrink-0" />
              <p>
                Hệ thống sẽ tự động tạo tài khoản (Username là Email công việc) và gửi
                link cài đặt mật khẩu qua Email.
              </p>
            </div>
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
            form="add-staff-form"
            className="flex h-10 items-center gap-2 rounded-lg bg-[#0D8BEA] px-4 text-sm font-bold text-white hover:bg-[#075A9C]"
          >
            <FiPlus aria-hidden="true" className="h-4 w-4" />
            Tạo tài khoản
          </button>
        </footer>
      </section>
    </div>
  );
}

export default AddStaffModal;
