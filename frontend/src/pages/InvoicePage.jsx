import { useEffect, useMemo, useState } from 'react';
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

const paymentChoices = [
  'Tiền mặt',
  'Chuyển khoản ngân hàng',
  'Thẻ tín dụng',
];

const room = (number, type, days, nightlyRate, services = []) => ({
  number,
  type,
  days,
  nightlyRate,
  services,
});

const service = (name, quantity, unit, amount) => ({
  name,
  quantity,
  unit,
  amount,
});

const makeSingleRoomInvoice = ({
  code,
  customer,
  phone,
  bookingCode,
  totalAmount,
  deposit,
  status,
  date,
  paymentMethod,
  roomNumber,
  roomType = 'A',
  days = 2,
  discount = 0,
  cashier = 'Trần B',
  billingName = customer,
  billingAddress = '123 Lê Lợi, TP.HCM',
  services = [],
}) => ({
  id: code,
  code,
  customer,
  phone,
  billingName,
  billingAddress,
  bookingCode,
  totalAmount,
  deposit,
  discount,
  discountReason: '',
  amountDue:
    status === 'Đã thanh toán' || status === 'Đã hủy'
      ? 0
      : Math.max(totalAmount - deposit - discount, 0),
  status,
  date,
  cashier,
  paymentMethod,
  rooms: [
    room(
      roomNumber,
      roomType,
      days,
      (totalAmount - services.reduce((sum, item) => sum + item.amount, 0)) /
        days,
      services,
    ),
  ],
});

const initialInvoices = [
  {
    id: 'INV-2026-1024-001',
    code: 'INV-2026-1024-001',
    customer: 'Nguyễn Minh Anh',
    phone: '0912839123',
    billingName: 'Nguyễn Minh Anh / Công ty TNHH ABC',
    billingAddress: '123 Lê Lợi, TP.HCM',
    bookingCode: 'BK-2026-1011',
    totalAmount: 2000000,
    deposit: 600000,
    discount: 0,
    discountReason: '',
    amountDue: 0,
    status: 'Đã thanh toán',
    date: '2026-10-24T14:30:00',
    cashier: 'Trần B',
    paymentMethod: 'Chuyển khoản ngân hàng',
    rooms: [
      room('101', 'A', 2, 500000, [
        service('Giặt ủi', 1, 'bộ', 40000),
        service('Nước suối', 2, 'chai', 60000),
      ]),
      room('102', 'B', 2, 400000, [
        service('Bữa sáng', 1, 'suất', 100000),
      ]),
    ],
  },
  makeSingleRoomInvoice({
    code: 'INV-2026-1024-002',
    customer: 'Trần Thị Mai',
    phone: '0977123456',
    bookingCode: 'BK-2026-1012',
    totalAmount: 850000,
    deposit: 0,
    status: 'Chờ thanh toán',
    date: '2026-10-24T13:45:00',
    paymentMethod: 'Tiền mặt',
    roomNumber: '105',
    services: [service('Nước suối', 1, 'chai', 50000)],
  }),
  makeSingleRoomInvoice({
    code: 'INV-2026-1024-003',
    customer: 'David',
    phone: '0904551234',
    bookingCode: 'BK-2026-1013',
    totalAmount: 5000000,
    deposit: 2500000,
    status: 'Chờ thanh toán',
    date: '2026-10-24T12:15:00',
    paymentMethod: 'Chuyển khoản ngân hàng',
    roomNumber: '201',
    roomType: 'VIP',
    days: 4,
    billingName: 'David / David Trading',
  }),
  makeSingleRoomInvoice({
    code: 'INV-2026-1024-004',
    customer: 'Lê Thu Hà',
    phone: '0936994789',
    bookingCode: 'BK-2026-1014',
    totalAmount: 864000,
    deposit: 0,
    status: 'Đã thanh toán',
    date: '2026-10-24T11:30:00',
    paymentMethod: 'Thẻ tín dụng',
    roomNumber: '108',
  }),
  makeSingleRoomInvoice({
    code: 'INV-2026-1024-005',
    customer: 'Phạm Quốc Bảo',
    phone: '0981334888',
    bookingCode: 'BK-2026-1015',
    totalAmount: 526000,
    deposit: 0,
    status: 'Lỗi thanh toán',
    date: '2026-10-24T10:20:00',
    paymentMethod: 'Thẻ tín dụng',
    roomNumber: '110',
  }),
  makeSingleRoomInvoice({
    code: 'INV-2026-1023-006',
    customer: 'Hoàng Đức Vinh',
    phone: '0918765432',
    bookingCode: 'BK-2026-1016',
    totalAmount: 162000,
    deposit: 0,
    status: 'Đã thanh toán',
    date: '2026-10-23T16:10:00',
    paymentMethod: 'Tiền mặt',
    roomNumber: '111',
    days: 1,
  }),
  makeSingleRoomInvoice({
    code: 'INV-2026-1023-007',
    customer: 'Vũ Phương Thảo',
    phone: '0945678123',
    bookingCode: 'BK-2026-1017',
    totalAmount: 1144800,
    deposit: 0,
    status: 'Đã thanh toán',
    date: '2026-10-23T14:50:00',
    paymentMethod: 'Chuyển khoản ngân hàng',
    roomNumber: '202',
    days: 3,
  }),
  makeSingleRoomInvoice({
    code: 'INV-2026-1022-008',
    customer: 'Đặng Quang Huy',
    phone: '0908123999',
    bookingCode: 'BK-2026-1018',
    totalAmount: 2052000,
    deposit: 1000000,
    status: 'Chờ thanh toán',
    date: '2026-10-22T17:10:00',
    paymentMethod: 'Chuyển khoản ngân hàng',
    roomNumber: '203',
    days: 3,
  }),
  makeSingleRoomInvoice({
    code: 'INV-2026-1022-009',
    customer: 'Ngô Thành Tùng',
    phone: '0967888999',
    bookingCode: 'BK-2026-1019',
    totalAmount: 237600,
    deposit: 0,
    status: 'Đã thanh toán',
    date: '2026-10-22T15:40:00',
    paymentMethod: 'Tiền mặt',
    roomNumber: '106',
  }),
  makeSingleRoomInvoice({
    code: 'INV-2026-1021-010',
    customer: 'Emma Watson',
    phone: '0911223344',
    bookingCode: 'BK-2026-1020',
    totalAmount: 1620000,
    deposit: 0,
    status: 'Đã hủy',
    date: '2026-10-21T09:00:00',
    paymentMethod: '—',
    roomNumber: '301',
    roomType: 'VIP',
    days: 3,
  }),
  makeSingleRoomInvoice({
    code: 'INV-2026-1020-011',
    customer: 'Nguyễn Hoàng Yến',
    phone: '0903112233',
    bookingCode: 'BK-2026-1021',
    totalAmount: 916000,
    deposit: 0,
    status: 'Đã thanh toán',
    date: '2026-10-20T14:00:00',
    paymentMethod: 'Chuyển khoản ngân hàng',
    roomNumber: '112',
  }),
];

