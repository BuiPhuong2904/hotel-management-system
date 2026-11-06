import { useMemo, useState } from 'react';
import {
  FiChevronLeft,
  FiChevronRight,
  FiEdit2,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiTrash2,
} from 'react-icons/fi';

const initialServices = [
  {
    id: 1,
    name: 'Giặt ủi áo sơ mi',
    unit: 'Món',
    price: 35000,
    status: 'Đang kinh doanh',
    note: 'Giặt ướt, sấy hơi nước chuyên dụng và ủi phẳng',
  },
  {
    id: 2,
    name: 'Nước suối',
    unit: 'Chai',
    price: 30000,
    status: 'Đang kinh doanh',
    note: 'Không có',
  },
  {
    id: 3,
    name: 'Buffet sáng',
    unit: 'Suất',
    price: 250000,
    status: 'Đang kinh doanh',
    note: 'Phục vụ từ 06:00 - 10:00 tại Nhà hàng',
  },
  {
    id: 4,
    name: 'Gói Minibar Đặc biệt',
    unit: 'Gói/Set',
    price: 480000,
    status: 'Tạm ngừng',
    note: 'Gồm: Rượu vang & Snack',
  },
  {
    id: 5,
    name: 'Check-in sớm/Check-out muộn (Gói 2 giờ)',
    unit: 'Gói 2 giờ',
    price: 150000,
    status: 'Đang kinh doanh',
    note: 'Gia hạn thời gian sử dụng phòng trước 14:00…',
  },
];

const statuses = ['Đang kinh doanh', 'Tạm ngừng'];
const statusColors = {
  'Đang kinh doanh': '#2E8B57',
  'Tạm ngừng': '#526575',
};

const emptyService = {
  name: '',
  unit: '',
  price: '150000',
  status: 'Đang kinh doanh',
  note: '',
};

const modalAssets = {
  add: {
    close: '/images/service-modal-add-close.svg',
    chevron: '/images/service-modal-add-chevron.svg',
    submit: '/images/service-modal-add-submit.svg',
  },
  edit: {
    close: '/images/service-modal-edit-close.svg',
    chevron: '/images/service-modal-edit-chevron.svg',
    submit: '/images/service-modal-edit-submit.svg',
  },
};

const formatPrice = (price) =>
  new Intl.NumberFormat('vi-VN').format(price);

