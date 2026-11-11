const express = require('express');
const router = express.Router();
const promotionController = require('../controllers/promotionController');
const { verifyToken, requireRole } = require('../middleware/auth');

router.use(verifyToken);

router.get('/check', promotionController.checkPromotion);

router.get('/', requireRole('Admin'), promotionController.getPromotions);
router.post('/', requireRole('Admin'), promotionController.createPromotion);
router.get('/:id', requireRole('Admin'), promotionController.getPromotionById);
router.put('/:id', requireRole('Admin'), promotionController.updatePromotion);
router.delete('/:id', requireRole('Admin'), promotionController.deletePromotion);

module.exports = router;