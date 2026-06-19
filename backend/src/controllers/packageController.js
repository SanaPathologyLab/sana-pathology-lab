const prisma = require('../prisma');
const { logActivity } = require('../utils/activityLogger');

// GET /api/packages - list all packages with their tests
exports.getPackages = async (req, res) => {
  try {
    const packages = await prisma.testPackage.findMany({
      include: {
        items: {
          include: {
            test: {
              include: { category: true }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    });
    res.json(packages);
  } catch (err) {
    console.error('Get packages error:', err.message);
    res.status(500).json({ message: 'An error occurred fetching packages.' });
  }
};

// POST /api/packages - create a package
exports.createPackage = async (req, res) => {
  try {
    const { name, code, description, price, isActive, testIds } = req.body;
    if (!name || !code || price === undefined || !Array.isArray(testIds) || testIds.length === 0) {
      return res.status(400).json({ message: 'name, code, price and at least one test are required.' });
    }

    // Ensure code is uppercase
    const upperCode = String(code).toUpperCase().trim();

    const pkg = await prisma.testPackage.create({
      data: {
        name: name.trim(),
        code: upperCode,
        description: description ? description.trim() : null,
        price: parseFloat(price),
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        items: {
          create: testIds.map(testId => ({ testId: parseInt(testId) }))
        }
      },
      include: {
        items: { include: { test: { include: { category: true } } } }
      }
    });

    res.status(201).json(pkg);

    logActivity({
      userId: req.userId,
      action: 'CREATE',
      entity: 'TestPackage',
      entityId: pkg.code,
      description: `Created health package "${pkg.name}" (${pkg.code}) with ${testIds.length} tests`,
      req,
    });
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({ message: 'A package with this code already exists.' });
    }
    console.error('Create package error:', err.message);
    res.status(500).json({ message: 'An error occurred creating the package.' });
  }
};

// PUT /api/packages/:id - update package
exports.updatePackage = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, code, description, price, isActive, testIds } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (code !== undefined) updateData.code = String(code).toUpperCase().trim();
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);

    // Replace tests if provided
    if (Array.isArray(testIds)) {
      // Delete existing items then recreate
      await prisma.testPackageItem.deleteMany({ where: { packageId: id } });
      updateData.items = {
        create: testIds.map(testId => ({ testId: parseInt(testId) }))
      };
    }

    const pkg = await prisma.testPackage.update({
      where: { id },
      data: updateData,
      include: {
        items: { include: { test: { include: { category: true } } } }
      }
    });

    res.json(pkg);

    logActivity({
      userId: req.userId,
      action: 'UPDATE',
      entity: 'TestPackage',
      entityId: id,
      description: `Updated health package ID ${id}`,
      req,
    });
  } catch (err) {
    console.error('Update package error:', err.message);
    res.status(500).json({ message: 'An error occurred updating the package.' });
  }
};

// DELETE /api/packages/:id
exports.deletePackage = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.testPackageItem.deleteMany({ where: { packageId: id } });
    await prisma.testPackage.delete({ where: { id } });
    res.json({ message: 'Package deleted successfully.' });

    logActivity({
      userId: req.userId,
      action: 'DELETE',
      entity: 'TestPackage',
      entityId: id,
      description: `Deleted health package ID ${id}`,
      req,
    });
  } catch (err) {
    console.error('Delete package error:', err.message);
    res.status(500).json({ message: 'An error occurred deleting the package.' });
  }
};

// GET /api/activity-log - paginated activity log viewer
exports.getActivityLog = async (req, res) => {
  try {
    const { page = 1, limit = 50, action, entity, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (action) where.action = action;
    if (entity) where.entity = entity;
    if (search) {
      where.OR = [
        { description: { contains: search, mode: 'insensitive' } },
        { entityId: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.activityLog.count({ where }),
    ]);

    // Enrich with user name
    const userIds = [...new Set(logs.map(l => l.userId).filter(Boolean))];
    const users = userIds.length
      ? await prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, name: true } })
      : [];
    const userMap = Object.fromEntries(users.map(u => [u.id, u.name]));

    const enriched = logs.map(l => ({
      ...l,
      userName: l.userId ? (userMap[l.userId] || `User #${l.userId}`) : 'System',
    }));

    res.json({ logs: enriched, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    console.error('Get activity log error:', err.message);
    res.status(500).json({ message: 'An error occurred fetching the activity log.' });
  }
};
