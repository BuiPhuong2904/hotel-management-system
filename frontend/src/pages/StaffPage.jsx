import { useEffect, useMemo, useState } from 'react';
import {
  FiChevronLeft,
  FiChevronRight,
  FiDownload,
  FiEdit2,
  FiEye,
  FiLock,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiUnlock,
} from 'react-icons/fi';
import AddStaffModal from '../components/AddStaffModal';
import EditStaffModal from '../components/EditStaffModal';
import LockStaffModal from '../components/LockStaffModal';
import StaffDetailDrawer from '../components/StaffDetailDrawer';
import ToastNotification from '../components/ToastNotification';

const initialStaff = [
  {
    id: 'staff-1',
    name: 'Lê Thành Đạt',
    phone: '0901.234.567',
    email: 'dat.le@grandhotel.vn',
    identification: '079123000321',
    role: 'Quản trị viên',
    accessScope: 'Toàn quyền hệ thống',
    status: 'Đang hoạt động',
    note: 'Phụ trách vận hành và quản trị hệ thống của toàn bộ chi nhánh.',
    activityLogs: [
      { action: 'Cập nhật danh mục phòng', date: '24/10/2026 09:15', status: 'Hoàn tất' },
      { action: 'Đăng nhập hệ thống', date: '24/10/2026 08:00', status: 'Thành công' },
    ],
  },
  {
    id: 'staff-2',
    name: 'Nguyễn Minh Anh',
    phone: '0912.839.221',
    email: 'minhanh@grandhotel.vn',
    identification: '079123000123',
    role: 'Lễ tân',
    accessScope: 'Quản lý Đặt phòng',
    status: 'Đang hoạt động',
    note: 'Nhân viên xuất sắc tháng 9. Đã hoàn thành khóa đào tạo quản trị rủi ro.',
    activityLogs: [
      { action: 'Tạo hóa đơn INV-1024', date: '24/10/2026 09:15', status: 'Hoàn tất' },
      { action: 'Đăng nhập hệ thống', date: '24/10/2026 08:00', status: 'Thành công' },
    ],
  },
  {
    id: 'staff-3',
    name: 'Lê Thu Hà',
    phone: '0988.777.666',
    email: 'thuha@grandhotel.vn',
    identification: '079123000456',
    role: 'Lễ tân',
    accessScope: 'Quản lý Đặt phòng',
    status: 'Ngừng hoạt động',
    note: 'Tạm ngừng công tác theo kế hoạch nhân sự.',
    activityLogs: [
      { action: 'Hoàn tất bàn giao ca', date: '23/10/2026 17:30', status: 'Hoàn tất' },
      { action: 'Đăng xuất hệ thống', date: '23/10/2026 17:45', status: 'Thành công' },
    ],
  },
  {
    id: 'staff-4',
    name: 'Trần Quốc Bảo',
    phone: '0909.111.222',
    email: 'quocbao@grandhotel.vn',
    identification: '079123000789',
    role: 'Lễ tân',
    accessScope: 'Quản lý Đặt phòng',
    status: 'Ngừng hoạt động',
    note: 'Đang chờ xác nhận lịch làm việc mới.',
    activityLogs: [
      { action: 'Cập nhật hồ sơ khách hàng', date: '22/10/2026 14:10', status: 'Hoàn tất' },
      { action: 'Đăng nhập hệ thống', date: '22/10/2026 08:02', status: 'Thành công' },
    ],
  },
  {
    id: 'staff-5',
    name: 'Phạm Ngọc Lan',
    phone: '0934.555.888',
    email: 'ngoclan@grandhotel.vn',
    identification: '079123001234',
    role: 'Quản trị viên',
    accessScope: 'Toàn quyền hệ thống',
    status: 'Đang hoạt động',
    note: 'Quản lý nhân sự và phân quyền hệ thống.',
    activityLogs: [
      { action: 'Phân quyền nhân viên', date: '21/10/2026 11:20', status: 'Hoàn tất' },
      { action: 'Đăng nhập hệ thống', date: '21/10/2026 08:15', status: 'Thành công' },
    ],
  },
];

const pageSize = 10;

