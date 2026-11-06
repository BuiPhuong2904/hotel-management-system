const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const { verifyToken, requireRole } = require('../middleware/auth');

router.get('/available', roomController.getAvailableRooms);

router.get('/', roomController.getRooms);
router.get('/:id', roomController.getRoomById);
router.post('/', verifyToken, requireRole('Admin'), roomController.createRoom);
router.put('/:id', verifyToken, requireRole('Admin'), roomController.updateRoom);
router.patch('/:id/status', verifyToken, requireRole('Admin', 'Staff'), roomController.updateRoomStatus);
router.delete('/:id', verifyToken, requireRole('Admin'), roomController.deleteRoom);

module.exports = router;