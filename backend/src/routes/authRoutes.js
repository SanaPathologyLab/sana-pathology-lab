const express = require('express');
const router = express.Router();
const controller = require('../controllers/authController');
const { verifyToken } = require('../middlewares/auth');

router.post('/register', verifyToken, controller.register);
router.post('/login', controller.login);
router.post('/login/patient', controller.loginPatient);
router.post('/login/doctor', controller.loginDoctor);
router.post('/register/doctor', controller.registerDoctor);
router.post('/recover/patient', controller.recoverPatient);
router.post('/recover/doctor', controller.recoverDoctor);
router.get('/me', verifyToken, controller.me);

module.exports = router;
