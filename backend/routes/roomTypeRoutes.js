const express = require('express');
const router = express.Router();
const roomTypeController = require('../controllers/roomTypeController');
const { verifyToken, requireRole } = require('../middleware/auth');

router.get('/', roomTypeController.getRoomTypes);
router.get('/:id', roomTypeController.getRoomTypeById);
router.post('/', verifyToken, requireRole('Admin'), roomTypeController.createRoomType);
router.put('/:id', verifyToken, requireRole('Admin'), roomTypeController.updateRoomType);
router.delete('/:id', verifyToken, requireRole('Admin'), roomTypeController.deleteRoomType);

module.exports = router;