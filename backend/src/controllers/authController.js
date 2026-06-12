const prisma = require('../prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { email, password, name, role, phone } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Email, password, and name are required' });
    }

    const userCount = await prisma.user.count();

    if (userCount > 0 && req.userRole !== 'ADMIN') {
      return res.status(403).json({ message: 'Only admin can create users' });
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
    console.error('Register error:', err.message);
    res.status(500).json({ message: 'An error occurred during registration.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Try to find user by email first (case-insensitive)
    let user = await prisma.user.findFirst({ 
      where: { email: { equals: email, mode: 'insensitive' } } 
    });

    // If not found by email, look up the Staff member by staffId or email (case-insensitively)
    if (!user) {
      const staff = await prisma.staff.findFirst({
        where: {
          OR: [
            { staffId: { equals: email, mode: 'insensitive' } },
            { email: { equals: email, mode: 'insensitive' } }
          ]
        }
      });

      if (staff) {
        // Find User by staff's email first
        if (staff.email) {
          user = await prisma.user.findFirst({
            where: { email: { equals: staff.email, mode: 'insensitive' } }
          });
        }
        // If still not found, look up User by staff's staffId (e.g. fallback login ID)
        if (!user && staff.staffId) {
          user = await prisma.user.findFirst({
            where: { email: { equals: staff.staffId, mode: 'insensitive' } }
          });
        }
      }
    }

    if (!user) return res.status(404).json({ message: 'User not found' });

    const passwordIsValid = bcrypt.compareSync(password, user.password);
    if (!passwordIsValid) return res.status(401).json({ message: 'Invalid password' });

    const token = jwt.sign({ id: user.id, role: user.role, userType: 'STAFF' }, process.env.JWT_SECRET, {
      expiresIn: '7d'
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
    console.error('Login error:', err.message);
    res.status(500).json({ message: 'An error occurred during login.' });
  }
};

exports.me = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) return res.status(404).json({ message: 'User not found' });
    delete user.password;
    res.status(200).json({ ...user, userType: 'STAFF' });
  } catch (err) {
    console.error('Me error:', err.message);
    res.status(500).json({ message: 'An error occurred.' });
  }
};

exports.loginPatient = async (req, res) => {
  try {
    const { mobileNumber, patientId, dateOfBirth, pin } = req.body;

    const patient = await prisma.patient.findFirst({
      where: { mobileNumber, patientId }
    });

    if (!patient) return res.status(404).json({ message: 'Invalid Patient ID or Mobile Number' });

    // Verify PIN (if set) or date of birth
    if (patient.pin) {
      const bcrypt = require('bcryptjs');
      if (!bcrypt.compareSync(String(pin), patient.pin)) {
        return res.status(401).json({ message: 'Invalid PIN' });
      }
    } else if (patient.dateOfBirth && dateOfBirth) {
      const dob = new Date(dateOfBirth).toISOString().split('T')[0];
      const storedDob = new Date(patient.dateOfBirth).toISOString().split('T')[0];
      if (dob !== storedDob) {
        return res.status(401).json({ message: 'Verification failed. Provide correct date of birth or set up a PIN.' });
      }
    } else {
      return res.status(401).json({ message: 'Set up a PIN via the patient portal to log in.' });
    }

    const token = jwt.sign({ id: patient.id, userType: 'PATIENT' }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.status(200).json({
      id: patient.id,
      name: patient.fullName,
      userType: 'PATIENT',
      accessToken: token
    });
  } catch (err) {
    console.error('Patient login error:', err.message);
    res.status(500).json({ message: 'An error occurred during login.' });
  }
};

exports.loginDoctor = async (req, res) => {
  try {
    const { mobileNumber, doctorId, pin } = req.body;
    const doctor = await prisma.doctor.findFirst({
      where: { mobileNumber, doctorId }
    });

    if (!doctor) return res.status(404).json({ message: 'Invalid Doctor ID or Mobile Number' });
    if (!doctor.isApproved) return res.status(403).json({ message: 'Your account is pending admin approval.' });

    // Verify PIN (if set)
    if (doctor.pin) {
      const bcrypt = require('bcryptjs');
      if (!bcrypt.compareSync(String(pin), doctor.pin)) {
        return res.status(401).json({ message: 'Invalid PIN' });
      }
    } else {
      return res.status(401).json({ message: 'Set up a PIN via your profile to log in.' });
    }

    const token = jwt.sign({ id: doctor.id, userType: 'DOCTOR' }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.status(200).json({
      id: doctor.id,
      name: doctor.name,
      userType: 'DOCTOR',
      accessToken: token
    });
  } catch (err) {
    console.error('Doctor login error:', err.message);
    res.status(500).json({ message: 'An error occurred during login.' });
  }
};

exports.registerDoctor = async (req, res) => {
  try {
    const { name, mobileNumber, qualification, specialization, email, clinicName, address } = req.body;

    if (!name || !mobileNumber) {
      return res.status(400).json({ message: 'Name and mobile number are required' });
    }

    const existing = await prisma.doctor.findFirst({ where: { mobileNumber } });
    if (existing) {
      return res.status(400).json({ message: 'A doctor with this mobile number already exists.' });
    }

    const lastDoctor = await prisma.doctor.findFirst({
      orderBy: { id: 'desc' }
    });
    const nextIdNum = lastDoctor ? lastDoctor.id + 1 : 1;
    const doctorId = `DOC-${nextIdNum.toString().padStart(4, '0')}`;

    const doctor = await prisma.doctor.create({
      data: { name, mobileNumber, qualification, specialization, email, clinicName, address, doctorId, isApproved: false }
    });
    res.status(201).json({ message: 'Doctor registered successfully. Pending approval.', doctorId: doctor.doctorId });
  } catch (err) {
    console.error('Doctor register error:', err.message);
    res.status(500).json({ message: 'An error occurred during registration.' });
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
    console.error('Patient recovery error:', err.message);
    res.status(500).json({ message: 'An error occurred.' });
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
    console.error('Doctor recovery error:', err.message);
    res.status(500).json({ message: 'An error occurred.' });
  }
};
