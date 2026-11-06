import { useState } from 'react';
import { createPortal } from 'react-dom';
import { FiPlus, FiTrash2, FiUser, FiX, FiCheck } from 'react-icons/fi';

const emptyGuest = () => ({
  name: '',
  identity: '',
  type: 'Nội địa (Việt Nam)',
  note: '',
});

function GuestListModal({
  isOpen,
  room,
  guests,
  primaryGuest,
  onClose,
  onSave,
}) {
  const [entries, setEntries] = useState(() =>
    guests?.length
      ? guests.map((guest) => ({ ...emptyGuest(), ...guest }))
      : [{ ...emptyGuest(), name: primaryGuest || '' }, emptyGuest()],
  );
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const updateEntry = (index, key, value) => {
    setEntries((current) =>
      current.map((entry, entryIndex) =>
        entryIndex === index ? { ...entry, [key]: value } : entry,
      ),
    );
  };

  const saveEntries = (event) => {
    event.preventDefault();
    const completedEntries = entries.filter((entry) =>
      [entry.name, entry.identity, entry.note].some((value) => value.trim()),
    );
    const incompleteEntry = completedEntries.some(
      (entry) => !entry.name.trim() || !entry.identity.trim(),
    );

    if (incompleteEntry) {
      setError('Vui lòng nhập họ tên và CCCD / Passport cho từng khách.');
      return;
    }

    onSave(completedEntries);
  };

  const modal = (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-3 sm:p-6"
      onClick={onClose}
    >
      <form
        onSubmit={saveEntries}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        className="flex max-h-[92vh] w-full max-w-[600px] flex-col overflow-hidden rounded-xl bg-white px-5 py-4 shadow-xl sm:px-6 sm:py-5"
        aria-labelledby="guest-list-title"
      >
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-[#DCECF8] py-2">
          <div className="min-w-0">
            <h2
              id="guest-list-title"
              className="text-xl font-bold text-[#075A9C] sm:text-2xl"
            >
              Cập nhật hồ sơ khách lưu trú
            </h2>
            <p className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-[#526575]">
              <span>{room?.roomNumber ? `Phòng ${room.roomNumber}` : `Phòng ${room?.number || ''}`}</span>
              <span aria-hidden="true">•</span>
              <span>{room?.roomType ? `Loại ${room.roomType}` : `Loại ${room?.type || 'A'}`}</span>
              <span aria-hidden="true">•</span>
              <span>Tiêu chuẩn {room?.guests || 2} khách</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-[#526575] hover:bg-[#F7FBFF]"
            aria-label="Đóng cập nhật hồ sơ khách"
          >
            <FiX aria-hidden="true" />
          </button>
        </header>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto py-4">
          {entries.map((entry, index) => (
            <section
              key={index}
              className="rounded-xl border border-[#DCECF8] px-4 py-3"
            >
              <div className="mb-3 flex items-center justify-between border-b border-[#DCECF8] pb-2">
                <h3 className="flex items-center gap-2 text-sm font-bold text-[#526575]">
                  <FiUser aria-hidden="true" className="text-[#075A9C]" />
                  KHÁCH {index + 1}
                </h3>
                {entries.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      setEntries((current) =>
                        current.filter((_, entryIndex) => entryIndex !== index),
                      )
                    }
                    className="rounded-md p-1.5 text-[#526575] hover:bg-[#F7FBFF] hover:text-[#D9534F]"
                    aria-label={`Xóa khách ${index + 1}`}
                  >
                    <FiTrash2 aria-hidden="true" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
                <label className="flex min-w-0 flex-col gap-1.5 text-sm font-bold text-[#075A9C]">
                  Họ và tên *
                  <input
                    value={entry.name}
                    onChange={(event) =>
                      updateEntry(index, 'name', event.target.value)
                    }
                    placeholder="Nhập họ và tên"
                    className="h-10 w-full rounded-lg border border-[#DCECF8] px-4 text-sm font-normal text-[#526575] outline-none focus:border-[#0D8BEA]"
                  />
                </label>
                <label className="flex min-w-0 flex-col gap-1.5 text-sm font-bold text-[#075A9C]">
                  CCCD / Passport *
                  <input
                    value={entry.identity}
                    onChange={(event) =>
                      updateEntry(index, 'identity', event.target.value)
                    }
                    placeholder="Nhập số giấy tờ"
                    className="h-10 w-full rounded-lg border border-[#DCECF8] px-4 text-sm font-normal text-[#526575] outline-none focus:border-[#0D8BEA]"
                  />
                </label>
                <label className="flex min-w-0 flex-col gap-1.5 text-sm font-bold text-[#075A9C]">
                  Loại khách *
                  <select
                    value={entry.type}
                    onChange={(event) =>
                      updateEntry(index, 'type', event.target.value)
                    }
                    className="h-10 w-full rounded-lg border border-[#DCECF8] bg-white px-4 text-sm font-normal text-[#526575] outline-none focus:border-[#0D8BEA]"
                  >
                    <option>Nội địa (Việt Nam)</option>
                    <option>Nước ngoài</option>
                  </select>
                </label>
                <label className="flex min-w-0 flex-col gap-1.5 text-sm font-bold text-[#075A9C]">
                  Ghi chú
                  <input
                    value={entry.note}
                    onChange={(event) =>
                      updateEntry(index, 'note', event.target.value)
                    }
                    placeholder="Nhập thông tin..."
                    className="h-10 w-full rounded-lg border border-[#DCECF8] px-4 text-sm font-normal text-[#526575] outline-none focus:border-[#0D8BEA]"
                  />
                </label>
              </div>
            </section>
          ))}

          <button
            type="button"
            onClick={() => setEntries((current) => [...current, emptyGuest()])}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[#DCECF8] text-sm font-bold text-[#526575] hover:bg-[#F7FBFF]"
          >
            <FiPlus aria-hidden="true" />
            Thêm khách ở
            <span className="font-normal text-xs">
              (Phụ thu người thứ 3 +25% đơn giá)
            </span>
          </button>
          {error && (
            <p role="alert" className="text-sm text-[#D9534F]">
              {error}
            </p>
          )}
        </div>

        <footer className="flex shrink-0 justify-end gap-3 border-t border-[#DCECF8] pt-4">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-lg border border-[#DCECF8] bg-[#F7FBFF] px-4 text-sm font-bold text-[#526575] hover:bg-[#E8F5FF]"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            className="flex h-10 items-center gap-2 rounded-lg bg-[#0D8BEA] px-4 text-sm font-bold text-white hover:bg-[#075A9C]"
          >
            <FiCheck aria-hidden="true" />
            Lưu danh sách
          </button>
        </footer>
      </form>
    </div>
  );

  return createPortal(modal, document.body);
}

export default GuestListModal;