function ServiceDialog({ service, onClose, onSave }) {
  const isEditing = Boolean(service);
  const assets = isEditing ? modalAssets.edit : modalAssets.add;
  const [form, setForm] = useState(
    service
      ? {
          name: service.name,
          unit: service.unit,
          price: String(service.price),
          status: service.status,
          note: service.note,
        }
      : { ...emptyService },
  );

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSave({
      ...form,
      name: form.name.trim(),
      unit: form.unit.trim(),
      note: form.note.trim() || 'Không có',
      price: Number(form.price),
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.2)] p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="service-dialog-title"
        onSubmit={handleSubmit}
        className="flex max-h-[calc(100vh-2rem)] w-full max-w-[600px] min-h-[537px] flex-col gap-6 overflow-y-auto rounded-xl bg-white px-6 py-5 shadow-[0_8px_12px_rgba(0,0,0,0.1)]"
      >
        <div className="flex h-[34px] shrink-0 items-center justify-between border-b border-[#DCECF8]">
          <h2
            id="service-dialog-title"
            className="text-2xl font-bold leading-[normal] text-[#075A9C]"
          >
            {isEditing ? 'Chỉnh Sửa Dịch Vụ' : 'Thêm Dịch Vụ Mới'}
          </h2>
          <button
            type="button"
            aria-label="Đóng"
            onClick={onClose}
            className="flex h-6 w-6 shrink-0 items-center justify-center"
          >
            <img src={assets.close} alt="" />
          </button>
        </div>

        <div className="flex w-full flex-col gap-4">
          <label className="flex w-full flex-col gap-2 text-sm font-bold leading-[19px] text-[#075A9C]">
            TÊN DỊCH VỤ *
            <input
              autoFocus
              required
              name="name"
              value={form.name}
              onChange={updateField}
              placeholder="Nhập thông tin..."
              className="h-10 w-full rounded-lg border border-[#DCECF8] bg-white px-4 py-2 text-sm font-normal leading-[normal] text-[#526575] outline-none placeholder:text-[rgba(82,101,117,0.8)] focus:border-[#0D8BEA]"
            />
          </label>

          <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
            <label className="flex min-w-0 flex-col gap-2 text-sm font-bold leading-[19px] text-[#075A9C]">
              ĐƠN VỊ TÍNH *
              <input
                required
                name="unit"
                value={form.unit}
                onChange={updateField}
                placeholder="Nhập thông tin..."
                className="h-10 w-full rounded-lg border border-[#DCECF8] bg-white px-4 py-2 text-sm font-normal leading-[normal] text-[#526575] outline-none placeholder:text-[rgba(82,101,117,0.8)] focus:border-[#0D8BEA]"
              />
            </label>
            <label className="flex min-w-0 flex-col gap-2 text-sm font-bold leading-[19px] text-[#075A9C]">
              ĐƠN GIÁ
              <span className="flex h-10 w-full items-center justify-between rounded-lg border border-[#DCECF8] bg-white px-4 py-2 text-sm font-normal leading-[normal] text-[#526575]">
                <input
                  required
                  type="text"
                  inputMode="numeric"
                  name="price"
                  value={
                    form.price === ''
                      ? ''
                      : formatPrice(Number(form.price))
                  }
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

          <label className="flex min-h-[69px] w-full flex-col gap-2 text-sm font-bold leading-[19px] text-[#075A9C]">
            TRẠNG THÁI KHỞI TẠO
            <span className="relative flex h-10 w-full items-center rounded-lg border border-[#DCECF8] bg-white">
              <select
                name="status"
                value={form.status}
                onChange={updateField}
                className="h-full w-full appearance-none rounded-lg bg-transparent px-4 py-2 pr-12 text-sm font-normal leading-[normal] text-[#526575] outline-none"
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <img
                src={assets.chevron}
                alt=""
                className="pointer-events-none absolute right-4"
              />
            </span>
          </label>

          <label className="flex w-full flex-col gap-2 text-sm font-bold leading-[19px] text-[#075A9C]">
            GHI CHÚ
            <textarea
              name="note"
              rows={2}
              value={form.note}
              onChange={updateField}
              placeholder="VD: Cửa sổ hướng hồ bơi, giường King-size, trang bị minibar cao cấp"
              className="h-20 w-full resize-none rounded-lg border border-[#DCECF8] bg-white px-4 py-2 text-sm font-normal leading-[normal] text-[#526575] outline-none placeholder:text-[#526575] focus:border-[#0D8BEA]"
            />
          </label>
        </div>

        <div className="flex w-full shrink-0 items-center justify-end gap-4 border-t border-[#DCECF8] pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 items-center justify-center rounded-lg border border-[#DCECF8] bg-[#F7FBFF] px-4 py-2.5 text-sm font-bold leading-[normal] text-[#526575]"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            className="flex h-10 items-center justify-center gap-2 rounded-lg bg-[#0D8BEA] px-4 py-2.5 text-sm font-bold leading-[normal] text-white"
          >
            <img src={assets.submit} alt="" />
            {isEditing ? 'Lưu dịch vụ' : 'Thêm dịch vụ'}
          </button>
        </div>
      </form>
    </div>
  );
}

