const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const { verifyToken } = require('./src/middlewares/auth');

dotenv.config();
const prisma = require('./src/prisma');

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN 
    ? process.env.CORS_ORIGIN.split(',') 
    : ['http://localhost:5173', 'http://localhost:5000', 'http://localhost:4173', 'https://sanapathologylab.github.io'],
  credentials: true,
}));
app.use(express.json());

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: 'Too many login attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

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
// Only returns limited non-sensitive data; full report requires auth
app.get('/api/public/report-lookup', async (req, res) => {
  try {
    const { mobile, reportNumber } = req.query;
    if (!mobile && !reportNumber) {
      return res.status(400).json({ message: 'Provide mobile number or report number.' });
    }

    let reports = [];

    if (reportNumber) {
      const report = await prisma.report.findUnique({
        where: { reportNumber: reportNumber.trim().toUpperCase() },
        select: {
          reportNumber: true,
          reportDate: true,
          status: true,
          patient: { select: { fullName: true, age: true, gender: true } },
          doctor: { select: { name: true, qualification: true } },
          results: {
            select: {
              parameterName: true, resultValue: true, flag: true,
              referenceRange: true, unit: true, groupName: true,
              test: { select: { testName: true, testCode: true } }
            }
          }
        },
      });
      if (report) reports = [report];
    } else if (mobile) {
      const patient = await prisma.patient.findFirst({
        where: { mobileNumber: mobile.trim() },
        select: { id: true, fullName: true },
      });
      if (patient) {
        reports = await prisma.report.findMany({
          where: { patientId: patient.id },
          select: {
            reportNumber: true,
            reportDate: true,
            status: true,
            patient: { select: { fullName: true, age: true, gender: true } },
            doctor: { select: { name: true, qualification: true } },
            results: {
              select: {
                parameterName: true, resultValue: true, flag: true,
                referenceRange: true, unit: true, groupName: true,
                test: { select: { testName: true, testCode: true } }
              }
            }
          },
          orderBy: { reportDate: 'desc' },
          take: 10,
        });
      }
    }

    if (reports.length === 0) {
      return res.status(404).json({ message: 'No reports found. Please check the number and try again.' });
    }

    res.json(reports);
  } catch (err) {
    console.error('Report lookup error:', err.message);
    res.status(500).json({ message: 'An error occurred.' });
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

    // Send Telegram Bot Notification to Admin
    try {
      const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
      const telegramChatId = process.env.TELEGRAM_CHAT_ID;
      if (telegramBotToken && telegramChatId) {
        const esc = (s, def = '') => (s ?? def).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const refId = `SPL-APT-${appointment.id.toString().padStart(6, '0')}`;
        const telegramText = `<b>🔔 New Appointment Request!</b>\n\n` +
          `<b>Ref ID:</b> ${refId}\n` +
          `<b>Name:</b> ${esc(name)}\n` +
          `<b>Mobile:</b> ${esc(mobile)}\n` +
          `<b>Gender:</b> ${esc(gender)}\n` +
          `<b>Date:</b> ${esc(preferredDate)} ${esc(preferredTime)}\n` +
          `<b>Mode:</b> ${address && address !== 'Lab Visit' ? 'Home Collection' : 'Lab Visit'}\n` +
          `<b>Address:</b> ${esc(address, 'N/A')}\n` +
          `<b>Notes:</b> ${esc(notes, 'None')}`;

        const resp = await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: telegramChatId,
            text: telegramText,
            parse_mode: 'HTML'
          })
        });
        const data = await resp.json();
        if (!data.ok) {
          console.error('Telegram API Error:', data.description);
        } else {
          console.log('Telegram Alert Sent successfully!');
        }
      } else {
        console.log('Telegram Credentials not configured in .env. Skipping Telegram notification.');
      }
    } catch (telegramErr) {
      console.error('Failed to send Telegram alert:', telegramErr);
    }

    res.status(201).json({ message: 'Appointment booked successfully', appointment });
  } catch (err) {
    console.error('Book appointment error:', err.message);
    res.status(500).json({ message: 'An error occurred while booking the appointment.' });
  }
});

// ─── PUBLIC: Appointment Lookup (no auth required) ───
app.get('/api/public/appointment-lookup', async (req, res) => {
  try {
    const { mobile } = req.query;
    if (!mobile) {
      return res.status(400).json({ message: 'Provide mobile number.' });
    }

    const patient = await prisma.patient.findFirst({
      where: { mobileNumber: mobile.trim() },
    });

    if (!patient) {
      return res.status(404).json({ message: 'No patient record found for this mobile number.' });
    }

    const appointments = await prisma.appointment.findMany({
      where: { patientId: patient.id },
      include: {
        patient: true,
        doctor: true,
      },
      orderBy: { date: 'desc' },
      take: 10,
    });

    res.json(appointments);
  } catch (err) {
    console.error('Appointment lookup error:', err.message);
    res.status(500).json({ message: 'An error occurred.' });
  }
});

