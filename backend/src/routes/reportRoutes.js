const express = require('express');
const router = express.Router();
const controller = require('../controllers/reportController');
const { verifyToken } = require('../middlewares/auth');

router.use(verifyToken);

router.post('/', controller.createReport);
router.get('/', controller.getReports);
router.get('/:id', controller.getReportById);
router.get('/:id/pdf', controller.generateReportPDF);
router.put('/:id', controller.updateReport);
router.delete('/:id', controller.deleteReport);

module.exports = router;

