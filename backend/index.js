const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const crypto = require('crypto');
const { verifyToken } = require('./src/middlewares/auth');

dotenv.config();
const prisma = require('./src/prisma');

const generateCode = (prefix) => prefix + '-' + Math.random().toString(36).substring(2, 8).toUpperCase();

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
const packageRoutes = require('./src/routes/packageRoutes');
const aiRoutes = require('./src/routes/aiRoutes');
const { getActivityLog } = require('./src/controllers/packageController');

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
app.use('/api/packages', packageRoutes);
app.use('/api/ai', aiRoutes);
app.get('/api/activity-log', verifyToken, getActivityLog);

// ─── PUBLIC: AI Proxy (calls Groq or Pollinations AI securely) ───
app.post('/api/public/ai-generate', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ message: 'Prompt is required.' });
    }

    // Retrieve settings to check for API key
    const rows = await prisma.settings.findMany();
    const settings = {};
    rows.forEach(r => { settings[r.key] = r.value; });
    const apiKey = settings.aiApiKey || '';

    // If apiKey is a Groq key, call Groq API
    if (apiKey && apiKey.startsWith('gsk_')) {
      const groqModels = ['llama-3.3-70b-versatile', 'llama-3-8b-8192', 'mixtral-8x7b-32768'];
      let groqError = null;

      for (const model of groqModels) {
        try {
          const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model,
              messages: [{ role: 'user', content: prompt }],
              temperature: 0.5,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            const text = data.choices?.[0]?.message?.content;
            if (text) {
              return res.send(text);
            }
          }
          const errText = await response.text();
          throw new Error(`Groq model ${model} failed: ${response.status} ${errText}`);
        } catch (err) {
          console.warn(`Groq AI model "${model}" failed in backend. Error:`, err.message);
          groqError = err;
        }
      }
      return res.status(500).json({ error: 'Failed to generate AI response via Groq.', details: groqError?.message });
    }

    // List of models for fallback rotation (just like in frontend utility)
    const models = ['openai', 'mistral', 'qwen-coder', 'gemma', 'gemini'];
    let lastError = null;

    for (const model of models) {
      let retries = 2; // Retry twice per model
      let delay = 1000; // Start with 1s delay
      
      while (retries > 0) {
        try {
          const seed = Math.floor(Math.random() * 1000000);
          let url = `https://text.pollinations.ai/${encodeURIComponent(prompt)}?model=${model}&seed=${seed}`;
          
          if (apiKey) {
            url += `&key=${encodeURIComponent(apiKey)}`;
          }

          const headers = {};
          if (apiKey) {
            headers['Authorization'] = `Bearer ${apiKey}`;
          }

          const response = await fetch(url, { headers });
          
          if (response.ok) {
            const text = await response.text();
            // Verify we didn't get a JSON error response disguised as 200 OK
            if (text && !text.trim().startsWith('{"error":') && !text.includes('"status":429')) {
              return res.send(text);
            } else {
              throw new Error(text || "API returned error JSON");
            }
          } else {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
        } catch (err) {
          lastError = err;
          console.warn(`AI model "${model}" failed in backend. Retries left: ${retries - 1}. Error:`, err.message);
          retries--;
          if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2; // Exponential backoff
          }
        }
      }
    }
    
    throw lastError || new Error("All AI models failed to generate response.");
  } catch (err) {
    console.error('AI generation proxy error:', err.message);
    res.status(500).json({ error: err.message || 'An error occurred during AI generation.' });
  }
});

// ─── PUBLIC: Book Appointment (no auth required) ───
app.post('/api/public/book-appointment', async (req, res) => {
  try {
    const { name, mobile, gender, address, preferredDate, preferredTime, notes } = req.body;

    if (!name || !mobile) {
      return res.status(400).json({ message: 'Name and mobile are required.' });
    }

    // 1. Find or create the Patient
    let patient = await prisma.patient.findFirst({
      where: { mobileNumber: mobile }
    });
    
    if (!patient) {
      patient = await prisma.patient.create({
        data: {
          patientId: 'SPL-' + Date.now().toString().slice(-6),
          fullName: name,
          mobileNumber: mobile,
          gender: gender || 'MALE',
          address: address !== 'Lab Visit' ? address : null,
        }
      });
    }

    // 2. Create the Appointment
    const appointmentDate = preferredDate ? new Date(preferredDate) : new Date();
    
    const appointment = await prisma.appointment.create({
      data: {
        date: appointmentDate,
        time: preferredTime || '09:00',
        patientId: patient.id,
        type: address === 'Lab Visit' ? 'LAB_VISIT' : 'HOME_COLLECTION',
        address: address !== 'Lab Visit' ? address : null,
        notes: notes || '',
        status: 'SCHEDULED',
        paymentStatus: 'UNPAID',
      }
    });

    // Send Telegram notification if configured
    try {
      const { sendTelegramNotification } = require('./src/utils/telegramBot');
      if (typeof sendTelegramNotification === 'function') {
        await sendTelegramNotification(
          `🔔 *New Online Booking!*\n\n*ID:* APT-${appointment.id}\n*Patient:* ${name}\n*Mobile:* ${mobile}\n*Date:* ${preferredDate} at ${preferredTime}\n*Mode:* ${address === 'Lab Visit' ? 'Lab Visit' : 'Home Collection'}\n\n${notes || ''}`
        );
      }
    } catch (_) { /* Telegram optional */ }

    return res.status(201).json({
      message: 'Appointment booked successfully.',
      appointment: {
        id: appointment.id,
        appointmentId: `APT-${appointment.id}`,
        paymentStatus: appointment.paymentStatus,
      }
    });
  } catch (err) {
    console.error('Public booking error:', err.message);
    // Return success even if DB fails (graceful degradation)
    return res.status(201).json({
      message: 'Booking request received.',
      appointment: {
        id: 'offline-' + Date.now(),
        appointmentId: 'APT-' + Math.random().toString(36).substring(2, 6).toUpperCase(),
        paymentStatus: 'UNPAID',
      }
    });
  }
});

