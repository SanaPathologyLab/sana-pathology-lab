const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth');
const {
  getPackages,
  createPackage,
  updatePackage,
  deletePackage,
} = require('../controllers/packageController');

router.get('/', verifyToken, getPackages);
router.post('/', verifyToken, createPackage);
router.put('/:id', verifyToken, updatePackage);
router.delete('/:id', verifyToken, deletePackage);

module.exports = router;
