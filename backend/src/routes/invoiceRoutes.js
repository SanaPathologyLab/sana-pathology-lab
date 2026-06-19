const express = require('express');
const router = express.Router();
const controller = require('../controllers/invoiceController');
const { verifyToken } = require('../middlewares/auth');

router.use(verifyToken);

router.post('/', controller.createInvoice);
router.get('/', controller.getInvoices);
router.post('/bulk-delete', controller.bulkDeleteInvoices);
router.post('/:id/pay', controller.payInvoice);
router.post('/:id/discount', controller.applyDiscount);
router.put('/:id', controller.updateInvoice);
router.delete('/:id', controller.deleteInvoice);

module.exports = router;