// ─── PUBLIC: Get Tests ───
app.get('/api/public/tests', async (req, res) => {
  try {
    const tests = await prisma.test.findMany({
      select: {
        id: true,
        testCode: true,
        testName: true,
        price: true,
        sampleType: true,
        category: {
          select: { name: true }
        }
      },
      orderBy: { testName: 'asc' }
    });
    res.json(tests);
  } catch (err) {
    console.error('Get public tests error:', err.message);
    res.status(500).json({ message: 'An error occurred.' });
  }
});

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
      const doctor = await prisma.doctor.findUnique({ where: { id: req.userId } });
      const commRate = doctor?.commissionRate || 0;

      const pending = await prisma.report.count({ where: { doctorId: req.userId, status: 'PENDING' } });
      const completed = await prisma.report.count({ where: { doctorId: req.userId, status: 'COMPLETED' } });
      
      const reports = await prisma.report.findMany({ 
        where: { doctorId: req.userId }, 
        include: { invoice: true } 
      });

      const uniquePatients = new Set(reports.map(r => r.patientId)).size;

      // Calculate total commission
      let totalCommission = 0;
      reports.forEach(r => {
        if (r.invoice) {
          const totalAmt = r.invoice.totalAmount || 0;
          const discountAmt = r.invoice.discount || 0;
          const discountBy = r.invoice.discountBy || '';
          
          const grossComm = (totalAmt * commRate) / 100;
          const drBorneDisc = discountBy === 'DOCTOR' ? discountAmt : 0;
          const netComm = Math.max(0, grossComm - drBorneDisc);
          totalCommission += netComm;
        }
      });

      return res.json({
        totalPatients: uniquePatients, todayPatients: 0,
        pendingReports: pending, completedReports: completed,
        totalRevenue: 0, todayRevenue: 0, monthRevenue: 0,
        topDoctors: [], lowStockCount: 0,
        totalCommission: Math.round(totalCommission),
        commissionRate: commRate
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
    console.error('Dashboard stats error:', err.message);
    res.status(500).json({ message: 'An error occurred fetching dashboard data.' });
  }
});

// ─── Auto-seed Widal test if not exists ───
async function seedWidalTest() {
  try {
    const existing = await prisma.test.findFirst({ where: { testCode: 'WIDAL' } });
    if (existing) {
      console.log('Widal test already exists, skipping seed.');
      return;
    }
    let immunoCat = await prisma.testCategory.findFirst({ where: { name: 'Immunology' } });
    if (!immunoCat) {
      immunoCat = await prisma.testCategory.create({ data: { name: 'Immunology' } });
      console.log('Created Immunology category.');
    }
    await prisma.test.create({
      data: {
        testName: 'WIDAL TEST (Rapid Slid Method)',
        testCode: 'WIDAL',
        sampleType: 'BLOOD',
        price: 200,
        categoryId: immunoCat.id,
        summary: 'Widal test is a serological test for detecting antibodies against Salmonella typhi and paratyphi. A titre of 1:80 or more for O antigen and 1:160 or more for H antigen is considered clinically significant.',
        parameters: {
          create: [
            { parameterName: 'S. TYPHI O', referenceRange: '< 1:80', unit: 'Titre', groupName: 'WIDAL TEST' },
            { parameterName: 'S. TYPHI H', referenceRange: '< 1:80', unit: 'Titre', groupName: 'WIDAL TEST' },
            { parameterName: 'S. PARA TYPHI A (H)', referenceRange: '< 1:80', unit: 'Titre', groupName: 'WIDAL TEST' },
            { parameterName: 'S. PARA TYPHI B (H)', referenceRange: '< 1:80', unit: 'Titre', groupName: 'WIDAL TEST' },
          ]
        }
      }
    });
    console.log('Widal test auto-seeded successfully.');
  } catch (err) {
    console.error('Failed to seed Widal test:', err.message);
  }
}

// Serve frontend production build as static files
const path = require('path');
const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(frontendDist));

// Debug endpoint to check database
app.get('/api/debug/tests', verifyToken, async (req, res) => {
  try {
    const tests = await prisma.test.findMany({ include: { parameters: true } });
    res.json({ count: tests.length, tests: tests.map(t => ({ id: t.id, testName: t.testName, testCode: t.testCode })) });
  } catch (err) {
    console.error('Debug tests error:', err.message);
    res.status(500).json({ message: 'An error occurred.' });
  }
});

// SPA fallback - serve index.html for any non-API route
app.use((req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(frontendDist, 'index.html'));
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await seedWidalTest();
});