const summaryCardStyles = [
  { title: 'TỔNG NHÂN SỰ', color: '#075A9C', detail: 'Toàn bộ chi nhánh' },
  { title: 'ĐANG HOẠT ĐỘNG', color: '#0D8BEA', detail: 'tổng nhân sự' },
  { title: 'NGỪNG HOẠT ĐỘNG', color: '#D9534F', detail: 'Đã khóa tài khoản' },
  { title: 'QUẢN TRỊ VIÊN', color: '#D97706', detail: 'Nắm toàn quyền hệ thống' },
];

function StaffPage() {
  const [staffMembers, setStaffMembers] = useState(initialStaff);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('Tất cả');
  const [statusFilter, setStatusFilter] = useState('Tất cả');
  const [selectedStaffId, setSelectedStaffId] = useState(null);
  const [editingStaffId, setEditingStaffId] = useState(null);
  const [lockingStaffId, setLockingStaffId] = useState(null);
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
  const selectedStaff =
    staffMembers.find((staff) => staff.id === selectedStaffId) || null;
  const editingStaff =
    staffMembers.find((staff) => staff.id === editingStaffId) || null;
  const lockingStaff =
    staffMembers.find((staff) => staff.id === lockingStaffId) || null;

  const summary = [
    String(staffMembers.length).padStart(2, '0'),
    String(staffMembers.filter((staff) => staff.status === 'Đang hoạt động').length).padStart(2, '0'),
    String(staffMembers.filter((staff) => staff.status === 'Ngừng hoạt động').length).padStart(2, '0'),
    String(staffMembers.filter((staff) => staff.role === 'Quản trị viên').length).padStart(2, '0'),
  ];

  const filteredStaff = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('vi');
    return staffMembers.filter((staff) => {
      const matchesRole = roleFilter === 'Tất cả' || staff.role === roleFilter;
      const matchesStatus =
        statusFilter === 'Tất cả' || staff.status === statusFilter;
      const matchesSearch =
        !query ||
        [
          staff.name,
          staff.phone,
          staff.email,
          staff.identification,
          staff.role,
          staff.accessScope,
        ].some((value) => value.toLocaleLowerCase('vi').includes(query));
      return matchesRole && matchesStatus && matchesSearch;
    });
  }, [roleFilter, search, staffMembers, statusFilter]);

  const pageCount = Math.max(1, Math.ceil(filteredStaff.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visibleStaff = filteredStaff.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  const rangeStart = filteredStaff.length ? (currentPage - 1) * pageSize + 1 : 0;
  const rangeEnd = Math.min(currentPage * pageSize, filteredStaff.length);

  const resetFilters = () => {
    setSearch('');
    setRoleFilter('Tất cả');
    setStatusFilter('Tất cả');
    setPage(1);
  };

  const addStaff = (form) => {
    const staff = {
      ...form,
      id: `staff-${Date.now()}`,
      accessScope:
        form.role === 'Quản trị viên' ? 'Toàn quyền hệ thống' : 'Quản lý Đặt phòng',
      status: 'Đang hoạt động',
      activityLogs: [
        {
          action: 'Tạo tài khoản nhân viên',
          date: new Intl.DateTimeFormat('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          })
            .format(new Date())
            .replace(',', ''),
          status: 'Thành công',
        },
      ],
    };
    setStaffMembers((current) => [staff, ...current]);
    resetFilters();
    setPage(1);
    setAddModalOpen(false);
    notify(`Đã tạo tài khoản nhân viên ${staff.name} thành công.`, 'success');
  };

  const saveStaff = (updatedStaff) => {
    setStaffMembers((current) =>
      current.map((staff) => (staff.id === updatedStaff.id ? updatedStaff : staff)),
    );
    setEditingStaffId(null);
    notify(`Đã cập nhật tài khoản ${updatedStaff.name} thành công.`, 'success');
  };

  const toggleStaffStatus = () => {
    if (!lockingStaff) return;
    const wasActive = lockingStaff.status === 'Đang hoạt động';
    const status = wasActive ? 'Ngừng hoạt động' : 'Đang hoạt động';
    setStaffMembers((current) =>
      current.map((staff) =>
        staff.id === lockingStaff.id ? { ...staff, status } : staff,
      ),
    );
    setLockingStaffId(null);
    notify(
      `Đã ${wasActive ? 'khóa' : 'mở khóa'} tài khoản của ${lockingStaff.name} thành công.`,
      'success',
    );
  };

  const exportCsv = () => {
    const rows = [
      [
        'Họ và tên',
        'Số điện thoại',
        'Email công việc',
        'CCCD / Hộ chiếu',
        'Vai trò',
        'Phạm vi truy cập',
        'Trạng thái',
        'Ghi chú hồ sơ',
      ],
      ...filteredStaff.map((staff) => [
        staff.name,
        staff.phone,
        staff.email,
        staff.identification,
        staff.role,
        staff.accessScope,
        staff.status,
        staff.note,
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
    link.download = 'danh-sach-nhan-vien.csv';
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  const showDetail = (staff) => setSelectedStaffId(staff.id);
  const openEdit = (event, staff) => {
    event.stopPropagation();
    setEditingStaffId(staff.id);
  };
  const openLock = (event, staff) => {
    event?.stopPropagation();
    setLockingStaffId(staff.id);
  };

  return (
    <section className="flex w-full min-w-0 flex-col gap-4">
      <section
        aria-label="Thống kê nhân sự"
        className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {summaryCardStyles.map(({ title, color, detail }, index) => {
          const value = summary[index];
          const count = value;
          const supportingText =
            index === 1 && summary[0]
              ? `${Math.round((value / summary[0]) * 100)}% ${detail}`
              : detail;

          return (
            <article
              key={title}
              className="flex min-h-[136px] flex-col gap-2 rounded-xl border border-[#DCECF8] bg-white p-[17px] shadow-[0_1px_1px_rgba(0,0,0,0.05)]"
            >
              <h2 className="text-sm font-bold" style={{ color }}>
                {title}
              </h2>
              <div className="pt-2">
                <p className="flex items-baseline gap-2 text-xl font-bold" style={{ color }}>
                  {count}
                  <span className="text-xs font-normal text-[#526575]">nhân viên</span>
                </p>
                <p className="mt-2 text-xs text-[#526575]">{supportingText}</p>
              </div>
            </article>
          );
        })}
      </section>

      <section
        aria-label="Tìm kiếm và lọc nhân viên"
        className="grid w-full min-w-0 gap-4 rounded-xl border border-[#DCECF8] bg-white p-4 sm:p-[17px] xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center"
      >
        <div className="flex min-w-0 flex-col gap-2">
          <label className="flex h-10 w-full min-w-0 items-center gap-3 rounded-lg border border-[#DCECF8] bg-[#F7FBFF] px-3 sm:max-w-[423px]">
            <FiSearch
              aria-hidden="true"
              className="h-3.5 w-3.5 shrink-0 text-[#526575]"
            />
            <input
              type="search"
              aria-label="Tìm nhân viên"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Tìm theo tên, email, số điện thoại..."
              className="h-full min-w-0 flex-1 bg-transparent text-xs text-[#526575] outline-none placeholder:text-[#526575]"
            />
          </label>

          <div className="flex min-w-0 flex-wrap items-center gap-3">
            <label className="flex h-10 w-full items-center rounded-lg border border-[#DCECF8] bg-white px-3 sm:w-[176px]">
              <select
                aria-label="Lọc theo vai trò"
                value={roleFilter}
                onChange={(event) => {
                  setRoleFilter(event.target.value);
                  setPage(1);
                }}
                className="h-full min-w-0 flex-1 appearance-none rounded-lg bg-transparent text-sm text-[#526575] outline-none"
              >
                <option value="Tất cả">Vai trò: Tất cả</option>
                <option>Quản trị viên</option>
                <option>Lễ tân</option>
              </select>
              <FiChevronRight
                aria-hidden="true"
                className="h-4 w-4 shrink-0 rotate-90 text-[#526575]"
              />
            </label>
            <label className="flex h-10 w-full items-center rounded-lg border border-[#DCECF8] bg-white px-3 sm:w-[176px]">
              <select
                aria-label="Lọc theo trạng thái"
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(event.target.value);
                  setPage(1);
                }}
                className="h-full min-w-0 flex-1 appearance-none rounded-lg bg-transparent text-sm text-[#526575] outline-none"
              >
                <option value="Tất cả">Trạng thái: Tất cả</option>
                <option>Đang hoạt động</option>
                <option>Ngừng hoạt động</option>
              </select>
              <FiChevronRight
                aria-hidden="true"
                className="h-4 w-4 shrink-0 rotate-90 text-[#526575]"
              />
            </label>
            <button
              type="button"
              aria-label="Đặt lại bộ lọc"
              onClick={resetFilters}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#DCECF8] bg-white text-[#526575] transition-colors hover:bg-[#F7FBFF]"
            >
              <FiRefreshCw aria-hidden="true" className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3">
          <button
            type="button"
            onClick={exportCsv}
            className="flex h-10 items-center justify-center gap-2 rounded-lg border border-[#DCECF8] bg-[#F7FBFF] px-4 text-sm font-bold text-[#0D8BEA] hover:bg-[#E8F5FF]"
          >
            <FiDownload aria-hidden="true" className="h-4 w-4" />
            Xuất Excel
          </button>
          <button
            type="button"
            onClick={() => setAddModalOpen(true)}
            className="flex h-10 items-center justify-center gap-2 rounded-lg bg-[#0D8BEA] px-4 text-sm font-bold text-white hover:bg-[#075A9C]"
          >
            <FiPlus aria-hidden="true" className="h-4 w-4" />
            Thêm nhân viên
          </button>
        </div>
      </section>

      <section className="w-full min-w-0 overflow-hidden rounded-xl border border-[#DCECF8] bg-white">
        <div className="flex min-h-14 flex-wrap items-center justify-between gap-2 border-b border-[#DCECF8] px-4 py-3 sm:px-5">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-[#075A9C]">Danh sách nhân viên</h2>
            <span className="rounded-md bg-[#E8F5FF] px-2 py-1 text-[10px] font-semibold text-[#0D8BEA]">
              {filteredStaff.length} kết quả
            </span>
          </div>
          <p className="text-xs text-[#526575]">Sắp xếp: Thứ tự tăng dần</p>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[900px] table-fixed border-collapse text-sm">
            <colgroup>
              <col style={{ width: '5.3%' }} />
              <col style={{ width: '16.9%' }} />
              <col style={{ width: '12.7%' }} />
              <col style={{ width: '21.3%' }} />
              <col style={{ width: '13.8%' }} />
              <col style={{ width: '15.5%' }} />
              <col style={{ width: '14.5%' }} />
            </colgroup>
            <thead className="bg-[#F7FBFF] text-sm font-bold text-[#526575]">
              <tr className="h-12 border-b border-[#DCECF8]">
                <th scope="col" className="px-2 text-center">#</th>
                <th scope="col" className="px-2 text-left">NHÂN VIÊN</th>
                <th scope="col" className="px-2 text-center">ĐIỆN THOẠI</th>
                <th scope="col" className="px-2 text-left">EMAIL</th>
                <th scope="col" className="px-2 text-center">VAI TRÒ</th>
                <th scope="col" className="px-2 text-center">TRẠNG THÁI</th>
                <th scope="col" className="px-2 text-center">THAO TÁC</th>
              </tr>
            </thead>
            <tbody className="text-sm text-[#526575]">
              {visibleStaff.map((staff, index) => {
                const isSelected = staff.id === selectedStaffId;
                const isActive = staff.status === 'Đang hoạt động';
                return (
                  <tr
                    key={staff.id}
                    tabIndex={0}
                    aria-selected={isSelected}
                    onClick={() => showDetail(staff)}
                    onKeyDown={(event) => {
                      if (event.target !== event.currentTarget) return;
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        showDetail(staff);
                      }
                    }}
                    className={`h-12 cursor-pointer border-b border-[#DCECF8] transition-colors ${
                      isSelected ? 'bg-[#E8F5FF]' : 'bg-white hover:bg-[#F7FBFF]'
                    }`}
                  >
                    <td className="px-2 text-center">
                      {(currentPage - 1) * pageSize + index + 1}
                    </td>
                    <td className="truncate px-2 text-left">{staff.name}</td>
                    <td className="whitespace-nowrap px-2 text-center">{staff.phone}</td>
                    <td className="truncate px-2 text-left">{staff.email}</td>
                    <td className="px-2 text-center">
                      <span
                        className={`inline-flex min-h-6 items-center whitespace-nowrap rounded-full border px-[10px] py-[2px] text-sm ${
                          staff.role === 'Quản trị viên'
                            ? 'border-[#075A9C] bg-[#075A9C] text-white'
                            : 'border-[#0D8BEA] bg-white text-[#0D8BEA]'
                        }`}
                      >
                        {staff.role}
                      </span>
                    </td>
                    <td className="px-2 text-center">
                      <span
                        className={`inline-flex min-h-6 items-center whitespace-nowrap rounded-full px-[10px] py-[2px] text-sm text-white ${
                          isActive ? 'bg-[#2E8B57]' : 'bg-[#526575]'
                        }`}
                      >
                        {staff.status}
                      </span>
                    </td>
                    <td className="px-2">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          aria-label={`Xem chi tiết ${staff.name}`}
                          onClick={(event) => {
                            event.stopPropagation();
                            showDetail(staff);
                          }}
                          className="flex h-7 w-7 items-center justify-center rounded text-[#526575] hover:bg-[#F7FBFF]"
                        >
                          <FiEye aria-hidden="true" className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          aria-label={`Chỉnh sửa ${staff.name}`}
                          onClick={(event) => openEdit(event, staff)}
                          className="flex h-7 w-7 items-center justify-center rounded text-[#0D8BEA] hover:bg-[#F7FBFF]"
                        >
                          <FiEdit2 aria-hidden="true" className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          aria-label={`${isActive ? 'Khóa' : 'Mở khóa'} tài khoản ${staff.name}`}
                          onClick={(event) => openLock(event, staff)}
                          className={`flex h-7 w-7 items-center justify-center rounded hover:bg-[#F7FBFF] ${
                            isActive ? 'text-[#D9534F]' : 'text-[#2E8B57]'
                          }`}
                        >
                          {isActive ? (
                            <FiLock aria-hidden="true" className="h-4 w-4" />
                          ) : (
                            <FiUnlock aria-hidden="true" className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!visibleStaff.length && (
                <tr>
                  <td colSpan="7" className="h-20 text-center text-sm text-[#526575]">
                    Không tìm thấy nhân viên phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <footer className="flex flex-col items-center gap-1 border-t border-[#DCECF8] px-4 py-2 text-xs text-[#526575]">
          <nav aria-label="Phân trang danh sách nhân viên" className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Trang trước"
              disabled={currentPage === 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className="flex h-7 w-7 items-center justify-center rounded disabled:cursor-not-allowed"
            >
              <FiChevronLeft aria-hidden="true" className="h-3.5 w-3.5" />
            </button>
            {Array.from({ length: pageCount }, (_, index) => index + 1).map(
              (pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  aria-current={pageNumber === currentPage ? 'page' : undefined}
                  onClick={() => setPage(pageNumber)}
                  className={`flex h-7 min-w-7 items-center justify-center rounded px-2 ${
                    pageNumber === currentPage
                      ? 'bg-[#0D8BEA] font-bold text-white'
                      : 'hover:bg-[#F7FBFF]'
                  }`}
                >
                  {pageNumber}
                </button>
              ),
            )}
            <button
              type="button"
              aria-label="Trang sau"
              disabled={currentPage === pageCount}
              onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
              className="flex h-7 w-7 items-center justify-center rounded disabled:cursor-not-allowed"
            >
              <FiChevronRight aria-hidden="true" className="h-3.5 w-3.5" />
            </button>
          </nav>
          <p>
            Hiển thị {rangeStart}-{rangeEnd} trên tổng {filteredStaff.length} nhân viên
          </p>
        </footer>
      </section>

      {addModalOpen && (
        <AddStaffModal onClose={() => setAddModalOpen(false)} onCreate={addStaff} />
      )}
      {editingStaff && (
        <EditStaffModal
          staff={editingStaff}
          onClose={() => setEditingStaffId(null)}
          onSave={saveStaff}
        />
      )}
      {selectedStaff && (
        <StaffDetailDrawer
          staff={selectedStaff}
          onClose={() => setSelectedStaffId(null)}
          onToggleStatus={(staff) => setLockingStaffId(staff.id)}
          onToast={notify}
          lockModalOpen={Boolean(lockingStaff)}
        />
      )}
      {lockingStaff && (
        <LockStaffModal
          staff={lockingStaff}
          onClose={() => setLockingStaffId(null)}
          onConfirm={toggleStaffStatus}
        />
      )}
      <ToastNotification message={toast.message} type={toast.type} />
    </section>
  );
}

export default StaffPage;
