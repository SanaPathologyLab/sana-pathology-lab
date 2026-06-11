const prisma = require('../prisma');

exports.createInvoice = async (req, res) => {
  try {
    const { patientId, reportId, tests, discount, gst, paymentMethod } = req.body;
    
    // Calculate totals
    let totalAmount = 0;
    for (const t of tests) {
      const testInfo = await prisma.test.findUnique({ where: { id: t.id } });
      if (testInfo) totalAmount += testInfo.price;
    }
    
    const finalAmount = totalAmount - (discount || 0) + (gst || 0);

    // Generate Invoice Number
    const lastInvoice = await prisma.invoice.findFirst({
      orderBy: { id: 'desc' }
    });
    const nextIdNum = lastInvoice ? lastInvoice.id + 1 : 1;
    const invoiceNumber = `INV-${nextIdNum.toString().padStart(6, '0')}`;

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        patientId,
        reportId,
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
    res.status(500).json({ message: err.message });
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
    res.status(500).json({ message: err.message });
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
    res.status(500).json({ message: err.message });
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
    res.status(500).json({ message: err.message });
  }
};

