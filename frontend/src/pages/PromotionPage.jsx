import { useEffect, useMemo, useState } from 'react';
import {
  FiCalendar,
  FiChevronDown,
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
import AddPromotionModal from '../components/AddPromotionModal';
import EditPromotionModal from '../components/EditPromotionModal';
import PromotionDetailDrawer from '../components/PromotionDetailDrawer';
import SuspendPromotionModal from '../components/SuspendPromotionModal';
import ToastNotification from '../components/ToastNotification';
import { parsePromotionDate, promotionSeedData } from '../data/promotions';

const pageSize = 10;

const formatMoney = (value) => `${new Intl.NumberFormat('vi-VN').format(value)} đ`;

const parseFilterDate = (value) => {
  if (!value.trim()) return null;
  return parsePromotionDate(value);
};

function StatisticCard({ label, value, detail, color }) {
  return (
    <section className="flex min-h-[136px] min-w-0 flex-col gap-2 rounded-xl border border-[#DCECF8] bg-white p-[17px] shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
      <h2 className={`text-sm font-bold ${color}`}>{label}</h2>
      <div className="pt-2">
        <p className={`text-xl font-bold ${color}`}>{value}</p>
        <p className="mt-1 text-xs text-[#526575]">{detail}</p>
      </div>
    </section>
  );
}

function PromotionPage() {
  const [promotions, setPromotions] = useState(promotionSeedData);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tất cả');
  const [startFilter, setStartFilter] = useState('');
  const [endFilter, setEndFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState(null);
  const [suspendingPromotion, setSuspendingPromotion] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  useEffect(() => {
    if (!toast.message) return undefined;
    const timeoutId = window.setTimeout(
      () => setToast({ message: '', type: 'success' }),
      3500,
    );
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  const selectedPromotion = promotions.find((item) => item.id === selectedId) || null;

  const filteredPromotions = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('vi');
    const from = parseFilterDate(startFilter);
    const to = parseFilterDate(endFilter);

    return promotions.filter((promotion) => {
      const matchesSearch =
        !query ||
        `${promotion.code} ${promotion.note}`
          .toLocaleLowerCase('vi')
          .includes(query);
      const matchesStatus =
        statusFilter === 'Tất cả' || promotion.status === statusFilter;
      const campaignStart = parsePromotionDate(promotion.startDate);
      const campaignEnd = parsePromotionDate(promotion.endDate);
      const matchesFrom = !from || campaignEnd >= from;
      const matchesTo = !to || campaignStart <= to;

      return matchesSearch && matchesStatus && matchesFrom && matchesTo;
    });
  }, [endFilter, promotions, search, startFilter, statusFilter]);

  const pageCount = Math.max(1, Math.ceil(filteredPromotions.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visiblePromotions = filteredPromotions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  const usageTotal = promotions.reduce((total, item) => total + item.usageCount, 0);
  const discountedTotal = promotions.reduce(
    (total, item) => total + item.totalDiscounted,
    0,
  );
  const activeCount = promotions.filter(
    (item) => item.status === 'Đang áp dụng',
  ).length;

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('Tất cả');
    setStartFilter('');
    setEndFilter('');
    setPage(1);
  };

  const showSuccess = (message) => setToast({ message, type: 'success' });

  const createPromotion = (values) => {
    const duplicate = promotions.some(
      (promotion) => promotion.code.toLocaleUpperCase('vi') === values.code,
    );
    if (duplicate) {
      setToast({ message: 'Mã khuyến mãi này đã tồn tại.', type: 'error' });
      return false;
    }

    setPromotions((current) => [
      {
        ...values,
        id: `${values.code}-${Date.now()}`,
        usageCount: 0,
        totalDiscounted: 0,
        usageHistory: [],
      },
      ...current,
    ]);
    setPage(1);
    showSuccess('Tạo mã khuyến mãi thành công.');
    return true;
  };

  const savePromotion = (values) => {
    setPromotions((current) =>
      current.map((promotion) =>
        promotion.id === values.id ? { ...promotion, ...values } : promotion,
      ),
    );
    setEditingPromotion(null);
    showSuccess('Cập nhật mã khuyến mãi thành công.');
    return true;
  };

  const togglePromotionStatus = (promotion) => {
    if (promotion.status === 'Đang áp dụng') {
      setSuspendingPromotion(promotion);
      return;
    }

    setPromotions((current) =>
      current.map((item) =>
        item.id === promotion.id
          ? { ...item, status: 'Đang áp dụng' }
          : item,
      ),
    );
    setSuspendingPromotion(null);
    showSuccess(`Đã kích hoạt lại mã ${promotion.code}.`);
  };

  const suspendPromotion = () => {
    if (!suspendingPromotion) return;
    const { id, code } = suspendingPromotion;
    setPromotions((current) =>
      current.map((item) =>
        item.id === id ? { ...item, status: 'Tạm ngưng' } : item,
      ),
    );
    setSuspendingPromotion(null);
    showSuccess(`Đã tạm ngưng mã ${code}.`);
  };

  const exportCsv = () => {
    const headers = [
      'Mã khuyến mãi',
      'Mức giảm (%)',
      'Giảm tối đa (VNĐ)',
      'Từ ngày',
      'Đến ngày',
      'Trạng thái',
      'Lượt sử dụng',
      'Tổng chiết khấu (VNĐ)',
      'Ghi chú',
    ];
    const rows = filteredPromotions.map((promotion) => [
      promotion.code,
      promotion.discountPercent,
      promotion.maxDiscount,
      promotion.startDate,
      promotion.endDate,
      promotion.status,
      promotion.usageCount,
      promotion.totalDiscounted,
      promotion.note,
    ]);
    const escapeCsv = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;
    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCsv).join(','))
      .join('\r\n');
    const blob = new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'danh-sach-khuyen-mai.csv';
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const dateFilter = (value, setValue, label) => (
    <label className="flex h-10 min-w-0 items-center gap-2 rounded-lg border border-[#DCECF8] bg-white px-3 text-sm text-[#526575] focus-within:border-[#0D8BEA]">
      <span className="shrink-0">{label}:</span>
      <input
        type="text"
        value={value}
        onChange={(event) => {
          setValue(event.target.value);
          setPage(1);
        }}
        placeholder="DD/MM/YYYY"
        aria-label={`${label} ngày`}
        className="min-w-0 w-full bg-transparent outline-none placeholder:text-[#526575]/80"
      />
      <FiCalendar aria-hidden="true" className="h-4 w-4 shrink-0" />
    </label>
  );

  return (
    <div className="space-y-6 pb-6">
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatisticCard
          label="TỔNG KHUYẾN MÃI"
          value={String(promotions.length).padStart(2, '0')}
          detail="Toàn bộ chiến dịch"
          color="text-[#0D8BEA]"
        />
        <StatisticCard
          label="ĐANG ÁP DỤNG"
          value={String(activeCount).padStart(2, '0')}
          detail="Đang có hiệu lực"
          color="text-[#2E8B57]"
        />
        <StatisticCard
          label="LƯỢT SỬ DỤNG"
          value={usageTotal}
          detail="Tổng số đơn đã áp mã"
          color="text-[#F97316]"
        />
        <StatisticCard
          label="TỔNG CHIẾT KHẤU"
          value={formatMoney(discountedTotal)}
          detail="Tổng tiền đã giảm trừ"
          color="text-[#075A9C]"
        />
      </section>

      <section
        aria-label="Bộ lọc khuyến mãi"
        className="flex flex-col gap-3 rounded-xl border border-[#DCECF8] bg-white p-3 sm:p-4"
      >
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex h-10 min-w-[220px] flex-1 items-center gap-2 rounded-lg border border-[#DCECF8] bg-[#F7FBFF] px-3 text-sm text-[#526575] focus-within:border-[#0D8BEA]">
            <FiSearch aria-hidden="true" className="h-4 w-4 shrink-0" />
            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Tìm theo mã khuyến mãi,..."
              aria-label="Tìm theo mã khuyến mãi"
              className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-[#526575]/80"
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
            Thêm khuyến mãi
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex h-10 min-w-[155px] items-center gap-2 rounded-lg border border-[#DCECF8] bg-white px-3 focus-within:border-[#0D8BEA]">
            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setPage(1);
              }}
              aria-label="Lọc theo trạng thái"
              className="h-full min-w-0 flex-1 appearance-none bg-transparent text-sm text-[#526575] outline-none"
            >
              <option value="Tất cả">Trạng thái: Tất cả</option>
              <option value="Đang áp dụng">Đang áp dụng</option>
              <option value="Tạm ngưng">Tạm ngưng</option>
            </select>
            <FiChevronDown
              aria-hidden="true"
              className="h-4 w-4 shrink-0 text-[#526575]"
            />
          </label>
          {dateFilter(startFilter, setStartFilter, 'Từ')}
          {dateFilter(endFilter, setEndFilter, 'Đến')}
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-[#DCECF8] bg-white">
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-[#DCECF8] px-4 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-bold text-[#075A9C]">
              Danh sách mã khuyến mãi
            </h2>
            <span className="rounded bg-[#E8F5FF] px-2 py-0.5 text-xs font-semibold text-[#0D8BEA]">
              {filteredPromotions.length} kết quả
            </span>
          </div>
          <p className="text-xs text-[#526575]">Sắp xếp: Thứ tự tăng dần</p>
        </header>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[930px] table-fixed border-collapse text-sm text-[#526575]">
            <colgroup>
              <col className="w-[5%]" />
              <col className="w-[20%]" />
              <col className="w-[12%]" />
              <col className="w-[15%]" />
              <col className="w-[23%]" />
              <col className="w-[13%]" />
              <col className="w-[12%]" />
            </colgroup>
            <thead className="border-b-2 border-[#DCECF8] bg-[#F8FAFC] text-sm font-bold text-[#526575]">
              <tr>
                <th scope="col" className="whitespace-nowrap px-3 py-3 text-center">#</th>
                <th scope="col" className="whitespace-nowrap px-3 py-3 text-left">MÃ KHUYẾN MÃI</th>
                <th scope="col" className="whitespace-nowrap px-3 py-3 text-center">MỨC GIẢM</th>
                <th scope="col" className="whitespace-nowrap px-3 py-3 text-right">GIẢM TỐI ĐA</th>
                <th scope="col" className="whitespace-nowrap px-3 py-3 text-center">THỜI GIAN ÁP DỤNG</th>
                <th scope="col" className="whitespace-nowrap px-3 py-3 text-center">TRẠNG THÁI</th>
                <th scope="col" className="whitespace-nowrap px-3 py-3 text-center">THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {visiblePromotions.map((promotion, index) => {
                const isOpen = selectedId === promotion.id;
                const isActive = promotion.status === 'Đang áp dụng';
                return (
                  <tr
                    key={promotion.id}
                    tabIndex={0}
                    onClick={() => setSelectedId(promotion.id)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        setSelectedId(promotion.id);
                      }
                    }}
                    className={`cursor-pointer border-b border-[#DCECF8] text-sm transition-colors ${
                      isOpen ? 'bg-[#E8F5FF]' : 'bg-white hover:bg-[#F7FBFF]'
                    }`}
                  >
                    <td className="whitespace-nowrap px-3 py-2.5 text-center">
                      {(currentPage - 1) * pageSize + index + 1}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-left font-medium">
                      {promotion.code}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-center">
                      {promotion.discountPercent}%
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-right">
                      {formatMoney(promotion.maxDiscount)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-center">
                      {promotion.startDate} - {promotion.endDate}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-center">
                      <span
                        className={`inline-flex h-6 items-center rounded-full px-2.5 text-sm text-white ${
                          isActive ? 'bg-[#2E8B57]' : 'bg-[#526575]'
                        }`}
                      >
                        {promotion.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          aria-label={`Xem chi tiết ${promotion.code}`}
                          title="Xem chi tiết"
                          onClick={(event) => {
                            event.stopPropagation();
                            setSelectedId(promotion.id);
                          }}
                          className="rounded p-1 text-[#526575] hover:bg-[#DCECF8]"
                        >
                          <FiEye aria-hidden="true" className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          aria-label={`Chỉnh sửa ${promotion.code}`}
                          title="Chỉnh sửa"
                          onClick={(event) => {
                            event.stopPropagation();
                            setEditingPromotion(promotion);
                          }}
                          className="rounded p-1 text-[#0D8BEA] hover:bg-[#E8F5FF]"
                        >
                          <FiEdit2 aria-hidden="true" className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          aria-label={
                            isActive
                              ? `Tạm ngưng ${promotion.code}`
                              : `Kích hoạt ${promotion.code}`
                          }
                          title={isActive ? 'Tạm ngưng' : 'Kích hoạt lại'}
                          onClick={(event) => {
                            event.stopPropagation();
                            togglePromotionStatus(promotion);
                          }}
                          className={`rounded p-1 hover:bg-[#F7FBFF] ${
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
              {visiblePromotions.length === 0 && (
                <tr>
                  <td
                    colSpan="7"
                    className="bg-white px-4 py-8 text-center text-sm text-[#526575]"
                  >
                    Không tìm thấy mã khuyến mãi phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="space-y-1 px-4 py-2 text-center">
          <nav
            aria-label="Phân trang danh sách khuyến mãi"
            className="flex items-center justify-center gap-1"
          >
            <button
              type="button"
              aria-label="Trang trước"
              disabled={currentPage === 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className="flex h-8 w-8 items-center justify-center rounded text-[#526575] hover:bg-[#F7FBFF] disabled:opacity-50"
            >
              <FiChevronLeft aria-hidden="true" className="h-4 w-4" />
            </button>
            {Array.from({ length: pageCount }, (_, index) => index + 1).map(
              (pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  aria-current={pageNumber === currentPage ? 'page' : undefined}
                  onClick={() => setPage(pageNumber)}
                  className={`flex h-8 min-w-8 items-center justify-center rounded px-2 text-sm ${
                    pageNumber === currentPage
                      ? 'bg-[#0D8BEA] font-semibold text-white'
                      : 'text-[#526575] hover:bg-[#F7FBFF]'
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
              onClick={() =>
                setPage((current) => Math.min(pageCount, current + 1))
              }
              className="flex h-8 w-8 items-center justify-center rounded text-[#526575] hover:bg-[#F7FBFF] disabled:opacity-50"
            >
              <FiChevronRight aria-hidden="true" className="h-4 w-4" />
            </button>
          </nav>
          <p className="text-xs text-[#526575]">
            Hiển thị{' '}
            {filteredPromotions.length === 0
              ? 0
              : (currentPage - 1) * pageSize + 1}
            -
            {Math.min(currentPage * pageSize, filteredPromotions.length)} trên
            tổng {filteredPromotions.length} mã khuyến mãi
          </p>
        </div>
      </section>

      {addModalOpen && (
        <AddPromotionModal
          promotions={promotions}
          onClose={() => setAddModalOpen(false)}
          onCreate={createPromotion}
        />
      )}
      {editingPromotion && (
        <EditPromotionModal
          promotion={editingPromotion}
          promotions={promotions}
          onClose={() => setEditingPromotion(null)}
          onSave={savePromotion}
        />
      )}
      {selectedPromotion && (
        <PromotionDetailDrawer
          promotion={selectedPromotion}
          onClose={() => setSelectedId(null)}
          onToggleStatus={togglePromotionStatus}
        />
      )}
      {suspendingPromotion && (
        <SuspendPromotionModal
          promotion={suspendingPromotion}
          onCancel={() => setSuspendingPromotion(null)}
          onConfirm={suspendPromotion}
        />
      )}
      <ToastNotification message={toast.message} type={toast.type} />
    </div>
  );
}

export default PromotionPage;
