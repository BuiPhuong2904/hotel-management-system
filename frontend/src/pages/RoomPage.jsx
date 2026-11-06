import { useMemo, useState } from 'react';
import {
  FiChevronLeft,
  FiChevronRight,
  FiEdit2,
  FiEye,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiTrash2,
} from 'react-icons/fi';
import RoomDetailDrawer from '../components/RoomDetailDrawer';

const initialRooms = [
  {
    id: 1,
    number: '101',
    floor: 'T1',
    type: 'A',
    price: 150000,
    capacity: 3,
    status: 'Đang lưu trú',
    note: 'Nguyễn Văn A - Đã thanh toán',
    guestName: 'Nguyễn Văn A',
    guestPhone: '0912345678',
    checkInTime: '14:00 - Hôm qua',
    expectedCheckOut: '29/10/2026',
  },
  {
    id: 2,
    number: '101',
    floor: 'T1',
    type: 'A',
    price: 150000,
    capacity: 3,
    status: 'Sẵn sàng',
    note: 'Không có',
  },
  {
    id: 3,
    number: '101',
    floor: 'T1',
    type: 'A',
    price: 150000,
    capacity: 3,
    status: 'Đang dọn dẹp',
    note: 'Không có',
  },
  {
    id: 4,
    number: '101',
    floor: 'T1',
    type: 'A',
    price: 150000,
    capacity: 3,
    status: 'Bảo trì',
    note: 'Không có',
  },
  {
    id: 5,
    number: '101',
    floor: 'T1',
    type: 'A',
    price: 150000,
    capacity: 3,
    status: 'Sẵn sàng',
    note: 'Không có',
  },
];

const roomStatuses = [
  {
    value: 'Sẵn sàng',
    subtitle: 'Đón khách ngay',
    color: '#16A34A',
    text: '#2E8B57',
    subtitleColor: '#16A34A',
  },
  {
    value: 'Đang dọn dẹp',
    subtitle: 'Chờ nhân viên',
    color: '#FFC542',
    text: '#E9A100',
    subtitleColor: '#FFC542',
  },
  {
    value: 'Bảo trì',
    subtitle: 'Khóa phòng',
    color: '#D9534F',
    text: '#D9534F',
    subtitleColor: '#FF3B30',
  },
];

const roomStatusColors = {
  'Đang lưu trú': '#0D8BEA',
  'Sẵn sàng': '#2E8B57',
  'Đang dọn dẹp': '#FFC542',
  'Bảo trì': '#D9534F',
};

const summaryCards = [
  {
    title: 'TỔNG SỐ PHÒNG',
    value: '48',
    description: 'Quy mô cơ sở',
    color: '#075A9C',
  },
  {
    title: 'CÒN TRỐNG',
    value: '08',
    description: 'Sẵn sàng đón khách',
    color: '#2E8B57',
    progress: 16.59,
  },
  {
    title: 'ĐANG LƯU TRÚ',
    value: '36',
    description: '75.0% lấp đầy',
    color: '#0D8BEA',
    progress: 75.01,
  },
  {
    title: 'CẦN DỌN DẸP',
    value: '03',
    description: 'Đang xử lý',
    color: '#D97706',
    progress: 6.25,
  },
  {
    title: 'BẢO TRÌ',
    value: '01',
    description: 'Phòng 402',
    color: '#D9534F',
    progress: 3.1,
  },
];

const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price);

