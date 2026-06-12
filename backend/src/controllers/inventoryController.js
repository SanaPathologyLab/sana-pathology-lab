const prisma = require('../prisma');

const getInventory = async (req, res) => {
  try {
    const items = await prisma.inventory.findMany({ orderBy: { itemName: 'asc' } });
    res.json(items);
  } catch (err) {
    console.error('Get inventory error:', err.message);
    res.status(500).json({ message: 'An error occurred.' });
  }
};

const createInventoryItem = async (req, res) => {
  try {
    const { itemName, category, currentStock, lowStockAlert, expiryDate, supplierName, supplierPhone, supplierEmail, unitPrice, unit } = req.body;
    const item = await prisma.inventory.create({
      data: {
        itemName,
        category,
        currentStock: parseInt(currentStock),
        lowStockAlert: parseInt(lowStockAlert),
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        supplierName,
        supplierPhone,
        supplierEmail,
        unitPrice: unitPrice ? parseFloat(unitPrice) : null,
        unit,
      },
    });
    res.json(item);
  } catch (err) {
    console.error('Create inventory item error:', err.message);
    res.status(500).json({ message: 'An error occurred.' });
  }
};

const updateInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { itemName, category, currentStock, lowStockAlert, expiryDate, supplierName, supplierPhone, supplierEmail, unitPrice, unit } = req.body;
    const item = await prisma.inventory.update({
      where: { id: parseInt(id) },
      data: {
        itemName,
        category,
        currentStock: parseInt(currentStock),
        lowStockAlert: parseInt(lowStockAlert),
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        supplierName,
        supplierPhone,
        supplierEmail,
        unitPrice: unitPrice ? parseFloat(unitPrice) : null,
        unit,
      },
    });
    res.json(item);
  } catch (err) {
    console.error('Update inventory item error:', err.message);
    res.status(500).json({ message: 'An error occurred.' });
  }
};

const deleteInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.inventory.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Item deleted' });
  } catch (err) {
    console.error('Delete inventory item error:', err.message);
    res.status(500).json({ message: 'An error occurred.' });
  }
};

module.exports = { getInventory, createInventoryItem, updateInventoryItem, deleteInventoryItem };
