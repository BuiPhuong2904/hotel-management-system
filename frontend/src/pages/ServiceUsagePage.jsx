import { useEffect, useMemo, useState } from 'react';
import {
  FiCalendar,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiDownload,
  FiEye,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiTrash2,
} from 'react-icons/fi';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import ToastNotification from '../components/ToastNotification';
import AddServiceUsageModal from '../components/AddServiceUsageModal';
import ServiceUsageDetailDrawer from '../components/ServiceUsageDetailDrawer';

const initialServiceUsages = [
  {
    id: 1,
    code: 'USG-001',
    room: 'P.101',
    customer: 'Nguyễn Văn A',
    service: 'Nước suối',
    date: '26/10/2026 09:15',
    quantity: 2,
    unit: 'chai',
    unitPrice: 30000,
    note: 'VD: Khách gọi thêm',
    createdBy: 'Lễ tân Nguyễn Văn A',
    isEditable: true,
  },
  {
    id: 2,
    code: 'USG-002',
    room: 'P.102',
    customer: 'Trần Thị B',
    service: 'Giặt ủi áo sơ mi',
    date: '26/10/2026 10:30',
    quantity: 3,
    unit: 'món',
    unitPrice: 35000,
    note: 'Không có',
    createdBy: 'Lễ tân Nguyễn Văn A',
    isEditable: false,
  },
  {
    id: 3,
    code: 'USG-003',
    room: 'P.103',
    customer: 'Lê Văn C',
    service: 'Buffet sáng',
    date: '27/10/2026 07:45',
    quantity: 1,
    unit: 'suất',
    unitPrice: 250000,
    note: 'Không có',
    createdBy: 'Lễ tân Nguyễn Văn A',
    isEditable: true,
  },
  {
    id: 4,
    code: 'USG-004',
    room: 'P.107',
    customer: 'Đỗ Xuân B',
    service: 'Check-in sớm/Check-out muộn (Gói 2 giờ)',
    date: '26/10/2026 12:00',
    quantity: 1,
    unit: 'gói',
    unitPrice: 150000,
    note: 'Không có',
    createdBy: 'Lễ tân Nguyễn Văn A',
    isEditable: false,
  },
  {
    id: 5,
    code: 'USG-005',
    room: 'P.110',
    customer: 'Lê Thị I',
    service: 'Nước suối',
    date: '26/10/2026 14:20',
    quantity: 1,
    unit: 'chai',
    unitPrice: 30000,
    note: 'Không có',
    createdBy: 'Lễ tân Nguyễn Văn A',
    isEditable: true,
  },
];

const pageSize = 5;

const formatPrice = (price) =>
  `${new Intl.NumberFormat('vi-VN').format(price)} đ`;

