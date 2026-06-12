const prisma = require('../prisma');

// --- Test Categories ---
exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Category name is required' });
    const category = await prisma.testCategory.create({ data: { name } });
    res.status(201).json(category);
  } catch (err) {
    console.error('Create category error:', err.message);
    res.status(500).json({ message: 'An error occurred.' });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await prisma.testCategory.findMany({
      include: { tests: true }
    });
    res.status(200).json(categories);
  } catch (err) {
    console.error('Get categories error:', err.message);
    res.status(500).json({ message: 'An error occurred.' });
  }
};

// --- Tests ---
const TEST_CREATE_FIELDS = ['testName', 'testCode', 'sampleType', 'price', 'categoryId', 'summary'];

exports.createTest = async (req, res) => {
  try {
    const { parameters } = req.body;
    const whitelisted = {};
    for (const field of TEST_CREATE_FIELDS) {
      if (req.body[field] !== undefined) whitelisted[field] = req.body[field];
    }
    if (!whitelisted.testName || !whitelisted.testCode) {
      return res.status(400).json({ message: 'Test name and code are required' });
    }
    const test = await prisma.test.create({
      data: {
        ...whitelisted,
        parameters: { create: parameters || [] }
      },
      include: { parameters: true, category: true }
    });
    res.status(201).json(test);
  } catch (err) {
    console.error('Create test error:', err.message);
    res.status(500).json({ message: 'An error occurred.' });
  }
};

exports.getTests = async (req, res) => {
  try {
    const tests = await prisma.test.findMany({
      include: { category: true, parameters: true }
    });
    res.status(200).json(tests);
  } catch (err) {
    console.error('getTests error:', err.message);
    res.status(500).json({ message: 'An error occurred.' });
  }
};

exports.updateTest = async (req, res) => {
  try {
    const { parameters } = req.body;
    const whitelisted = {};
    for (const field of TEST_CREATE_FIELDS) {
      if (req.body[field] !== undefined) whitelisted[field] = req.body[field];
    }

    const test = await prisma.test.update({
      where: { id: parseInt(req.params.id) },
      data: whitelisted,
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

    // Background: update historical report results (non-blocking)
    if (parameters) {
      setImmediate(async () => {
        try {
          for (const p of parameters) {
            await prisma.reportResult.updateMany({
              where: { testId: test.id, parameterName: p.parameterName },
              data: { referenceRange: p.referenceRange, unit: p.unit }
            });
          }
        } catch (bgErr) {
          console.error('Background parameter update error:', bgErr.message);
        }
      });
    }
  } catch (err) {
    console.error('Update test error:', err.message);
    res.status(500).json({ message: 'An error occurred.' });
  }
};

exports.deleteTest = async (req, res) => {
  try {
    await prisma.reportResult.deleteMany({ where: { testId: parseInt(req.params.id) } });
    await prisma.testParameter.deleteMany({ where: { testId: parseInt(req.params.id) } });
    await prisma.test.delete({ where: { id: parseInt(req.params.id) } });
    res.status(200).json({ message: 'Test deleted successfully' });
  } catch (err) {
    console.error('Delete test error:', err.message);
    res.status(500).json({ message: 'An error occurred.' });
  }
};