const initialBookings = [
  {
    code: 'BK-2026-1011',
    representative: 'Nguyễn Minh Anh',
    status: 'Completed',
    deposit: 600000,
    billingName: 'Nguyễn Minh Anh / Công ty TNHH ABC',
    phone: '0912839123',
    address: '123 Lê Lợi, TP.HCM',
    rooms: [
      room('101', 'A', 2, 500000, [
        service('Giặt ủi', 1, 'bộ', 40000),
        service('Nước suối', 2, 'chai', 60000),
      ]),
      room('102', 'B', 2, 400000, [
        service('Bữa sáng', 1, 'suất', 100000),
      ]),
    ],
  },
  {
    code: 'BK-2026-1012',
    representative: 'Trần Thị Mai',
    status: 'CheckedIn',
    deposit: 500000,
    billingName: 'Trần Thị Mai',
    phone: '0977123456',
    address: '45 Nguyễn Huệ, TP.HCM',
    rooms: [
      room('101', 'A', 2, 500000, [
        service('Giặt ủi', 1, 'bộ', 40000),
        service('Nước suối', 2, 'chai', 60000),
      ]),
      room('102', 'B', 2, 350000),
    ],
  },
  {
    code: 'BK-2026-1013',
    representative: 'David',
    status: 'Completed',
    deposit: 250000,
    billingName: 'David / David Trading',
    phone: '0904551234',
    address: '88 Đồng Khởi, TP.HCM',
    rooms: [room('201', 'VIP', 2, 500000, [service('Minibar', 1, 'lần', 50000)])],
  },
  {
    code: 'BK-2026-1022',
    representative: 'Lê Thị Hương',
    status: 'Confirmed',
    deposit: 300000,
    billingName: 'Lê Thị Hương',
    phone: '0909112233',
    address: '',
    rooms: [room('107', 'A', 2, 450000)],
  },
  {
    code: 'BK-2026-1026',
    representative: 'Nguyễn Văn A',
    status: 'CheckedIn',
    deposit: 500000,
    billingName: 'Nguyễn Văn A',
    phone: '0912839123',
    address: '123 Lê Lợi, TP.HCM',
    rooms: [
      room('P.101', 'Loại A', 2, 500000, [
        service('Giặt ủi', 1, 'bộ', 40000),
        service('Nước suối', 2, 'chai', 60000),
      ]),
      room('P.102', 'Loại B', 2, 350000),
    ],
  },
  {
    code: 'BK-2026-1027',
    representative: 'Phạm Thu Trang',
    status: 'Completed',
    deposit: 0,
    billingName: 'Phạm Thu Trang',
    phone: '0938123456',
    address: '12 Trần Hưng Đạo, TP.HCM',
    rooms: [room('P.205', 'Loại A', 2, 600000, [service('Minibar', 1, 'lần', 50000)])],
  },
];

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

