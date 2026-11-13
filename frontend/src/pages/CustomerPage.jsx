import { useEffect, useMemo, useState } from 'react';
import {
  FiChevronLeft,
  FiChevronRight,
  FiEdit2,
  FiEye,
  FiLock,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiUnlock,
} from 'react-icons/fi';
import AddCustomerModal from '../components/AddCustomerModal';
import CustomerDetailDrawer from '../components/CustomerDetailDrawer';
import CustomerStatusBadge from '../components/CustomerStatusBadge';
import EditCustomerModal from '../components/EditCustomerModal';
import LockAccountModal from '../components/LockAccountModal';
import ToastNotification from '../components/ToastNotification';
import {
  customerStatuses,
  formatCustomerCurrency,
  maskIdentification,
} from '../utils/customerUtils';

const initialCustomers = [
  {
    id: 'cus-1',
    username: 'minhanh_cus',
    name: 'Nguyễn Minh Anh',
    phone: '0912839123',
    email: 'minhanh@gmail.com',
    identification: '079123000123',
    address: '123 Lê Lợi, Quận 1, TP.HCM',
    note: 'Khách VIP, thường xuyên công tác. Ưu tiên phòng tầng cao, view hồ bơi.',
    stayCount: 5,
    totalSpent: 4500000,
    status: 'Đang hoạt động',
    bookingHistory: [
      { code: 'BK-2026-1011', date: '24/10/2026', total: 1300000, status: 'Đang lưu trú' },
      { code: 'BK-2026-0805', date: '15/08/2026', total: 3200000, status: 'Đã trả' },
    ],
  },
  {
    id: 'cus-2',
    username: 'thimai_cus',
    name: 'Trần Thị Mai',
    phone: '0904551234',
    email: 'thimai@gmail.com',
    identification: '079123005678',
    address: '45 Nguyễn Huệ, Quận 1, TP.HCM',
    note: 'Ưu tiên phòng yên tĩnh.',
    stayCount: 2,
    totalSpent: 1250000,
    status: 'Đang hoạt động',
    bookingHistory: [
      { code: 'BK-2026-0918', date: '18/09/2026', total: 1250000, status: 'Đã trả' },
    ],
  },
  {
    id: 'cus-3',
    username: 'thuhac_cus',
    name: 'Lê Thu Hà',
    phone: '0936994789',
    email: 'thuha@gmail.com',
    identification: '079123009012',
    address: '10 Pasteur, Quận 3, TP.HCM',
    note: 'Khách hàng thân thiết.',
    stayCount: 8,
    totalSpent: 12800000,
    status: 'Đang hoạt động',
    bookingHistory: [
      { code: 'BK-2026-1024', date: '24/10/2026', total: 2800000, status: 'Đang lưu trú' },
      { code: 'BK-2026-0712', date: '12/07/2026', total: 3500000, status: 'Đã trả' },
    ],
  },
  {
    id: 'cus-4',
    username: 'ducvinh_cus',
    name: 'Hoàng Đức Vinh',
    phone: '0918765432',
    email: 'ducvinh@gmail.com',
    identification: '079123003456',
    address: '88 Điện Biên Phủ, Bình Thạnh, TP.HCM',
    note: '',
    stayCount: 1,
    totalSpent: 900000,
    status: 'Ngừng hoạt động',
    bookingHistory: [
      { code: 'BK-2026-0621', date: '21/06/2026', total: 900000, status: 'Đã trả' },
    ],
  },
  {
    id: 'cus-5',
    username: 'thanhtung_cus',
    name: 'Ngô Thanh Tùng',
    phone: '0967888999',
    email: '',
    identification: '079123007890',
    address: '12 Trần Hưng Đạo, Quận 5, TP.HCM',
    note: 'Vui lòng xác nhận thông tin trước khi đặt phòng.',
    stayCount: 0,
    totalSpent: 0,
    status: 'Bị khóa',
    bookingHistory: [],
  },
];

const summaryCardStyles = [
  { title: 'TỔNG KHÁCH HÀNG', color: '#075A9C', suffix: 'khách' },
  { title: 'KHÁCH ĐANG LƯU TRÚ', color: '#0D8BEA', suffix: 'khách' },
  { title: 'TÀI KHOẢN BỊ KHÓA', color: '#D9534F', suffix: 'tài khoản' },
  { title: 'HỒ SƠ CẦN BỔ SUNG', color: '#D97706', suffix: 'hồ sơ' },
];

const formatPhone = (phone) => phone;