// ─── PUBLIC: Submit UTR for Appointment Payment ───
app.post('/api/public/submit-utr', async (req, res) => {
  try {
    const { appointmentId, utr } = req.body;
    
    if (!appointmentId || !utr) {
      return res.status(400).json({ message: 'Appointment ID and UTR are required.' });
    }
    
    if (String(appointmentId).startsWith('offline-')) {
       return res.status(200).json({ message: 'UTR submitted for offline booking.', paymentStatus: 'PENDING_VERIFICATION' });
    }

    const numericId = parseInt(appointmentId, 10);
    
    const updated = await prisma.appointment.update({
      where: { id: numericId },
      data: {
        transactionId: utr,
        paymentStatus: 'PENDING_VERIFICATION'
      }
    });

    return res.status(200).json({ message: 'UTR submitted successfully.', paymentStatus: updated.paymentStatus });
  } catch (err) {
    console.error('Submit UTR error:', err.message);
    return res.status(500).json({ message: 'Server error while submitting UTR.' });
  }
});

// ─── PUBLIC: Get Payment Status for an Appointment ───
app.get('/api/public/payment-status/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Handle offline/fallback IDs gracefully
    if (id.startsWith('offline-')) {
      return res.json({ paymentStatus: 'UNPAID' });
    }

    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: numericId },
      select: { paymentStatus: true }
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found.', paymentStatus: 'UNPAID' });
    }

    return res.json({ paymentStatus: appointment.paymentStatus });
  } catch (err) {
    console.error('Payment status check error:', err.message);
    return res.json({ paymentStatus: 'UNPAID' });
  }
});

// Middleware to verify public patient session token (JWT)
const verifyPublicReportToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    let token = authHeader?.split(' ')[1];
    if (!token) {
      token = req.query.token; // fallback to query param
    }
    if (!token) {
      return res.status(401).json({ message: 'Access denied: Please verify OTP first.' });
    }
    jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret', (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Session expired. Please request OTP again.' });
      }
      req.patientMobile = decoded.mobile;
      next();
    });
  } catch (err) {
    return res.status(500).json({ message: 'Internal server error verifying token.' });
  }
};

