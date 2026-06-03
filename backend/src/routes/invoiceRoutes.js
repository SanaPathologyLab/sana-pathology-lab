const express = require('express');
const router = express.Router();
const controller = require('../controllers/invoiceController');
const { verifyToken } = require('../middlewares/auth');

router.use(verifyToken);

router.post('/', controller.createInvoice);
router.get('/', controller.getInvoices);
router.post('/:id/pay', controller.payInvoice);
router.post('/:id/discount', controller.applyDiscount);

module.exports = router;
