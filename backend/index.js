const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const prisma = require('./src/prisma');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./src/routes/authRoutes');
const patientRoutes = require('./src/routes/patientRoutes');
const doctorRoutes = require('./src/routes/doctorRoutes');
const testRoutes = require('./src/routes/testRoutes');
const reportRoutes = require('./src/routes/reportRoutes');
const invoiceRoutes = require('./src/routes/invoiceRoutes');
const settingsRoutes = require('./src/routes/settingsRoutes');
const appointmentRoutes = require('./src/routes/appointmentRoutes');
const inventoryRoutes = require('./src/routes/inventoryRoutes');
const staffRoutes = require('./src/routes/staffRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/staff', staffRoutes);

// ─── PUBLIC: Patient Report Lookup (no auth required) ───
app.get('/api/public/report-lookup', async (req, res) => {
  try {
    const { mobile, reportNumber } = req.query;
    if (!mobile && !reportNumber) {
      return res.status(400).json({ message: 'Provide mobile number or report number.' });
    }

    let reports = [];

    if (reportNumber) {
      // Search by exact report number
      const report = await prisma.report.findUnique({
        where: { reportNumber: reportNumber.trim().toUpperCase() },
        include: {
          patient: true,
          doctor: true,
          results: { include: { test: { include: { category: true } } } },
          invoice: true,
        },
      });
      if (report) reports = [report];
    } else if (mobile) {
      // Find patient by mobile, then get their reports
      const patient = await prisma.patient.findFirst({
        where: { mobileNumber: mobile.trim() },
      });
      if (patient) {
        reports = await prisma.report.findMany({
          where: { patientId: patient.id },
          include: {
            patient: true,
            doctor: true,
            results: { include: { test: { include: { category: true } } } },
            invoice: true,
          },
          orderBy: { reportDate: 'desc' },
          take: 10, // last 10 reports
        });
      }
    }

    if (reports.length === 0) {
      return res.status(404).json({ message: 'No reports found. Please check the number and try again.' });
    }

    res.json(reports);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// ─── PUBLIC: Book Appointment ───
app.post('/api/public/book-appointment', async (req, res) => {
  try {
    const { name, mobile, gender, dateOfBirth, address, preferredDate, preferredTime, notes } = req.body;
    
    if (!name || !mobile || !preferredDate || !preferredTime || !gender) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if patient exists
    let patient = await prisma.patient.findFirst({
      where: { mobileNumber: mobile.trim() }
    });

    if (!patient) {
      // Create new patient
      const lastPatient = await prisma.patient.findFirst({ orderBy: { id: 'desc' } });
      const nextIdNum = lastPatient ? lastPatient.id + 1 : 1;
      const newPatientId = `SPL-${nextIdNum.toString().padStart(4, '0')}`;
      
      patient = await prisma.patient.create({
        data: {
          patientId: newPatientId,
          fullName: name.trim(),
          mobileNumber: mobile.trim(),
          gender: gender,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
          address: address ? address.trim() : null
        }
      });
    }

    // Create Appointment
    const appointment = await prisma.appointment.create({
      data: {
        date: new Date(preferredDate),
        time: preferredTime,
        patientId: patient.id,
        notes: notes ? notes.trim() : null,
        status: 'SCHEDULED'
      }
    });

    // Send Fast2SMS Alert to Admin
    try {
      const adminPhone = process.env.ADMIN_PHONE || '6396786939';
      const smsText = `New Appointment!\nName: ${name}\nMob: ${mobile}\nDate: ${preferredDate} ${preferredTime}`;
      
      const fast2smsApiKey = process.env.FAST2SMS_API_KEY || 'MtqzwpXCPos2S9fHrAQi3lIEng8xKBUWdevVhb76YDT5c0yR1uibF4qC3UO5jtM0SHuw86KdzJDQN9Wo';
      
      fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          'authorization': fast2smsApiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          route: 'q',
          message: smsText,
          language: 'english',
          flash: 0,
          numbers: adminPhone
        })
      })
      .then(r => r.json())
      .then(data => console.log('Fast2SMS Response:', data))
      .catch(err => console.error('Fast2SMS Fetch Error:', err));
    } catch (smsErr) {
      console.error('Failed to send SMS alert:', smsErr);
    }

    res.status(201).json({ message: 'Appointment booked successfully', appointment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// Dashboard stats
const { verifyToken } = require('./src/middlewares/auth');

app.get('/api/dashboard/stats', verifyToken, async (req, res) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    if (req.userType === 'PATIENT') {
      const pending = await prisma.report.count({ where: { patientId: req.userId, status: 'PENDING' } });
      const completed = await prisma.report.count({ where: { patientId: req.userId, status: 'COMPLETED' } });
      const invoices = await prisma.invoice.findMany({ where: { patientId: req.userId }, select: { finalAmount: true, paymentStatus: true } });
      const totalSpent = invoices.filter(i => i.paymentStatus === 'PAID').reduce((a, i) => a + i.finalAmount, 0);

      return res.json({
        totalPatients: 0, todayPatients: 0,
        pendingReports: pending, completedReports: completed,
        totalRevenue: totalSpent, todayRevenue: 0, monthRevenue: 0,
        topDoctors: [], lowStockCount: 0,
      });
    }

    if (req.userType === 'DOCTOR') {
      const pending = await prisma.report.count({ where: { doctorId: req.userId, status: 'PENDING' } });
      const completed = await prisma.report.count({ where: { doctorId: req.userId, status: 'COMPLETED' } });
      const reports = await prisma.report.findMany({ where: { doctorId: req.userId }, select: { patientId: true } });
      const uniquePatients = new Set(reports.map(r => r.patientId)).size;

      return res.json({
        totalPatients: uniquePatients, todayPatients: 0,
        pendingReports: pending, completedReports: completed,
        totalRevenue: 0, todayRevenue: 0, monthRevenue: 0,
        topDoctors: [], lowStockCount: 0,
      });
    }

    // STAFF / ADMIN Stats
    const [
      totalPatients,
      todayPatients,
      pendingReports,
      completedReports,
      allInvoices,
      todayInvoices,
      monthInvoices,
      topDoctors,
      inventory,
    ] = await Promise.all([
      prisma.patient.count(),
      prisma.patient.count({ where: { createdAt: { gte: todayStart, lt: todayEnd } } }),
      prisma.report.count({ where: { status: 'PENDING' } }),
      prisma.report.count({ where: { status: 'COMPLETED' } }),
      prisma.invoice.findMany({ select: { finalAmount: true, paymentStatus: true } }),
      prisma.invoice.findMany({ where: { createdAt: { gte: todayStart, lt: todayEnd } }, select: { finalAmount: true, paymentStatus: true } }),
      prisma.invoice.findMany({ where: { createdAt: { gte: monthStart } }, select: { finalAmount: true, paymentStatus: true } }),
      prisma.doctor.findMany({
        include: { _count: { select: { reports: true } } },
        orderBy: { reports: { _count: 'desc' } },
        take: 5,
      }),
      prisma.inventory.findMany(),
    ]);

    // Calculate low stock separately
    const lowStockItems = inventory.filter(i => i.currentStock <= i.lowStockAlert);

    const calcRevenue = (invoices) =>
      invoices.filter(i => i.paymentStatus === 'PAID').reduce((a, i) => a + i.finalAmount, 0);

    res.json({
      totalPatients,
      todayPatients,
      pendingReports,
      completedReports,
      totalRevenue: calcRevenue(allInvoices),
      todayRevenue: calcRevenue(todayInvoices),
      monthRevenue: calcRevenue(monthInvoices),
      topDoctors: topDoctors.map(d => ({ name: d.name, count: d._count.reports })),
      lowStockCount: lowStockItems.length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/', (req, res) => {
  res.json({ message: 'Sana Pathology Lab API is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
