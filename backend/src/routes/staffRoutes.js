const express = require('express');
const router = express.Router();
const { getStaff, createStaff, updateStaff, deleteStaff, markAttendance } = require('../controllers/staffController');
const { verifyToken } = require('../middlewares/auth');

router.get('/', verifyToken, getStaff);
router.post('/', verifyToken, createStaff);
router.put('/:id', verifyToken, updateStaff);
router.delete('/:id', verifyToken, deleteStaff);
router.post('/attendance', verifyToken, markAttendance);

module.exports = router;
