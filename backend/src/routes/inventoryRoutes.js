const express = require('express');
const router = express.Router();
const { getInventory, createInventoryItem, updateInventoryItem, deleteInventoryItem } = require('../controllers/inventoryController');
const { verifyToken } = require('../middlewares/auth');

router.get('/', verifyToken, getInventory);
router.post('/', verifyToken, createInventoryItem);
router.put('/:id', verifyToken, updateInventoryItem);
router.delete('/:id', verifyToken, deleteInventoryItem);

module.exports = router;
