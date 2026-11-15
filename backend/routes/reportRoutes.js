const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { verifyToken, requireRole } = require('../middleware/auth');

router.use(verifyToken, requireRole('Admin'));

router.get('/monthly', reportController.monthlyReport);

module.exports = router;