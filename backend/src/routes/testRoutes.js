const express = require('express');
const router = express.Router();
const controller = require('../controllers/testController');
const { verifyToken } = require('../middlewares/auth');

router.use(verifyToken);

// Categories
router.post('/categories', controller.createCategory);
router.get('/categories', controller.getCategories);

// Tests
router.post('/', controller.createTest);
router.get('/', controller.getTests);
router.put('/:id', controller.updateTest);
router.delete('/:id', controller.deleteTest);

module.exports = router;
