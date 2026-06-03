const prisma = require('../prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { email, password, name, role, phone } = req.body;
    
    // In production, we'd only allow ADMIN to register other users.
    // We will bypass it here just for setup if no users exist.
    const userCount = await prisma.user.count();
    
    if (userCount > 0 && req.userRole !== 'ADMIN') {
      // return res.status(403).json({ message: 'Only admin can create users' });
    }

    const hashedPassword = bcrypt.hashSync(password, 8);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role || 'RECEPTIONIST',
        phone
      }
    });

    res.status(201).json({ message: 'User registered successfully', userId: user.id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findFirst({ 
      where: { email: { equals: email, mode: 'insensitive' } } 
    });

    if (!user) return res.status(404).json({ message: 'User not found' });

    const passwordIsValid = bcrypt.compareSync(password, user.password);
    if (!passwordIsValid) return res.status(401).json({ message: 'Invalid password' });

    const token = jwt.sign({ id: user.id, role: user.role, userType: 'STAFF' }, process.env.JWT_SECRET || 'supersecretjwtkey', {
      expiresIn: 86400 // 24 hours
    });

    res.status(200).json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      userType: 'STAFF',
      accessToken: token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.me = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) return res.status(404).json({ message: 'User not found' });
    delete user.password;
    res.status(200).json({ ...user, userType: 'STAFF' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.loginPatient = async (req, res) => {
  try {
    const { mobileNumber, patientId } = req.body;
    const patient = await prisma.patient.findFirst({
      where: { mobileNumber, patientId }
    });

    if (!patient) return res.status(404).json({ message: 'Invalid Patient ID or Mobile Number' });

    const token = jwt.sign({ id: patient.id, userType: 'PATIENT' }, process.env.JWT_SECRET || 'supersecretjwtkey', {
      expiresIn: 86400
    });

    res.status(200).json({
      id: patient.id,
      name: patient.fullName,
      userType: 'PATIENT',
      accessToken: token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.loginDoctor = async (req, res) => {
  try {
    const { mobileNumber, doctorId } = req.body;
    const doctor = await prisma.doctor.findFirst({
      where: { mobileNumber, doctorId }
    });

    if (!doctor) return res.status(404).json({ message: 'Invalid Doctor ID or Mobile Number' });
    if (!doctor.isApproved) return res.status(403).json({ message: 'Your account is pending admin approval.' });

    const token = jwt.sign({ id: doctor.id, userType: 'DOCTOR' }, process.env.JWT_SECRET || 'supersecretjwtkey', {
      expiresIn: 86400
    });

    res.status(200).json({
      id: doctor.id,
      name: doctor.name,
      userType: 'DOCTOR',
      accessToken: token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.registerDoctor = async (req, res) => {
  try {
    const data = req.body;
    
    // Check if mobile number already exists
    const existing = await prisma.doctor.findFirst({ where: { mobileNumber: data.mobileNumber } });
    if (existing) {
      return res.status(400).json({ message: 'A doctor with this mobile number already exists.' });
    }

    const lastDoctor = await prisma.doctor.findFirst({
      orderBy: { id: 'desc' }
    });
    const nextIdNum = lastDoctor ? lastDoctor.id + 1 : 1;
    data.doctorId = `DOC-${nextIdNum.toString().padStart(4, '0')}`;
    data.isApproved = false;
    
    const doctor = await prisma.doctor.create({ data });
    res.status(201).json({ message: 'Doctor registered successfully. Pending approval.', doctorId: doctor.doctorId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.recoverPatient = async (req, res) => {
  try {
    const { mobileNumber, fullName } = req.body;
    const patient = await prisma.patient.findFirst({
      where: {
        mobileNumber,
        fullName: {
          equals: fullName,
        }
      }
    });

    if (!patient) {
      // Intentionally vague message to prevent fishing
      return res.status(404).json({ message: 'No matching record found. Please ensure your name and mobile number are entered exactly as registered.' });
    }

    res.status(200).json({ message: 'Match found!', id: patient.patientId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.recoverDoctor = async (req, res) => {
  try {
    const { mobileNumber, fullName } = req.body;
    const doctor = await prisma.doctor.findFirst({
      where: {
        mobileNumber,
        name: {
          equals: fullName,
        }
      }
    });

    if (!doctor) {
      return res.status(404).json({ message: 'No matching record found. Please ensure your name and mobile number are entered exactly as registered.' });
    }

    res.status(200).json({ message: 'Match found!', id: doctor.doctorId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