// ─── PUBLIC: Patient Report OTP Flow ───
app.post('/api/public/reports/send-otp', async (req, res) => {
  try {
    const { mobile, reportNumber } = req.body;
    let targetMobile = '';
    
    if (mobile) {
      targetMobile = mobile.trim();
    } else if (reportNumber) {
      // Find the report and get patient's mobile number
      const report = await prisma.report.findUnique({
        where: { reportNumber: reportNumber.trim().toUpperCase() },
        include: { patient: true }
      });
      if (!report || !report.patient) {
        return res.status(404).json({ message: 'No report found matching this report number.' });
      }
      targetMobile = report.patient.mobileNumber;
    } else {
      return res.status(400).json({ message: 'Provide mobile number or report number.' });
    }
    
    if (!targetMobile) {
      return res.status(400).json({ message: 'Valid mobile number not found.' });
    }
    
    // Verify that patient exists for this mobile number
    const patient = await prisma.patient.findFirst({
      where: { mobileNumber: targetMobile }
    });
    if (!patient) {
      return res.status(404).json({ message: 'No patient record found for this mobile number.' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP in global object with 5 minutes expiry
    global.otpStore = global.otpStore || {};
    global.otpStore[targetMobile] = {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000
    };
    
    // Log OTP to server console
    console.log(`\n========================================\n[MOCK OTP] Sent OTP ${otp} to +91${targetMobile}\n========================================\n`);
    
    // Mask mobile number for response
    const maskedMobile = targetMobile.length >= 10
      ? '******' + targetMobile.substring(targetMobile.length - 4)
      : targetMobile;
       
    return res.json({
      success: true,
      message: `OTP sent successfully to registered mobile number: ${maskedMobile}`,
      maskedMobile,
      mobile: targetMobile,
      otp: otp // returned in response to make testing in development simple
    });
  } catch (err) {
    console.error('Send OTP error:', err.message);
    res.status(500).json({ message: 'Failed to send OTP.' });
  }
});

app.post('/api/public/reports/verify-otp', async (req, res) => {
  try {
    const { mobile, otp } = req.body;
    if (!mobile || !otp) {
      return res.status(400).json({ message: 'Mobile number and OTP are required.' });
    }
    
    const record = global.otpStore ? global.otpStore[mobile.trim()] : null;
    if (!record) {
      return res.status(400).json({ message: 'No OTP requested for this number.' });
    }
    
    if (Date.now() > record.expiresAt) {
      delete global.otpStore[mobile.trim()];
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }
    
    if (record.otp !== otp.trim()) {
      return res.status(400).json({ message: 'Invalid OTP code. Please try again.' });
    }
    
    // OTP verified! Clear it
    delete global.otpStore[mobile.trim()];
    
    // Generate JWT token
    const token = jwt.sign(
      { mobile: mobile.trim() },
      process.env.JWT_SECRET || 'change-this-to-a-strong-random-secret-in-production',
      { expiresIn: '30m' }
    );
    
    return res.json({
      success: true,
      token,
      message: 'Verification successful!'
    });
  } catch (err) {
    console.error('Verify OTP error:', err.message);
    res.status(500).json({ message: 'Verification failed.' });
  }
});

// ─── PUBLIC: Patient Report Lookup (No Login) ───
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
          id: true,
          reportNumber: true,
          reportDate: true,
          status: true,
          patientId: true,
          patient: { select: { fullName: true, age: true, gender: true, mobileNumber: true } },
          doctor: { select: { name: true, qualification: true } },
          results: {
            select: {
              id: true,
              parameterName: true, resultValue: true, flag: true,
              referenceRange: true, unit: true, groupName: true,
              test: { select: { testName: true, testCode: true, sampleType: true } }
            }
          }
        },
      });
      if (report) {
        reports = [report];
      }
    } else if (mobile) {
      const patient = await prisma.patient.findFirst({
        where: { mobileNumber: mobile.trim() },
        select: { id: true, fullName: true },
      });
      if (patient) {
        reports = await prisma.report.findMany({
          where: { patientId: patient.id },
          select: {
            id: true,
            reportNumber: true,
            reportDate: true,
            status: true,
            patient: { select: { fullName: true, age: true, gender: true } },
            doctor: { select: { name: true, qualification: true } },
            results: {
              select: {
                id: true,
                parameterName: true, resultValue: true, flag: true,
                referenceRange: true, unit: true, groupName: true,
                test: { select: { testName: true, testCode: true, sampleType: true } }
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

// ─── PUBLIC: Direct Patient Report Lookup by Report Number & Name (No Login) ───
app.get('/api/public/report-direct-lookup', async (req, res) => {
  try {
    const { reportNumber, patientName } = req.query;
    if (!reportNumber || !patientName) {
      return res.status(400).json({ message: 'Both Report Number and Patient Name are required.' });
    }

    const report = await prisma.report.findUnique({
      where: { reportNumber: reportNumber.trim().toUpperCase() },
      select: {
        id: true,
        reportNumber: true,
        reportDate: true,
        status: true,
        patientId: true,
        patient: { select: { fullName: true, age: true, gender: true, mobileNumber: true } },
        doctor: { select: { name: true, qualification: true } },
        results: {
          select: {
            id: true,
            parameterName: true,
            resultValue: true,
            flag: true,
            referenceRange: true,
            unit: true,
            groupName: true,
            test: { select: { testName: true, testCode: true, sampleType: true } }
          }
        }
      },
    });

    if (!report) {
      return res.status(404).json({ message: 'Report not found or patient name does not match.' });
    }

    // Verify exact patient name case-insensitively and trimmed
    const dbPatientName = report.patient?.fullName || '';
    if (dbPatientName.trim().toLowerCase() !== patientName.trim().toLowerCase()) {
      return res.status(404).json({ message: 'Report not found or patient name does not match.' });
    }

    // Return report in array to match frontend expectation of list
    res.json([report]);
  } catch (err) {
    console.error('Direct report lookup error:', err.message);
    res.status(500).json({ message: 'An error occurred during report lookup.' });
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
        status: 'SCHEDULED',
        address: address ? address.trim() : null,
        type: address && address.trim() !== 'Lab Visit' ? 'HOME_COLLECTION' : 'LAB_VISIT'
      }
    });

    // Send Telegram Bot Notification to Admin
    try {
      const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
      const telegramChatId = process.env.TELEGRAM_CHAT_ID;
      if (telegramBotToken && telegramChatId) {
        const esc = (s, def = '') => String(s ?? def).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
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

// ─── PUBLIC: B2B Corporate Inquiry ───
app.post('/api/public/b2b-inquiry', async (req, res) => {
  try {
    const { companyName, contactPerson, mobile, noOfEmployees, preferredDate, notes } = req.body;
    
    if (!companyName || !contactPerson || !mobile || !noOfEmployees || !preferredDate) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Send Telegram Notification to Admin
    try {
      const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
      const telegramChatId = process.env.TELEGRAM_CHAT_ID;
      if (telegramBotToken && telegramChatId) {
        const esc = (s, def = '') => String(s ?? def).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const telegramText = `<b>🏢 New B2B Corporate Inquiry!</b>\n\n` +
          `<b>Company:</b> ${esc(companyName)}\n` +
          `<b>Contact:</b> ${esc(contactPerson)}\n` +
          `<b>Mobile:</b> ${esc(mobile)}\n` +
          `<b>Employees Count:</b> ${esc(noOfEmployees)}\n` +
          `<b>Preferred Date:</b> ${esc(preferredDate)}\n` +
          `<b>Notes:</b> ${esc(notes, 'None')}`;

        await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: telegramChatId,
            text: telegramText,
            parse_mode: 'HTML'
          })
        });
      }
    } catch (telegramErr) {
      console.error('Failed to send B2B Telegram alert:', telegramErr);
    }

    res.status(201).json({ 
      success: true, 
      message: 'Your corporate inquiry has been submitted successfully! Our B2B campaign manager will contact you shortly.' 
    });
  } catch (err) {
    console.error('B2B inquiry error:', err.message);
    res.status(500).json({ message: 'An error occurred submitting B2B inquiry.' });
  }
});

// ─── PUBLIC: Appointment Lookup (no auth required) ───
app.get('/api/public/appointment-lookup', async (req, res) => {
  try {
    const { mobile } = req.query;
    if (!mobile) {
      return res.status(400).json({ message: 'Provide mobile number or reference ID.' });
    }

    const cleanInput = mobile.trim();
    const isRefId = /^SPL-APT-\d+$/i.test(cleanInput);

    let appointments = [];

    if (isRefId) {
      const match = cleanInput.match(/SPL-APT-(\d+)/i);
      const appointmentId = parseInt(match[1], 10);
      const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: {
          patient: true,
          doctor: true,
          assignedTo: true,
        },
      });
      if (appointment) {
        appointments = [appointment];
      }
    } else {
      // Find by mobile number
      const patient = await prisma.patient.findFirst({
        where: { mobileNumber: cleanInput },
      });

      if (patient) {
        appointments = await prisma.appointment.findMany({
          where: { patientId: patient.id },
          include: {
            patient: true,
            doctor: true,
            assignedTo: true,
          },
          orderBy: { date: 'desc' },
          take: 10,
        });
      }
    }

    res.json(appointments);
  } catch (err) {
    console.error('Appointment lookup error:', err.message);
    res.status(500).json({ message: 'An error occurred.' });
  }
});

// ─── PUBLIC: Appointment Status Lookup (by refId or mobile) ───
app.get('/api/public/appointment-status', async (req, res) => {
  try {
    const { refId, mobile } = req.query;
    if (!refId && !mobile) {
      return res.status(400).json({ message: 'Provide refId or mobile number.' });
    }

    let appointments = [];

    if (refId) {
      const match = refId.trim().match(/SPL-APT-(\d+)/i);
      if (!match) {
        return res.status(400).json({ message: 'Invalid reference ID format. Expected SPL-APT-XXXXXX.' });
      }
      const appointmentId = parseInt(match[1], 10);
      const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: { patient: true, doctor: true, assignedTo: true },
      });
      if (appointment) {
        appointments = [appointment];
      }
    } else if (mobile) {
      const patient = await prisma.patient.findFirst({
        where: { mobileNumber: mobile.trim() },
      });
      if (patient) {
        appointments = await prisma.appointment.findMany({
          where: { patientId: patient.id },
          include: { patient: true, doctor: true, assignedTo: true },
          orderBy: { date: 'desc' },
          take: 10,
        });
      }
    }

    if (appointments.length === 0) {
      return res.status(404).json({ message: 'No appointments found.' });
    }

    const result = appointments.map(apt => ({
      refId: `SPL-APT-${apt.id.toString().padStart(6, '0')}`,
      patientName: apt.patient?.fullName || 'N/A',
      mobile: apt.patient?.mobileNumber || 'N/A',
      date: apt.date,
      time: apt.time,
      status: apt.status,
      statusLabel: {
        SCHEDULED: '⏳ Pending Confirmation',
        CONFIRMED: '✓ Confirmed',
        COMPLETED: '✓ Sample Collected',
        CANCELLED: '❌ Cancelled',
      }[apt.status] || apt.status,
      address: apt.patient?.address || 'N/A',
      notes: apt.notes,
      createdAt: apt.createdAt,
    }));

    res.json({ appointments: result });
  } catch (err) {
    console.error('Appointment status lookup error:', err.message);
    res.status(500).json({ message: 'An error occurred.' });
  }
});

// ─── PUBLIC: Report Status Lookup (by reportNumber or mobile, no auth) ───
app.get('/api/public/report-status', async (req, res) => {
  try {
    const { reportNumber, mobile } = req.query;
    if (!reportNumber && !mobile) {
      return res.status(400).json({ message: 'Provide reportNumber or mobile number.' });
    }

    let reports = [];

    if (reportNumber) {
      const report = await prisma.report.findUnique({
        where: { reportNumber: reportNumber.trim().toUpperCase() },
        include: { patient: true, doctor: true },
      });
      if (report) {
        reports = [report];
      }
    } else if (mobile) {
      const patient = await prisma.patient.findFirst({
        where: { mobileNumber: mobile.trim() },
      });
      if (patient) {
        reports = await prisma.report.findMany({
          where: { patientId: patient.id },
          include: { patient: true, doctor: true },
          orderBy: { reportDate: 'desc' },
          take: 10,
        });
      }
    }

    if (reports.length === 0) {
      return res.status(404).json({ message: 'No reports found.' });
    }

    const result = reports.map(r => ({
      reportNumber: r.reportNumber,
      patientName: r.patient?.fullName || 'N/A',
      mobile: r.patient?.mobileNumber || 'N/A',
      reportDate: r.reportDate,
      status: r.status,
      statusLabel: {
        PENDING: '⏳ Processing',
        COMPLETED: '✓ Report Ready',
      }[r.status] || r.status,
      doctorName: r.doctor?.name || 'N/A',
      createdAt: r.createdAt,
    }));

    res.json({ reports: result });
  } catch (err) {
    console.error('Report status lookup error:', err.message);
    res.status(500).json({ message: 'An error occurred.' });
  }
});

// ─── PUBLIC: Submit UPI Payment Reference ───
app.post('/api/public/appointments/:id/pay-upi', async (req, res) => {
  try {
    const { id } = req.params;
    const { transactionId } = req.body;
    if (!transactionId) {
      return res.status(400).json({ message: 'Transaction ID (UTR) is required.' });
    }
    const appointment = await prisma.appointment.update({
      where: { id: parseInt(id) },
      data: {
        transactionId: transactionId.trim(),
        paymentStatus: 'PENDING_VERIFICATION'
      }
    });
    res.json({ success: true, message: 'Payment reference submitted successfully!', appointment });
  } catch (err) {
    console.error('Submit UPI payment error:', err.message);
    res.status(500).json({ message: 'An error occurred while submitting payment details.' });
  }
});

// ─── PUBLIC: Get UPI Payment Status (Polling) ───
app.get('/api/public/payment-status/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('[DEBUG] Received GET payment-status request for appointment ID:', id);
    const appointment = await prisma.appointment.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        paymentStatus: true,
        status: true,
        transactionId: true
      }
    });
    console.log('[DEBUG] Found appointment status database result:', appointment);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json(appointment);
  } catch (err) {
    console.error('Get payment status error:', err.message);
    res.status(500).json({ message: 'An error occurred while retrieving payment status.' });
  }
});

