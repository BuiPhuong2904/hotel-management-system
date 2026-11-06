const bcrypt = require('bcryptjs');
const UserModel = require('../models/userModel');

const ROLES = ['Admin', 'Staff', 'Customer'];
const STATUSES = ['Active', 'Inactive', 'Blocked'];
const BCRYPT_ROUNDS = 12;

const USERNAME_PATTERN = /^[A-Za-z0-9_.]{3,50}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?\d{9,15}$/;
const IDENTITY_PATTERN = /^[A-Za-z0-9]{6,20}$/;

const fail = (res, status, message) => res.status(status).json({ success: false, message });
const isValidId = (value) => /^\d+$/.test(String(value)) && Number(value) > 0;

const optional = (value) => {
  const text = String(value ?? '').trim();
  return text === '' ? null : text;
};

const isValidPassword = (password) => password.length >= 8 && Buffer.byteLength(password) <= 72;
const PASSWORD_MESSAGE = 'Mật khẩu phải từ 8 ký tự và không quá 72 byte';

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

// Admin thao tác được với mọi tài khoản; Lễ tân (Staff) chỉ với khách hàng
const canManage = (actor, target) => actor.role === 'Admin' || target.Role === 'Customer';

// Kiểm tra và chuẩn hóa các trường hồ sơ
const parseProfile = (source) => {
  const FullName = String(source.FullName ?? '').trim();
  const Phone = optional(source.Phone);
  const Email = optional(source.Email);
  const IdentityNumber = optional(source.IdentityNumber);
  const Note = optional(source.Note);

  if (!FullName || FullName.length > 100) return { error: 'Họ tên bắt buộc và tối đa 100 ký tự' };
  if (Phone && !PHONE_PATTERN.test(Phone)) return { error: 'Số điện thoại không hợp lệ' };
  if (Email && (!EMAIL_PATTERN.test(Email) || Email.length > 100)) {
    return { error: 'Email không hợp lệ' };
  }
  if (IdentityNumber && !IDENTITY_PATTERN.test(IdentityNumber)) {
    return { error: 'CCCD/CMND không hợp lệ (6-20 ký tự chữ và số)' };
  }
  if (Note && Note.length > 255) return { error: 'Ghi chú tối đa 255 ký tự' };
  return { data: { FullName, Phone, Email, IdentityNumber, Note } };
};

// ---------- Dành cho Admin và Lễ tân ----------

// GET /api/v1/users?role=&status=&search=
exports.getUsers = async (req, res) => {
  try {
    const { role, status, search } = req.query;
    if (role && !ROLES.includes(role)) return fail(res, 400, 'Quyền không hợp lệ');
    if (status && !STATUSES.includes(status)) return fail(res, 400, 'Trạng thái không hợp lệ');

    // Lễ tân chỉ được xem danh sách khách hàng
    const roleFilter = req.user.role === 'Staff' ? 'Customer' : role;
    const users = await UserModel.findAll({
      role: roleFilter,
      status,
      search: search ? String(search).trim() : undefined,
    });
    return res.json({ success: true, data: users });
  } catch (err) {
    return handleError(res, err);
  }
};

// GET /api/v1/users/:id
exports.getUserById = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return fail(res, 400, 'Mã người dùng không hợp lệ');
    const user = await UserModel.findById(req.params.id);
    if (!user) return fail(res, 404, 'Không tìm thấy người dùng');
    if (!canManage(req.user, user)) return fail(res, 403, 'Bạn không có quyền xem tài khoản này');
    return res.json({ success: true, data: user });
  } catch (err) {
    return handleError(res, err);
  }
};

// PUT /api/v1/users/:id
exports.updateUser = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return fail(res, 400, 'Mã người dùng không hợp lệ');
    const target = await UserModel.findById(req.params.id);
    if (!target) return fail(res, 404, 'Không tìm thấy người dùng');
    if (!canManage(req.user, target)) {
      return fail(res, 403, 'Bạn không có quyền sửa tài khoản này');
    }

    const { error, data } = parseProfile({ ...target, ...(req.body || {}) });
    if (error) return fail(res, 400, error);

    await UserModel.updateProfile(target.UserID, data);
    const user = await UserModel.findById(target.UserID);
    return res.json({ success: true, data: user });
  } catch (err) {
    return handleError(res, err);
  }
};

// ---------- Chỉ Admin ----------

