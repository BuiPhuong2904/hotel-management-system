const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');
const { verifyToken } = require('../middleware/auth');

router.post('/', verifyToken, chatbotController.chat);

module.exports = router;