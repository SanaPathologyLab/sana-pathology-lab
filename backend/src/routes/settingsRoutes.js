const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { verifyToken } = require('../middlewares/auth');

router.get('/', verifyToken, getSettings);
router.put('/', verifyToken, updateSettings);

module.exports = router;
