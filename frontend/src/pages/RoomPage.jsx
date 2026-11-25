import { useEffect, useMemo, useState } from 'react';
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

import { createRoomAPI, deleteRoomAPI, getRoomsAPI, getRoomTypesAPI, updateRoomAPI, updateRoomStatusAPI } from '../services/roomService';

const labels = { Available: 'Sẵn sàng', Occupied: 'Đang lưu trú', Cleaning: 'Đang dọn dẹp', Maintenance: 'Bảo trì' };
const statusCode = (label) => Object.keys(labels).find((code) => labels[code] === label);
const toRoom = (row) => ({
  id: row.RoomID, number: row.RoomNumber, type: row.RoomTypeID,
  floor: /^([0-9]+)[0-9]{2}$/.test(row.RoomNumber) ? 'T' + row.RoomNumber.slice(0, -2) : '',
  price: Number(row.BasePrice), capacity: row.MaxGuests, note: row.Note || '', status: labels[row.Status],
});

const roomStatuses = [
  { value: 'Đang lưu trú', subtitle: 'Có khách', color: '#0D8BEA', text: '#0D8BEA', subtitleColor: '#0D8BEA' },
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

const cards = [
  ['TỔNG SỐ PHÒNG', null, '#075A9C'], ['CÒN TRỐNG', 'Available', '#2E8B57'],
  ['ĐANG LƯU TRÚ', 'Occupied', '#0D8BEA'], ['CẦN DỌN DẸP', 'Cleaning', '#D97706'],
  ['BẢO TRÌ', 'Maintenance', '#D9534F'],
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
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
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

function RoomFormDialog({ room, types, busy, error, onClose, onSave }) {
  const isEditing = Boolean(room);
  const [form, setForm] = useState(
    room
      ? {
          number: room.number,
          type: room.type,
          status: room.status,
          note: room.note,
        }
      : {
          number: '',
          type: '',
          status: 'Sẵn sàng',
          note: '',
        },
  );

  const selectedType = types.find((type) => type.RoomTypeID === form.type);
  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const number = form.number.trim();

    onSave({
      number,
      type: form.type,
      status: form.status,
      note: form.note.trim(),
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
              maxLength={10}
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
                {types.map((type) => (
                  <option key={type.RoomTypeID} value={type.RoomTypeID}>
                    {type.TypeName}
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
                value={selectedType?.MaxGuests ?? ''}
                readOnly
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
                  value={selectedType ? formatPrice(selectedType.BasePrice) : ''}
                  readOnly
                  aria-label="ĐƠN GIÁ"
                  className="min-w-0 flex-1 bg-transparent outline-none"
                />
                <span className="ml-2 shrink-0">VNĐ</span>
              </span>
            </label>
          </div>

          {!isEditing && <RoomStatusOptions
            isEditing={isEditing}
            value={form.status}
            onChange={(status) => setForm((current) => ({ ...current, status }))}
          />}

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

        {error && <p role="alert">{error}</p>}
        <footer className="mt-auto flex w-full shrink-0 items-center justify-end gap-4 border-t border-[#DCECF8] pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-[84px] items-center justify-center rounded-lg border border-[#DCECF8] bg-[#F7FBFF] px-4 py-2.5 text-sm font-bold text-[#526575]"
          >
            Hủy bỏ
          </button>
          <button
            type="submit" disabled={busy}
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

function DeleteRoomDialog({ room, busy, error, onClose, onConfirm }) {
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
        {error && <p role="alert">{error}</p>}
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
            disabled={busy}
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
  const [rooms, setRooms] = useState([]);
  const [floor, setFloor] = useState('all');
  const [roomType, setRoomType] = useState('all');
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [roomDialog, setRoomDialog] = useState(null);
  const [deletingRoom, setDeletingRoom] = useState(null);
  const [viewingRoom, setViewingRoom] = useState(null);

  const [types, setTypes] = useState([]);
  const [allRooms, setAllRooms] = useState([]);
  const [revision, refresh] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [readError, setReadError] = useState('');
  const role = sessionStorage.getItem('roomToken') && sessionStorage.getItem('roomRole');
  const admin = role === 'Admin';
  const canChangeStatus = admin || role === 'Staff';

  useEffect(() => {
    let active = true;
    const params = {};
    if (roomType !== 'all') params.roomTypeId = roomType;
    if (status !== 'all') params.status = statusCode(status);
    async function load() {
      setLoading(true);
      setReadError('');
      try {
        const all = getRoomsAPI();
        const [full, filtered, catalog] = await Promise.all([
          all, Object.keys(params).length ? getRoomsAPI(params) : all, getRoomTypesAPI(),
        ]);
        if (active) {
          setRooms(filtered.data.map(toRoom));
          setAllRooms(full.data.map(toRoom));
          setTypes(catalog.data);
        }
      } catch (err) {
        if (active) setReadError(err.response?.data?.message || 'Không tải được danh sách phòng.');
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [roomType, status, revision]);
  const summaryCards = cards.map(([title, code, color]) => {
    const value = code ? allRooms.filter((r) => r.status === labels[code]).length : allRooms.length;
    return { title, color, value, progress: code && allRooms.length ? Math.round(value * 100 / allRooms.length) : undefined };
  });

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
    setRoomType('all');
    setStatus('all');
    setSearch('');
  };

  async function mutate(action, onSuccess) {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      await action();
      onSuccess?.();
      refresh((v) => v + 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể lưu thay đổi.');
      if (err.response?.status === 401) {
        sessionStorage.removeItem('roomToken');
        sessionStorage.removeItem('roomRole');
        setRoomDialog(null);
        setDeletingRoom(null);
      }
    } finally {
      setBusy(false);
    }
  }

  const saveRoom = (form) => {
    const body = { RoomNumber: form.number, RoomTypeID: form.type, Note: form.note };
    return mutate(() => roomDialog.room
      ? updateRoomAPI(roomDialog.room.id, body)
      : createRoomAPI({ ...body, Status: statusCode(form.status) }), () => setRoomDialog(null));
  };

  const confirmDelete = () => mutate(() => deleteRoomAPI(deletingRoom.id), () => setDeletingRoom(null));

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
      {!canChangeStatus && <a className="text-blue-700 underline" href="/login?redirect=/room-management">Đăng nhập để quản lý phòng</a>}
      {loading && <p role="status">Đang tải phòng…</p>}
      {readError && <p role="alert">{readError} <button onClick={() => refresh((v) => v + 1)}>Thử lại</button></p>}
      {error && !roomDialog && !deletingRoom && <p role="alert">{error}</p>}
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
                ...[...new Set(allRooms.map((room) => room.floor).filter(Boolean))].map((value) => ({
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
                ...types.map(({ RoomTypeID: value, TypeName }) => ({
                  label: TypeName,
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
              disabled={!admin || busy || !types.length}
              onClick={() => { setError(''); setRoomDialog({ room: null }); }}
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
              <col className="w-[135px]" />
              <col className="w-[135px]" />
              <col className="w-[120px]" />
              <col className="w-[115px]" />
              <col className="w-[155px]" />
              <col />
              <col className="w-[120px]" />
            </colgroup>
            <thead className="bg-[#F8FAFC] text-sm font-bold tracking-wide text-[#526575]">
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
              {!loading && !readError && filteredRooms.map((room, index) => (
                <tr
                  key={room.id}
                  className={`h-12 border-b border-[#DCECF8] transition-colors hover:bg-[#F7FBFF] ${
                    viewingRoom?.id === room.id ? 'bg-[#E8F5FF]' : 'bg-white'
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
                    <select aria-label={`Trạng thái phòng ${room.number}`} disabled={!canChangeStatus || busy || loading}
                      value={statusCode(room.status)} onChange={(event) => {
                        const next = event.target.value;
                        mutate(() => updateRoomStatusAPI(room.id, next));
                      }}>
                      {Object.entries(labels).map(([code, label]) => <option key={code} value={code}>{label}</option>)}
                    </select>
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
                        disabled={!admin || busy}
                        onClick={() => { setError(''); setRoomDialog({ room }); }}
                        className="rounded p-1 text-[#0D8BEA] hover:bg-[#E8F5FF]"
                      >
                        <FiEdit2 aria-hidden="true" className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        aria-label={`Xóa phòng ${room.number}`}
                        title="Xóa phòng"
                        disabled={!admin || busy}
                        onClick={() => { setError(''); setDeletingRoom(room); }}
                        className="rounded p-1 text-[#D9534F] hover:bg-[#F7FBFF]"
                      >
                        <FiTrash2 aria-hidden="true" className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && !readError && filteredRooms.length === 0 && (
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

<div className="flex flex-col items-center gap-1 px-4 py-3 text-xs text-[#526575]">
          <nav aria-label="Phân trang danh sách phòng" className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Trang trước"
              disabled
              className="flex h-8 w-8 items-center justify-center rounded text-[#526575] disabled:opacity-40"
            >
              <FiChevronLeft aria-hidden="true" className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-current="page"
              className="h-8 min-w-8 rounded bg-[#0D8BEA] px-2 font-bold text-white"
            >
              1
            </button>
            <button
              type="button"
              aria-label="Trang tiếp theo"
              disabled
              className="flex h-8 w-8 items-center justify-center rounded text-[#526575] disabled:opacity-40"
            >
              <FiChevronRight aria-hidden="true" className="h-4 w-4" />
            </button>
          </nav>
          <p>
            {filteredRooms.length > 0
              ? `Hiển thị 1–${filteredRooms.length} trên tổng ${filteredRooms.length} phòng`
              : 'Không có phòng'}
          </p>
        </div>
      </section>

      {roomDialog && (
        <RoomFormDialog
          key={roomDialog.room?.id ?? 'new'}
          room={roomDialog.room} types={types} busy={busy} error={error}
          onClose={() => !busy && setRoomDialog(null)}
          onSave={saveRoom}
        />
      )}
      {deletingRoom && (
        <DeleteRoomDialog
          room={deletingRoom} busy={busy} error={error}
          onClose={() => !busy && setDeletingRoom(null)}
          onConfirm={confirmDelete}
        />
      )}
      {viewingRoom && (
        <RoomDetailDrawer
          key={viewingRoom.id}
          room={viewingRoom}
          onClose={() => setViewingRoom(null)}
          onEdit={admin ? (room) => { setError(''); setRoomDialog({ room }); } : undefined}
        />
      )}
    </section>
  );
}

export default RoomPage;