function ServiceUsagePage() {
  const [serviceUsages, setServiceUsages] = useState(initialServiceUsages);
  const [search, setSearch] = useState('');
  const [roomFilter, setRoomFilter] = useState('Tất cả phòng lưu trú');
  const [page, setPage] = useState(1);
  const [deletingService, setDeletingService] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedUsage, setSelectedUsage] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'error' });

  useEffect(() => {
    if (!toast.message) {
      return undefined;
    }

    const timeoutId = window.setTimeout(
      () => setToast({ message: '', type: 'error' }),
      3500,
    );
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  const rooms = useMemo(
    () => [
      ...new Map(
        serviceUsages.map(({ room, customer }) => [room, { room, customer }]),
      ).values(),
    ],
    [serviceUsages],
  );

  const filteredUsages = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('vi');

    return serviceUsages.filter((usage) => {
      const matchesSearch =
        !query ||
        `${usage.room} ${usage.customer} ${usage.service}`
          .toLocaleLowerCase('vi')
          .includes(query);
      const matchesRoom =
        roomFilter === 'Tất cả phòng lưu trú' || usage.room === roomFilter;

      return matchesSearch && matchesRoom;
    });
  }, [roomFilter, search, serviceUsages]);

  const pageCount = Math.max(1, Math.ceil(filteredUsages.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visibleUsages = filteredUsages.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const resetFilters = () => {
    setSearch('');
    setRoomFilter('Tất cả phòng lưu trú');
    setPage(1);
  };

  const requestDelete = (usage) => {
    if (usage.isEditable) {
      setDeletingService(usage);
      return;
    }

    setToast({
      message: 'Không thể xóa dịch vụ thuộc hóa đơn đã đóng',
      type: 'error',
    });
  };

  const confirmDelete = () => {
    if (!deletingService) {
      return;
    }

    setServiceUsages((currentUsages) =>
      currentUsages.filter((usage) => usage.id !== deletingService.id),
    );
    setSelectedUsage((currentUsage) =>
      currentUsage?.id === deletingService.id ? null : currentUsage,
    );
    setDeletingService(null);
  };

  const addServiceUsages = ({ room, customer, note, items }) => {
    const date = new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
      .format(new Date())
      .replace(',', '');

    setServiceUsages((currentUsages) => {
      const nextCode = Math.max(
        0,
        ...currentUsages.map((usage) =>
          Number(usage.code?.replace('USG-', '') || 0),
        ),
      );
      const timestamp = Date.now();

      return [
        ...items.map((item, index) => ({
          ...item,
          id: timestamp + index,
          code: `USG-${String(nextCode + index + 1).padStart(3, '0')}`,
          room,
          customer,
          date,
          note,
          createdBy: 'Lễ tân Nguyễn Văn A',
          isEditable: true,
        })),
        ...currentUsages,
      ];
    });
    setPage(1);
    setAddModalOpen(false);
    setToast({ message: 'Ghi nhận dịch vụ thành công', type: 'success' });
  };

  const exportUsages = () => {
    const rows = [
      [
        'Phòng',
        'Khách hàng',
        'Dịch vụ',
        'Thời gian',
        'Số lượng',
        'Đơn giá',
        'Thành tiền',
      ],
      ...filteredUsages.map((usage) => [
        usage.room,
        usage.customer,
        usage.service,
        usage.date,
        `${usage.quantity} ${usage.unit}`,
        usage.unitPrice,
        usage.quantity * usage.unitPrice,
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
    link.download = 'dich-vu-phat-sinh.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="flex w-full min-w-0 flex-col gap-6">
      <section
        aria-label="Thống kê dịch vụ phát sinh"
        className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <article className="flex min-h-[136px] flex-col gap-2 rounded-xl border border-[#DCECF8] bg-white p-[17px] shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
          <h2 className="text-sm font-bold text-[#0D8BEA]">
            TỔNG LƯỢT GHI NHẬN
          </h2>
          <div className="pt-2">
            <p className="flex items-baseline gap-2 text-xl font-bold text-[#0D8BEA]">
              24 <span className="text-xs font-normal text-[#526575]">lượt</span>
            </p>
            <p className="mt-2 text-xs text-[#526575]">
              So với hôm qua: <span className="text-[#2E8B57]">+15%</span>
            </p>
          </div>
        </article>
        <article className="flex min-h-[136px] flex-col gap-2 rounded-xl border border-[#DCECF8] bg-white p-[17px] shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
          <h2 className="text-sm font-bold text-[#075A9C]">
            DOANH THU DỊCH VỤ
          </h2>
          <div className="pt-2">
            <p className="text-xl font-bold text-[#075A9C]">1.085.000 đ</p>
            <p className="mt-2 text-xs text-[#526575]">
              Đã cộng dồn vào hóa đơn phòng
            </p>
          </div>
        </article>
        <article className="flex min-h-[136px] flex-col gap-2 rounded-xl border border-[#DCECF8] bg-white p-[17px] shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
          <h2 className="text-sm font-bold text-[#2E8B57]">
            DỊCH VỤ PHỔ BIẾN NHẤT
          </h2>
          <div className="pt-2">
            <p className="text-xl font-bold text-[#2E8B57]">Nước suối</p>
            <p className="mt-2 text-xs text-[#526575]">
              12 lượt gọi trong ngày
            </p>
          </div>
        </article>
        <article className="flex min-h-[136px] flex-col gap-2 rounded-xl border border-[#DCECF8] bg-white p-[17px] shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
          <h2 className="text-sm font-bold text-[#D97706]">
            SỐ PHÒNG PHÁT SINH
          </h2>
          <div className="pt-2">
            <p className="flex items-baseline gap-2 text-xl font-bold text-[#D97706]">
              08 <span className="text-xs font-normal text-[#526575]">phòng</span>
            </p>
            <p className="mt-2 text-xs text-[#526575]">
              Trên tổng số 36 phòng đang có khách
            </p>
          </div>
        </article>
      </section>

      <section
        aria-label="Tìm kiếm và lọc dịch vụ phát sinh"
        className="grid w-full min-w-0 gap-4 rounded-xl border border-[#DCECF8] bg-white p-4 sm:p-[17px] xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center"
      >
        <div className="flex min-w-0 flex-col gap-3">
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row">
            <label className="relative block min-w-0 flex-1">
              <FiSearch
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#526575]"
              />
              <input
                type="search"
                aria-label="Tìm theo khách hàng, phòng hoặc dịch vụ"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Tìm theo khách hàng, phòng..."
                className="h-10 w-full rounded-lg border border-[#DCECF8] bg-[#F7FBFF] pl-9 pr-3 text-xs text-[#526575] outline-none placeholder:text-[#526575] focus:border-[#0D8BEA]"
              />
            </label>
            <button
              type="button"
              aria-label="Đặt lại bộ lọc"
              onClick={resetFilters}
              className="flex h-10 w-10 shrink-0 items-center justify-center self-end rounded-lg border border-[#DCECF8] bg-white text-[#526575] transition-colors hover:bg-[#F7FBFF] sm:self-auto"
            >
              <FiRefreshCw aria-hidden="true" className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <label className="relative flex h-10 min-w-[192px] flex-1 items-center rounded-lg border border-[#DCECF8] bg-white sm:flex-none">
              <select
                aria-label="Lọc theo phòng"
                value={roomFilter}
                onChange={(event) => {
                  setRoomFilter(event.target.value);
                  setPage(1);
                }}
                className="h-full w-full appearance-none rounded-lg bg-transparent px-4 pr-10 text-sm text-[#526575] outline-none"
              >
                <option>Tất cả phòng lưu trú</option>
                {rooms.map(({ room }) => (
                  <option key={room} value={room}>
                    {room}
                  </option>
                ))}
              </select>
              <FiChevronDown
                aria-hidden="true"
                className="pointer-events-none absolute right-3 h-4 w-4 text-[#526575]"
              />
            </label>
            <label className="flex h-10 min-w-[192px] flex-1 items-center gap-2 rounded-lg border border-[#DCECF8] bg-white px-4 text-sm text-[#526575] sm:flex-none">
              <span>Từ:</span>
              <input
                type="text"
                aria-label="Ngày bắt đầu"
                placeholder="DD/MM/YYYY"
                className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-[#526575]"
              />
              <FiCalendar aria-hidden="true" className="h-4 w-4 shrink-0" />
            </label>
            <label className="flex h-10 min-w-[192px] flex-1 items-center gap-2 rounded-lg border border-[#DCECF8] bg-white px-4 text-sm text-[#526575] sm:flex-none">
              <span>Đến:</span>
              <input
                type="text"
                aria-label="Ngày kết thúc"
                placeholder="DD/MM/YYYY"
                className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-[#526575]"
              />
              <FiCalendar aria-hidden="true" className="h-4 w-4 shrink-0" />
            </label>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-start gap-3 xl:justify-end">
          <button
            type="button"
            onClick={exportUsages}
            className="flex h-10 items-center justify-center gap-2 rounded-lg border border-[#DCECF8] bg-[#F7FBFF] px-4 text-sm font-bold text-[#0D8BEA] transition-colors hover:bg-[#DCECF8]"
          >
            <FiDownload aria-hidden="true" className="h-4 w-4" />
            Xuất Excel
          </button>
          <button
            type="button"
            onClick={() => setAddModalOpen(true)}
            className="flex h-10 items-center justify-center gap-2 rounded-lg bg-[#0D8BEA] px-4 text-sm font-bold text-white transition-colors hover:bg-[#0D8BEA]"
          >
            <FiPlus aria-hidden="true" className="h-4 w-4" />
            Ghi nhận dịch vụ
          </button>
        </div>
      </section>

      <section className="w-full min-w-0 overflow-hidden rounded-xl border border-[#DCECF8] bg-white">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#DCECF8] px-4 py-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-[#075A9C]">
              Dịch vụ phát sinh
            </h2>
            <span className="rounded bg-[#F7FBFF] px-2 py-1 text-[10px] text-[#0D8BEA]">
              {filteredUsages.length} kết quả
            </span>
          </div>
          <span className="text-[10px] text-[#526575]">
            Sắp xếp: Thứ tự mới nhất
          </span>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[1134px] table-fixed border-collapse text-sm leading-[normal] text-[#526575]">
            <colgroup>
              <col style={{ width: '5.291%' }} />
              <col style={{ width: '17.637%' }} />
              <col style={{ width: '23.457%' }} />
              <col style={{ width: '14.109%' }} />
              <col style={{ width: '7.760%' }} />
              <col style={{ width: '10.582%' }} />
              <col style={{ width: '10.582%' }} />
              <col style={{ width: '10.582%' }} />
            </colgroup>
            <thead className="bg-[#F8FAFC]">
              <tr>
                {[
                  { label: '#', align: 'text-center' },
                  { label: 'PHÒNG & KHÁCH HÀNG', align: 'text-left' },
                  { label: 'DỊCH VỤ', align: 'text-left' },
                  { label: 'THỜI GIAN', align: 'text-center' },
                  { label: 'SỐ LƯỢNG', align: 'text-center' },
                  { label: 'ĐƠN GIÁ', align: 'text-right' },
                  { label: 'THÀNH TIỀN', align: 'text-right' },
                  { label: 'THAO TÁC', align: 'text-center' },
                ].map(({ label, align }) => (
                  <th
                    key={label}
                    scope="col"
                    className={`h-12 border-b-2 border-[#DCECF8] px-4 py-0 text-sm font-bold leading-[normal] align-middle ${align}`}
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleUsages.length > 0 ? (
                visibleUsages.map((usage, index) => (
                  <tr
                    key={usage.id}
                    aria-selected={selectedUsage?.id === usage.id}
                    tabIndex={0}
                    onClick={(event) => {
                      if (!event.target.closest('[data-row-delete]')) {
                        setSelectedUsage(usage);
                      }
                    }}
                    onKeyDown={(event) => {
                      if (
                        !event.target.closest('[data-row-delete]') &&
                        (event.key === 'Enter' || event.key === ' ')
                      ) {
                        event.preventDefault();
                        setSelectedUsage(usage);
                      }
                    }}
                    className={`h-12 cursor-pointer border-b border-[#DCECF8] text-sm font-normal leading-[normal] transition-colors focus-visible:outline-2 focus-visible:outline-[#0D8BEA] ${
                      selectedUsage?.id === usage.id
                        ? 'bg-[#DCECF8] hover:bg-[#DCECF8]'
                        : 'bg-white hover:bg-[#F7FBFF]'
                    }`}
                  >
                    <td className="h-12 overflow-hidden border-b border-[#DCECF8] px-4 py-0 text-center align-middle text-sm font-normal leading-[normal]">
                      {(currentPage - 1) * pageSize + index + 1}
                    </td>
                    <td className="h-12 overflow-hidden border-b border-[#DCECF8] px-4 py-0 text-left align-middle text-sm font-normal leading-[normal]">
                      <p className="font-bold leading-[normal]">{usage.room}</p>
                      <p className="truncate font-normal leading-[normal]">
                        {usage.customer}
                      </p>
                    </td>
                    <td
                      className="h-12 overflow-hidden border-b border-[#DCECF8] px-4 py-0 text-left align-middle text-sm font-normal leading-[normal]"
                      title={usage.service}
                    >
                      <span className="block truncate">{usage.service}</span>
                    </td>
                    <td className="h-12 overflow-hidden border-b border-[#DCECF8] px-4 py-0 text-right align-middle text-sm font-normal leading-[normal]">
                      {usage.date}
                    </td>
                    <td className="h-12 overflow-hidden border-b border-[#DCECF8] px-4 py-0 text-center align-middle text-sm font-normal leading-[normal]">
                      {usage.quantity} {usage.unit}
                    </td>
                    <td className="h-12 overflow-hidden border-b border-[#DCECF8] px-4 py-0 text-right align-middle text-sm font-normal leading-[normal]">
                      {formatPrice(usage.unitPrice)}
                    </td>
                    <td className="h-12 overflow-hidden border-b border-[#DCECF8] px-4 py-0 text-right align-middle text-sm font-normal leading-[normal]">
                      {formatPrice(usage.quantity * usage.unitPrice)}
                    </td>
                    <td className="h-12 overflow-hidden border-b border-[#DCECF8] px-4 py-0 text-center align-middle text-sm font-normal leading-[normal]">
                      <div className="flex items-center justify-center gap-[10px]">
                        <button
                          type="button"
                          aria-label={`Xem ghi nhận dịch vụ ${usage.service} phòng ${usage.room}`}
                          onClick={() => setSelectedUsage(usage)}
                          className="rounded p-0.5 text-[#526575] transition-colors hover:bg-[#F7FBFF]"
                        >
                          <FiEye aria-hidden="true" className="h-5 w-5" />
                        </button>
                        <button
                          type="button"
                          data-row-delete
                          aria-label={`Xóa ghi nhận dịch vụ ${usage.service} phòng ${usage.room}`}
                          onClick={(event) => {
                            event.stopPropagation();
                            requestDelete(usage);
                          }}
                          className="rounded p-0.5 text-[#D9534F] transition-colors hover:bg-[#F7FBFF]"
                        >
                          <FiTrash2 aria-hidden="true" className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    className="h-20 border-b border-[#DCECF8] px-4 text-center text-[#526575]"
                  >
                    Không tìm thấy dịch vụ phát sinh
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-1 px-4 py-2">
          <button
            type="button"
            aria-label="Trang trước"
            disabled={currentPage === 1}
            onClick={() => setPage((value) => Math.max(1, value - 1))}
            className="flex h-8 w-8 items-center justify-center rounded text-[#526575] disabled:opacity-40"
          >
            <FiChevronLeft aria-hidden="true" className="h-3 w-3" />
          </button>
          {Array.from({ length: pageCount }, (_, index) => index + 1).map(
            (pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                aria-current={pageNumber === currentPage ? 'page' : undefined}
                onClick={() => setPage(pageNumber)}
                className={`flex h-8 min-w-8 items-center justify-center rounded px-2 text-xs ${
                  pageNumber === currentPage
                    ? 'bg-[#0D8BEA] text-white'
                    : 'text-[#526575] hover:bg-[#F7FBFF]'
                }`}
              >
                {pageNumber}
              </button>
            ),
          )}
          <button
            type="button"
            aria-label="Trang tiếp theo"
            disabled={currentPage === pageCount}
            onClick={() =>
              setPage((value) => Math.min(pageCount, value + 1))
            }
            className="flex h-8 w-8 items-center justify-center rounded text-[#526575] disabled:opacity-40"
          >
            <FiChevronRight aria-hidden="true" className="h-3 w-3" />
          </button>
          <p className="w-full text-center text-xs text-[#526575]">
            Hiển thị{' '}
            {filteredUsages.length === 0
              ? 0
              : (currentPage - 1) * pageSize + 1}
            -{Math.min(currentPage * pageSize, filteredUsages.length)} trên
            tổng {filteredUsages.length} dịch vụ
          </p>
        </div>
      </section>

      <DeleteConfirmModal
        service={deletingService}
        onCancel={() => setDeletingService(null)}
        onConfirm={confirmDelete}
      />
      {addModalOpen && (
        <AddServiceUsageModal
          rooms={rooms}
          onClose={() => setAddModalOpen(false)}
          onSubmit={addServiceUsages}
        />
      )}
      <ServiceUsageDetailDrawer
        usage={selectedUsage}
        onClose={() => setSelectedUsage(null)}
        onDelete={requestDelete}
      />
      <ToastNotification message={toast.message} type={toast.type} />
    </section>
  );
}

export default ServiceUsagePage;
