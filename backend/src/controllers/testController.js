const prisma = require('../prisma');

// --- Test Categories ---
exports.createCategory = async (req, res) => {
  try {
    const category = await prisma.testCategory.create({ data: req.body });
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await prisma.testCategory.findMany({
      include: { tests: true }
    });
    res.status(200).json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --- Tests ---
exports.createTest = async (req, res) => {
  try {
    const { parameters, ...testData } = req.body;
    const test = await prisma.test.create({ 
      data: {
        ...testData,
        parameters: { create: parameters || [] }
      },
      include: { parameters: true, category: true }
    });
    res.status(201).json(test);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getTests = async (req, res) => {
  try {
    const tests = await prisma.test.findMany({
      include: { category: true, parameters: true }
    });
    res.status(200).json(tests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateTest = async (req, res) => {
  try {
    const { parameters, ...testData } = req.body;
    
    // First update the main test
    const test = await prisma.test.update({
      where: { id: parseInt(req.params.id) },
      data: testData,
    });

    // Handle parameters (delete old, create new for simplicity)
    if (parameters) {
      await prisma.testParameter.deleteMany({ where: { testId: test.id } });
      await prisma.testParameter.createMany({
        data: parameters.map(p => ({ ...p, testId: test.id }))
      });
    }

    const updatedTest = await prisma.test.findUnique({
      where: { id: test.id },
      include: { parameters: true, category: true }
    });
    
    res.status(200).json(updatedTest);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteTest = async (req, res) => {
  try {
    if (req.userRole !== 'ADMIN') return res.status(403).json({ message: 'Admin access required' });
    await prisma.test.delete({ where: { id: parseInt(req.params.id) } });
    res.status(200).json({ message: 'Test deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
