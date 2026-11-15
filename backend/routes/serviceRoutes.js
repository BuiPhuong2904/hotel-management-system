const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const { verifyToken, requireRole } = require('../middleware/auth');

router.get('/', serviceController.getServices);
router.get('/:id', serviceController.getServiceById);
router.post('/', verifyToken, requireRole('Admin'), serviceController.createService);
router.put('/:id', verifyToken, requireRole('Admin'), serviceController.updateService);
router.delete('/:id', verifyToken, requireRole('Admin'), serviceController.deleteService);

module.exports = router;