function CustomerPage() {
  const [customers, setCustomers] = useState(initialCustomers);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tất cả');
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [editingCustomerId, setEditingCustomerId] = useState(null);
  const [lockingCustomerId, setLockingCustomerId] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  useEffect(() => {
    if (!toast.message) return undefined;
    const timeout = window.setTimeout(
      () => setToast({ message: '', type: 'success' }),
      3500,
    );
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const notify = (message, type = 'success') => setToast({ message, type });
  const selectedCustomer =
    customers.find((customer) => customer.id === selectedCustomerId) || null;
  const editingCustomer =
    customers.find((customer) => customer.id === editingCustomerId) || null;
  const lockingCustomer =
    customers.find((customer) => customer.id === lockingCustomerId) || null;

  const metrics = [
    customers.length,
    customers.filter((customer) =>
      customer.bookingHistory.some((booking) => booking.status === 'Đang lưu trú'),
    ).length,
    customers.filter((customer) => customer.status === 'Bị khóa').length,
    customers.filter((customer) => !customer.email || !customer.identification).length,
  ];

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('vi');
    return customers.filter((customer) => {
      const matchesStatus =
        statusFilter === 'Tất cả' || customer.status === statusFilter;
      const matchesSearch =
        !query ||
        [
          customer.name,
          customer.phone,
          customer.email,
          customer.identification,
          customer.username,
        ].some((value) => value.toLocaleLowerCase('vi').includes(query));
      return matchesStatus && matchesSearch;
    });
  }, [customers, search, statusFilter]);

  const pageSize = 5;
  const pageCount = Math.max(1, Math.ceil(filteredCustomers.length / pageSize));
  const visibleCustomers = filteredCustomers.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('Tất cả');
    setPage(1);
  };

  const addCustomer = (form) => {
    const customer = {
      ...form,
      id: `cus-${Date.now()}`,
      username: form.phone,
      stayCount: 0,
      totalSpent: 0,
      status: 'Đang hoạt động',
      bookingHistory: [],
    };
    setCustomers((current) => [customer, ...current]);
    setSearch('');
    setStatusFilter('Tất cả');
    setPage(1);
    setAddModalOpen(false);
    notify(`Đã tạo hồ sơ khách hàng ${customer.name} thành công.`, 'success');
  };

  const saveCustomer = (updatedCustomer) => {
    setCustomers((current) =>
      current.map((customer) =>
        customer.id === updatedCustomer.id ? updatedCustomer : customer,
      ),
    );
    setEditingCustomerId(null);
    notify(`Đã cập nhật hồ sơ ${updatedCustomer.name} thành công.`, 'success');
  };

  const lockCustomer = () => {
    if (!lockingCustomer) return;
    const lockedName = lockingCustomer.name;
    setCustomers((current) =>
      current.map((customer) =>
        customer.id === lockingCustomer.id
          ? { ...customer, status: 'Bị khóa' }
          : customer,
      ),
    );
    setLockingCustomerId(null);
    notify(`Đã khóa tài khoản của ${lockedName} thành công.`, 'success');
  };

  const unlockCustomer = (customer) => {
    setCustomers((current) =>
      current.map((item) =>
        item.id === customer.id ? { ...item, status: 'Đang hoạt động' } : item,
      ),
    );
    notify(`Đã mở khóa tài khoản của ${customer.name} thành công.`, 'success');
  };

  const openEdit = (event, customer) => {
    event.stopPropagation();
    setEditingCustomerId(customer.id);
  };

  const openLock = (event, customer) => {
    event.stopPropagation();
    setLockingCustomerId(customer.id);
  };

  const headerCellClass =
    'h-12 border-b-2 border-[#DCECF8] bg-[#F8FAFC] px-3 py-3 text-sm font-bold tracking-wide text-[#526575]';
  const bodyCellClass =
    'h-12 border-b border-[#DCECF8] px-3 py-3 text-sm text-[#526575]';

 return (
    <section className="flex min-w-0 flex-col gap-4 text-[#526575]">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCardStyles.map((card, index) => {
          const value = metrics[index];
          const displayValue = String(value).padStart(2, '0');

          return (
            <article
              key={card.title}
              className="flex h-[136px] min-w-0 flex-col gap-2 rounded-xl border border-[#DCECF8] bg-white p-[17px] shadow-[0_1px_1px_rgba(0,0,0,0.05)]"
            >
              <h2 className="whitespace-nowrap text-sm font-bold" style={{ color: card.color }}>
                {card.title}
              </h2>
              <div className="flex min-h-0 flex-1 flex-col pt-1">
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold leading-7" style={{ color: card.color }}>
                    {displayValue}
                  </span>
                  <span className="text-xs text-[#526575]">{card.suffix}</span>
                </div>
                <p className="mt-1 text-xs text-[#526575]">
                  {index === 0
                    ? 'Tổng hồ sơ khách hàng'
                    : index === 1
                      ? 'Có phiếu thuê đang lưu trú'
                      : index === 2
                        ? 'Cần rà soát'
                        : 'Thiếu Email/CCCD'}
                </p>
              </div>
            </article>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-[#DCECF8] bg-white p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
        <div className="flex min-w-0 gap-3">
          <label className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-lg border border-[#DCECF8] bg-[#F7FBFF] px-3 sm:w-[369px] sm:flex-none">
            <FiSearch aria-hidden="true" className="h-4 w-4 shrink-0 text-[#526575]" />
            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Tìm theo tên khách, số điện thoại, CCCD/Hộ chiếu..."
              className="min-w-0 flex-1 bg-transparent text-xs text-[#526575] outline-none placeholder:text-[#526575]"
              aria-label="Tìm theo tên khách, số điện thoại, CCCD/Hộ chiếu"
            />
          </label>
          <button
            type="button"
            onClick={resetFilters}
            aria-label="Làm mới bộ lọc"
            title="Làm mới bộ lọc"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#DCECF8] bg-white text-[#526575] hover:bg-[#F7FBFF]"
          >
            <FiRefreshCw aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="flex h-10 items-center">
            <span className="sr-only">Lọc theo trạng thái</span>
            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setPage(1);
              }}
              className="h-10 w-full rounded-lg border border-[#DCECF8] bg-white px-3 py-2 text-sm text-[#526575] outline-none focus:border-[#0D8BEA] sm:w-40"
            >
              <option value="Tất cả">Trạng thái: Tất cả</option>
              {customerStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={() => setAddModalOpen(true)}
            className="flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-[#0D8BEA] px-4 text-sm font-bold text-white hover:bg-[#075A9C]"
          >
            <FiPlus aria-hidden="true" className="h-4 w-4" />
            Thêm khách hàng
          </button>
        </div>
      </div>

      <section className="min-w-0 overflow-hidden rounded-xl border border-[#DCECF8] bg-white">
        <header className="flex h-14 items-center justify-between border-b border-[#DCECF8] px-4 sm:px-5">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-[#075A9C]">Danh bạ khách hàng</h1>
            <span className="rounded-md bg-[#E8F5FF] px-2 py-1 text-xs text-[#0D8BEA]">
              {filteredCustomers.length} kết quả
            </span>
          </div>
          <span className="hidden text-xs text-[#526575] sm:inline">
            Sắp xếp: Thứ tự tăng dần
          </span>
        </header>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] table-fixed border-collapse">
            <colgroup>
              <col style={{ width: '4%' }} />
              <col style={{ width: '18%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '15%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '14%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '13%' }} />
            </colgroup>
            <thead>
              <tr>
                <th scope="col" className={`${headerCellClass} text-center`}>#</th>
                <th scope="col" className={`${headerCellClass} text-left`}>KHÁCH HÀNG</th>
                <th scope="col" className={`${headerCellClass} text-center`}>ĐIỆN THOẠI</th>
                <th scope="col" className={`${headerCellClass} text-center`}>CCCD / HỘ CHIẾU</th>
                <th scope="col" className={`${headerCellClass} text-center`}>LỊCH SỬ LƯU TRÚ</th>
                <th scope="col" className={`${headerCellClass} text-right`}>TỔNG CHI TIÊU</th>
                <th scope="col" className={`${headerCellClass} text-center`}>TRẠNG THÁI</th>
                <th scope="col" className={`${headerCellClass} text-center`}>THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {visibleCustomers.map((customer, index) => (
                <tr
                  key={customer.id}
                  onClick={() => setSelectedCustomerId(customer.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      setSelectedCustomerId(customer.id);
                    }
                  }}
                  tabIndex={0}
                  aria-label={`Xem hồ sơ ${customer.name}`}
                  className={`cursor-pointer transition-colors hover:bg-[#F7FBFF] focus-visible:outline-2 focus-visible:outline-[#0D8BEA] ${
                    selectedCustomerId === customer.id ? 'bg-[#E8F5FF]' : 'bg-white'
                  }`}
                >
                  <td className={`${bodyCellClass} text-center`}>
                    {(page - 1) * pageSize + index + 1}
                  </td>
                  <td className={`${bodyCellClass} truncate text-left`}>
                    {customer.name}
                  </td>
                  <td className={`${bodyCellClass} text-center`}>
                    {formatPhone(customer.phone)}
                  </td>
                  <td className={`${bodyCellClass} text-center`}>
                    {maskIdentification(customer.identification)}
                  </td>
                  <td className={`${bodyCellClass} text-center`}>
                    {customer.stayCount} lượt
                  </td>
                  <td className={`${bodyCellClass} text-right`}>
                    {formatCustomerCurrency(customer.totalSpent)}
                  </td>
                  <td className={`${bodyCellClass} text-center`}>
                    <CustomerStatusBadge status={customer.status} className="text-sm" />
                  </td>
                  <td className={`${bodyCellClass} text-center`}>
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        aria-label={`Xem ${customer.name}`}
                        title="Xem chi tiết"
                        onClick={() => setSelectedCustomerId(customer.id)}
                        className="flex h-7 w-7 items-center justify-center rounded text-[#526575] hover:bg-[#E8F5FF]"
                      >
                        <FiEye aria-hidden="true" className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        aria-label={`Sửa ${customer.name}`}
                        title="Chỉnh sửa"
                        onClick={(event) => openEdit(event, customer)}
                        className="flex h-7 w-7 items-center justify-center rounded text-[#0D8BEA] hover:bg-[#E8F5FF]"
                      >
                        <FiEdit2 aria-hidden="true" className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        aria-label={
                          customer.status === 'Bị khóa'
                            ? `Mở khóa ${customer.name}`
                            : `Khóa ${customer.name}`
                        }
                        title={
                          customer.status === 'Bị khóa'
                            ? 'Mở khóa tài khoản'
                            : 'Khóa tài khoản'
                        }
                        onClick={(event) =>
                          customer.status === 'Bị khóa'
                            ? (event.stopPropagation(), unlockCustomer(customer))
                            : openLock(event, customer)
                        }
                        className={`flex h-7 w-7 items-center justify-center rounded hover:bg-[#F7FBFF] ${
                          customer.status === 'Bị khóa'
                            ? 'text-[#2E8B57]'
                            : 'text-[#D9534F]'
                        }`}
                      >
                        {customer.status === 'Bị khóa' ? (
                          <FiUnlock aria-hidden="true" className="h-4 w-4" />
                        ) : (
                          <FiLock aria-hidden="true" className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!visibleCustomers.length && (
                <tr>
                  <td colSpan="8" className="px-4 py-10 text-center text-sm text-[#526575]">
                    Không tìm thấy khách hàng phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <footer className="flex min-h-[72px] flex-col items-center justify-center gap-1 px-4 py-3">

          <nav aria-label="Phân trang danh sách khách hàng" className="flex items-center gap-1">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage((current) => current - 1)}
              aria-label="Trang trước"
              className="flex h-8 w-8 items-center justify-center rounded text-[#526575] hover:bg-[#F7FBFF] disabled:opacity-40"
            >
              <FiChevronLeft aria-hidden="true" className="h-4 w-4" />
            </button>
            {Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                aria-current={pageNumber === page ? 'page' : undefined}
                onClick={() => setPage(pageNumber)}
                className={`h-8 min-w-8 rounded px-2 text-xs ${
                  pageNumber === page
                    ? 'bg-[#0D8BEA] font-bold text-white'
                    : 'text-[#526575] hover:bg-[#F7FBFF]'
                }`}
              >
                {pageNumber}
              </button>
            ))}
            <button
              type="button"
              disabled={page === pageCount}
              onClick={() => setPage((current) => current + 1)}
              aria-label="Trang sau"
              className="flex h-8 w-8 items-center justify-center rounded text-[#526575] hover:bg-[#F7FBFF] disabled:opacity-40"
            >
              <FiChevronRight aria-hidden="true" className="h-4 w-4" />
            </button>
          </nav>
          <p className="text-xs text-[#526575]">
            {filteredCustomers.length
              ? `Hiển thị ${(page - 1) * pageSize + 1}–${Math.min(
                  page * pageSize,
                  filteredCustomers.length,
                )} trên tổng ${filteredCustomers.length} khách hàng`
              : 'Không có khách hàng'}
          </p>
        </footer>
      </section>

      {addModalOpen && (
        <AddCustomerModal onClose={() => setAddModalOpen(false)} onCreate={addCustomer} />
      )}
      {editingCustomer && (
        <EditCustomerModal
          key={editingCustomer.id}
          customer={editingCustomer}
          onClose={() => setEditingCustomerId(null)}
          onSave={saveCustomer}
        />
      )}
      {lockingCustomer && (
        <LockAccountModal
          customer={lockingCustomer}
          onClose={() => setLockingCustomerId(null)}
          onConfirm={lockCustomer}
        />
      )}
      {selectedCustomer && (
        <CustomerDetailDrawer
          customer={selectedCustomer}
          onClose={() => setSelectedCustomerId(null)}
          onLock={(customer) => setLockingCustomerId(customer.id)}
          onUnlock={unlockCustomer}
          onToast={notify}
        />
      )}
      <ToastNotification message={toast.message} type={toast.type} />
    </section>
  );
}

export default CustomerPage;
