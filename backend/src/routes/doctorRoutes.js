const express = require('express');
const router = express.Router();
const controller = require('../controllers/doctorController');
const { verifyToken } = require('../middlewares/auth');

router.use(verifyToken);

router.post('/', controller.createDoctor);
router.get('/', controller.getDoctors);
router.get('/analytics/referrals', controller.getDoctorAnalytics);
router.get('/:id', controller.getDoctorById);
router.put('/:id', controller.updateDoctor);
router.delete('/:id', controller.deleteDoctor);

module.exports = router;
