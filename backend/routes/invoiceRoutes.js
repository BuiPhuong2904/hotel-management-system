const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const invoiceDocController = require('../controllers/invoiceDocController');
const { verifyToken, requireRole } = require('../middleware/auth');

router.use(verifyToken);

router.get('/preview', requireRole('Admin', 'Staff'), invoiceController.previewInvoice);
router.get('/my', requireRole('Customer'), invoiceController.getMyInvoices);

router.get('/', requireRole('Admin', 'Staff'), invoiceController.getInvoices);
router.post('/', requireRole('Admin', 'Staff'), invoiceController.createInvoice);

router.get('/:id/pdf', invoiceDocController.downloadPdf);

router.post('/:id/email', requireRole('Admin', 'Staff'), invoiceDocController.emailInvoice);

router.get('/:id', invoiceController.getInvoiceById);

module.exports = router;