function ServicePage() {
  const [services, setServices] = useState(initialServices);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tất cả');
  const [page, setPage] = useState(1);
  const [editingService, setEditingService] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deletingService, setDeletingService] = useState(null);
  const pageSize = 10;

  const filteredServices = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('vi');

    return services.filter((service) => {
      const matchesSearch =
        !query ||
        `${service.name} ${service.unit} ${service.note}`
          .toLocaleLowerCase('vi')
          .includes(query);
      const matchesStatus =
        statusFilter === 'Tất cả' || service.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [search, services, statusFilter]);

  const pageCount = Math.max(1, Math.ceil(filteredServices.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visibleServices = filteredServices.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('Tất cả');
    setPage(1);
  };

  const updateStatusFilter = (status) => {
    setStatusFilter(status);
    setPage(1);
  };

  const openNewService = () => {
    setEditingService(null);
    setDialogOpen(true);
  };

  const openEditService = (service) => {
    setEditingService(service);
    setDialogOpen(true);
  };

  const saveService = (serviceData) => {
    if (editingService) {
      setServices((currentServices) =>
        currentServices.map((service) =>
          service.id === editingService.id
            ? { ...service, ...serviceData }
            : service,
        ),
      );
    } else {
      setServices((currentServices) => [
        ...currentServices,
        { id: Date.now(), ...serviceData },
      ]);
    }

    setDialogOpen(false);
    setEditingService(null);
  };

  const deleteService = () => {
    if (!deletingService) {
      return;
    }

    setServices((currentServices) =>
      currentServices.filter((service) => service.id !== deletingService.id),
    );
    setDeletingService(null);
  };

  const exportServices = () => {
    const rows = [
      ['Tên dịch vụ', 'Đơn vị tính', 'Đơn giá', 'Trạng thái', 'Ghi chú'],
      ...filteredServices.map((service) => [
        service.name,
        service.unit,
        service.price,
        service.status,
        service.note,
      ]),
    ];
    const csv = `\uFEFF${rows
      .map((row) =>
        row
          .map((cell) => `"${String(cell).replaceAll('"', '""')}"`)
          .join(','),
      )
      .join('\n')}`;
    const url = URL.createObjectURL(
      new Blob([csv], { type: 'text/csv;charset=utf-8' }),
    );
    const link = document.createElement('a');
    link.href = url;
    link.download = 'danh-muc-dich-vu.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="flex w-full min-w-0 flex-col gap-6">
      <section
        aria-label="Tìm kiếm và lọc dịch vụ"
        className="grid min-w-0 gap-4 rounded-xl border border-[#DCECF8] bg-white p-4 sm:p-[17px] xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center"
      >
        <div className="flex min-w-0 flex-col gap-3">
          <label className="relative block w-full max-w-[437px]">
            <FiSearch
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#526575]"
            />
            <input
              type="search"
              aria-label="Tìm tên dịch vụ"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Tìm tên dịch vụ,..."
              className="h-10 w-full rounded-lg border border-[#DCECF8] bg-[#F8FAFC] pl-9 pr-3 text-sm text-[#526575] outline-none placeholder:text-[#526575] focus:border-[#0D8BEA]"
            />
          </label>

          <div className="flex min-w-0 flex-wrap items-center gap-1">
            <div className="flex min-h-10 min-w-0 flex-wrap items-center gap-1 rounded-lg border border-[#DCECF8] bg-[#F7FBFF] p-1">
              <span className="shrink-0 px-2 text-xs font-semibold text-[#64748B]">
                TRẠNG THÁI:
              </span>
              <button
                type="button"
                aria-pressed={statusFilter === 'Tất cả'}
                onClick={() => updateStatusFilter('Tất cả')}
                className={`rounded px-2 py-1 text-xs font-semibold ${
                  statusFilter === 'Tất cả'
                    ? 'bg-[#0D8BEA] text-white'
                    : 'text-[#526575] hover:bg-[#E8F5FF]'
                }`}
              >
                Tất cả
              </button>
              {statuses.map((status) => (
                <button
                  key={status}
                  type="button"
                  aria-pressed={statusFilter === status}
                  onClick={() => updateStatusFilter(status)}
                  className={`flex items-center gap-1 rounded px-2 py-1 text-xs transition-colors ${
                    statusFilter === status
                      ? 'bg-[#E8F5FF] font-semibold text-[#075A9C]'
                      : 'text-[#526575] hover:bg-[#E8F5FF]'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: statusColors[status] }}
                  />
                  {status}
                </button>
              ))}
            </div>
            <button
              type="button"
              aria-label="Đặt lại bộ lọc"
              onClick={resetFilters}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#DCECF8] bg-white text-[#526575] hover:bg-[#F7FBFF]"
            >
              <FiRefreshCw aria-hidden="true" className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-start gap-3 xl:justify-end">
          <button
            type="button"
            onClick={exportServices}
            className="flex h-10 items-center justify-center gap-2 rounded-lg border border-[#DCECF8] bg-[#F7FBFF] px-4 text-sm font-bold text-[#0D8BEA] hover:bg-[#E8F5FF]"
          >
            <FiPlus aria-hidden="true" className="h-4 w-4" />
            Xuất Excel
          </button>
          <button
            type="button"
            onClick={openNewService}
            className="flex h-10 items-center justify-center gap-2 rounded-lg bg-[#0D8BEA] px-4 text-sm font-bold text-white hover:bg-[#075A9C]"
          >
            <FiPlus aria-hidden="true" className="h-4 w-4" />
            Thêm dịch vụ mới
          </button>
        </div>
      </section>

      <section
        aria-label="Danh mục dịch vụ"
        className="min-w-0 rounded-xl border border-[#DCECF8] bg-white p-px shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#DCECF8] px-4 py-3 sm:px-5">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-lg font-bold text-[#075A9C]">
              Danh mục dịch vụ
            </h1>
            <span className="rounded-md border border-[#DCECF8] bg-[#E8F5FF] px-2 py-0.5 text-xs text-[#0D8BEA]">
              {filteredServices.length} kết quả
            </span>
          </div>
          <span className="text-xs text-[#526575]">
            Sắp xếp: Thứ tự tăng dần
          </span>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[1084px]">
            <div
              role="row"
              className="grid grid-cols-[48px_minmax(300px,320px)_96px_120px_160px_minmax(220px,1fr)_120px] bg-[#F8FAFC]"
            >
              {[
                '#',
                'TÊN DỊCH VỤ',
                'ĐƠN VỊ TÍNH',
                'ĐƠN GIÁ',
                'TRẠNG THÁI',
                'GHI CHÚ',
                'THAO TÁC',
              ].map((heading) => (
                <div
                  key={heading}
                  role="columnheader"
                  className="flex h-12 items-center border-b-2 border-[#DCECF8] px-2 text-xs font-bold text-[#526575] first:justify-center first:px-1 [&:nth-child(4)]:justify-end [&:nth-child(5)]:justify-center [&:nth-child(7)]:justify-center"
                >
                  {heading}
                </div>
              ))}
            </div>

            {visibleServices.length > 0 ? (
              visibleServices.map((service, index) => (
                <div
                  key={service.id}
                  role="row"
                  className={`grid grid-cols-[48px_minmax(300px,320px)_96px_120px_160px_minmax(220px,1fr)_120px] transition-colors ${
                    index % 2 === 1 ? 'bg-[#DCECF8]' : 'bg-white'
                  } hover:bg-[#E8F5FF]`}
                >
                  <div
                    role="cell"
                    className="flex min-h-12 items-center justify-center border-b border-[#DCECF8] px-2 text-sm text-[#526575]"
                  >
                    {(currentPage - 1) * pageSize + index + 1}
                  </div>
                  <div
                    role="cell"
                    className="flex min-h-12 min-w-0 items-center border-b border-[#DCECF8] px-2 text-sm text-[#526575]"
                  >
                    <span className="truncate" title={service.name}>
                      {service.name}
                    </span>
                  </div>
                  <div
                    role="cell"
                    className="flex min-h-12 items-center border-b border-[#DCECF8] px-2 text-sm text-[#526575]"
                  >
                    {service.unit}
                  </div>
                  <div
                    role="cell"
                    className="flex min-h-12 items-center justify-end border-b border-[#DCECF8] px-4 text-sm text-[#526575]"
                  >
                    {formatPrice(service.price)}
                  </div>
                  <div
                    role="cell"
                    className="flex min-h-12 items-center justify-center border-b border-[#DCECF8] px-2"
                  >
                    <span
                      className="whitespace-nowrap rounded-full px-2.5 py-1 text-xs text-white"
                      style={{ backgroundColor: statusColors[service.status] }}
                    >
                      {service.status}
                    </span>
                  </div>
                  <div
                    role="cell"
                    className="flex min-h-12 min-w-0 items-center border-b border-[#DCECF8] px-4 text-sm text-[#526575]"
                  >
                    <span className="truncate" title={service.note}>
                      {service.note}
                    </span>
                  </div>
                  <div
                    role="cell"
                    className="flex min-h-12 items-center justify-center gap-2 border-b border-[#DCECF8] px-3"
                  >
                    <button
                      type="button"
                      aria-label={`Sửa ${service.name}`}
                      onClick={() => openEditService(service)}
                      className="flex h-8 w-8 items-center justify-center rounded text-[#0D8BEA] hover:bg-[#E8F5FF]"
                    >
                      <FiEdit2 aria-hidden="true" className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Xóa ${service.name}`}
                      onClick={() => setDeletingService(service)}
                      className="flex h-8 w-8 items-center justify-center rounded text-[#D9534F] hover:bg-[#E8F5FF]"
                    >
                      <FiTrash2 aria-hidden="true" className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="px-4 py-10 text-center text-sm text-[#526575]">
                Không tìm thấy dịch vụ phù hợp.
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center gap-1 px-4 py-3 text-xs text-[#526575] sm:flex-row sm:justify-center sm:gap-4">
          <nav aria-label="Phân trang dịch vụ" className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Trang trước"
              disabled={currentPage === 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className="flex h-8 w-8 items-center justify-center rounded disabled:opacity-40 enabled:hover:bg-[#E8F5FF]"
            >
              <FiChevronLeft aria-hidden="true" className="h-4 w-4" />
            </button>
            {Array.from({ length: pageCount }, (_, index) => index + 1)
              .slice(
                Math.max(0, Math.min(currentPage - 2, pageCount - 3)),
                Math.max(0, Math.min(currentPage - 2, pageCount - 3)) + 3,
              )
              .map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  aria-current={currentPage === pageNumber ? 'page' : undefined}
                  onClick={() => setPage(pageNumber)}
                  className={`h-8 min-w-8 rounded px-2 ${
                    currentPage === pageNumber
                      ? 'bg-[#0D8BEA] font-bold text-white'
                      : 'hover:bg-[#E8F5FF]'
                  }`}
                >
                  {pageNumber}
                </button>
              ))}
            {pageCount > 3 && (
              <>
                <span className="px-1">…</span>
                <button
                  type="button"
                  aria-current={currentPage === pageCount ? 'page' : undefined}
                  onClick={() => setPage(pageCount)}
                  className={`h-8 min-w-8 rounded px-2 ${
                    currentPage === pageCount
                      ? 'bg-[#0D8BEA] font-bold text-white'
                      : 'hover:bg-[#E8F5FF]'
                  }`}
                >
                  {pageCount}
                </button>
              </>
            )}
            <button
              type="button"
              aria-label="Trang sau"
              disabled={currentPage === pageCount}
              onClick={() =>
                setPage((current) => Math.min(pageCount, current + 1))
              }
              className="flex h-8 w-8 items-center justify-center rounded disabled:opacity-40 enabled:hover:bg-[#E8F5FF]"
            >
              <FiChevronRight aria-hidden="true" className="h-4 w-4" />
            </button>
          </nav>
          <p>
            Hiển thị{' '}
            {filteredServices.length === 0
              ? '0'
              : `${(currentPage - 1) * pageSize + 1}–${Math.min(
                  currentPage * pageSize,
                  filteredServices.length,
                )}`}{' '}
            trên tổng {filteredServices.length} dịch vụ
          </p>
        </div>
      </section>

      {dialogOpen && (
        <ServiceDialog
          key={editingService?.id ?? 'new'}
          service={editingService}
          onClose={() => {
            setDialogOpen(false);
            setEditingService(null);
          }}
          onSave={saveService}
        />
      )}

      {deletingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.2)] p-4">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-service-title"
            className="flex w-full max-w-[400px] min-h-[190px] flex-col gap-6 rounded-xl bg-white p-6 shadow-[0_12px_16px_rgba(0,0,0,0.2)]"
          >
            <div className="flex w-full flex-col gap-2">
              <h2
                id="delete-service-title"
                className="text-2xl font-bold leading-[normal] text-[#075A9C]"
              >
                Xóa {deletingService.name}?
              </h2>
              <p className="text-sm leading-[normal] text-[#526575]">
                Dịch vụ {deletingService.name} sẽ bị xóa khỏi danh sách. Hành
                động này không thể hoàn tác.
              </p>
            </div>
            <div className="flex w-full items-center justify-end gap-4">
              <button
                type="button"
                onClick={() => setDeletingService(null)}
                className="flex h-[39px] w-[84px] items-center justify-center rounded-lg border border-[#DCECF8] bg-[#F7FBFF] px-4 py-2 text-sm font-bold leading-[normal] text-[#526575]"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={deleteService}
                className="flex h-[35px] w-[113px] items-center justify-center rounded-lg bg-[#D9534F] px-4 py-2 text-sm font-bold leading-[normal] text-white"
              >
                Xóa dịch vụ
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default ServicePage;
