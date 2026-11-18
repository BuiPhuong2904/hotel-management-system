
import { useMemo, useState } from 'react';
import {
  FiChevronDown,
  FiPlus,
  FiTrash2,
  FiX,
} from 'react-icons/fi';

const formatNumber = (value) =>
  new Intl.NumberFormat('vi-VN').format(value);

const createEmptyItem = () => ({
  key: `${Date.now()}-${Math.random()}`,
  serviceId: '',
  quantity: 1,
});

function AddServiceUsageModal({
  rooms = [],
  services = [],
  onClose,
  onSubmit,
}) {
  const [roomId, setRoomId] = useState('');
  const [items, setItems] = useState(() => [createEmptyItem()]);
  const [submitting, setSubmitting] = useState(false);

  const total = useMemo(
    () =>
      items.reduce((sum, item) => {
        const service = services.find(
          (option) => String(option.ServiceID) === String(item.serviceId),
        );
        return sum + Number(service?.Price || 0) * Number(item.quantity || 0);
      }, 0),
    [items, services],
  );

  const updateItem = (key, field, value) => {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.key === key ? { ...item, [field]: value } : item,
      ),
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!roomId || items.some((item) => !item.serviceId)) {
      return;
    }

    if (
      items.some(
        (item) =>
          !Number.isInteger(Number(item.quantity)) ||
          Number(item.quantity) < 1 ||
          Number(item.quantity) > 999,
      )
    ) {
      return;
    }

    setSubmitting(true);

    try {
      await onSubmit({
        RoomID: Number(roomId),
        items: items.map((item) => ({
          ServiceID: Number(item.serviceId),
          Quantity: Number(item.quantity),
        })),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !submitting) {
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
            disabled={submitting}
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
                value={roomId}
                onChange={(event) => setRoomId(event.target.value)}
                className="h-full w-full appearance-none rounded-lg bg-transparent px-4 pr-10 text-sm font-normal text-[#526575] outline-none"
              >
                <option value="">Chọn phòng...</option>
                {rooms.map((option) => (
                  <option key={option.RoomID} value={option.RoomID}>
                    P.{option.RoomNumber} - {option.GuestName}
                  </option>
                ))}
              </select>
              <FiChevronDown
                aria-hidden="true"
                className="pointer-events-none absolute right-4 h-4 w-4 text-[#526575]"
              />
            </span>
          </label>

          {rooms.length === 0 && (
            <p className="text-xs text-[#D9534F]">
              Hiện không có phòng nào đang có khách để ghi nhận dịch vụ.
            </p>
          )}

          {services.length === 0 && (
            <p className="text-xs text-[#D9534F]">
              Chưa có dịch vụ trong danh mục.
            </p>
          )}

          <div className="flex flex-col gap-3">
            {items.map((item, index) => {
              const service = services.find(
                (option) =>
                  String(option.ServiceID) === String(item.serviceId),
              );
              const lineTotal =
                Number(service?.Price || 0) * Number(item.quantity || 0);

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
                        value={item.serviceId}
                        onChange={(event) =>
                          updateItem(item.key, 'serviceId', event.target.value)
                        }
                        className="h-full w-full appearance-none rounded-lg bg-transparent px-4 pr-10 text-sm font-normal text-[#526575] outline-none"
                      >
                        <option value="">Chọn dịch vụ...</option>
                        {services.map((option) => (
                          <option
                            key={option.ServiceID}
                            value={option.ServiceID}
                          >
                            {option.ServiceName}
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
                      max="999"
                      step="1"
                      type="number"
                      value={item.quantity}
                      onChange={(event) =>
                        updateItem(
                          item.key,
                          'quantity',
                          event.target.value,
                        )
                      }
                      className="h-10 w-full rounded-lg border border-[#DCECF8] bg-white px-4 text-sm font-normal text-[#526575] outline-none focus:border-[#0D8BEA]"
                    />
                  </label>

                  <div className="flex min-w-0 flex-col gap-2 text-sm">
                    <span className="font-bold text-[#075A9C]">
                      THÀNH TIỀN
                    </span>
                    <div className="flex h-10 items-center justify-between rounded-lg border border-[#DCECF8] bg-white px-4 text-sm text-[#526575]">
                      <span>{formatNumber(lineTotal)}</span>
                      <span>VNĐ</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    aria-label={`Xóa dòng dịch vụ ${index + 1}`}
                    disabled={items.length === 1 || submitting}
                    onClick={() =>
                      setItems((currentItems) =>
                        currentItems.filter(
                          (current) => current.key !== item.key,
                        ),
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
              disabled={submitting}
              onClick={() =>
                setItems((currentItems) => [
                  ...currentItems,
                  createEmptyItem(),
                ])
              }
              className="self-start py-1 text-xs font-semibold text-[#0D8BEA] disabled:opacity-50"
            >
              + Thêm món/dịch vụ
            </button>
          </div>
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
            disabled={submitting}
            className="flex h-10 items-center justify-center rounded-lg border border-[#DCECF8] bg-[#F7FBFF] px-4 text-sm font-bold text-[#526575]"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            disabled={
              submitting ||
              rooms.length === 0 ||
              services.length === 0
            }
            className="flex h-10 items-center justify-center gap-2 rounded-lg bg-[#0D8BEA] px-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FiPlus aria-hidden="true" className="h-4 w-4" />
            {submitting ? 'Đang ghi nhận...' : 'Ghi nhận tất cả'}
          </button>
        </footer>
      </form>
    </div>
  );
}

export default AddServiceUsageModal;