// POST /api/v1/users   (Admin tạo tài khoản cho nhân viên hoặc bất kỳ quyền nào)
exports.createUser = async (req, res) => {
  try {
    const body = req.body || {};
    const Username = String(body.Username ?? '').trim();
    const Password = String(body.Password ?? '');
    const Role = body.Role;

    if (!USERNAME_PATTERN.test(Username)) {
      return fail(res, 400, 'Tên đăng nhập gồm 3-50 ký tự: chữ, số, dấu chấm hoặc gạch dưới');
    }
    if (!isValidPassword(Password)) return fail(res, 400, PASSWORD_MESSAGE);
    if (!ROLES.includes(Role)) return fail(res, 400, 'Quyền phải là Admin, Staff hoặc Customer');

    const { error, data } = parseProfile(body);
    if (error) return fail(res, 400, error);

    const PasswordHash = await bcrypt.hash(Password, BCRYPT_ROUNDS);
    const id = await UserModel.create({ Username, PasswordHash, Role, ...data });
    const user = await UserModel.findById(id);
    return res.status(201).json({ success: true, data: user });
  } catch (err) {
    return handleError(res, err);
  }
};

// PATCH /api/v1/users/:id/role   body: { Role }
exports.updateRole = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return fail(res, 400, 'Mã người dùng không hợp lệ');
    const { Role } = req.body || {};
    if (!ROLES.includes(Role)) return fail(res, 400, 'Quyền phải là Admin, Staff hoặc Customer');

    if (Number(req.params.id) === req.user.id) {
      return fail(res, 400, 'Không thể tự thay đổi quyền của chính mình');
    }
    const target = await UserModel.findById(req.params.id);
    if (!target) return fail(res, 404, 'Không tìm thấy người dùng');

    await UserModel.updateRole(target.UserID, Role);
    const user = await UserModel.findById(target.UserID);
    return res.json({ success: true, data: user });
  } catch (err) {
    return handleError(res, err);
  }
};

// PATCH /api/v1/users/:id/status   body: { Status }  (Active | Inactive | Blocked)
exports.updateStatus = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return fail(res, 400, 'Mã người dùng không hợp lệ');
    const { Status } = req.body || {};
    if (!STATUSES.includes(Status)) {
      return fail(res, 400, `Trạng thái phải là một trong: ${STATUSES.join(', ')}`);
    }

    if (Number(req.params.id) === req.user.id) {
      return fail(res, 400, 'Không thể tự thay đổi trạng thái của chính mình');
    }
    const target = await UserModel.findById(req.params.id);
    if (!target) return fail(res, 404, 'Không tìm thấy người dùng');

    await UserModel.updateStatus(target.UserID, Status);
    const user = await UserModel.findById(target.UserID);
    return res.json({ success: true, data: user });
  } catch (err) {
    return handleError(res, err);
  }
};

// PATCH /api/v1/users/:id/password   body: { NewPassword }  (Admin đặt lại mật khẩu)
exports.resetPassword = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return fail(res, 400, 'Mã người dùng không hợp lệ');
    const NewPassword = String((req.body || {}).NewPassword ?? '');
    if (!isValidPassword(NewPassword)) return fail(res, 400, PASSWORD_MESSAGE);
    const target = await UserModel.findById(req.params.id);
    if (!target) return fail(res, 404, 'Không tìm thấy người dùng');

    await UserModel.updatePassword(target.UserID, await bcrypt.hash(NewPassword, BCRYPT_ROUNDS));
    return res.json({ success: true, message: 'Đã đặt lại mật khẩu' });
  } catch (err) {
    return handleError(res, err);
  }
};

// ---------- Mọi người dùng đã đăng nhập ----------

// PUT /api/v1/users/me
exports.updateMe = async (req, res) => {
  try {
    const me = await UserModel.findById(req.user.id);
    if (!me) return fail(res, 404, 'Không tìm thấy tài khoản');

    const { error, data } = parseProfile({ ...me, ...(req.body || {}) });
    if (error) return fail(res, 400, error);

    await UserModel.updateProfile(me.UserID, { ...data, Note: me.Note });
    const user = await UserModel.findById(me.UserID);
    return res.json({ success: true, data: user });
  } catch (err) {
    return handleError(res, err);
  }
};

// PUT /api/v1/users/me/password   body: { CurrentPassword, NewPassword }
exports.changeMyPassword = async (req, res) => {
  try {
    const body = req.body || {};
    const CurrentPassword = String(body.CurrentPassword ?? '');
    const NewPassword = String(body.NewPassword ?? '');
    if (!CurrentPassword) return fail(res, 400, 'Vui lòng nhập mật khẩu hiện tại');
    if (!isValidPassword(NewPassword)) return fail(res, 400, PASSWORD_MESSAGE);
    if (NewPassword === CurrentPassword) {
      return fail(res, 400, 'Mật khẩu mới phải khác mật khẩu hiện tại');
    }

    const me = await UserModel.findByUsername(req.user.username);
    if (!me || !(await bcrypt.compare(CurrentPassword, me.PasswordHash))) {
      return fail(res, 400, 'Mật khẩu hiện tại không đúng');
    }

    await UserModel.updatePassword(me.UserID, await bcrypt.hash(NewPassword, BCRYPT_ROUNDS));
    return res.json({ success: true, message: 'Đã đổi mật khẩu' });
  } catch (err) {
    return handleError(res, err);
  }
};