function SummaryCard({ card }) {
  return (
    <article className="flex h-[136px] min-w-0 flex-col gap-2 rounded-xl border border-[#DCECF8] bg-white p-[17px] shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
      <h2
        className="whitespace-nowrap text-sm font-bold"
        style={{ color: card.color }}
      >
        {card.title}
      </h2>
      <div className="flex min-h-0 flex-1 flex-col pt-1">
        <div className="flex items-baseline gap-1">
          <span
            className="text-xl font-bold leading-7"
            style={{ color: card.color }}
          >
            {card.value}
          </span>
          <span className="text-xs text-[#526575]">phòng</span>
        </div>
        <p
          className="text-xs"
          style={{
            color: card.progress === undefined ? '#526575' : card.color,
          }}
        >
          {card.description}
        </p>
        {card.progress !== undefined && (
          <div
            aria-label={`${card.title}: ${card.progress}%`}
            aria-valuemax={100}
            aria-valuemin={0}
            aria-valuenow={card.progress}
            className="mt-auto h-1.5 overflow-hidden rounded-full bg-[#DCECF8]"
            role="progressbar"
          >
            <div
              className="h-full rounded-full bg-[#0D8BEA]"
              style={{ width: `${card.progress}%` }}
            />
          </div>
        )}
      </div>
    </article>
  );
}

