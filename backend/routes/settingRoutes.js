const express = require('express');
const router = express.Router();
const settingController = require('../controllers/settingController');
const { verifyToken, requireRole } = require('../middleware/auth');

router.use(verifyToken);

router.get('/', settingController.getSettings);
router.put('/:key', requireRole('Admin'), settingController.updateSetting);

module.exports = router;