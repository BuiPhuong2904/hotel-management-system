const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, requireRole } = require('../middleware/auth');

router.use(verifyToken);

// Tài khoản của chính mình
router.put('/me', userController.updateMe);
router.put('/me/password', userController.changeMyPassword);

// Admin và Lễ tân
router.get('/', requireRole('Admin', 'Staff'), userController.getUsers);
router.get('/:id', requireRole('Admin', 'Staff'), userController.getUserById);
router.put('/:id', requireRole('Admin', 'Staff'), userController.updateUser);

// Admin
router.post('/', requireRole('Admin'), userController.createUser);
router.patch('/:id/role', requireRole('Admin'), userController.updateRole);
router.patch('/:id/status', requireRole('Admin'), userController.updateStatus);
router.patch('/:id/password', requireRole('Admin'), userController.resetPassword);

module.exports = router;