function FilterGroup({ label, options, value, onChange, tone = 'blue' }) {
  const background = tone === 'muted' ? '#F4F9FD' : '#F7FBFF';

  return (
    <div
      className="flex min-h-10 flex-wrap items-center gap-1 rounded-lg border border-[#DCECF8] p-1"
      style={{ backgroundColor: background }}
    >
      <span className="shrink-0 px-2 text-xs font-semibold text-[#64748B]">
        {label}:
      </span>
      {options.map((option) => {
        const selected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            className={`rounded px-2.5 py-1 text-xs font-semibold transition-colors ${
              selected
                ? 'bg-[#0D8BEA] text-white'
                : 'text-[#526575] hover:bg-[#E8F5FF]'
            }`}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function RoomStatusOptions({ value, onChange, isEditing }) {
  return (
    <fieldset className="flex min-w-0 flex-col gap-2">
      <legend className="text-sm font-bold text-[#075A9C]">
        {isEditing ? 'TRẠNG THÁI HIỆN TẠI' : 'TRẠNG THÁI KHỞI TẠO'}
      </legend>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-[160px_166px_165px] lg:gap-6">
        {roomStatuses.map((status) => {
          const selected = value === status.value;
          const radioAsset =
            status.value === 'Sẵn sàng'
              ? selected
                ? '/images/room-modal-radio-selected.svg'
                : '/images/room-modal-radio-unselected.svg'
              : !selected
                ? '/images/room-modal-radio-unselected.svg'
                : null;
          return (
            <label
              key={status.value}
              className="flex h-12 min-w-0 cursor-pointer items-center gap-3 overflow-hidden rounded-lg border bg-white px-3 sm:gap-4 sm:px-4"
              style={{ borderColor: status.color }}
            >
              <input
                type="radio"
                name="status"
                value={status.value}
                checked={selected}
                onChange={() => onChange(status.value)}
                className="sr-only"
              />
              {radioAsset ? (
                <img
                  src={radioAsset}
                  alt=""
                  aria-hidden="true"
                  className="h-5 w-5 shrink-0"
                />
              ) : (
                <span
                  aria-hidden="true"
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#DCECF8] bg-[#F7FBFF]"
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: status.color }}
                  />
                </span>
              )}
              <span className="flex min-w-0 flex-col">
                <span
                  className="whitespace-nowrap text-sm font-bold leading-5"
                  style={{ color: status.text }}
                >
                  {status.value}
                </span>
                <span
                  className="whitespace-nowrap text-xs leading-4"
                  style={{ color: status.subtitleColor }}
                >
                  {status.subtitle}
                </span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

function RoomFormDialog({ room, onClose, onSave }) {
  const isEditing = Boolean(room);
  const [form, setForm] = useState(
    room
      ? {
          number: room.number,
          type: room.type,
          capacity: String(room.capacity),
          price: String(room.price),
          status: room.status,
          note: room.note,
        }
      : {
          number: '',
          type: '',
          capacity: '3',
          price: '150000',
          status: 'Sẵn sàng',
          note: '',
        },
  );

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const number = form.number.trim();
    const floorNumber = number.match(/\d/)?.[0];

    onSave({
      number,
      floor: floorNumber ? `T${floorNumber}` : '',
      type: form.type,
      capacity: Number(form.capacity),
      price: Number(form.price),
      status: form.status,
      note: form.note.trim() || 'Không có',
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[rgba(0,0,0,0.2)] p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="room-dialog-title"
        onSubmit={handleSubmit}
        className="flex h-[626px] max-h-[calc(100dvh-2rem)] w-full max-w-[600px] flex-col gap-6 overflow-y-auto rounded-xl bg-white px-6 py-5 shadow-[0_8px_12px_rgba(0,0,0,0.1)]"
      >
        <header className="flex h-[34px] shrink-0 items-center justify-between border-b border-[#DCECF8]">
          <h2
            id="room-dialog-title"
            className="text-2xl font-bold leading-normal text-[#075A9C]"
          >
            {isEditing ? 'Chỉnh Sửa Phòng' : 'Thêm Phòng Mới'}
          </h2>
          <button
            type="button"
            aria-label="Đóng"
            onClick={onClose}
            className="flex h-6 w-6 shrink-0 items-center justify-center text-[#526575] hover:text-[#075A9C]"
          >
            <img
              src="/images/room-modal-close.svg"
              alt=""
              aria-hidden="true"
              className="h-6 w-6"
            />
          </button>
        </header>

        <div className="flex w-full flex-col gap-4">
          <label className="flex w-full flex-col gap-2 text-sm font-bold text-[#075A9C]">
            TÊN PHÒNG *
            <input
              autoFocus
              required
              name="number"
              value={form.number}
              onChange={updateField}
              placeholder="Nhập thông tin..."
              className="h-10 w-full rounded-lg border border-[#DCECF8] bg-white px-4 py-2 text-sm font-normal text-[#526575] outline-none placeholder:text-[rgba(82,101,117,0.8)] focus:border-[#0D8BEA]"
            />
          </label>

          <label className="flex w-full flex-col gap-2 text-sm font-bold text-[#075A9C]">
            LOẠI PHÒNG *
            <span className="flex h-10 w-full items-center rounded-lg border border-[#DCECF8] bg-white px-4">
              <select
                required
                name="type"
                value={form.type}
                onChange={updateField}
                className="h-full min-w-0 flex-1 appearance-none bg-transparent text-sm font-normal text-[#526575] outline-none"
              >
                <option value="" disabled>
                  Chọn loại phòng...
                </option>
                {['A', 'B', 'C'].map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <img
                src="/images/room-modal-chevron.svg"
                alt=""
                aria-hidden="true"
                className="h-6 w-6 shrink-0"
              />
            </span>
          </label>

          <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
            <label className="flex min-w-0 flex-col gap-2 text-sm font-bold text-[#075A9C]">
              SỐ KHÁCH TỐI ĐA
              <input
                required
                type="number"
                min="1"
                name="capacity"
                value={form.capacity}
                onChange={updateField}
                className="h-10 w-full rounded-lg border border-transparent bg-[#E8F5FF] px-4 py-2 text-sm font-normal text-[#526575] outline-none focus:border-[#0D8BEA]"
              />
            </label>
            <label className="flex min-w-0 flex-col gap-2 text-sm font-bold text-[#075A9C]">
              ĐƠN GIÁ
              <span className="flex h-10 w-full items-center justify-between rounded-lg bg-[#E8F5FF] px-4 py-2 text-sm font-normal text-[#526575]">
                <input
                  required
                  type="text"
                  inputMode="numeric"
                  name="price"
                  value={form.price ? formatPrice(Number(form.price)) : ''}
                  onChange={(event) => {
                    const digits = event.target.value.replace(/\D/g, '');
                    setForm((current) => ({ ...current, price: digits }));
                  }}
                  aria-label="ĐƠN GIÁ"
                  className="min-w-0 flex-1 bg-transparent outline-none"
                />
                <span className="ml-2 shrink-0">VNĐ</span>
              </span>
            </label>
          </div>

          <RoomStatusOptions
            isEditing={isEditing}
            value={form.status}
            onChange={(status) => setForm((current) => ({ ...current, status }))}
          />

          <label className="flex w-full flex-col gap-2 text-sm font-bold text-[#075A9C]">
            GHI CHÚ TIỆN ÍCH
            <textarea
              name="note"
              rows={3}
              value={form.note}
              onChange={updateField}
              placeholder="VD: Cửa sổ hướng hồ bơi, giường King-size, trang bị minibar cao cấp"
              className="h-20 w-full resize-none rounded-lg border border-[#DCECF8] bg-white px-4 py-2 text-sm font-normal text-[#526575] outline-none placeholder:text-[#526575] focus:border-[#0D8BEA]"
            />
          </label>
        </div>

        <footer className="mt-auto flex w-full shrink-0 items-center justify-end gap-4 border-t border-[#DCECF8] pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-[84px] items-center justify-center rounded-lg border border-[#DCECF8] bg-[#F7FBFF] px-4 py-2.5 text-sm font-bold text-[#526575]"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            className={`flex h-10 items-center justify-center gap-2 rounded-lg bg-[#0D8BEA] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#075A9C] ${
              isEditing ? 'w-[132px]' : 'w-[143px]'
            }`}
          >
            {isEditing ? (
              <img
                src="/images/room-modal-save.svg"
                alt=""
                aria-hidden="true"
                className="h-4 w-4"
              />
            ) : (
              <img
                src="/images/room-modal-add.svg"
                alt=""
                aria-hidden="true"
                className="h-4 w-4"
              />
            )}
            {isEditing ? 'Lưu phòng' : 'Thêm phòng'}
          </button>
        </footer>
      </form>
    </div>
  );
}

function DeleteRoomDialog({ room, onClose, onConfirm }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.2)] p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-room-title"
        className="flex min-h-[190px] w-full max-w-[400px] flex-col gap-6 rounded-xl bg-white p-6 shadow-[0_12px_16px_rgba(0,0,0,0.2)]"
      >
        <div className="flex w-full flex-col gap-2">
          <h2
            id="delete-room-title"
            className="text-2xl font-bold leading-[33px] text-[#075A9C]"
          >
            Xóa phòng {room.number}?
          </h2>
          <p className="text-sm leading-[19px] text-[#526575]">
            Phòng {room.number} sẽ bị xóa khỏi danh sách. Hành động này không
            thể hoàn tác.
          </p>
        </div>
        <div className="flex w-full items-center justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            className="flex h-[39px] w-[84px] items-center justify-center rounded-lg border border-[#DCECF8] bg-[#F7FBFF] px-4 py-2 text-sm font-bold text-[#526575]"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex h-[35px] w-[106px] items-center justify-center rounded-lg bg-[#D9534F] px-4 py-2 text-sm font-bold text-white hover:bg-[#D9534F]"
          >
            Xóa phòng
          </button>
        </div>
      </div>
    </div>
  );
}

function RoomPage() {
  const [rooms, setRooms] = useState(initialRooms);
  const [floor, setFloor] = useState('all');
  const [roomType, setRoomType] = useState('A');
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [roomDialog, setRoomDialog] = useState(null);
  const [deletingRoom, setDeletingRoom] = useState(null);
  const [viewingRoom, setViewingRoom] = useState(null);

  const filteredRooms = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('vi');
    return rooms.filter((room) => {
      const matchesFloor = floor === 'all' || room.floor === floor;
      const matchesType = roomType === 'all' || room.type === roomType;
      const matchesStatus = status === 'all' || room.status === status;
      const matchesSearch =
        !query ||
        `${room.number} ${room.type} ${room.note}`
          .toLocaleLowerCase('vi')
          .includes(query);

      return matchesFloor && matchesType && matchesStatus && matchesSearch;
    });
  }, [floor, roomType, rooms, search, status]);

  const resetFilters = () => {
    setFloor('all');
    setRoomType('A');
    setStatus('all');
    setSearch('');
  };

  const saveRoom = (roomData) => {
    if (roomDialog?.room) {
      setRooms((currentRooms) =>
        currentRooms.map((room) =>
          room.id === roomDialog.room.id
            ? { ...room, ...roomData }
            : room,
        ),
      );
    } else {
      setRooms((currentRooms) => [
        ...currentRooms,
        { id: Date.now(), ...roomData },
      ]);
    }
    setRoomDialog(null);
  };

  const confirmDelete = () => {
    if (!deletingRoom) return;
    setRooms((currentRooms) =>
      currentRooms.filter((room) => room.id !== deletingRoom.id),
    );
    setDeletingRoom(null);
  };

  const exportRooms = () => {
    const rows = [
      ['Tên phòng', 'Loại phòng', 'Đơn giá', 'Sức chứa', 'Trạng thái', 'Khách / ghi chú'],
      ...filteredRooms.map((room) => [
        room.number,
        room.type,
        room.price,
        room.capacity,
        room.status,
        room.note,
      ]),
    ];
    const csv = `\uFEFF${rows
      .map((row) =>
        row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(','),
      )
      .join('\n')}`;
    const url = URL.createObjectURL(
      new Blob([csv], { type: 'text/csv;charset=utf-8' }),
    );
    const link = document.createElement('a');
    link.href = url;
    link.download = 'danh-sach-phong.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="-mt-2 flex w-full flex-1 flex-col gap-6 min-w-0 bg-[#F7FBFF]">
      <section
        aria-label="Tổng quan tình trạng phòng"
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5 xl:gap-4"
      >
        {summaryCards.map((card) => (
          <SummaryCard key={card.title} card={card} />
        ))}
      </section>

      <section
        aria-label="Bộ lọc và tìm kiếm phòng"
        className="grid min-w-0 gap-4 rounded-xl border border-[#DCECF8] bg-white p-4 sm:p-[17px] xl:min-h-[140px] xl:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.8fr)] xl:items-center xl:gap-6"
      >
        <div className="flex min-w-0 flex-col gap-3">
          <div className="flex flex-wrap gap-6">
            <FilterGroup
              label="TẦNG"
              value={floor}
              onChange={setFloor}
              options={[
                { label: 'Tất cả', value: 'all' },
                ...['T1', 'T2', 'T3', 'T4'].map((value) => ({
                  label: value,
                  value,
                })),
              ]}
            />
            <FilterGroup
              label="LOẠI"
              tone="muted"
              value={roomType}
              onChange={setRoomType}
              options={[
                { label: 'Tất cả', value: 'all' },
                ...['A', 'B', 'C'].map((value) => ({
                  label: `Loại ${value}`,
                  value,
                })),
              ]}
            />
          </div>

          <div className="flex flex-wrap items-center gap-1 rounded-lg border border-[#DCECF8] bg-[#F7FBFF] p-1">
            <span className="shrink-0 px-2 text-xs font-semibold text-[#64748B]">
              TRẠNG THÁI:
            </span>
            <button
              type="button"
              aria-pressed={status === 'all'}
              onClick={() => setStatus('all')}
              className={`rounded px-2 py-1 text-xs font-semibold ${
                status === 'all'
                  ? 'bg-[#0D8BEA] text-white'
                  : 'text-[#526575] hover:bg-[#E8F5FF]'
              }`}
            >
              Tất cả
            </button>
            {Object.entries(roomStatusColors).map(([label, color]) => (
              <button
                key={label}
                type="button"
                aria-pressed={status === label}
                onClick={() => setStatus(label)}
                className="flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold text-[#526575] hover:bg-[#E8F5FF]"
              >
                <span
                  aria-hidden="true"
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: color }}
                />
                {label}
              </button>
            ))}
            <button
              type="button"
              aria-label="Đặt lại bộ lọc"
              title="Đặt lại bộ lọc"
              onClick={resetFilters}
              className="ml-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#DCECF8] bg-white text-[#526575] hover:bg-[#E8F5FF]"
            >
              <FiRefreshCw aria-hidden="true" className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-3">
          <label className="flex h-10 w-full items-center gap-[10px] rounded-lg border border-[#DCECF8] bg-[#F8FAFC] px-[13px] focus-within:border-[#0D8BEA]">
            <FiSearch
              aria-hidden="true"
              className="h-3.5 w-3.5 shrink-0 text-[#526575]"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm số phòng,..."
              aria-label="Tìm phòng"
              className="h-full min-w-0 flex-1 bg-transparent text-sm text-[#526575] outline-none placeholder:text-[#526575]"
            />
          </label>
          <div className="flex flex-wrap justify-end gap-3 xl:gap-6">
            <button
              type="button"
              onClick={exportRooms}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#DCECF8] bg-[#F7FBFF] px-4 text-sm font-bold text-[#0D8BEA] hover:bg-[#E8F5FF]"
            >
              <FiPlus aria-hidden="true" className="h-4 w-4" />
              Xuất Excel
            </button>
            <button
              type="button"
              onClick={() => setRoomDialog({ room: null })}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#0D8BEA] px-4 text-sm font-bold text-white hover:bg-[#075A9C]"
            >
              <FiPlus aria-hidden="true" className="h-4 w-4" />
              Thêm phòng mới
            </button>
          </div>
        </div>
      </section>

      <section
        aria-label="Danh mục phòng lưu trú"
        className="min-w-0 overflow-hidden rounded-xl border border-[#DCECF8] bg-white p-px xl:min-h-[413px]"
      >
        <div className="flex flex-col gap-2 border-b border-[#DCECF8] px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-lg font-bold text-[#075A9C]">
              Danh mục phòng lưu trú
            </h1>
            <span className="rounded-md border border-[#DCECF8] bg-[#E8F5FF] px-[9px] py-[3px] text-xs text-[#0D8BEA]">
              {filteredRooms.length} kết quả
            </span>
          </div>
          <p className="text-xs text-[#526575]">
            Sắp xếp: Thứ tự số phòng tăng dần
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] border-collapse text-left text-sm">
            <colgroup>
              <col className="w-12" />
              <col className="w-[110px]" />
              <col className="w-[120px]" />
              <col className="w-[120px]" />
              <col className="w-[110px]" />
              <col className="w-[150px]" />
              <col />
              <col className="w-[120px]" />
            </colgroup>
            <thead className="bg-[#F8FAFC] text-xs font-bold tracking-wide text-[#526575]">
              <tr>
                <th scope="col" className="h-12 border-b-2 border-[#DCECF8] px-4 text-center">#</th>
                <th scope="col" className="h-12 border-b-2 border-[#DCECF8] px-4">TÊN PHÒNG</th>
                <th scope="col" className="h-12 border-b-2 border-[#DCECF8] px-4">LOẠI PHÒNG</th>
                <th scope="col" className="h-12 border-b-2 border-[#DCECF8] px-4 text-right">ĐƠN GIÁ</th>
                <th scope="col" className="h-12 border-b-2 border-[#DCECF8] px-4 text-center">SỨC CHỨA</th>
                <th scope="col" className="h-12 border-b-2 border-[#DCECF8] px-4 text-center">TRẠNG THÁI</th>
                <th scope="col" className="h-12 border-b-2 border-[#DCECF8] px-4">KHÁCH / GHI CHÚ</th>
                <th scope="col" className="h-12 border-b-2 border-[#DCECF8] px-4 text-center">THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {filteredRooms.map((room, index) => (
                <tr
                  key={room.id}
                  className={`h-12 border-b border-[#DCECF8] ${
                    index % 2 === 1 ? 'bg-[#DCECF8]' : 'bg-white'
                  }`}
                >
                  <td className="px-4 text-center text-[#526575]">{index + 1}</td>
                  <td className="truncate px-4 text-[#526575]">{room.number}</td>
                  <td className="px-4 text-[#526575]">{room.type}</td>
                  <td className="px-4 text-right text-[#526575]">
                    {formatPrice(room.price)}
                  </td>
                  <td className="px-4 text-center text-[#526575]">{room.capacity}</td>
                  <td className="px-4 text-center">
                    <span
                      className="inline-flex h-[25px] items-center justify-center whitespace-nowrap rounded-full px-2.5 text-sm text-white"
                      style={{ backgroundColor: roomStatusColors[room.status] }}
                    >
                      {room.status}
                    </span>
                  </td>
                  <td className="max-w-0 truncate px-4 text-[#526575]">{room.note}</td>
                  <td className="px-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        aria-label={`Xem phòng ${room.number}`}
                        title="Xem chi tiết"
                        onClick={() => setViewingRoom(room)}
                        className="rounded p-1 text-[#64748B] hover:bg-[#E8F5FF]"
                      >
                        <FiEye aria-hidden="true" className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        aria-label={`Sửa phòng ${room.number}`}
                        title="Sửa phòng"
                        onClick={() => setRoomDialog({ room })}
                        className="rounded p-1 text-[#0D8BEA] hover:bg-[#E8F5FF]"
                      >
                        <FiEdit2 aria-hidden="true" className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        aria-label={`Xóa phòng ${room.number}`}
                        title="Xóa phòng"
                        onClick={() => setDeletingRoom(room)}
                        className="rounded p-1 text-[#D9534F] hover:bg-[#F7FBFF]"
                      >
                        <FiTrash2 aria-hidden="true" className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredRooms.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-10 text-center text-sm text-[#526575]"
                  >
                    Không tìm thấy phòng phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col items-center gap-1 px-4 py-2">
          <nav aria-label="Phân trang" className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Trang trước"
              disabled
              className="flex h-8 w-8 items-center justify-center rounded text-[#526575] disabled:opacity-50"
            >
              <FiChevronLeft aria-hidden="true" className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-current="page"
              className="h-8 w-8 bg-[#0D8BEA] text-sm font-semibold text-white"
            >
              1
            </button>
            {[2, 3].map((page) => (
              <button
                key={page}
                type="button"
                className="h-8 w-8 rounded text-sm text-[#526575] hover:bg-[#E8F5FF]"
              >
                {page}
              </button>
            ))}
            <span className="flex h-8 w-8 items-center justify-center text-sm text-[#526575]">
              …
            </span>
            <button
              type="button"
              className="h-8 w-8 rounded text-sm text-[#526575] hover:bg-[#E8F5FF]"
            >
              10
            </button>
            <button
              type="button"
              aria-label="Trang tiếp theo"
              className="flex h-8 w-8 items-center justify-center rounded text-[#526575] hover:bg-[#E8F5FF]"
            >
              <FiChevronRight aria-hidden="true" className="h-4 w-4" />
            </button>
          </nav>
          <p className="text-center text-xs text-[#526575]">
            Hiển thị 1-10 trên tổng 100 phòng
          </p>
        </div>
      </section>

      {roomDialog && (
        <RoomFormDialog
          key={roomDialog.room?.id ?? 'new'}
          room={roomDialog.room}
          onClose={() => setRoomDialog(null)}
          onSave={saveRoom}
        />
      )}
      {deletingRoom && (
        <DeleteRoomDialog
          room={deletingRoom}
          onClose={() => setDeletingRoom(null)}
          onConfirm={confirmDelete}
        />
      )}
      {viewingRoom && (
        <RoomDetailDrawer
          key={viewingRoom.id}
          room={viewingRoom}
          onClose={() => setViewingRoom(null)}
          onEdit={(room) => setRoomDialog({ room })}
        />
      )}
    </section>
  );
}

export default RoomPage;
