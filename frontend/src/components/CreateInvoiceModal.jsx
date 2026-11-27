import { useEffect, useState } from 'react';
import { FiChevronDown, FiPlus, FiX } from 'react-icons/fi';
import bookingService from '../services/bookingService';
import invoiceService from '../services/invoiceService';
import { bookingCode } from '../utils/bookingMapper';
import { METHOD_TO_API, mapInvoicePreview } from '../utils/invoiceMapper';

const formatCurrency = (value) =>
  `${new Intl.NumberFormat('vi-VN').format(Math.round(value || 0))} đ`;

const getRoomTotal = (room) =>
  room.days * room.nightlyRate +
  room.timeSurcharge +
  room.services.reduce((sum, item) => sum + item.amount, 0);

const apiError = (error) =>
  error.response?.data?.message || 'Không thể kết nối máy chủ, vui lòng thử lại!';

function SectionHeading({ children }) {
  return (
    <h3 className="flex h-4 items-center border-l-[5px] border-[#0D8BEA] px-3 text-sm font-bold text-[#075A9C]">
      {children}
    </h3>
  );
}

function SummaryLine({ label, value, valueClass = '' }) {
  return (
    <div className="flex justify-between gap-4">
      <span>{label}</span>
      <span className={valueClass}>{value}</span>
    </div>
  );
}

