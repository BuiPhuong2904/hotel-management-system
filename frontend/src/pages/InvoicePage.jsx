import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  FiChevronLeft,
  FiChevronRight,
  FiEye,
  FiPlus,
  FiPrinter,
  FiRefreshCw,
  FiSearch,
} from 'react-icons/fi';
import CreateInvoiceDrawer from '../components/CreateInvoiceModal';
import InvoiceDetailDrawer from '../components/InvoiceDetailDrawer';
import ToastNotification from '../components/ToastNotification';
import invoiceService from '../services/invoiceService';
import { toDateInput } from '../utils/bookingMapper';
import { mapInvoiceDetail, mapInvoiceSummary } from '../utils/invoiceMapper';

const paymentChoices = [
  'Tiền mặt',
  'Chuyển khoản ngân hàng',
  'Thẻ tín dụng',
];

const apiError = (error) =>
  error.response?.data?.message || 'Không thể kết nối máy chủ, vui lòng thử lại!';

const statusStyles = {
  'Đã thanh toán': 'bg-[#2E8B57]',
  'Chờ thanh toán': 'bg-[#FFC542]',
  'Lỗi thanh toán': 'bg-[#D9534F]',
  'Đã hủy': 'bg-[#526575]',
};

const formatCurrency = (value) =>
  `${new Intl.NumberFormat('vi-VN').format(Math.round(value || 0))} đ`;

