const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');
const { getSecret } = require('../middleware/auth');

const BCRYPT_ROUNDS = 12;

const DUMMY_HASH = '$2a$12$Yo9f/CkzNlIzzJQqmhyNuO641QmY6qyYP829Smi2g3IPIjb7XLZjO';

const USERNAME_PATTERN = /^[A-Za-z0-9_.]{3,50}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?\d{9,15}$/;
const IDENTITY_PATTERN = /^[A-Za-z0-9]{6,20}$/;

const fail = (res, status, message) => res.status(status).json({ success: false, message });

const optional = (value) => {
  const text = String(value ?? '').trim();
  return text === '' ? null : text;
};

const duplicateMessage = (err) => {
  const match = /for key '([^']+)'/.exec(err.sqlMessage || '');
  const key = match ? match[1].split('.').pop().toLowerCase() : '';
  if (key === 'username') return 'Tên đăng nhập đã tồn tại';
  if (key === 'email') return 'Email đã được sử dụng';
  if (key === 'phone') return 'Số điện thoại đã được sử dụng';
  if (key === 'identitynumber') return 'CCCD/CMND đã được sử dụng';
  return 'Thông tin đã tồn tại trong hệ thống';
};

const handleError = (res, err) => {
  if (err.code === 'ER_DUP_ENTRY') return fail(res, 409, duplicateMessage(err));
  console.error(err);
  return fail(res, 500, 'Lỗi máy chủ');
};

// POST /api/v1/auth/register 
exports.register = async (req, res) => {
  try {
    const body = req.body || {};
    const Username = String(body.Username ?? '').trim();
    const Password = String(body.Password ?? '');
    const FullName = String(body.FullName ?? '').trim();
    const Phone = optional(body.Phone);
    const Email = optional(body.Email);
    const IdentityNumber = optional(body.IdentityNumber);

    if (!USERNAME_PATTERN.test(Username)) {
      return fail(res, 400, 'Tên đăng nhập gồm 3-50 ký tự: chữ, số, dấu chấm hoặc gạch dưới');
    }
    if (Password.length < 8 || Buffer.byteLength(Password) > 72) {
      return fail(res, 400, 'Mật khẩu phải từ 8 ký tự và không quá 72 byte');
    }
    if (!FullName || FullName.length > 100) {
      return fail(res, 400, 'Họ tên bắt buộc và tối đa 100 ký tự');
    }
    if (Phone && !PHONE_PATTERN.test(Phone)) return fail(res, 400, 'Số điện thoại không hợp lệ');
    if (Email && (!EMAIL_PATTERN.test(Email) || Email.length > 100)) {
      return fail(res, 400, 'Email không hợp lệ');
    }
    if (IdentityNumber && !IDENTITY_PATTERN.test(IdentityNumber)) {
      return fail(res, 400, 'CCCD/CMND không hợp lệ (6-20 ký tự chữ và số)');
    }

    const PasswordHash = await bcrypt.hash(Password, BCRYPT_ROUNDS);

    const id = await UserModel.create({
      Username,
      PasswordHash,
      Role: 'Customer',
      FullName,
      IdentityNumber,
      Phone,
      Email,
    });
    const user = await UserModel.findById(id);
    return res.status(201).json({ success: true, data: { user } });
  } catch (err) {
    return handleError(res, err);
  }
};

// POST /api/v1/auth/login
exports.login = async (req, res) => {
  try {
    const body = req.body || {};
    const Username = String(body.Username ?? '').trim();
    const Password = String(body.Password ?? '');
    if (!Username || !Password) {
      return fail(res, 400, 'Vui lòng nhập tên đăng nhập và mật khẩu');
    }

    const user = await UserModel.findByUsername(Username);
    const passwordOk = await bcrypt.compare(Password, user ? user.PasswordHash : DUMMY_HASH);

    if (!user || !passwordOk) return fail(res, 401, 'Sai tên đăng nhập hoặc mật khẩu');

    if (user.Status !== 'Active') {
      return fail(
        res,
        403,
        user.Status === 'Blocked' ? 'Tài khoản đã bị khóa' : 'Tài khoản đã ngừng hoạt động'
      );
    }

    const token = jwt.sign({ id: user.UserID, role: user.Role }, getSecret(), {
      expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    });
    const safeUser = { ...user };
    delete safeUser.PasswordHash;
    return res.json({ success: true, data: { token, user: safeUser } });
  } catch (err) {
    return handleError(res, err);
  }
};

// GET /api/v1/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.id);
    if (!user) return fail(res, 404, 'Không tìm thấy tài khoản');
    return res.json({ success: true, data: { user } });
  } catch (err) {
    return handleError(res, err);
  }
};