const getRoomTotal = (roomItem) =>
  roomItem.days * roomItem.nightlyRate +
  roomItem.services.reduce((sum, item) => sum + item.amount, 0);

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
  const [invoices, setInvoices] = useState(initialInvoices);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState({ message: '', type: 'error' });

  useEffect(() => {
    if (!toast.message) return undefined;
    const timeoutId = window.setTimeout(
      () => setToast({ message: '', type: 'error' }),
      3500,
    );
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  const selectedInvoice =
    invoices.find((invoice) => invoice.id === selectedInvoiceId) || null;

  const filteredInvoices = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('vi');
    return invoices.filter((invoice) => {
      const matchesSearch =
        !query ||
        [invoice.code, invoice.bookingCode, invoice.customer]
          .some((value) => value.toLocaleLowerCase('vi').includes(query));
      const invoiceDate = invoice.date.slice(0, 10);
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
  const pendingCount = invoices.filter(
    (invoice) => invoice.status === 'Chờ thanh toán',
  ).length;
  const failedCount = invoices.filter(
    (invoice) => invoice.status === 'Lỗi thanh toán',
  ).length;

  const openInvoice = (invoice) => setSelectedInvoiceId(invoice.id);
  const closeInvoice = () => setSelectedInvoiceId(null);

  const handleCreateInvoice = (
    booking,
    discount,
    discountReason,
    method,
    reference,
  ) => {
    const totalAmount = booking.rooms.reduce(
      (sum, roomItem) => sum + getRoomTotal(roomItem),
      0,
    );
    const amountDue = Math.max(
      totalAmount - booking.deposit - discount,
      0,
    );
    const createdAt = new Date();
    const newInvoice = {
      id: `INV-${Date.now()}`,
      code: `INV-${createdAt.getFullYear()}-${String(
        createdAt.getMonth() + 1,
      ).padStart(2, '0')}${String(createdAt.getDate()).padStart(2, '0')}-${String(
        invoices.length + 1,
      ).padStart(3, '0')}`,
      customer: booking.representative,
      phone: booking.phone,
      billingName: booking.billingName,
      billingAddress: booking.address || '—',
      bookingCode: booking.code,
      totalAmount,
      deposit: booking.deposit,
      discount,
      discountReason,
      amountDue,
      status: 'Chờ thanh toán',
      date: createdAt.toISOString(),
      cashier: 'Trần B',
      paymentMethod: method,
      transactionReference: reference,
      rooms: booking.rooms,
    };
    setInvoices((currentInvoices) => [newInvoice, ...currentInvoices]);
    setPage(1);
    setCreateOpen(false);
    setToast({
      message: `Đã lập hóa đơn ${newInvoice.code} thành công.`,
      type: 'success',
    });
  };

  const handlePayment = (invoice, method) => {
    setInvoices((currentInvoices) =>
      currentInvoices.map((item) =>
        item.id === invoice.id
          ? {
              ...item,
              status: 'Đã thanh toán',
              amountDue: 0,
              paymentMethod: method,
              paidAt: new Date().toISOString(),
            }
          : item,
      ),
    );
    closeInvoice();
    setToast({
      message: `Đã xác nhận thu tiền hóa đơn ${invoice.code}.`,
      type: 'success',
    });
  };

  const handlePrint = (invoice) =>
    setToast({
      message: `Đã xuất hóa đơn VAT ${invoice.code} thành công.`,
      type: 'success',
    });

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
          <p className="text-xs text-[#526575]">
            So với hôm qua: <span className="text-[#2E8B57]">+15%</span>
          </p>
        </article>
        <article className="flex h-[136px] flex-col gap-2 rounded-xl border border-[#DCECF8] bg-white p-[17px] shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
          <h2 className="text-sm font-bold text-[#D97706]">CHỜ THANH TOÁN</h2>
          <p className="pt-2 text-xl font-bold text-[#D97706]">
            {String(pendingCount).padStart(2, '0')}
            <span className="ml-2 text-xs font-normal text-[#526575]">
              hóa đơn
            </span>
          </p>
          <p className="text-xs text-[#526575]">
            So với hôm qua: <span className="text-[#2E8B57]">+15%</span>
          </p>
        </article>
        <article className="flex h-[136px] flex-col gap-2 rounded-xl border border-[#DCECF8] bg-white p-[17px] shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
          <h2 className="text-sm font-bold text-[#D9534F]">LỖI THANH TOÁN</h2>
          <p className="pt-2 text-xl font-bold text-[#D9534F]">
            {String(failedCount).padStart(2, '0')}
            <span className="ml-2 text-xs font-normal text-[#526575]">
              hóa đơn
            </span>
          </p>
          <p className="text-xs text-[#526575]">
            {failedCount ? 'Cần kiểm tra giao dịch' : 'Không có dữ liệu'}
          </p>
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
          bookings={initialBookings}
          invoices={invoices}
          paymentChoices={paymentChoices}
          onClose={() => setCreateOpen(false)}
          onCreate={handleCreateInvoice}
        />
      )}
      {selectedInvoice && (
        <InvoiceDetailDrawer
          invoice={selectedInvoice}
          paymentChoices={paymentChoices}
          onClose={closeInvoice}
          onPayment={handlePayment}
          onPrint={handlePrint}
        />
      )}
      <ToastNotification message={toast.message} type={toast.type} />
    </div>
  );
}

export default InvoicePage;
