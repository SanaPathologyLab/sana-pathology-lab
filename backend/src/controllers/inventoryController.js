const prisma = require('../prisma');

const getInventory = async (req, res) => {
  try {
    const items = await prisma.inventory.findMany({ orderBy: { itemName: 'asc' } });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
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
    res.status(500).json({ error: err.message });
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
    res.status(500).json({ error: err.message });
  }
};

const deleteInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.inventory.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getInventory, createInventoryItem, updateInventoryItem, deleteInventoryItem };
