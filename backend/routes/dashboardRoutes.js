const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { verifyToken, requireRole } = require('../middleware/auth');

router.use(verifyToken, requireRole('Admin'));

router.get('/overview', reportController.overview);
router.get('/revenue', reportController.revenueByYear);
router.get('/top-services', reportController.topServices);

module.exports = router;