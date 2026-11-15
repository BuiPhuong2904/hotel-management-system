const SettingModel = require('../models/settingModel');
const pricing = require('./pricing');

const PHONE_PATTERN = /^\+?\d{9,15}$/;
const IDENTITY_PATTERN = /^[A-Za-z0-9]{6,20}$/;
const GUEST_TYPES = ['Domestic', 'Foreign'];

const pad = (n) => String(n).padStart(2, '0');

const optional = (value) => {
  const text = String(value ?? '').trim();
  return text === '' ? null : text;
};

const parseDate = (value) => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const d = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== value ? null : value;
};

// Hôm nay theo giờ máy chủ dạng YYYY-MM-DD
const todayString = () => {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

// Bây giờ theo giờ máy chủ dạng YYYY-MM-DD HH:mm:ss
const nowString = () => {
  const now = new Date();
  return `${todayString()} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
};

// Giá trị ngày giờ từ database "YYYY-MM-DD HH:mm:ss"
const toDateTimeString = (value) => {
  if (value instanceof Date) {
    return (
      `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())} ` +
      `${pad(value.getHours())}:${pad(value.getMinutes())}:${pad(value.getSeconds())}`
    );
  }
  return String(value).replace('T', ' ').slice(0, 19);
};
const dateOnly = (value) => toDateTimeString(value).slice(0, 10);

// Đọc các tham số quy định từ bảng Settings
const readSettings = async () => {
  const map = await SettingModel.getMap();
  const num = (key) => {
    const value = Number(map[key]);
    if (map[key] === undefined || !Number.isFinite(value)) {
      throw new Error(`Tham số ${key} trong bảng Settings thiếu hoặc không hợp lệ`);
    }
    return value;
  };
  const time = (key) => {
    const value = String(map[key] ?? '');
    if (!/^\d{2}:\d{2}(:\d{2})?$/.test(value)) {
      throw new Error(`Tham số ${key} trong bảng Settings thiếu hoặc không hợp lệ`);
    }
    return value.length === 5 ? `${value}:00` : value;
  };
  return {
    surchargeRate: num('SurchargeThirdGuestRate'),
    foreignerRate: num('ForeignerCoefficient'),
    minDepositRate: num('MinDepositRateOnline'),
    earlyRate: num('EarlyCheckInSurchargeRate'),
    lateRate: num('LateCheckOutSurchargeRate'),
    checkInTime: time('StandardCheckInTime'),
    checkOutTime: time('StandardCheckOutTime'),
  };
};

// Kiểm tra danh sách phòng gửi lên
const parseRoomIds = (list, maxRooms) => {
  if (!Array.isArray(list) || list.length === 0) return { error: 'Cần chọn ít nhất một phòng' };
  if (list.length > maxRooms) return { error: `Mỗi đơn tối đa ${maxRooms} phòng` };
  const roomIds = list.map((r) => Number((r || {}).RoomID));
  if (roomIds.some((id) => !Number.isInteger(id) || id < 1)) return { error: 'Mã phòng không hợp lệ' };
  if (new Set(roomIds).size !== roomIds.length) return { error: 'Mỗi phòng chỉ được chọn một lần' };
  return { roomIds };
};

// Kiểm tra danh sách khách trong một phòng
const parseGuests = (list, maxGuests) => {
  if (!Array.isArray(list) || list.length === 0) return { error: 'Mỗi phòng cần ít nhất một khách' };
  if (list.length > maxGuests) return { error: `chỉ cho tối đa ${maxGuests} khách` };
  const guests = [];
  for (const g of list) {
    const item = g || {};
    const FullName = String(item.FullName ?? '').trim();
    const IdentityNumber = String(item.IdentityNumber ?? '').trim();
    const CustomerType = item.CustomerType ?? 'Domestic';
    const Address = optional(item.Address);
    if (!FullName || FullName.length > 100) {
      return { error: 'họ tên khách bắt buộc và tối đa 100 ký tự' };
    }
    if (!IDENTITY_PATTERN.test(IdentityNumber)) {
      return { error: 'CCCD/CMND/hộ chiếu không hợp lệ (6-20 ký tự chữ và số)' };
    }
    if (!GUEST_TYPES.includes(CustomerType)) {
      return { error: 'loại khách phải là Domestic hoặc Foreign' };
    }
    if (Address && Address.length > 255) return { error: 'địa chỉ tối đa 255 ký tự' };
    guests.push({ FullName, IdentityNumber, CustomerType, Address });
  }
  return { guests };
};

// Phụ thu nhận phòng sớm
const calcEarlySurcharge = ({ price, actualCheckIn, standardTime, earlyRate }) =>
  actualCheckIn.slice(11, 19) < standardTime ? pricing.round2(price * earlyRate) : 0;

module.exports = {
  PHONE_PATTERN,
  optional,
  parseDate,
  todayString,
  nowString,
  toDateTimeString,
  dateOnly,
  readSettings,
  parseRoomIds,
  parseGuests,
  calcEarlySurcharge,
};