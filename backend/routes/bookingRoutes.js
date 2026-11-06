const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const receptionController = require('../controllers/receptionController');
const { verifyToken, requireRole } = require('../middleware/auth');

router.use(verifyToken);

// ---- Khách hàng ----
router.post('/online', requireRole('Customer'), bookingController.createOnlineBooking);
router.get('/my', requireRole('Customer'), bookingController.getMyBookings);

// ---- Lễ tân và Admin ----
router.post('/direct', requireRole('Admin', 'Staff'), receptionController.createDirectBooking);
router.patch('/:id/confirm-deposit', requireRole('Admin', 'Staff'), receptionController.confirmDeposit);
router.post('/:id/check-in', requireRole('Admin', 'Staff'), receptionController.checkIn);

// ---- Xem và hủy đơn: khách chỉ với đơn của mình, Admin/Lễ tân với mọi đơn ----
router.get('/:id', bookingController.getBookingById);
router.patch('/:id/cancel', bookingController.cancelBooking);

module.exports = router;