const formatDate = (value) => {
  const date = new Date(value);
  return `${String(date.getDate()).padStart(2, '0')}/${String(
    date.getMonth() + 1,
  ).padStart(2, '0')}/${date.getFullYear()}`;
};

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex h-[25px] items-center justify-center whitespace-nowrap rounded-full px-[10px] py-[2px] text-sm text-white ${statusStyles[status]}`}
    >
      {status}
    </span>
  );
}

function InvoicePage() {
  const location = useLocation();
  const navigate = useNavigate();
  // Khi bấm "Thanh toán và trả phòng" ở trang Đặt phòng sẽ mở sẵn form lập hóa đơn
  const [startBookingId] = useState(
    () => location.state?.createInvoiceForBookingId ?? null,
  );
  const [invoices, setInvoices] = useState([]);
  const [loadError, setLoadError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [createOpen, setCreateOpen] = useState(Boolean(startBookingId));
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState({ message: '', type: 'error' });
  const selectedInvoiceId = selectedInvoice?.id ?? null;

  useEffect(() => {
    if (startBookingId) navigate('/invoices', { replace: true, state: null });
  }, [navigate, startBookingId]);

  useEffect(() => {
    if (!toast.message) return undefined;
    const timeoutId = window.setTimeout(
      () => setToast({ message: '', type: 'error' }),
      3500,
    );
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await invoiceService.getInvoices();
        if (cancelled) return;
        setInvoices(res.data.map(mapInvoiceSummary));
        setLoadError('');
      } catch (error) {
        if (!cancelled) setLoadError(apiError(error));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const filteredInvoices = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('vi');
    return invoices.filter((invoice) => {
      const matchesSearch =
        !query ||
        [invoice.code, `BK-${invoice.bookingId}`, invoice.customer, invoice.phone]
          .some((value) => String(value).toLocaleLowerCase('vi').includes(query));
      const invoiceDate = toDateInput(new Date(invoice.date));
      return (
        matchesSearch &&
        (!statusFilter || invoice.status === statusFilter) &&
        (!methodFilter || invoice.paymentMethod === methodFilter) &&
        (!fromDate || invoiceDate >= fromDate) &&
        (!toDate || invoiceDate <= toDate)
      );
    });
  }, [fromDate, invoices, methodFilter, search, statusFilter, toDate]);

  const pageSize = 10;
  const pageCount = Math.max(1, Math.ceil(filteredInvoices.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visibleInvoices = filteredInvoices.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  const paidInvoices = invoices.filter(
    (invoice) => invoice.status === 'Đã thanh toán',
  );
  const paidRevenue = paidInvoices.reduce(
    (sum, invoice) => sum + invoice.totalAmount,
    0,
  );
  const vatTotal = paidInvoices.reduce((sum, invoice) => sum + invoice.vatAmount, 0);
  const discountTotal = paidInvoices.reduce((sum, invoice) => sum + invoice.discount, 0);

  const openInvoice = async (invoice) => {
    try {
      const res = await invoiceService.getInvoiceById(invoice.id);
      setSelectedInvoice(mapInvoiceDetail(res.data));
    } catch (error) {
      setToast({ message: apiError(error), type: 'error' });
    }
  };
  const closeInvoice = () => setSelectedInvoice(null);


  const handleCreateInvoice = async (payload) => {
    const res = await invoiceService.createInvoice(payload);
    setCreateOpen(false);
    setPage(1);
    setReloadKey((key) => key + 1);
    setToast({
      message: `Đã lập hóa đơn INV-${String(res.data.InvoiceID).padStart(4, '0')} và hoàn tất trả phòng.`,
      type: 'success',
    });
    setSelectedInvoice(mapInvoiceDetail(res.data));
  };

  const handlePrint = async (invoice) => {
    try {
      const blob = await invoiceService.downloadPdf(invoice.id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${invoice.code}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      setToast({ message: 'Không thể tải file PDF hóa đơn.', type: 'error' });
    }
  };

  const handleEmail = async (invoice, email) => {
    try {
      const res = await invoiceService.sendEmail(invoice.id, email || undefined);
      setToast({
        message: res.message || `Đã gửi hóa đơn ${invoice.code}.`,
        type: 'success',
      });
    } catch (error) {
      setToast({ message: apiError(error), type: 'error' });
    }
  };

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('');
    setMethodFilter('');
    setFromDate('');
    setToDate('');
    setPage(1);
  };

  const setSearchValue = (value) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <div className="flex min-w-0 flex-col gap-6">
      {loadError && (
        <p
          role="alert"
          className="rounded-lg border border-[#D9534F] bg-white px-4 py-3 text-sm text-[#D9534F]"
        >
          {loadError}
        </p>
      )}
      <section
        aria-label="Thống kê hóa đơn"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <article className="flex h-[136px] flex-col gap-2 rounded-xl border border-[#DCECF8] bg-white p-[17px] shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
          <h2 className="text-sm font-bold text-[#075A9C]">TỔNG DOANH THU</h2>
          <p className="pt-2 text-xl font-bold text-[#075A9C]">
            {formatCurrency(paidRevenue)}
          </p>
          <p className="text-xs text-[#526575]">Tổng đã thanh toán</p>
        </article>
        <article className="flex h-[136px] flex-col gap-2 rounded-xl border border-[#DCECF8] bg-white p-[17px] shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
          <h2 className="text-sm font-bold text-[#2E8B57]">ĐÃ THANH TOÁN</h2>
          <p className="pt-2 text-xl font-bold text-[#2E8B57]">
            {String(paidInvoices.length).padStart(2, '0')}
            <span className="ml-2 text-xs font-normal text-[#526575]">
              hóa đơn
            </span>
          </p>
          <p className="text-xs text-[#526575]">Hóa đơn đã ghi nhận thanh toán</p>
        </article>
        <article className="flex h-[136px] flex-col gap-2 rounded-xl border border-[#DCECF8] bg-white p-[17px] shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
          <h2 className="text-sm font-bold text-[#D97706]">THUẾ VAT ĐÃ THU</h2>
          <p className="pt-2 text-xl font-bold text-[#D97706]">
            {formatCurrency(vatTotal)}
          </p>
          <p className="text-xs text-[#526575]">Tổng VAT các hóa đơn đã thanh toán</p>
        </article>
        <article className="flex h-[136px] flex-col gap-2 rounded-xl border border-[#DCECF8] bg-white p-[17px] shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
          <h2 className="text-sm font-bold text-[#D9534F]">ĐÃ GIẢM GIÁ</h2>
          <p className="pt-2 text-xl font-bold text-[#D9534F]">
            {formatCurrency(discountTotal)}
          </p>
          <p className="text-xs text-[#526575]">Tổng khuyến mãi đã áp dụng</p>
        </article>
      </section>

      <section
        aria-label="Bộ lọc hóa đơn"
        className="flex flex-col gap-4 rounded-xl border border-[#DCECF8] bg-white p-4 xl:min-h-[120px] xl:flex-row xl:items-center xl:justify-between"
      >
        <div className="flex min-w-0 flex-col gap-3 xl:w-[400px]">
          <div className="flex gap-2">
            <label className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-lg border border-[#DCECF8] bg-[#F7FBFF] px-3">
              <FiSearch aria-hidden="true" className="h-4 w-4 shrink-0 text-[#526575]" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Tìm theo Mã HĐ, Mã Đặt phòng, Tên khách..."
                aria-label="Tìm theo mã hóa đơn, mã đặt phòng hoặc tên khách"
                className="min-w-0 flex-1 bg-transparent text-xs text-[#526575] outline-none placeholder:text-[#526575]"
              />
            </label>
            <button
              type="button"
              onClick={clearFilters}
              aria-label="Xóa bộ lọc"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#DCECF8] bg-white text-[#526575] hover:bg-[#F7FBFF]"
            >
              <FiRefreshCw aria-hidden="true" className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="flex h-10 items-center gap-2 rounded-lg border border-[#DCECF8] px-3 text-sm text-[#526575]">
              <span className="shrink-0">Từ:</span>
              <input
                type="date"
                value={fromDate}
                onChange={(event) => {
                  setFromDate(event.target.value);
                  setPage(1);
                }}
                aria-label="Từ ngày"
                className="min-w-0 flex-1 bg-transparent text-xs text-[#526575] outline-none"
              />
            </label>
            <label className="flex h-10 items-center gap-2 rounded-lg border border-[#DCECF8] px-3 text-sm text-[#526575]">
              <span className="shrink-0">Đến:</span>
              <input
                type="date"
                value={toDate}
                onChange={(event) => {
                  setToDate(event.target.value);
                  setPage(1);
                }}
                aria-label="Đến ngày"
                className="min-w-0 flex-1 bg-transparent text-xs text-[#526575] outline-none"
              />
            </label>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="flex h-10 min-w-[176px] items-center rounded-lg border border-[#DCECF8] px-3">
            <span className="sr-only">Lọc theo trạng thái</span>
            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setPage(1);
              }}
              className="w-full bg-white text-sm text-[#526575] outline-none"
            >
              <option value="">Trạng thái: Tất cả</option>
              {Object.keys(statusStyles).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
          <label className="flex h-10 min-w-[176px] items-center rounded-lg border border-[#DCECF8] px-3">
            <span className="sr-only">Lọc theo phương thức thanh toán</span>
            <select
              value={methodFilter}
              onChange={(event) => {
                setMethodFilter(event.target.value);
                setPage(1);
              }}
              className="w-full bg-white text-sm text-[#526575] outline-none"
            >
              <option value="">Phương thức: Tất cả</option>
              {paymentChoices.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
              <option value="—">Chưa chọn</option>
            </select>
          </label>
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="flex h-10 items-center justify-center gap-2 rounded-lg bg-[#0D8BEA] px-4 text-sm font-bold text-white hover:bg-[#075A9C]"
          >
            <FiPlus aria-hidden="true" className="h-4 w-4" />
            Lập hóa đơn
          </button>
        </div>
      </section>

      <section
        aria-labelledby="invoice-table-title"
        className="min-w-0 overflow-hidden rounded-xl border border-[#DCECF8] bg-white"
      >
        <div className="flex h-14 items-center justify-between border-b border-[#DCECF8] bg-white px-5">
          <div className="flex items-center gap-3">
            <h2
              id="invoice-table-title"
              className="text-lg font-bold text-[#075A9C]"
            >
              Hóa đơn thanh toán
            </h2>
            <span className="rounded-md border border-[#DCECF8] bg-[#E8F5FF] px-[9px] py-[3px] text-xs text-[#0D8BEA]">
              {filteredInvoices.length} kết quả
            </span>
          </div>
          <span className="hidden text-xs text-[#526575] sm:inline">
            Sắp xếp: Thứ tự mới nhất
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1134px] table-fixed border-collapse text-sm">
            <colgroup>
              <col style={{ width: 187 }} />
              <col style={{ width: 187 }} />
              <col style={{ width: 120 }} />
              <col style={{ width: 120 }} />
              <col style={{ width: 120 }} />
              <col style={{ width: 160 }} />
              <col style={{ width: 120 }} />
              <col style={{ width: 120 }} />
            </colgroup>
            <thead className="bg-[#F8FAFC]">
              <tr>
                <th scope="col" className="h-12 border-b-2 border-[#DCECF8] px-4 py-3 text-left text-sm font-bold text-[#526575]">
                  MÃ HĐ
                </th>
                <th scope="col" className="h-12 border-b-2 border-[#DCECF8] px-4 py-3 text-left text-sm font-bold text-[#526575]">
                  KHÁCH HÀNG
                </th>
                <th scope="col" className="h-12 border-b-2 border-[#DCECF8] px-4 py-3 text-right text-sm font-bold text-[#526575]">
                  TỔNG TIỀN
                </th>
                <th scope="col" className="h-12 border-b-2 border-[#DCECF8] px-4 py-3 text-right text-sm font-bold text-[#526575]">
                  KHẤU TRỪ CỌC
                </th>
                <th scope="col" className="h-12 border-b-2 border-[#DCECF8] px-4 py-3 text-right text-sm font-bold text-[#526575]">
                  CẦN THU
                </th>
                <th scope="col" className="h-12 border-b-2 border-[#DCECF8] px-4 py-3 text-center text-sm font-bold text-[#526575]">
                  TRẠNG THÁI
                </th>
                <th scope="col" className="h-12 border-b-2 border-[#DCECF8] px-4 py-3 text-center text-sm font-bold text-[#526575]">
                  NGÀY LẬP
                </th>
                <th scope="col" className="h-12 border-b-2 border-[#DCECF8] px-4 py-3 text-center text-sm font-bold text-[#526575]">
                  THAO TÁC
                </th>
              </tr>
            </thead>
            <tbody>
              {visibleInvoices.map((invoice) => {
                const isSelected = invoice.id === selectedInvoiceId;
                return (
                  <tr
                    key={invoice.id}
                    onClick={() => openInvoice(invoice)}
                    aria-selected={isSelected}
                    className={`h-12 cursor-pointer border-b border-[#DCECF8] ${
                      isSelected ? 'bg-[#DCECF8]' : 'bg-white'
                    }`}
                  >
                    <td className="h-12 px-4 py-3 text-left text-sm text-[#526575]">
                      {invoice.code}
                    </td>
                    <td className="h-12 px-4 py-2 text-left text-sm text-[#526575]">
                      <div className="leading-[18px]">
                        <p className="font-bold">{invoice.customer}</p>
                        <p>{invoice.phone}</p>
                      </div>
                    </td>
                    <td className="h-12 px-4 py-3 text-right text-sm text-[#526575]">
                      {formatCurrency(invoice.totalAmount)}
                    </td>
                    <td className="h-12 px-4 py-3 text-right text-sm text-[#526575]">
                      {invoice.deposit ? formatCurrency(invoice.deposit) : '—'}
                    </td>
                    <td
                      className={`h-12 px-4 py-3 text-right text-sm font-bold ${
                        invoice.amountDue === 0
                          ? 'text-[#047857]'
                          : 'text-[#B45309]'
                      }`}
                    >
                      {formatCurrency(invoice.amountDue)}
                    </td>
                    <td className="h-12 px-4 py-3 text-center">
                      <StatusBadge status={invoice.status} />
                    </td>
                    <td className="h-12 px-4 py-3 text-center text-sm text-[#526575]">
                      {formatDate(invoice.date)}
                    </td>
                    <td className="h-12 px-3 py-2">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          aria-label={`Xem chi tiết ${invoice.code}`}
                          onClick={(event) => {
                            event.stopPropagation();
                            openInvoice(invoice);
                          }}
                          className="flex h-8 w-8 items-center justify-center rounded text-[#526575] hover:bg-[#E8F5FF] hover:text-[#0D8BEA]"
                        >
                          <FiEye aria-hidden="true" className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          aria-label={`In hóa đơn ${invoice.code}`}
                          onClick={(event) => {
                            event.stopPropagation();
                            handlePrint(invoice);
                          }}
                          className="flex h-8 w-8 items-center justify-center rounded text-[#526575] hover:bg-[#E8F5FF] hover:text-[#0D8BEA]"
                        >
                          <FiPrinter aria-hidden="true" className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {visibleInvoices.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="h-24 px-4 text-center text-sm text-[#526575]"
                  >
                    Không tìm thấy hóa đơn phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <footer className="flex min-h-[50px] flex-wrap items-center justify-center gap-2 border-t border-[#DCECF8] px-4 py-2 text-sm text-[#526575]">
          <button
            type="button"
            aria-label="Trang trước"
            disabled={currentPage === 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            className="flex h-8 w-8 items-center justify-center rounded disabled:opacity-40"
          >
            <FiChevronLeft aria-hidden="true" />
          </button>
          {Array.from({ length: pageCount }, (_, index) => index + 1).map(
            (pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                aria-current={pageNumber === currentPage ? 'page' : undefined}
                onClick={() => setPage(pageNumber)}
                className={`flex h-8 w-8 items-center justify-center ${
                  pageNumber === currentPage
                    ? 'bg-[#0D8BEA] text-white'
                    : 'text-[#526575]'
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
            className="flex h-8 w-8 items-center justify-center rounded disabled:opacity-40"
          >
            <FiChevronRight aria-hidden="true" />
          </button>
          <span className="basis-full text-center text-xs text-[#526575]">
          Hiển thị {filteredInvoices.length ? (currentPage - 1) * pageSize + 1 : 0}-
          {Math.min(currentPage * pageSize, filteredInvoices.length)} trên tổng{' '}
            {filteredInvoices.length} hóa đơn
          </span>
        </footer>
      </section>

      {createOpen && (
        <CreateInvoiceDrawer
          paymentChoices={paymentChoices}
          initialBookingId={startBookingId}
          onClose={() => setCreateOpen(false)}
          onCreate={handleCreateInvoice}
        />
      )}
      {selectedInvoice && (
        <InvoiceDetailDrawer
          invoice={selectedInvoice}
          onClose={closeInvoice}
          onPrint={handlePrint}
          onEmail={handleEmail}
        />
      )}
      <ToastNotification message={toast.message} type={toast.type} />
    </div>
  );
}

export default InvoicePage;