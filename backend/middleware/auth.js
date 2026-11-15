const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');

const getSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('Thiếu JWT_SECRET trong file .env');
  return secret;
};

const deny = (res, status, message) => res.status(status).json({ success: false, message });

// Kiểm tra token
const verifyToken = async (req, res, next) => {
  try {
    const secret = getSecret();
    const [scheme, token] = (req.headers.authorization || '').split(' ');
    if (scheme !== 'Bearer' || !token) return deny(res, 401, 'Bạn chưa đăng nhập');

    let payload;
    try {
      payload = jwt.verify(token, secret);
    } catch (e) {
      return deny(res, 401, 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn');
    }

    const user = await UserModel.findById(payload.id);
    if (!user || user.Status !== 'Active') {
      return deny(res, 401, 'Tài khoản không còn hiệu lực');
    }

    req.user = { id: user.UserID, username: user.Username, role: user.Role };
    return next();
  } catch (err) {
    console.error(err);
    return deny(res, 500, 'Lỗi máy chủ');
  }
};

// Chỉ cho các quyền được liệt kê đi tiếp
const requireRole =
  (...roles) =>
  (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return deny(res, 403, 'Bạn không có quyền thực hiện thao tác này');
    }
    return next();
  };

module.exports = { verifyToken, requireRole, getSecret };