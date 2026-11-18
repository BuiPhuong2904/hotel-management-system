
import { useEffect, useMemo, useState } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from 'lucide-react';

import DeleteConfirmModal from '../components/DeleteConfirmModal';
import ToastNotification from '../components/ToastNotification';
import AddServiceUsageModal from '../components/AddServiceUsageModal';
import ServiceUsageDetailDrawer from '../components/ServiceUsageDetailDrawer';

import {
  getAllServiceUsagesAPI,
  getActiveRoomsAPI,
  createServiceUsageAPI,
  deleteServiceUsageAPI,
} from '../services/serviceUsageService';

import { getServicesAPI } from '../services/serviceService';

const PAGE_SIZE = 8;

const formatCurrency = (value) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(Number(value) || 0);

const formatDateTime = (value) => {
  if (!value) return '—';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '—';

  return date.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

// Chuyển dữ liệu API về cấu trúc sử dụng trong giao diện.
const mapUsageFromAPI = (item) => ({
  id: item.UsageID,
  usageId: item.UsageID,

  detailId: item.DetailID,
  bookingId: item.BookingID,
  roomId: item.RoomID,

  room: item.RoomNumber || '—',
  customer: item.GuestName || '—',

  serviceId: item.ServiceID,
  service: item.ServiceName || '—',

  quantity: Number(item.Quantity) || 0,
  unit: item.Unit || '—',

  unitPrice: Number(item.PriceAtUsage) || 0,
  subtotal:
    Number(item.SubTotal) ||
    (Number(item.Quantity) || 0) * (Number(item.PriceAtUsage) || 0),

  date: item.RecordedAt,

  isInvoiced: Boolean(item.IsInvoiced),
  isEditable: Boolean(item.IsEditable),
});

export default function ServiceUsagePage() {
  const [serviceUsages, setServiceUsages] = useState([]);
  const [activeRooms, setActiveRooms] = useState([]);
  const [services, setServices] = useState([]);

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roomFilter, setRoomFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUsage, setSelectedUsage] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Tải danh sách lượt sử dụng dịch vụ.
  const loadServiceUsages = async () => {
    try {
      const response = await getAllServiceUsagesAPI();

      const items = response?.data?.Items || response?.data || [];

      setServiceUsages(
        Array.isArray(items) ? items.map(mapUsageFromAPI) : []
      );
    } catch (error) {
      console.error('Lỗi tải lượt sử dụng dịch vụ:', error);
      showToast(
        error?.response?.data?.message ||
          'Không thể tải danh sách sử dụng dịch vụ.',
        'error'
      );
    }
  };

  // Tải phòng đang có khách và danh sách dịch vụ.
  const loadFormData = async () => {
    try {
      const [roomResponse, serviceResponse] = await Promise.all([
        getActiveRoomsAPI(),
        getServicesAPI(),
      ]);

      const roomData = roomResponse?.data?.data || roomResponse?.data || [];
      const serviceData =
        serviceResponse?.data?.data || serviceResponse?.data || [];

      setActiveRooms(Array.isArray(roomData) ? roomData : []);
      setServices(Array.isArray(serviceData) ? serviceData : []);
    } catch (error) {
      console.error('Lỗi tải dữ liệu biểu mẫu:', error);
      showToast(
        error?.response?.data?.message ||
          'Không thể tải danh sách phòng hoặc dịch vụ.',
        'error'
      );
    }
  };

  // Tải dữ liệu khi mở trang.
  const loadData = async () => {
    setLoading(true);

    await Promise.all([
      loadServiceUsages(),
      loadFormData(),
    ]);

    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Danh sách phòng dùng cho bộ lọc.
  const rooms = useMemo(() => {
    return [...new Set(serviceUsages.map((item) => item.room).filter(Boolean))];
  }, [serviceUsages]);

  // Tìm kiếm và lọc dữ liệu.
  const filteredUsages = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    return serviceUsages.filter((item) => {
      const matchesSearch =
        !keyword ||
        String(item.room).toLowerCase().includes(keyword) ||
        String(item.customer).toLowerCase().includes(keyword) ||
        String(item.service).toLowerCase().includes(keyword);

      const matchesRoom =
        roomFilter === 'all' || String(item.room) === String(roomFilter);

      return matchesSearch && matchesRoom;
    });
  }, [serviceUsages, searchTerm, roomFilter]);

  // Phân trang.
  const totalPages = Math.max(
    1,
    Math.ceil(filteredUsages.length / PAGE_SIZE)
  );

  const paginatedUsages = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;

    return filteredUsages.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredUsages, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roomFilter]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // Thống kê.
  const totalUsageCount = serviceUsages.length;

  const totalQuantity = serviceUsages.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const totalRevenue = serviceUsages.reduce(
    (sum, item) => sum + item.subtotal,
    0
  );

  const uniqueRoomCount = new Set(
    serviceUsages.map((item) => item.room)
  ).size;

  // Thêm lượt sử dụng dịch vụ.
  const handleAddServiceUsages = async (formData) => {
    try {
      const items = formData?.items || [];

      if (!formData?.RoomID || items.length === 0) {
        showToast('Vui lòng chọn phòng và dịch vụ.', 'error');
        return;
      }

      for (const item of items) {
        await createServiceUsageAPI({
          RoomID: Number(formData.RoomID),
          ServiceID: Number(item.ServiceID),
          Quantity: Number(item.Quantity),
        });
      }

      setShowAddModal(false);

      await loadServiceUsages();

      showToast('Thêm lượt sử dụng dịch vụ thành công.');
    } catch (error) {
      console.error('Lỗi thêm lượt sử dụng:', error);

      await loadServiceUsages();

      showToast(
        error?.response?.data?.message ||
          'Không thể thêm lượt sử dụng dịch vụ.',
        'error'
      );
    }
  };

  // Mở hộp thoại xác nhận xóa.
  const handleRequestDelete = (usage) => {
    if (!usage.isEditable || usage.isInvoiced) {
      showToast(
        'Lượt sử dụng này không thể xóa vì đã khóa hoặc đã lập hóa đơn.',
        'error'
      );
      return;
    }

    setDeleteTarget(usage);
  };

  // Xóa lượt sử dụng.
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      setDeleting(true);

      await deleteServiceUsageAPI(deleteTarget.usageId);

      setServiceUsages((previous) =>
        previous.filter(
          (item) => String(item.usageId) !== String(deleteTarget.usageId)
        )
      );

      if (
        selectedUsage &&
        selectedUsage.usageId === deleteTarget.usageId
      ) {
        setSelectedUsage(null);
      }

      setDeleteTarget(null);
      showToast('Xóa lượt sử dụng dịch vụ thành công.');
    } catch (error) {
      console.error('Lỗi xóa lượt sử dụng:', error);

      showToast(
        error?.response?.data?.message ||
          'Không thể xóa lượt sử dụng dịch vụ.',
        'error'
      );
    } finally {
      setDeleting(false);
    }
  };

  // Xuất CSV.
  const handleExportCSV = () => {
    if (filteredUsages.length === 0) {
      showToast('Không có dữ liệu để xuất.', 'error');
      return;
    }

    const headers = [
      'Mã sử dụng',
      'Phòng',
      'Khách hàng',
      'Dịch vụ',
      'Thời gian',
      'Số lượng',
      'Đơn vị',
      'Đơn giá',
      'Thành tiền',
    ];

    const rows = filteredUsages.map((item) => [
      item.usageId,
      item.room,
      item.customer,
      item.service,
      formatDateTime(item.date),
      item.quantity,
      item.unit,
      item.unitPrice,
      item.subtotal,
    ]);

    const csvContent = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row
          .map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`)
          .join(',')
      )
      .join('\n');

    const blob = new Blob(
      ['\uFEFF' + csvContent],
      { type: 'text/csv;charset=utf-8;' }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'danh-sach-su-dung-dich-vu.csv';
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Tiêu đề trang */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Quản lý sử dụng dịch vụ
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Theo dõi các dịch vụ khách hàng đã sử dụng trong thời gian lưu trú.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={loading ? 'animate-spin' : ''}
            />
            Làm mới
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Download size={16} />
            Xuất Excel
          </button>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus size={16} />
            Thêm dịch vụ
          </button>
        </div>
      </div>

      {/* Các thẻ thống kê */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Lượt sử dụng</p>
          <p className="mt-2 text-2xl font-bold text-gray-800">
            {totalUsageCount}
          </p>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Tổng số lượng</p>
          <p className="mt-2 text-2xl font-bold text-gray-800">
            {totalQuantity}
          </p>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Số phòng sử dụng</p>
          <p className="mt-2 text-2xl font-bold text-gray-800">
            {uniqueRoomCount}
          </p>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Tổng tiền dịch vụ</p>
          <p className="mt-2 text-2xl font-bold text-blue-600">
            {formatCurrency(totalRevenue)}
          </p>
        </div>
      </div>

      {/* Bộ lọc */}
      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Tìm theo phòng, khách hàng hoặc dịch vụ..."
              className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Calendar size={17} className="text-gray-400" />

            <select
              value={roomFilter}
              onChange={(event) => setRoomFilter(event.target.value)}
              className="min-w-[160px] rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
            >
              <option value="all">Tất cả phòng</option>

              {rooms.map((room) => (
                <option key={room} value={room}>
                  Phòng {room}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Bảng danh sách */}
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-5 py-4 font-semibold">#</th>
                <th className="px-5 py-4 font-semibold">
                  Phòng & khách hàng
                </th>
                <th className="px-5 py-4 font-semibold">Dịch vụ</th>
                <th className="px-5 py-4 font-semibold">Thời gian</th>
                <th className="px-5 py-4 text-center font-semibold">
                  Số lượng
                </th>
                <th className="px-5 py-4 text-right font-semibold">
                  Đơn giá
                </th>
                <th className="px-5 py-4 text-right font-semibold">
                  Thành tiền
                </th>
                <th className="px-5 py-4 text-center font-semibold">
                  Thao tác
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-12 text-center text-gray-500"
                  >
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : paginatedUsages.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-12 text-center text-gray-500"
                  >
                    Không tìm thấy lượt sử dụng dịch vụ nào.
                  </td>
                </tr>
              ) : (
                paginatedUsages.map((usage, index) => (
                  <tr
                    key={usage.usageId}
                    className="transition-colors hover:bg-gray-50"
                  >
                    <td className="px-5 py-4 text-gray-500">
                      {(currentPage - 1) * PAGE_SIZE + index + 1}
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-semibold text-gray-800">
                        Phòng {usage.room}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {usage.customer}
                      </p>
                    </td>

                    <td className="px-5 py-4 font-medium text-gray-800">
                      {usage.service}
                    </td>

                    <td className="px-5 py-4 text-gray-500">
                      {formatDateTime(usage.date)}
                    </td>

                    <td className="px-5 py-4 text-center text-gray-700">
                      {usage.quantity} {usage.unit}
                    </td>

                    <td className="px-5 py-4 text-right text-gray-700">
                      {formatCurrency(usage.unitPrice)}
                    </td>

                    <td className="px-5 py-4 text-right font-semibold text-gray-800">
                      {formatCurrency(usage.subtotal)}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          title="Xem chi tiết"
                          onClick={() => setSelectedUsage(usage)}
                          className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                        >
                          <Eye size={17} />
                        </button>

                        <button
                          type="button"
                          title="Xóa lượt sử dụng"
                          disabled={!usage.isEditable || usage.isInvoiced}
                          onClick={() => handleRequestDelete(usage)}
                          className="rounded-lg p-2 text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Phân trang */}
        {!loading && filteredUsages.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-500">
              Hiển thị{' '}
              {(currentPage - 1) * PAGE_SIZE + 1}–
              {Math.min(currentPage * PAGE_SIZE, filteredUsages.length)} trong{' '}
              {filteredUsages.length} lượt sử dụng
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((page) => page - 1)}
                className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
              >
                <ChevronLeft size={17} />
              </button>

              <span className="px-2 text-sm text-gray-600">
                Trang {currentPage} / {totalPages}
              </span>

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((page) => page + 1)}
                className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
              >
                <ChevronRight size={17} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal thêm dịch vụ */}
      {showAddModal && (
        <AddServiceUsageModal
          rooms={activeRooms}
          services={services}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddServiceUsages}
        />
      )}

      {/* Drawer chi tiết */}
      {selectedUsage && (
        <ServiceUsageDetailDrawer
          usage={selectedUsage}
          onClose={() => setSelectedUsage(null)}
          onDelete={() => {
            handleRequestDelete(selectedUsage);
          }}
        />
      )}

      {/* Xác nhận xóa */}
      {deleteTarget && (
        <DeleteConfirmModal
          isOpen={true}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleConfirmDelete}
          loading={deleting}
          title="Xóa lượt sử dụng dịch vụ"
          message={`Bạn có chắc chắn muốn xóa lượt sử dụng dịch vụ "${deleteTarget.service}" của phòng ${deleteTarget.room} không?`}
        />
      )}

      {/* Thông báo */}
      {toast && (
        <ToastNotification
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
