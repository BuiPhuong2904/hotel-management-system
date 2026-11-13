export const customerStatuses = [
  'Đang hoạt động',
  'Ngừng hoạt động',
  'Bị khóa',
];

export const customerStatusColors = {
  'Đang hoạt động': '#2E8B57',
  'Ngừng hoạt động': '#526575',
  'Bị khóa': '#D9534F',
};

export const maskIdentification = (value = '') =>
  value.length > 4 ? `${'*'.repeat(value.length - 4)}${value.slice(-4)}` : value;

export const formatCustomerCurrency = (amount = 0) =>
  `${new Intl.NumberFormat('vi-VN').format(amount)} đ`;

export const getCustomerInitials = (name = '') =>
  name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
