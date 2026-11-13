export const promotionSeedData = [
  {
    id: 'SUMMER26',
    code: 'SUMMER26',
    discountPercent: 20,
    maxDiscount: 500000,
    startDate: '01/06/2026',
    endDate: '30/06/2026',
    status: 'Đang áp dụng',
    note: 'Áp dụng cho kỳ nghỉ hè. Không áp dụng cùng các mã giảm giá khác.',
    usageCount: 45,
    totalDiscounted: 10000000,
    usageHistory: [
      {
        bookingCode: 'BK-2026-1011',
        customerName: 'Nguyễn Minh Anh',
        date: '24/10/2026',
        status: 'Hoàn tất',
      },
      {
        bookingCode: 'BK-2026-1008',
        customerName: 'Trần Hoàng Nam',
        date: '22/10/2026',
        status: 'Hoàn tất',
      },
    ],
  },
  {
    id: 'WELCOME',
    code: 'WELCOME',
    discountPercent: 10,
    maxDiscount: 200000,
    startDate: '01/10/2026',
    endDate: '31/10/2026',
    status: 'Đang áp dụng',
    note: 'Ưu đãi dành cho khách hàng đặt phòng lần đầu.',
    usageCount: 6,
    totalDiscounted: 1200000,
    usageHistory: [
      {
        bookingCode: 'BK-2026-1005',
        customerName: 'Lê Thu Hà',
        date: '20/10/2026',
        status: 'Hoàn tất',
      },
    ],
  },
  {
    id: 'VIP2026',
    code: 'VIP2026',
    discountPercent: 15,
    maxDiscount: 1000000,
    startDate: '01/01/2026',
    endDate: '31/12/2026',
    status: 'Đang áp dụng',
    note: 'Ưu đãi dành riêng cho khách hàng thân thiết.',
    usageCount: 3,
    totalDiscounted: 1000000,
    usageHistory: [
      {
        bookingCode: 'BK-2026-0998',
        customerName: 'Phạm Quốc Bảo',
        date: '18/10/2026',
        status: 'Hoàn tất',
      },
    ],
  },
  {
    id: 'FLASH50',
    code: 'FLASH50',
    discountPercent: 50,
    maxDiscount: 100000,
    startDate: '10/10/2026',
    endDate: '11/10/2026',
    status: 'Tạm ngưng',
    note: 'Chương trình ưu đãi trong thời gian giới hạn.',
    usageCount: 2,
    totalDiscounted: 300000,
    usageHistory: [
      {
        bookingCode: 'BK-2026-0981',
        customerName: 'Võ Ngọc Lan',
        date: '11/10/2026',
        status: 'Hoàn tất',
      },
    ],
  },
  {
    id: 'AUTUMN10',
    code: 'AUTUMN10',
    discountPercent: 10,
    maxDiscount: 300000,
    startDate: '01/09/2026',
    endDate: '30/11/2026',
    status: 'Đang áp dụng',
    note: 'Ưu đãi mùa thu cho các kỳ nghỉ từ hai đêm.',
    usageCount: 0,
    totalDiscounted: 0,
    usageHistory: [],
  },
];

export function parsePromotionDate(value) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value.trim());
  if (!match) {
    return null;
  }

  const [, dayText, monthText, yearText] = match;
  const day = Number(dayText);
  const month = Number(monthText);
  const year = Number(yearText);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

export function toDateInputValue(value) {
  const date = parsePromotionDate(value);
  if (!date) {
    return '';
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function fromDateInputValue(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return '';
  }

  const [, year, month, day] = match;
  return `${day}/${month}/${year}`;
}
