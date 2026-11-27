export const INVOICE_STATUS_LABEL = {
  Pending: 'Chờ thanh toán',
  Paid: 'Đã thanh toán',
  Failed: 'Lỗi thanh toán',
  Cancelled: 'Đã hủy',
};

export const METHOD_LABEL = {
  Cash: 'Tiền mặt',
  BankTransfer: 'Chuyển khoản ngân hàng',
  CreditCard: 'Thẻ tín dụng',
};

export const METHOD_TO_API = {
  'Tiền mặt': 'Cash',
  'Chuyển khoản ngân hàng': 'BankTransfer',
  'Thẻ tín dụng': 'CreditCard',
};


export const invoiceCode = (row) => {
  const year = row.PaidAt ? new Date(String(row.PaidAt).replace(' ', 'T')).getFullYear() : '';
  return `INV-${year}-${String(row.InvoiceID).padStart(4, '0')}`;
};

const num = (value) => Number(value) || 0;


export const mapInvoiceSummary = (row) => ({
  id: row.InvoiceID,
  code: invoiceCode(row),
  customer: row.GuestName || '',
  phone: row.GuestPhone || '',
  billingName: row.BillingName || row.GuestName || '',
  bookingId: row.BookingID,
  totalAmount: num(row.TotalAmount),
  deposit: num(row.DepositDeducted),
  discount: num(row.DiscountAmount),
  vatAmount: num(row.VatAmount),
  amountDue: num(row.AmountDue),
  status: INVOICE_STATUS_LABEL[row.PaymentStatus] || row.PaymentStatus,
  date: row.PaidAt,
  cashier: row.CreatedByName || '',
  paymentMethod: METHOD_LABEL[row.PaymentMethod] || '—',
});


const buildRooms = (rooms = [], services = []) =>
  rooms.map((room) => {
    const days = Math.max(1, num(room.RentalDays));
    return {
      detailId: room.DetailID,
      number: String(room.RoomNumber),
      type: room.RoomTypeID || String(room.TypeName || '').replace('Phòng Loại ', ''),
      days,
      nightlyRate: num(room.SubTotal) / days,
      timeSurcharge: num(room.TimeSurcharge),
      services: services
        .filter((item) => item.DetailID === room.DetailID)
        .map((item) => ({
          name: item.ServiceName,
          quantity: num(item.Quantity),
          unit: item.Unit,
          amount: num(item.SubTotal),
        })),
    };
  });

export const mapInvoiceDetail = (row) => ({
  ...mapInvoiceSummary(row),
  billingAddress: row.BillingAddress || '',
  roomTotal: num(row.RoomTotal),
  timeSurchargeTotal: num(row.TimeSurchargeTotal),
  serviceTotal: num(row.ServiceTotal),
  vatRate: num(row.VatRate),
  transactionReference: row.TransactionReference || '',
  rooms: buildRooms(row.Rooms, row.Services),
});

export const mapInvoicePreview = (row) => ({
  bookingId: row.BookingID,
  guestName: row.GuestName,
  deposit: num(row.Deposit),
  roomTotal: num(row.RoomTotal),
  timeSurchargeTotal: num(row.TimeSurchargeTotal),
  serviceTotal: num(row.ServiceTotal),
  promoCode: row.PromoCode || '',
  discount: num(row.DiscountAmount),
  subtotalBeforeVat: num(row.SubtotalBeforeVat),
  vatRate: num(row.VatRate),
  vatAmount: num(row.VatAmount),
  totalAmount: num(row.TotalAmount),
  depositDeducted: num(row.DepositDeducted),
  amountDue: num(row.AmountDue),
  refundDue: num(row.RefundDue),
  rooms: buildRooms(row.Rooms, row.Services),
});