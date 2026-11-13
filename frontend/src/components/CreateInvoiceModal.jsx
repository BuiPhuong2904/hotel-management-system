import { useEffect, useMemo, useState } from 'react';
import { FiChevronDown, FiPlus, FiX } from 'react-icons/fi';

const formatCurrency = (value) =>
  `${new Intl.NumberFormat('vi-VN').format(Math.round(value || 0))} đ`;

const getRoomTotal = (room) =>
  room.days * room.nightlyRate +
  room.services.reduce((sum, item) => sum + item.amount, 0);

function SectionHeading({ children }) {
  return (
    <h3 className="flex h-4 items-center border-l-[5px] border-[#0D8BEA] px-3 text-sm font-bold text-[#075A9C]">
      {children}
    </h3>
  );
}

function CreateInvoiceDrawer({
  bookings,
  invoices,
  paymentChoices,
  onClose,
  onCreate,
}) {
  const eligibleBookings = useMemo(
    () =>
      bookings.filter(
        (booking) =>
          ['CheckedIn', 'Completed'].includes(booking.status) &&
          !invoices.some(
            (invoice) =>
              invoice.bookingCode === booking.code &&
              invoice.status === 'Đã thanh toán',
          ),
      ),
    [bookings, invoices],
  );
  const [bookingCode, setBookingCode] = useState(() => eligibleBookings[0]?.code || '');
  const [discountInput, setDiscountInput] = useState('0');
  const [discountReason, setDiscountReason] = useState('');
  const [billingName, setBillingName] = useState(
    () => eligibleBookings[0]?.billingName || '',
  );
  const [billingAddress, setBillingAddress] = useState(
    () => eligibleBookings[0]?.address || '',
  );
  const [method, setMethod] = useState('Chuyển khoản ngân hàng');
  const [reference, setReference] = useState('');
  const [validationMessage, setValidationMessage] = useState('');

  const booking =
    eligibleBookings.find((item) => item.code === bookingCode) ||
    eligibleBookings[0] ||
    null;

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const roomTotal = booking
    ? booking.rooms.reduce((sum, room) => sum + getRoomTotal(room), 0)
    : 0;
  const roomFeeTotal = booking
    ? booking.rooms.reduce(
        (sum, room) => sum + room.days * room.nightlyRate,
        0,
      )
    : 0;
  const serviceTotal = roomTotal - roomFeeTotal;
  const rawDiscount = Number(discountInput) || 0;
  const maxDiscount = Math.max(roomTotal - (booking?.deposit || 0), 0);
  const discount = Math.min(
    Math.max(rawDiscount, 0),
    maxDiscount,
  );
  const amountDue = Math.max(roomTotal - (booking?.deposit || 0) - discount, 0);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!booking) {
      setValidationMessage('Không có phiếu thuê đủ điều kiện để lập hóa đơn.');
      return;
    }
    if (discount > 0 && !discountReason.trim()) {
      setValidationMessage('Vui lòng nhập lý do giảm giá.');
      return;
    }
    onCreate(
      {
        ...booking,
        billingName: billingName.trim() || booking.billingName,
        address: billingAddress.trim() || '—',
      },
      discount,
      discountReason.trim(),
      method,
      reference.trim(),
    );
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/20"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-invoice-title"
        className="flex max-h-[90vh] w-full max-w-[680px] flex-col rounded-xl bg-white px-6 shadow-[0_12px_32px_rgba(0,0,0,0.16)]"
      >
        <header className="flex h-[76px] shrink-0 items-center justify-between border-b border-[#DCECF8]">
          <h2
            id="create-invoice-title"
            className="text-2xl font-bold text-[#075A9C]"
          >
            Lập Hóa Đơn Thanh Toán
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-[#526575] hover:bg-[#F7FBFF]"
          >
            <FiX aria-hidden="true" className="h-5 w-5" />
          </button>
        </header>

        <form
          id="create-invoice-form"
          onSubmit={handleSubmit}
          className="min-h-0 flex-1 overflow-y-auto py-4"
        >
          <div className="flex flex-col gap-4">
            <section className="flex flex-col gap-4">
              <SectionHeading>CHỌN PHIẾU THUÊ</SectionHeading>
              <div className="rounded-xl border border-[#DCECF8] bg-[#F7FBFF] p-4">
                <label className="flex flex-col gap-2 text-sm font-bold text-[#075A9C]">
                  Mã phiếu thuê / Phòng *
                  <span className="relative flex h-10 items-center">
                    <select
                      value={booking?.code || ''}
                      onChange={(event) => {
                        const selectedBooking = eligibleBookings.find(
                          (item) => item.code === event.target.value,
                        );
                        setBookingCode(event.target.value);
                        setBillingName(selectedBooking?.billingName || '');
                        setBillingAddress(selectedBooking?.address || '');
                        setValidationMessage('');
                      }}
                      disabled={!eligibleBookings.length}
                      required
                      className="h-10 w-full appearance-none rounded-lg border border-[#DCECF8] bg-white px-4 pr-10 text-sm font-normal text-[#526575] outline-none focus:border-[#0D8BEA]"
                    >
                      {eligibleBookings.length ? (
                        eligibleBookings.map((item) => (
                          <option key={item.code} value={item.code}>
                            {item.code} - {item.representative} - ({item.rooms.length} phòng)
                          </option>
                        ))
                      ) : (
                        <option value="">Không có phiếu thuê phù hợp</option>
                      )}
                    </select>
                    <FiChevronDown
                      aria-hidden="true"
                      className="pointer-events-none absolute right-3 h-5 w-5 text-[#526575]"
                    />
                  </span>
                </label>
              </div>
            </section>

            <section className="flex flex-col gap-4">
              <SectionHeading>ƯU ĐÃI / GIẢM GIÁ</SectionHeading>
              <div className="flex flex-col gap-4 rounded-xl border border-[#DCECF8] bg-[#F7FBFF] p-4">
                <label className="flex flex-col gap-2 text-sm font-bold text-[#075A9C]">
                  Số tiền giảm giá
                  <span className="flex h-10 items-center justify-between rounded-lg border border-[#DCECF8] bg-white px-4 font-normal text-[#526575]">
                    <input
                      type="number"
                      min="0"
                      max={Math.max(roomTotal - (booking?.deposit || 0), 0)}
                      step="1000"
                      value={discountInput}
                      onChange={(event) => {
                        const nextValue = event.target.value;
                        setDiscountInput(
                          nextValue === ''
                            ? ''
                            : String(
                                Math.min(
                                  Math.max(Number(nextValue) || 0, 0),
                                  maxDiscount,
                                ),
                              ),
                        );
                        setValidationMessage('');
                      }}
                      aria-label="Số tiền giảm giá"
                      className="w-full bg-transparent text-sm outline-none"
                    />
                    <span className="ml-2 shrink-0">VNĐ</span>
                  </span>
                </label>
                <label className="flex flex-col gap-2 text-sm font-bold text-[#075A9C]">
                  Lý do giảm giá
                  <textarea
                    value={discountReason}
                    onChange={(event) => {
                      setDiscountReason(event.target.value);
                      setValidationMessage('');
                    }}
                    placeholder={'Ví dụ: "Khách quen", "Đền bù dịch vụ", "Áp mã SUMMER26"...'}
                    className="h-20 resize-y rounded-lg border border-[#DCECF8] bg-white px-4 py-2 text-sm font-normal text-[#526575] outline-none placeholder:text-[#526575] focus:border-[#0D8BEA]"
                  />
                </label>
              </div>
            </section>

            <section className="flex flex-col gap-4">
              <SectionHeading>TỔNG KẾT CHI PHÍ</SectionHeading>
              <div className="rounded-xl border border-[#DCECF8] bg-[#F7FBFF] p-4">
                <div className="flex flex-col gap-3 rounded-lg border border-[#DCECF8] bg-white p-4 text-sm text-[#526575]">
                  <div className="flex justify-between gap-4">
                    <span>Phòng thanh toán:</span>
                    <span className="text-right">
                      {booking?.rooms.map((item) => `P.${item.number.replace(/^P\./, '')}`).join(', ') || '—'}
                    </span>
                  </div>
                  {booking?.rooms.map((item) => (
                    <div
                      key={item.number}
                      className="flex justify-between gap-4 border-t border-[#F1F5F9] pt-2"
                    >
                      <span>
                        P.{item.number.replace(/^P\./, '')} ({item.type})
                      </span>
                      <span>{formatCurrency(getRoomTotal(item))}</span>
                    </div>
                  ))}
                  <div className="flex justify-between gap-4">
                    <span>Tổng tiền phòng ({booking?.rooms.length || 0} phòng):</span>
                    <span>{formatCurrency(roomFeeTotal)}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span>Tổng tiền dịch vụ:</span>
                    <span>{formatCurrency(serviceTotal)}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span>Đã khấu trừ cọc:</span>
                    <span className="text-[#CC2E2E]">
                      - {formatCurrency(booking?.deposit || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span>Giảm giá / Ưu đãi:</span>
                    <span className="text-[#CC2E2E]">
                      - {formatCurrency(discount)}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4 border-t border-[#DCECF8] pt-3 text-lg font-bold">
                    <span className="text-[#075A9C]">CẦN THU THÊM:</span>
                    <span className="text-[#2E8B57]">
                      {formatCurrency(amountDue)}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            <section className="flex flex-col gap-4">
              <SectionHeading>THÔNG TIN XUẤT HÓA ĐƠN</SectionHeading>
              <div className="flex flex-col gap-4 rounded-xl border border-[#DCECF8] bg-[#F7FBFF] p-4">
                <label className="flex flex-col gap-2 text-sm font-bold text-[#075A9C]">
                  Tên cá nhân / Cơ quan thanh toán *
                  <input
                    value={billingName}
                    onChange={(event) => setBillingName(event.target.value)}
                    required
                    className="h-10 rounded-lg border border-[#DCECF8] bg-white px-4 text-sm font-normal text-[#526575] outline-none focus:border-[#0D8BEA]"
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm font-bold text-[#075A9C]">
                  Địa chỉ xuất hóa đơn
                  <textarea
                    value={billingAddress}
                    onChange={(event) => setBillingAddress(event.target.value)}
                    placeholder="Nhập địa chỉ xuất hóa đơn (nếu có)"
                    className="h-20 resize-y rounded-lg border border-[#DCECF8] bg-white px-4 py-2 text-sm font-normal text-[#526575] outline-none placeholder:text-[#526575] focus:border-[#0D8BEA]"
                  />
                </label>
              </div>
            </section>

            <section className="flex flex-col gap-4">
              <SectionHeading>THANH TOÁN</SectionHeading>
              <div className="flex flex-col gap-4 rounded-xl border border-[#DCECF8] bg-[#F7FBFF] p-4">
                <label className="flex flex-col gap-2 text-sm font-bold text-[#075A9C]">
                  Phương thức thanh toán *
                  <span className="relative flex h-10 items-center">
                    <select
                      value={method}
                      onChange={(event) => setMethod(event.target.value)}
                      className="h-10 w-full appearance-none rounded-lg border border-[#DCECF8] bg-white px-4 pr-10 text-sm font-normal text-[#526575] outline-none focus:border-[#0D8BEA]"
                    >
                      {paymentChoices.map((choice) => (
                        <option key={choice} value={choice}>
                          {choice}
                        </option>
                      ))}
                    </select>
                    <FiChevronDown
                      aria-hidden="true"
                      className="pointer-events-none absolute right-3 h-5 w-5 text-[#526575]"
                    />
                  </span>
                </label>
                <label className="flex flex-col gap-2 text-sm font-bold text-[#075A9C]">
                  Mã giao dịch tham chiếu
                  <input
                    value={reference}
                    onChange={(event) => setReference(event.target.value)}
                    placeholder="Nhập mã giao dịch / mã chuẩn chi..."
                    className="h-10 rounded-lg border border-[#DCECF8] bg-white px-4 text-sm font-normal text-[#526575] outline-none placeholder:text-[#526575] focus:border-[#0D8BEA]"
                  />
                </label>
              </div>
            </section>
            {validationMessage && (
              <p role="alert" className="text-sm text-[#D9534F]">
                {validationMessage}
              </p>
            )}
          </div>
        </form>

        <footer className="flex shrink-0 items-center justify-end gap-4 border-t border-[#DCECF8] bg-white py-4">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-lg border border-[#DCECF8] bg-[#E8F5FF] px-4 text-sm font-bold text-[#0D8BEA] hover:bg-[#DCECF8]"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            form="create-invoice-form"
            disabled={!eligibleBookings.length}
            className="flex h-10 items-center justify-center gap-2 rounded-lg bg-[#0D8BEA] px-4 text-sm font-bold text-white hover:bg-[#075A9C] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FiPlus aria-hidden="true" className="h-4 w-4" />
            Lập hóa đơn
          </button>
        </footer>
      </div>
    </div>
  );
}

export default CreateInvoiceDrawer;
