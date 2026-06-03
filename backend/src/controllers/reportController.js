const prisma = require('../prisma');

exports.createReport = async (req, res) => {
  try {
    const { patientId, doctorId, results } = req.body;
    
    // Generate Report Number
    const lastReport = await prisma.report.findFirst({
      orderBy: { id: 'desc' }
    });
    const nextIdNum = lastReport ? lastReport.id + 1 : 1;
    const reportNumber = `RPT-${nextIdNum.toString().padStart(6, '0')}`;

    // Calculate total price based on unique tests
    const uniqueTestIds = [...new Set(results.map(r => r.testId))];
    const tests = await prisma.test.findMany({
      where: { id: { in: uniqueTestIds } }
    });
    const totalAmount = tests.reduce((sum, test) => sum + test.price, 0);

    const report = await prisma.report.create({
      data: {
        reportNumber,
        patientId,
        doctorId,
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
    res.status(500).json({ message: err.message });
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
    res.status(500).json({ message: err.message });
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
        results: { include: { test: true } }
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
    res.status(500).json({ message: err.message });
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
    
    // Update results if provided
    if (results && results.length > 0) {
      for (const resItem of results) {
        if (resItem.id) {
          await prisma.reportResult.update({
            where: { id: resItem.id },
            data: { resultValue: resItem.resultValue, flag: resItem.flag }
          });
        }
      }
    }

    res.status(200).json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteReport = async (req, res) => {
  try {
    // Delete results first (cascade)
    await prisma.reportResult.deleteMany({ where: { reportId: parseInt(req.params.id) } });
    await prisma.report.delete({ where: { id: parseInt(req.params.id) } });
    res.status(200).json({ message: 'Report deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

