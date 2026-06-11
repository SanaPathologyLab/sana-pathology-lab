const express = require('express');
const router = express.Router();
const controller = require('../controllers/patientController');
const { verifyToken } = require('../middlewares/auth');

router.use(verifyToken); // All patient routes require auth

router.post('/', controller.createPatient);
router.get('/', controller.getPatients);
router.post('/bulk-delete', controller.bulkDeletePatients);
router.get('/:id', controller.getPatientById);
router.put('/:id', controller.updatePatient);
router.delete('/:id', controller.deletePatient);

module.exports = router;
