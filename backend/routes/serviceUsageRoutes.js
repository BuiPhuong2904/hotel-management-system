const express = require('express');
const router = express.Router();


const serviceUsageController = require('../controllers/serviceUsageController');
const { verifyToken, requireRole } = require('../middleware/auth');


router.use(verifyToken);


// Xem toàn bộ lượt sử dụng dịch vụ
router.get(
  '/all',
  requireRole('Admin', 'Staff'),
  serviceUsageController.getAllUsages
);


// Lấy danh sách phòng đang có khách
router.get(
  '/active-rooms',
  requireRole('Admin', 'Staff'),
  serviceUsageController.getActiveRooms
);


// Xem dịch vụ theo bookingId hoặc roomId
router.get('/', serviceUsageController.getUsages);


// Ghi nhận dịch vụ
router.post(
  '/',
  requireRole('Admin', 'Staff'),
  serviceUsageController.createUsage
);


// Cập nhật số lượng
router.patch(
  '/:id',
  requireRole('Admin', 'Staff'),
  serviceUsageController.updateUsage
);


// Xóa lượt sử dụng dịch vụ
router.delete(
  '/:id',
  requireRole('Admin', 'Staff'),
  serviceUsageController.deleteUsage
);


module.exports = router;