function CreateInvoiceDrawer({ paymentChoices, initialBookingId, onClose, onCreate }) {
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [bookingId, setBookingId] = useState(initialBookingId ? String(initialBookingId) : '');
  const [preview, setPreview] = useState(null);
  const [billingName, setBillingName] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [method, setMethod] = useState(paymentChoices[0]);
  const [reference, setReference] = useState('');
  const [validationMessage, setValidationMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Các đơn đang lưu trú là các đơn có thể lập hóa đơn
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await bookingService.getBookings({ status: 'CheckedIn' });
        if (cancelled) return;
        setBookings(res.data);
        setBookingId((current) => {
          if (current && res.data.some((item) => String(item.BookingID) === current)) {
            return current;
          }
          return res.data[0] ? String(res.data[0].BookingID) : '';
        });
      } catch (error) {
        if (!cancelled) setValidationMessage(apiError(error));
      } finally {
        if (!cancelled) setLoadingBookings(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Tính tiền xem trước mỗi khi đổi đơn
  useEffect(() => {
    if (!bookingId) return undefined;
    let cancelled = false;
    (async () => {
      try {
        const res = await invoiceService.previewInvoice(bookingId);
        if (cancelled) return;
        const next = mapInvoicePreview(res.data);
        setPreview(next);
        setBillingName(next.guestName || '');
        setBillingAddress('');
        setValidationMessage('');
      } catch (error) {
        if (!cancelled) {
          setPreview(null);
          setValidationMessage(apiError(error));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [bookingId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!bookingId || !preview) {
      setValidationMessage('Không có phiếu thuê đủ điều kiện để lập hóa đơn.');
      return;
    }
    if (submitting) return;

    setSubmitting(true);
    try {
      await onCreate({
        BookingID: Number(bookingId),
        PaymentMethod: METHOD_TO_API[method],
        BillingName: billingName.trim() || undefined,
        BillingAddress: billingAddress.trim() || undefined,
        TransactionReference: reference.trim() || undefined,
      });
    } catch (error) {
      setValidationMessage(apiError(error));
      setSubmitting(false);
    }
  };

  const rooms = preview?.rooms || [];
  const roomFeeTotal = rooms.reduce((sum, room) => sum + room.days * room.nightlyRate, 0);

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/20 p-4"
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
          <h2 id="create-invoice-title" className="text-2xl font-bold text-[#075A9C]">
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
                      value={bookingId}
                      onChange={(event) => {
                        setBookingId(event.target.value);
                        setPreview(null);
                        setValidationMessage('');
                      }}
                      disabled={!bookings.length}
                      required
                      className="h-10 w-full appearance-none rounded-lg border border-[#DCECF8] bg-white px-4 pr-10 text-sm font-normal text-[#526575] outline-none focus:border-[#0D8BEA]"
                    >
                      {bookings.length ? (
                        bookings.map((item) => (
                          <option key={item.BookingID} value={item.BookingID}>
                            {bookingCode(item)} - {item.GuestName} - ({item.Rooms.length} phòng)
                          </option>
                        ))
                      ) : (
                        <option value="">
                          {loadingBookings ? 'Đang tải...' : 'Không có phiếu thuê phù hợp'}
                        </option>
                      )}
                    </select>
                    <FiChevronDown
                      aria-hidden="true"
                      className="pointer-events-none absolute right-3 h-5 w-5 text-[#526575]"
                    />
                  </span>
                </label>
                <p className="mt-2 text-xs text-[#526575]">
                  Số tiền được tính theo thời điểm trả phòng hiện tại. Giảm giá lấy
                  từ mã khuyến mãi đã gắn vào đơn.
                </p>
              </div>
            </section>

            <section className="flex flex-col gap-4">
              <SectionHeading>TỔNG KẾT CHI PHÍ</SectionHeading>
              <div className="rounded-xl border border-[#DCECF8] bg-[#F7FBFF] p-4">
                <div className="flex flex-col gap-3 rounded-lg border border-[#DCECF8] bg-white p-4 text-sm text-[#526575]">
                  {preview ? (
                    <>
                      {rooms.map((item) => (
                        <div
                          key={item.detailId}
                          className="flex justify-between gap-4 border-b border-[#F1F5F9] pb-2"
                        >
                          <span>
                            P.{item.number} ({item.type}) · {item.days} đêm
                          </span>
                          <span>{formatCurrency(getRoomTotal(item))}</span>
                        </div>
                      ))}
                      <SummaryLine
                        label={`Tổng tiền phòng (${rooms.length} phòng):`}
                        value={formatCurrency(roomFeeTotal)}
                      />
                      <SummaryLine
                        label="Phụ thu nhận sớm / trả muộn:"
                        value={formatCurrency(preview.timeSurchargeTotal)}
                      />
                      <SummaryLine
                        label="Tổng tiền dịch vụ:"
                        value={formatCurrency(preview.serviceTotal)}
                      />
                      <SummaryLine
                        label={`Giảm giá${preview.promoCode ? ` (${preview.promoCode})` : ''}:`}
                        value={`- ${formatCurrency(preview.discount)}`}
                        valueClass="text-[#CC2E2E]"
                      />
                      <SummaryLine
                        label={`Thuế VAT (${Math.round(preview.vatRate * 10000) / 100}%):`}
                        value={formatCurrency(preview.vatAmount)}
                      />
                      <SummaryLine
                        label="Tổng cộng:"
                        value={formatCurrency(preview.totalAmount)}
                        valueClass="font-bold text-[#075A9C]"
                      />
                      <SummaryLine
                        label="Đã khấu trừ cọc:"
                        value={`- ${formatCurrency(preview.depositDeducted)}`}
                        valueClass="text-[#CC2E2E]"
                      />
                      {preview.refundDue > 0 && (
                        <SummaryLine
                          label="Hoàn lại cọc thừa cho khách:"
                          value={formatCurrency(preview.refundDue)}
                          valueClass="text-[#D97706]"
                        />
                      )}
                      <div className="flex justify-between gap-4 border-t border-[#DCECF8] pt-3 text-lg font-bold">
                        <span className="text-[#075A9C]">CẦN THU THÊM:</span>
                        <span className="text-[#2E8B57]">{formatCurrency(preview.amountDue)}</span>
                      </div>
                    </>
                  ) : (
                    <p>{bookingId ? 'Đang tính tiền...' : 'Chưa chọn phiếu thuê.'}</p>
                  )}
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
                    maxLength={100}
                    className="h-10 rounded-lg border border-[#DCECF8] bg-white px-4 text-sm font-normal text-[#526575] outline-none focus:border-[#0D8BEA]"
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm font-bold text-[#075A9C]">
                  Địa chỉ xuất hóa đơn
                  <textarea
                    value={billingAddress}
                    onChange={(event) => setBillingAddress(event.target.value)}
                    maxLength={255}
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
                    maxLength={100}
                    placeholder="Nhập mã giao dịch / mã chuẩn chi..."
                    className="h-10 rounded-lg border border-[#DCECF8] bg-white px-4 text-sm font-normal text-[#526575] outline-none placeholder:text-[#526575] focus:border-[#0D8BEA]"
                  />
                </label>
                <p className="text-xs text-[#526575]">
                  Lập hóa đơn sẽ ghi nhận thanh toán và hoàn tất trả phòng.
                </p>
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
            disabled={!preview || submitting}
            className="flex h-10 items-center justify-center gap-2 rounded-lg bg-[#0D8BEA] px-4 text-sm font-bold text-white hover:bg-[#075A9C] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FiPlus aria-hidden="true" className="h-4 w-4" />
            {submitting ? 'Đang lập...' : 'Lập hóa đơn'}
          </button>
        </footer>
      </div>
    </div>
  );
}

export default CreateInvoiceDrawer;