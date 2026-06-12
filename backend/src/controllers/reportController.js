const prisma = require('../prisma');

const generateReportNumber = async () => {
  const last = await prisma.report.findFirst({ orderBy: { id: 'desc' } });
  const nextId = last ? last.id + 1 : 1;
  return `RPT-${nextId.toString().padStart(6, '0')}`;
};

exports.createReport = async (req, res) => {
  try {
    const { patientId, doctorId, results } = req.body;

    if (!patientId || !results || !Array.isArray(results) || results.length === 0) {
      return res.status(400).json({ message: 'Patient ID and test results are required' });
    }

    const reportNumber = await generateReportNumber();

    // Calculate total price based on unique tests
    const uniqueTestIds = [...new Set(results.map(r => r.testId))];
    const tests = await prisma.test.findMany({
      where: { id: { in: uniqueTestIds } }
    });
    const totalAmount = tests.reduce((sum, test) => sum + test.price, 0);

    const report = await prisma.report.create({
      data: {
        reportNumber,
        patientId: parseInt(patientId),
        doctorId: doctorId ? parseInt(doctorId) : null,
        technicianId: req.userRole === 'TECHNICIAN' ? req.userId : null,
        results: {
          create: results.map(r => ({
            testId: r.testId,
            parameterName: r.parameterName || '-',
            resultValue: r.resultValue,
            flag: r.flag || null,
            referenceRange: r.referenceRange || null,
            unit: r.unit || null,
            groupName: r.groupName || null
          }))
        }
      },
      include: { results: true }
    });
    
    // Generate Invoice Number
    const lastInvoice = await prisma.invoice.findFirst({
      orderBy: { id: 'desc' }
    });
    const nextInvNum = lastInvoice ? lastInvoice.id + 1 : 1;
    const invoiceNumber = `INV-${nextInvNum.toString().padStart(6, '0')}`;

    // Create Invoice
    await prisma.invoice.create({
      data: {
        invoiceNumber,
        patientId,
        reportId: report.id,
        totalAmount,
        finalAmount: totalAmount,
        paymentStatus: 'UNPAID'
      }
    });
    
    res.status(201).json(report);
  } catch (err) {
    console.error('Create report error:', err.message);
    res.status(500).json({ message: 'An error occurred while creating the report.' });
  }
};

exports.getReports = async (req, res) => {
  try {
    let where = {};
    if (req.userType === 'PATIENT') {
      where.patientId = req.userId;
    } else if (req.userType === 'DOCTOR') {
      where.doctorId = req.userId;
    }

    const reports = await prisma.report.findMany({
      where,
      include: { patient: true, doctor: true, technician: true },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(reports);
  } catch (err) {
    console.error('Get reports error:', err.message);
    res.status(500).json({ message: 'An error occurred.' });
  }
};

exports.getReportById = async (req, res) => {
  try {
    const report = await prisma.report.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        patient: true,
        doctor: true,
        technician: true,
        results: { 
          include: { test: { include: { parameters: true } } },
          orderBy: { id: 'asc' }
        }
      }
    });
    if (!report) return res.status(404).json({ message: 'Report not found' });
    
    // RBAC Check
    if (req.userType === 'PATIENT' && report.patientId !== req.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    if (req.userType === 'DOCTOR' && report.doctorId !== req.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.status(200).json(report);
  } catch (err) {
    console.error('Get report error:', err.message);
    res.status(500).json({ message: 'An error occurred.' });
  }
};

exports.updateReport = async (req, res) => {
  try {
    const { status, doctorId, results } = req.body;
    
    const updateData = {};
    if (status !== undefined) updateData.status = status;
    if (doctorId !== undefined) updateData.doctorId = doctorId || null;
    if (req.userRole === 'TECHNICIAN') updateData.technicianId = req.userId;

    const report = await prisma.report.update({
      where: { id: parseInt(req.params.id) },
      data: updateData
    });
    
    // Completely recreate results if provided, to support adding/removing tests
    if (results && Array.isArray(results)) {
      // Delete old results
      await prisma.reportResult.deleteMany({ where: { reportId: report.id } });
      
      // Create new results
      if (results.length > 0) {
        await prisma.reportResult.createMany({
          data: results.map(r => ({
            reportId: report.id,
            testId: r.testId,
            parameterName: r.parameterName || '-',
            resultValue: r.resultValue || '',
            flag: r.flag || null,
            referenceRange: r.referenceRange || null,
            unit: r.unit || null,
            groupName: r.groupName || null
          }))
        });
      }
    }

    res.status(200).json(report);
  } catch (err) {
    console.error('Update report error:', err.message);
    res.status(500).json({ message: 'An error occurred.' });
  }
};

exports.deleteReport = async (req, res) => {
  try {
    const reportId = parseInt(req.params.id);
    
    // Find the associated invoice
    const invoice = await prisma.invoice.findUnique({ where: { reportId } });
    if (invoice) {
      // Delete associated payments first
      await prisma.payment.deleteMany({ where: { invoiceId: invoice.id } });
      // Delete the invoice
      await prisma.invoice.delete({ where: { id: invoice.id } });
    }

    // Delete results first (cascade)
    await prisma.reportResult.deleteMany({ where: { reportId } });
    await prisma.report.delete({ where: { id: reportId } });
    res.status(200).json({ message: 'Report deleted successfully' });
  } catch (err) {
    console.error('Delete report error:', err.message);
    res.status(500).json({ message: 'An error occurred.' });
  }
};


