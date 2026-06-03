const express = require('express');
const router = express.Router();
const { getAppointments, createAppointment, updateAppointment, deleteAppointment } = require('../controllers/appointmentController');
const { verifyToken } = require('../middlewares/auth');

router.get('/', verifyToken, getAppointments);
router.post('/', verifyToken, createAppointment);
router.put('/:id', verifyToken, updateAppointment);
router.delete('/:id', verifyToken, deleteAppointment);

module.exports = router;