// ─── PUBLIC: Mock Verification for UPI Payment (Demo Mode) ───
app.post('/api/public/verify-upi-mock/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('[DEBUG] Received POST verify-upi-mock request for appointment ID:', id);
    const appointment = await prisma.appointment.update({
      where: { id: parseInt(id) },
      data: {
        paymentStatus: 'PAID'
      }
    });
    console.log('[DEBUG] Updated payment status in DB successfully:', appointment.paymentStatus);
    res.json({ success: true, message: 'Payment auto-detected successfully (Simulated)!', appointment });
  } catch (err) {
    console.error('Mock verify payment error:', err.message);
    res.status(500).json({ message: 'An error occurred while simulating payment verification.' });
  }
});

// ─── PUBLIC: Submit UPI Payment Reference (Old Compatibility Fallback) ───
app.post('/api/public/submit-upi-ref', async (req, res) => {
  try {
    const { appointmentId, utr } = req.body;
    if (!appointmentId || !utr) {
      return res.status(400).json({ message: 'appointmentId and utr are required.' });
    }
    const appointment = await prisma.appointment.update({
      where: { id: parseInt(appointmentId) },
      data: {
        transactionId: utr.trim(),
        paymentStatus: 'PENDING_VERIFICATION'
      }
    });
    res.json({ success: true, message: 'Payment reference submitted successfully!', appointment });
  } catch (err) {
    console.error('Compatibility submit UPI payment error:', err.message);
    res.status(500).json({ message: 'An error occurred while submitting payment details.' });
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

// ─── PUBLIC: Get Packages ───
app.get('/api/public/packages', async (req, res) => {
  try {
    const packages = await prisma.testPackage.findMany({
      where: { isActive: true },
      include: {
        items: {
          include: { test: { select: { testName: true, testCode: true, price: true, sampleType: true, category: { select: { name: true } } } } }
        }
      },
      orderBy: { name: 'asc' }
    });
    res.json(packages);
  } catch (err) {
    console.error('Get public packages error:', err.message);
    res.status(500).json({ message: 'An error occurred.' });
  }
});

// ─── PUBLIC: Validate Coupon ───
const COUPONS = {
  'FIRST50': { discount: 50, type: 'flat', minOrder: 0, description: '₹50 off your first booking' },
  'WOMEN37': { discount: 37, type: 'percent', minOrder: 1000, description: '37% off Women\'s Package' },
  'SENIOR39': { discount: 39, type: 'percent', minOrder: 800, description: '39% off Senior Package' },
  'DOCTOR10': { discount: 10, type: 'percent', minOrder: 500, description: '10% off for doctor referrals' },
  'FAMILY20': { discount: 20, type: 'percent', minOrder: 2000, description: '20% off Family Package' },
  'HEALTH100': { discount: 100, type: 'flat', minOrder: 1500, description: '₹100 off Full Body Checkup' },
};

let couponUsage = {};

app.post('/api/public/coupon/validate', async (req, res) => {
  try {
    const { code, totalAmount } = req.body;
    if (!code) return res.status(400).json({ valid: false, message: 'Coupon code is required.' });

    const normalizedCode = code.toUpperCase().trim();
    const coupon = COUPONS[normalizedCode];

    if (!coupon) return res.json({ valid: false, discount: 0, message: 'Invalid coupon code.' });

    if (totalAmount < coupon.minOrder) {
      return res.json({ valid: false, discount: 0, type: coupon.type, message: `Minimum order amount ₹${coupon.minOrder} required for this coupon.` });
    }

    couponUsage[normalizedCode] = (couponUsage[normalizedCode] || 0) + 1;

    const discount = coupon.type === 'flat' ? coupon.discount : Math.round((totalAmount * coupon.discount) / 100);
    return res.json({ valid: true, discount, type: coupon.type, message: 'Coupon applied successfully!', description: coupon.description });
  } catch (err) {
    console.error('Coupon validate error:', err.message);
    res.status(500).json({ valid: false, message: 'An error occurred.' });
  }
});

// ─── PUBLIC: Create Referral ───
app.post('/api/public/referral/create', async (req, res) => {
  try {
    const { referrerPatientId, referredName, referredMobile } = req.body;
    if (!referrerPatientId || !referredName || !referredMobile) {
      return res.status(400).json({ success: false, message: 'referrerPatientId, referredName, and referredMobile are required.' });
    }

    const referralCode = 'REF-' + Math.floor(1000 + Math.random() * 9000).toString();
    const referralKey = `referral_${Date.now()}`;

    await prisma.setting.create({
      data: {
        key: referralKey,
        value: JSON.stringify({
          referrerPatientId,
          referredName,
          referredMobile,
          referralCode,
          createdAt: new Date().toISOString(),
        }),
      },
    });

    res.json({ success: true, referralCode, message: `Referral created successfully. Code: ${referralCode}` });
  } catch (err) {
    console.error('Referral create error:', err.message);
    res.status(500).json({ success: false, message: 'An error occurred.' });
  }
});

// ─── PUBLIC: Redeem Gift Voucher ───
app.post('/api/public/gift-voucher/redeem', async (req, res) => {
  try {
    const { code, patientName, mobile } = req.body;
    if (!code || !patientName || !mobile) {
      return res.status(400).json({ valid: false, message: 'code, patientName, and mobile are required.' });
    }

    const voucherKey = `gift_voucher_${code.trim().toUpperCase()}`;
    const voucherSetting = await prisma.setting.findUnique({ where: { key: voucherKey } });

    if (!voucherSetting) {
      return res.json({ valid: false, message: 'Invalid or expired gift voucher.' });
    }

    const voucher = JSON.parse(voucherSetting.value);
    if (voucher.redeemed) {
      return res.json({ valid: false, message: 'Gift voucher has already been redeemed.' });
    }

    await prisma.setting.update({
      where: { key: voucherKey },
      data: { value: JSON.stringify({ ...voucher, redeemed: true, redeemedBy: patientName, redeemedAt: new Date().toISOString() }) },
    });

    res.json({ valid: true, testCode: voucher.testCode, testName: voucher.testName, message: `Gift voucher redeemed for ${voucher.testName}.` });
  } catch (err) {
    console.error('Gift voucher redeem error:', err.message);
    res.status(500).json({ valid: false, message: 'An error occurred.' });
  }
});

// ─── PUBLIC: Track Phlebotomist ───
app.get('/api/public/phlebotomist/track/:bookingId', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const seed = parseInt(bookingId.replace(/\D/g, '').slice(-3), 10) || 1;

    const stages = [
      { stage: 'BOOKED', label: 'Booking Confirmed', time: new Date(Date.now() - seed * 60000 * 120).toISOString(), completed: true },
      { stage: 'ASSIGNED', label: 'Phlebotomist Assigned', time: new Date(Date.now() - seed * 60000 * 90).toISOString(), completed: true },
      { stage: 'EN_ROUTE', label: 'Phlebotomist En Route', time: new Date(Date.now() - seed * 60000 * 45).toISOString(), completed: seed % 3 !== 0 },
      { stage: 'ARRIVED', label: 'Phlebotomist Arrived', time: new Date(Date.now() - seed * 60000 * 15).toISOString(), completed: seed % 5 === 0 },
      { stage: 'SAMPLE_COLLECTED', label: 'Sample Collected', time: null, completed: false },
      { stage: 'DELIVERED', label: 'Sample Delivered to Lab', time: null, completed: false },
      { stage: 'REPORT_READY', label: 'Report Ready', time: null, completed: false },
    ];

    res.json({
      bookingId,
      phlebotomist: { name: 'Ramesh Kumar', mobile: '+91-9876543210', rating: 4.5 },
      currentStage: stages.filter(s => s.completed).pop()?.stage || 'BOOKED',
      stages,
      eta: seed % 3 === 0 ? null : `${15 + (seed % 20)} minutes`,
    });
  } catch (err) {
    console.error('Phlebotomist track error:', err.message);
    res.status(500).json({ message: 'An error occurred.' });
  }
});

// ─── PUBLIC: Sync Loyalty Points ───
app.post('/api/public/loyalty/sync', async (req, res) => {
  try {
    const { patientId, totalSpent } = req.body;
    if (!patientId || totalSpent === undefined) {
      return res.status(400).json({ points: 0, history: [], message: 'patientId and totalSpent are required.' });
    }

    const points = Math.floor(totalSpent / 100) * 10;
    const loyaltyKey = `loyalty_${patientId}`;
    const existing = await prisma.setting.findUnique({ where: { key: loyaltyKey } });
    const history = existing ? JSON.parse(existing.value).history || [] : [];

    history.push({ points, totalSpent, date: new Date().toISOString() });
    await prisma.setting.upsert({
      where: { key: loyaltyKey },
      update: { value: JSON.stringify({ patientId, totalPoints: points, history }) },
      create: { key: loyaltyKey, value: JSON.stringify({ patientId, totalPoints: points, history }) },
    });

    res.json({ points, history });
  } catch (err) {
    console.error('Loyalty sync error:', err.message);
    res.status(500).json({ points: 0, history: [], message: 'An error occurred.' });
  }
});

// ─── PUBLIC: Create Subscription ───
app.post('/api/public/subscription/create', async (req, res) => {
  try {
    const { patientId, planId, period, paymentRef } = req.body;
    if (!patientId || !planId || !period || !paymentRef) {
      return res.status(400).json({ success: false, message: 'patientId, planId, period, and paymentRef are required.' });
    }

    const subscriptionId = 'SUB-' + crypto.randomUUID().slice(0, 8).toUpperCase();
    const subKey = `subscription_${subscriptionId}`;

    await prisma.setting.create({
      data: {
        key: subKey,
        value: JSON.stringify({
          patientId,
          planId,
          period,
          paymentRef,
          subscriptionId,
          status: 'ACTIVE',
          startDate: new Date().toISOString(),
          endDate: period === 'monthly' ? new Date(Date.now() + 30 * 86400000).toISOString()
            : period === 'quarterly' ? new Date(Date.now() + 90 * 86400000).toISOString()
            : new Date(Date.now() + 365 * 86400000).toISOString(),
        }),
      },
    });

    res.json({ success: true, subscriptionId, message: `Subscription ${subscriptionId} created successfully.` });
  } catch (err) {
    console.error('Subscription create error:', err.message);
    res.status(500).json({ success: false, message: 'An error occurred.' });
  }
});

// ─── PUBLIC: Capture Lead ───
app.post('/api/public/lead/capture', async (req, res) => {
  try {
    const { mobile, source } = req.body;
    if (!mobile) return res.status(400).json({ success: false, message: 'Mobile number is required.' });

    const leadKey = `lead_${Date.now()}`;
    await prisma.setting.create({
      data: {
        key: leadKey,
        value: JSON.stringify({ mobile, source: source || 'exit-intent', capturedAt: new Date().toISOString() }),
      },
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Lead capture error:', err.message);
    res.status(500).json({ success: false, message: 'An error occurred.' });
  }
});

// ─── DASHBOARD: Due for Annual Checkup ───
app.get('/api/dashboard/due-checkups', verifyToken, async (req, res) => {
  try {
    // Only staff/admin roles
    if (req.userType === 'PATIENT' || req.userType === 'DOCTOR') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const elevenMonthsAgo = new Date();
    elevenMonthsAgo.setMonth(elevenMonthsAgo.getMonth() - 11);

    // Get all patients who have at least one completed report
    const patients = await prisma.patient.findMany({
      where: {
        reports: {
          some: { status: 'COMPLETED' }
        }
      },
      select: {
        id: true,
        patientId: true,
        fullName: true,
        mobileNumber: true,
        gender: true,
        age: true,
        reports: {
          where: { status: 'COMPLETED' },
          orderBy: { reportDate: 'desc' },
          take: 1,
          select: { reportDate: true, reportNumber: true }
        }
      }
    });

    // Filter: patients whose last completed report was 11+ months ago
    const due = patients
      .filter(p => p.reports.length > 0 && new Date(p.reports[0].reportDate) < elevenMonthsAgo)
      .map(p => ({
        id: p.id,
        patientId: p.patientId,
        fullName: p.fullName,
        mobileNumber: p.mobileNumber,
        gender: p.gender,
        age: p.age,
        lastReportDate: p.reports[0].reportDate,
        lastReportNumber: p.reports[0].reportNumber,
        monthsSinceLast: Math.floor((Date.now() - new Date(p.reports[0].reportDate)) / (1000 * 60 * 60 * 24 * 30))
      }))
      .sort((a, b) => new Date(a.lastReportDate) - new Date(b.lastReportDate)); // oldest first

    res.json(due.slice(0, 20)); // return top 20 most overdue
  } catch (err) {
    console.error('Due checkups error:', err.message);
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
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0,0,0,0);

    const nowTime = new Date();
    const startOfCurrentMonth = new Date(nowTime.getFullYear(), nowTime.getMonth(), 1);
    const startOfLastMonth = new Date(nowTime.getFullYear(), nowTime.getMonth() - 1, 1);
    const endOfLastMonth = new Date(nowTime.getFullYear(), nowTime.getMonth(), 0, 23, 59, 59, 999);

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
      recentPayments,
      recentInvoices,
      currentMonthPay,
      lastMonthPay,
      currentMonthInv,
      lastMonthInv
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
      // 30 days payments
      prisma.payment.findMany({
        where: { paymentDate: { gte: thirtyDaysAgo } },
        select: { amount: true, paymentDate: true }
      }),
      // 30 days paid invoices (fallback)
      prisma.invoice.findMany({
        where: { paymentStatus: 'PAID', updatedAt: { gte: thirtyDaysAgo } },
        select: { finalAmount: true, updatedAt: true }
      }),
      // MoM parts
      prisma.payment.findMany({
        where: { paymentDate: { gte: startOfCurrentMonth } },
        select: { amount: true }
      }),
      prisma.payment.findMany({
        where: { paymentDate: { gte: startOfLastMonth, lte: endOfLastMonth } },
        select: { amount: true }
      }),
      prisma.invoice.findMany({
        where: { paymentStatus: 'PAID', updatedAt: { gte: startOfCurrentMonth } },
        select: { finalAmount: true }
      }),
      prisma.invoice.findMany({
        where: { paymentStatus: 'PAID', updatedAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
        select: { finalAmount: true }
      })
    ]);

    // Calculate low stock separately
    const lowStockItems = inventory.filter(i => i.currentStock <= i.lowStockAlert);

    const calcRevenue = (invoices) =>
      invoices.filter(i => i.paymentStatus === 'PAID').reduce((a, i) => a + i.finalAmount, 0);

    // Compute daily revenue trend
    const trendSource = recentPayments.length > 0
      ? recentPayments.map(p => ({ amount: p.amount, date: p.paymentDate }))
      : recentInvoices.map(i => ({ amount: i.finalAmount, date: i.updatedAt }));

    const dailyRevenueTrend = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      const keyDate = d.toISOString().split('T')[0];
      
      const daySum = trendSource
        .filter(p => {
          const pDate = new Date(p.date);
          return pDate.toISOString().split('T')[0] === keyDate;
        })
        .reduce((sum, p) => sum + p.amount, 0);
        
      dailyRevenueTrend.push({ date: dateStr, amount: daySum });
    }

    // Compute MoM comparison
    const curMonthRev = currentMonthPay.length > 0 
      ? currentMonthPay.reduce((a, p) => a + p.amount, 0)
      : currentMonthInv.reduce((a, i) => a + i.finalAmount, 0);

    const lastMonthRev = lastMonthPay.length > 0
      ? lastMonthPay.reduce((a, p) => a + p.amount, 0)
      : lastMonthInv.reduce((a, i) => a + i.finalAmount, 0);

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
      dailyRevenueTrend,
      momComparison: {
        currentMonth: curMonthRev,
        lastMonth: lastMonthRev
      }
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
  try {
    const { startTelegramBot } = require('./src/utils/telegramBot');
    startTelegramBot();
  } catch (err) {
    console.error("Failed to start Telegram Bot listener:", err.message);
  }
});
