const express = require('express');
const router = express.Router();
const serviceUsageController = require('../controllers/serviceUsageController');
const { verifyToken, requireRole } = require('../middleware/auth');

router.use(verifyToken);

router.get('/', serviceUsageController.getUsages);

router.post('/', requireRole('Admin', 'Staff'), serviceUsageController.createUsage);
router.patch('/:id', requireRole('Admin', 'Staff'), serviceUsageController.updateUsage);
router.delete('/:id', requireRole('Admin', 'Staff'), serviceUsageController.deleteUsage);

module.exports = router;