import { useMemo, useState } from 'react';
import {
  FiChevronDown,
  FiPlus,
  FiTrash2,
  FiX,
} from 'react-icons/fi';

const serviceOptions = [
  { name: 'Nước suối', unit: 'chai', price: 30000 },
  { name: 'Giặt ủi áo sơ mi', unit: 'món', price: 35000 },
  { name: 'Buffet sáng', unit: 'suất', price: 250000 },
  { name: 'Gói Minibar Đặc biệt', unit: 'gói', price: 480000 },
  {
    name: 'Check-in sớm/Check-out muộn (Gói 2 giờ)',
    unit: 'gói',
    price: 150000,
  },
];

const formatNumber = (value) => new Intl.NumberFormat('vi-VN').format(value);

const createEmptyItem = () => ({
  key: `${Date.now()}-${Math.random()}`,
  serviceName: '',
  quantity: 1,
});

function AddServiceUsageModal({ rooms, onClose, onSubmit }) {
  const [room, setRoom] = useState('');
  const [items, setItems] = useState(() => [createEmptyItem()]);
  const [note, setNote] = useState('');

  const total = useMemo(
    () =>
      items.reduce((sum, item) => {
        const service = serviceOptions.find(
          (option) => option.name === item.serviceName,
        );
        return sum + (service?.price ?? 0) * Number(item.quantity || 0);
      }, 0),
    [items],
  );

  const updateItem = (key, field, value) => {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.key === key ? { ...item, [field]: value } : item,
      ),
    );
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const selectedRoom = rooms.find((option) => option.room === room);
    if (!selectedRoom || items.some((item) => !item.serviceName)) {
      return;
    }

    onSubmit({
      room: selectedRoom.room,
      customer: selectedRoom.customer,
      note: note.trim() || 'Không có',
      items: items.map((item) => {
        const service = serviceOptions.find(
          (option) => option.name === item.serviceName,
        );
        return {
          service: service.name,
          unit: service.unit,
          unitPrice: service.price,
          quantity: Number(item.quantity),
        };
      }),
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-usage-title"
        onSubmit={handleSubmit}
        className="flex max-h-[calc(100dvh-2rem)] w-full max-w-[600px] flex-col overflow-hidden rounded-xl bg-white px-6 py-5 shadow-[0_8px_12px_rgba(0,0,0,0.1)]"
      >
        <header className="flex shrink-0 items-center justify-between border-b border-[#DCECF8] pb-1">
          <h2
            id="add-usage-title"
            className="text-xl font-bold leading-normal text-[#075A9C] sm:text-2xl"
          >
            Ghi Nhận Dịch Vụ Mới
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

        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto py-5">
          <label className="flex w-full flex-col gap-2 text-sm font-bold text-[#075A9C]">
            CHỌN PHÒNG *
            <span className="relative flex h-10 w-full items-center rounded-lg border border-[#DCECF8] bg-white">
              <select
                required
                value={room}
                onChange={(event) => setRoom(event.target.value)}
                className="h-full w-full appearance-none rounded-lg bg-transparent px-4 pr-10 text-sm font-normal text-[#526575] outline-none"
              >
                <option value="">Chọn phòng...</option>
                {rooms.map((option) => (
                  <option key={option.room} value={option.room}>
                    {option.room} - {option.customer}
                  </option>
                ))}
              </select>
              <FiChevronDown
                aria-hidden="true"
                className="pointer-events-none absolute right-4 h-4 w-4 text-[#526575]"
              />
            </span>
          </label>

          <div className="flex flex-col gap-3">
            {items.map((item, index) => {
              const service = serviceOptions.find(
                (option) => option.name === item.serviceName,
              );
              const lineTotal = (service?.price ?? 0) * Number(item.quantity || 0);

              return (
                <div
                  key={item.key}
                  className="grid grid-cols-1 items-end gap-3 sm:grid-cols-[minmax(0,1fr)_120px_160px_40px] sm:gap-4"
                >
                  <label className="flex min-w-0 flex-col gap-2 text-sm font-bold text-[#075A9C]">
                    CHỌN DỊCH VỤ *
                    <span className="relative flex h-10 w-full items-center rounded-lg border border-[#DCECF8] bg-white">
                      <select
                        required
                        aria-label={`Chọn dịch vụ dòng ${index + 1}`}
                        value={item.serviceName}
                        onChange={(event) =>
                          updateItem(item.key, 'serviceName', event.target.value)
                        }
                        className="h-full w-full appearance-none rounded-lg bg-transparent px-4 pr-10 text-sm font-normal text-[#526575] outline-none"
                      >
                        <option value="">Chọn dịch vụ...</option>
                        {serviceOptions.map((option) => (
                          <option key={option.name} value={option.name}>
                            {option.name}
                          </option>
                        ))}
                      </select>
                      <FiChevronDown
                        aria-hidden="true"
                        className="pointer-events-none absolute right-4 h-4 w-4 text-[#526575]"
                      />
                    </span>
                  </label>

                  <label className="flex min-w-0 flex-col gap-2 text-sm font-bold text-[#075A9C]">
                    SỐ LƯỢNG
                    <input
                      required
                      min="1"
                      type="number"
                      value={item.quantity}
                      onChange={(event) =>
                        updateItem(
                          item.key,
                          'quantity',
                          Math.max(1, Number(event.target.value)),
                        )
                      }
                      className="h-10 w-full rounded-lg border border-[#DCECF8] bg-white px-4 text-sm font-normal text-[#526575] outline-none focus:border-[#0D8BEA]"
                    />
                  </label>

                  <div className="flex min-w-0 flex-col gap-2 text-sm">
                    <span className="font-bold text-[#075A9C]">THÀNH TIỀN</span>
                    <div className="flex h-10 items-center justify-between rounded-lg border border-[#DCECF8] bg-white px-4 text-sm text-[#526575]">
                      <span>{formatNumber(lineTotal)}</span>
                      <span>VNĐ</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    aria-label={`Xóa dòng dịch vụ ${index + 1}`}
                    disabled={items.length === 1}
                    onClick={() =>
                      setItems((currentItems) =>
                        currentItems.filter((current) => current.key !== item.key),
                      )
                    }
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#DCECF8] bg-white text-[#D9534F] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <FiTrash2 aria-hidden="true" className="h-5 w-5" />
                  </button>
                </div>
              );
            })}

            <button
              type="button"
              onClick={() => setItems((currentItems) => [...currentItems, createEmptyItem()])}
              className="self-start py-1 text-xs font-semibold text-[#0D8BEA]"
            >
              + Thêm món/dịch vụ
            </button>
          </div>

          <label className="flex w-full flex-col gap-2 text-sm font-bold text-[#075A9C]">
            GHI CHÚ
            <textarea
              rows={3}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="VD: Giao lên phòng lúc 14:00"
              className="min-h-20 w-full resize-y rounded-lg border border-[#DCECF8] bg-white px-4 py-2 text-sm font-normal text-[#526575] outline-none placeholder:text-[#526575] focus:border-[#0D8BEA]"
            />
          </label>
        </div>

        <div className="flex shrink-0 items-center justify-end pt-3">
          <p className="text-lg font-bold text-[#075A9C]">
            Tổng tiền: {formatNumber(total)} VNĐ
          </p>
        </div>

        <footer className="flex shrink-0 flex-wrap items-center justify-end gap-4 border-t border-[#DCECF8] pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 items-center justify-center rounded-lg border border-[#DCECF8] bg-[#F7FBFF] px-4 text-sm font-bold text-[#526575]"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            className="flex h-10 items-center justify-center gap-2 rounded-lg bg-[#0D8BEA] px-4 text-sm font-bold text-white"
          >
            <FiPlus aria-hidden="true" className="h-4 w-4" />
            Ghi nhận tất cả
          </button>
        </footer>
      </form>
    </div>
  );
}

export default AddServiceUsageModal;
