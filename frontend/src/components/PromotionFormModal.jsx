import { useEffect, useState } from 'react';
import { FiCalendar, FiCheck, FiChevronDown, FiPlus, FiX } from 'react-icons/fi';
import {
  fromDateInputValue,
  parsePromotionDate,
  toDateInputValue,
} from '../data/promotions';

const emptyValues = {
  code: '',
  discountPercent: '',
  maxDiscount: '',
  startDate: '',
  endDate: '',
  status: 'Đang áp dụng',
  note: '',
};

const getFormValues = (values) => ({
  code: values.code || '',
  discountPercent: String(values.discountPercent ?? ''),
  maxDiscount: String(values.maxDiscount ?? ''),
  startDate: values.startDate || '',
  endDate: values.endDate || '',
  status: values.status || 'Đang áp dụng',
  note: values.note || '',
});

function PromotionFormModal({
  title,
  submitLabel,
  initialValues = emptyValues,
  existingPromotions = [],
  onClose,
  onSubmit,
  mode,
}) {
  const [form, setForm] = useState(() => getFormValues(initialValues));
  const [error, setError] = useState('');

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const updateField = (event) => {
    const { name, value } = event.target;
    setError('');
    setForm((current) => ({
      ...current,
      [name]: name === 'code' ? value.toLocaleUpperCase('vi') : value,
    }));
  };

  const updateDate = (event) => {
    const { name, value } = event.target;
    setError('');
    setForm((current) => ({ ...current, [name]: fromDateInputValue(value) }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const code = form.code.trim().toLocaleUpperCase('vi');
    const discountPercent = Number(form.discountPercent);
    const maxDiscount = Number(form.maxDiscount);
    const startDate = parsePromotionDate(form.startDate);
    const endDate = parsePromotionDate(form.endDate);
    const isDuplicate = existingPromotions.some(
      (promotion) => promotion.code.toLocaleUpperCase('vi') === code,
    );

    if (!/^[A-Z0-9_-]+$/.test(code)) {
      setError('Mã khuyến mãi chỉ được chứa chữ cái, chữ số, dấu gạch ngang hoặc gạch dưới.');
      return;
    }
    if (isDuplicate) {
      setError('Mã khuyến mãi này đã tồn tại.');
      return;
    }
    if (!Number.isFinite(discountPercent) || discountPercent < 1 || discountPercent > 100) {
      setError('Mức giảm phải nằm trong khoảng từ 1% đến 100%.');
      return;
    }
    if (!Number.isFinite(maxDiscount) || maxDiscount < 0) {
      setError('Mức giảm tối đa không hợp lệ.');
      return;
    }
    if (!startDate || !endDate) {
      setError('Vui lòng nhập ngày theo định dạng DD/MM/YYYY hợp lệ.');
      return;
    }
    if (endDate < startDate) {
      setError('Ngày kết thúc phải bằng hoặc sau ngày bắt đầu.');
      return;
    }

    const saved = onSubmit({
      ...initialValues,
      code,
      discountPercent,
      maxDiscount,
      startDate: form.startDate.trim(),
      endDate: form.endDate.trim(),
      status: form.status,
      note: form.note.trim(),
    });
    if (saved !== false) {
      onClose();
    }
  };

  const inputClass =
    'h-10 w-full rounded-lg border border-[#DCECF8] bg-white px-4 text-sm font-normal text-[#526575] outline-none placeholder:text-[#526575]/80 focus:border-[#0D8BEA]';
  const labelClass = 'flex min-w-0 flex-col gap-2 text-sm font-bold text-[#075A9C]';

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
        aria-labelledby="promotion-form-title"
        className="flex max-h-[90vh] w-full max-w-[600px] flex-col rounded-xl bg-white px-6 py-5 shadow-[0_8px_12px_rgba(0,0,0,0.1)]"
      >
        <header className="flex shrink-0 items-center justify-between border-b border-[#DCECF8]">
          <h2
            id="promotion-form-title"
            className="text-xl font-bold text-[#075A9C] sm:text-2xl"
          >
            {title}
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
          onSubmit={handleSubmit}
          className="min-h-0 flex-1 overflow-y-auto py-4"
        >
          <div className="flex flex-col gap-4">
            <label className={labelClass}>
              MÃ KHUYẾN MÃI
              <input
                autoFocus
                required
                name="code"
                value={form.code}
                onChange={updateField}
                placeholder="VD: SUMMER26"
                className={inputClass}
              />
            </label>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
              <label className={labelClass}>
                MỨC GIẢM (%)
                <input
                  required
                  name="discountPercent"
                  type="number"
                  min="1"
                  max="100"
                  step="1"
                  value={form.discountPercent}
                  onChange={updateField}
                  placeholder="VD: 20"
                  className={inputClass}
                />
              </label>
              <label className={labelClass}>
                MỨC GIẢM TỐI ĐA
                <span className="flex h-10 items-center rounded-lg border border-[#DCECF8] bg-white px-4 focus-within:border-[#0D8BEA]">
                  <input
                    required
                    name="maxDiscount"
                    type="number"
                    min="0"
                    step="1000"
                    value={form.maxDiscount}
                    onChange={updateField}
                    placeholder="500,000"
                    className="min-w-0 flex-1 bg-transparent text-sm font-normal text-[#526575] outline-none placeholder:text-[#526575]/80"
                  />
                  <span className="ml-3 text-sm font-normal text-[#526575]">VNĐ</span>
                </span>
              </label>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
              {[
                { label: 'TỪ NGÀY', name: 'startDate', value: form.startDate },
                { label: 'ĐẾN NGÀY', name: 'endDate', value: form.endDate },
              ].map(({ label, name, value }) => (
                <label key={name} className={labelClass}>
                  {label}
                  <span className="flex h-10 items-center gap-2 rounded-lg border border-[#DCECF8] bg-white px-4 focus-within:border-[#0D8BEA]">
                    <input
                      required
                      name={name}
                      type="date"
                      aria-label={label}
                      value={toDateInputValue(value)}
                      onChange={updateDate}
                      className="min-w-0 flex-1 bg-transparent text-sm font-normal text-[#526575] outline-none"
                    />
                    <FiCalendar
                      aria-hidden="true"
                      className="h-5 w-5 shrink-0 text-[#526575]"
                    />
                  </span>
                </label>
              ))}
            </div>

            <label className={labelClass}>
              TRẠNG THÁI
              <span className="flex h-10 items-center gap-2 rounded-lg border border-[#DCECF8] bg-white px-4 focus-within:border-[#0D8BEA]">
                <select
                  name="status"
                  value={form.status}
                  onChange={updateField}
                  className="h-full min-w-0 flex-1 appearance-none bg-transparent text-sm font-normal text-[#526575] outline-none"
                >
                  <option>Đang áp dụng</option>
                  <option>Tạm ngưng</option>
                </select>
                <FiChevronDown
                  aria-hidden="true"
                  className="h-4 w-4 shrink-0 text-[#526575]"
                />
              </span>
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
            {error && (
              <p role="alert" className="text-sm text-[#D9534F]">
                {error}
              </p>
            )}
          </div>

          <footer className="sticky bottom-0 mt-6 flex shrink-0 justify-end gap-4 border-t border-[#DCECF8] bg-white pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex h-10 items-center justify-center rounded-lg border border-[#DCECF8] bg-[#F7FBFF] px-4 text-sm font-bold text-[#526575] hover:bg-[#DCECF8]"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="flex h-10 items-center justify-center gap-2 rounded-lg bg-[#0D8BEA] px-4 text-sm font-bold text-white hover:bg-[#075A9C]"
            >
              {mode === 'edit' ? (
                <FiCheck aria-hidden="true" className="h-4 w-4" />
              ) : (
                <FiPlus aria-hidden="true" className="h-4 w-4" />
              )}
              {submitLabel}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}

export default PromotionFormModal;
