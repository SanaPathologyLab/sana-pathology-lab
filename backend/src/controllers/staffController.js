const prisma = require('../prisma');

const generateStaffId = async (tx) => {
  const count = await tx.staff.count();
  return `STF-${String(count + 1).padStart(4, '0')}`;
};

const getStaff = async (req, res) => {
  try {
    const staff = await prisma.staff.findMany({
      include: { attendance: { orderBy: { date: 'desc' }, take: 30 } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(staff);
  } catch (err) {
    console.error('Get staff error:', err.message);
    res.status(500).json({ error: 'An error occurred.' });
  }
};

const createStaff = async (req, res) => {
  try {
    const { name, role, mobile, email, address, joiningDate, salary } = req.body;
    if (!name) return res.status(400).json({ error: 'Staff name is required' });

    const staff = await prisma.$transaction(async (tx) => {
      const staffId = await generateStaffId(tx);
      return tx.staff.create({
        data: {
          staffId,
          name,
          role,
          mobile,
          email,
          address,
          joiningDate: joiningDate ? new Date(joiningDate) : null,
          salary: salary ? parseFloat(salary) : null,
        },
      });
    });
    res.json(staff);
  } catch (err) {
    console.error('Create staff error:', err.message);
    res.status(500).json({ error: 'An error occurred.' });
  }
};

const updateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, mobile, email, address, joiningDate, salary, isActive } = req.body;
    const staff = await prisma.staff.update({
      where: { id: parseInt(id) },
      data: {
        name,
        role,
        mobile,
        email,
        address,
        joiningDate: joiningDate ? new Date(joiningDate) : undefined,
        salary: salary !== undefined ? parseFloat(salary) : undefined,
        isActive: isActive !== undefined ? isActive : undefined,
      },
    });
    res.json(staff);
  } catch (err) {
    console.error('Update staff error:', err.message);
    res.status(500).json({ error: 'An error occurred.' });
  }
};

const deleteStaff = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.staff.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Staff deleted' });
  } catch (err) {
    console.error('Delete staff error:', err.message);
    res.status(500).json({ error: 'An error occurred.' });
  }
};

const markAttendance = async (req, res) => {
  try {
    const { staffId, date, status, notes } = req.body;
    // Upsert: one record per staff per day
    const dateObj = new Date(date);
    const existing = await prisma.attendance.findFirst({
      where: { staffId: parseInt(staffId), date: dateObj },
    });
    let record;
    if (existing) {
      record = await prisma.attendance.update({
        where: { id: existing.id },
        data: { status, notes },
      });
    } else {
      record = await prisma.attendance.create({
        data: { staffId: parseInt(staffId), date: dateObj, status, notes },
      });
    }
    res.json(record);
  } catch (err) {
    console.error('Mark attendance error:', err.message);
    res.status(500).json({ error: 'An error occurred.' });
  }
};

const setStaffCredentials = async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    const staff = await prisma.staff.findUnique({ where: { id: parseInt(id) } });
    if (!staff) return res.status(404).json({ error: 'Staff member not found' });

    const bcrypt = require('bcryptjs');
    const hashedPassword = bcrypt.hashSync(password, 8);

    // Map Staff role to valid User role if possible, fallback to RECEPTIONIST
    const roleMapping = {
      'TECHNICIAN': 'TECHNICIAN',
      'RECEPTIONIST': 'RECEPTIONIST',
      'MANAGER': 'ADMIN',
      'ACCOUNTANT': 'RECEPTIONIST',
    };
    const userRole = roleMapping[staff.role] || 'RECEPTIONIST';

    // Use staff's email as login email, fall back to staffId if no email
    const loginEmail = staff.email || staff.staffId;

    // If staff has an email and an old User record exists with staffId as email,
    // delete the old record first to avoid unique constraint conflict
    if (staff.email && staff.staffId !== staff.email) {
      await prisma.user.deleteMany({ where: { email: staff.staffId } });
    }

    // Upsert User record using staff's email (or staffId as fallback)
    const user = await prisma.user.upsert({
      where: { email: loginEmail },
      update: {
        password: hashedPassword,
        name: staff.name,
        role: userRole,
        phone: staff.mobile
      },
      create: {
        email: loginEmail,
        password: hashedPassword,
        name: staff.name,
        role: userRole,
        phone: staff.mobile
      }
    });

    res.json({ message: 'Credentials updated successfully', loginId: loginEmail, staffId: staff.staffId });
  } catch (err) {
    console.error('Set staff credentials error:', err.message);
    res.status(500).json({ error: 'An error occurred.' });
  }
};

module.exports = { getStaff, createStaff, updateStaff, deleteStaff, markAttendance, setStaffCredentials };
