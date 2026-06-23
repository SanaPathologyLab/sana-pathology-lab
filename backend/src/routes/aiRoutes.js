const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

router.post('/chat', aiController.chat);
router.post('/reset', aiController.reset);
router.get('/status', aiController.status);

module.exports = router;
