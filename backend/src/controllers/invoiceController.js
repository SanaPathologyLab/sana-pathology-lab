const prisma = require('../prisma');

const generateInvoiceNumber = async () => {
  const last = await prisma.invoice.findFirst({ orderBy: { id: 'desc' } });
  const nextId = last ? last.id + 1 : 1;
  return `INV-${nextId.toString().padStart(6, '0')}`;
};

exports.createInvoice = async (req, res) => {
  try {
    const { patientId, reportId, tests, discount, gst, paymentMethod } = req.body;

    if (!patientId || !tests || !Array.isArray(tests) || tests.length === 0) {
      return res.status(400).json({ message: 'Patient ID and tests are required' });
    }

    // Calculate totals with single query (fix N+1)
    const testIds = tests.map(t => t.id);
    const testRecords = await prisma.test.findMany({
      where: { id: { in: testIds } }
    });
    const totalAmount = testRecords.reduce((sum, t) => sum + t.price, 0);

    const finalAmount = totalAmount - (discount || 0) + (gst || 0);

    const invoiceNumber = await generateInvoiceNumber();

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        patientId: parseInt(patientId),
        reportId: reportId ? parseInt(reportId) : null,
        totalAmount,
        discount: discount || 0,
        gst: gst || 0,
        finalAmount,
        paymentStatus: finalAmount > 0 ? 'UNPAID' : 'PAID',
        paymentMethod
      }
    });

    res.status(201).json(invoice);
  } catch (err) {
    console.error('Create invoice error:', err.message);
    res.status(500).json({ message: 'An error occurred while creating the invoice.' });
  }
};

exports.getInvoices = async (req, res) => {
  try {
    let where = {};
    if (req.userType === 'PATIENT') {
      where.patientId = req.userId;
    } else if (req.userType === 'DOCTOR') {
      where.report = {
        doctorId: req.userId
      };
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: { patient: true, report: true },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(invoices);
  } catch (err) {
    console.error('Get invoices error:', err.message);
    res.status(500).json({ message: 'An error occurred.' });
  }
};

exports.payInvoice = async (req, res) => {
  try {
    const { amount, paymentMethod, transactionId } = req.body;
    
    const invoice = await prisma.invoice.findUnique({ where: { id: parseInt(req.params.id) }, include: { payments: true } });
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    
    const paidAmount = invoice.payments.reduce((acc, p) => acc + p.amount, 0) + amount;
    
    let status = 'PARTIAL';
    if (paidAmount >= invoice.finalAmount) status = 'PAID';

    await prisma.payment.create({
      data: {
        invoiceId: invoice.id,
        amount,
        paymentMethod,
        transactionId
      }
    });

    const updatedInvoice = await prisma.invoice.update({
      where: { id: invoice.id },
      data: { paymentStatus: status }
    });

    res.status(200).json(updatedInvoice);
  } catch (err) {
    console.error('Pay invoice error:', err.message);
    res.status(500).json({ message: 'An error occurred.' });
  }
};

exports.applyDiscount = async (req, res) => {
  try {
    const { discountType, discountValue, discountBy } = req.body;
    // discountType: 'FIXED' | 'PERCENT'
    // discountValue: number
    // discountBy: 'DOCTOR' | 'LAB' | null

    const invoice = await prisma.invoice.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    let discountAmount = 0;
    if (discountType === 'PERCENT') {
      discountAmount = (invoice.totalAmount * discountValue) / 100;
    } else {
      discountAmount = discountValue;
    }

    // Clamp discount to not exceed total amount
    discountAmount = Math.min(discountAmount, invoice.totalAmount);
    const finalAmount = invoice.totalAmount - discountAmount;

    const updated = await prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        discount: discountAmount,
        discountBy: discountAmount > 0 ? (discountBy || null) : null,
        finalAmount,
      },
      include: { patient: true, report: true }
    });

    res.status(200).json(updated);
  } catch (err) {
    console.error('Apply discount error:', err.message);
    res.status(500).json({ message: 'An error occurred.' });
  }
};

exports.updateInvoice = async (req, res) => {
  try {
    if (req.userType !== 'STAFF') {
      return res.status(403).json({ message: 'Access denied: Only staff can modify invoices' });
    }

    const { finalAmount, discount, paymentStatus, paymentMethod } = req.body;
    const updateData = {};
    if (finalAmount !== undefined) updateData.finalAmount = parseFloat(finalAmount);
    if (discount !== undefined) updateData.discount = parseFloat(discount);
    if (paymentStatus !== undefined) updateData.paymentStatus = paymentStatus;
    if (paymentMethod !== undefined) updateData.paymentMethod = paymentMethod;

    const updated = await prisma.invoice.update({
      where: { id: parseInt(req.params.id) },
      data: updateData,
      include: { patient: true, report: true }
    });

    res.status(200).json(updated);
  } catch (err) {
    console.error('Update invoice error:', err.message);
    res.status(500).json({ message: 'An error occurred while updating the invoice.' });
  }
};

exports.deleteInvoice = async (req, res) => {
  try {
    if (req.userType !== 'STAFF') {
      return res.status(403).json({ message: 'Access denied: Only staff can delete invoices' });
    }

    const invoiceId = parseInt(req.params.id);

    // Delete associated payments first
    await prisma.payment.deleteMany({ where: { invoiceId } });

    // Delete the invoice
    await prisma.invoice.delete({ where: { id: invoiceId } });

    res.status(200).json({ message: 'Invoice deleted successfully' });
  } catch (err) {
    console.error('Delete invoice error:', err.message);
    res.status(500).json({ message: 'An error occurred while deleting the invoice.' });
  }
};


