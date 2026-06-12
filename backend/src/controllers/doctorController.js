const prisma = require('../prisma');

const DOCTOR_CREATE_FIELDS = [
  'name', 'qualification', 'specialization', 'mobileNumber', 'email',
  'clinicName', 'address', 'commissionRate'
];

exports.createDoctor = async (req, res) => {
  try {
    const { name, mobileNumber } = req.body;
    if (!name) return res.status(400).json({ message: 'Doctor name is required' });

    const lastDoctor = await prisma.doctor.findFirst({
      orderBy: { id: 'desc' }
    });
    const nextIdNum = lastDoctor ? lastDoctor.id + 1 : 1;
    const doctorId = `DOC-${nextIdNum.toString().padStart(4, '0')}`;

    const whitelisted = {};
    for (const field of DOCTOR_CREATE_FIELDS) {
      if (req.body[field] !== undefined) whitelisted[field] = req.body[field];
    }
    whitelisted.doctorId = doctorId;

    const doctor = await prisma.doctor.create({ data: whitelisted });
    res.status(201).json(doctor);
  } catch (err) {
    console.error('Create doctor error:', err.message);
    res.status(500).json({ message: 'An error occurred while creating the doctor.' });
  }
};

exports.getDoctors = async (req, res) => {
  try {
    const doctors = await prisma.doctor.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(doctors);
  } catch (err) {
    console.error('Get doctors error:', err.message);
    res.status(500).json({ message: 'An error occurred.' });
  }
};

  const getDoctorAnalytics = async (req, res) => {
  try {
    const { month, year } = req.query;
    
    const m = parseInt(month);
    const y = parseInt(year);
    
    if (!m || !y || m < 1 || m > 12) {
      return res.status(400).json({ message: 'Valid month (1-12) and year are required' });
    }

    const startDate = new Date(y, m - 1, 1);
    const endDate = new Date(y, m, 1);

    const doctors = await prisma.doctor.findMany({
      include: {
        reports: {
          where: {
            reportDate: {
              gte: startDate,
              lt: endDate
            }
          },
          include: {
            patient: true,
            invoice: true,
            results: {
              include: {
                test: true
              }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    const analytics = doctors.map(doc => ({
      id: doc.id,
      doctorId: doc.doctorId,
      name: doc.name,
      clinicName: doc.clinicName || 'N/A',
      commissionRate: doc.commissionRate || 0,
      totalSamples: doc.reports.length,
      reports: doc.reports.map(r => {
        // Get unique test names
        const testNames = [...new Set(r.results.map(res => res.test.testName))].join(', ');
        const totalAmount  = r.invoice?.totalAmount || 0;
        const discountAmt  = r.invoice?.discount || 0;
        const discountBy   = r.invoice?.discountBy || null;
        const finalAmount  = r.invoice?.finalAmount || 0;
        return {
          reportNumber: r.reportNumber,
          patientName:  r.patient?.fullName || 'Unknown',
          reportDate:   r.reportDate,
          tests:        testNames,
          totalAmount,
          discountAmount: discountAmt,
          discountBy,
          reportAmount: finalAmount
        };
      })
    }));

    res.status(200).json(analytics);
  } catch (err) {
    console.error('Doctor analytics error:', err.message);
    res.status(500).json({ message: 'An error occurred fetching analytics.' });
  }
};
exports.getDoctorAnalytics = getDoctorAnalytics;

exports.getDoctorById = async (req, res) => {
  try {
    const doctor = await prisma.doctor.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        reports: true,
        appointments: true
      }
    });
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    res.status(200).json(doctor);
  } catch (err) {
    console.error('Get doctor error:', err.message);
    res.status(500).json({ message: 'An error occurred.' });
  }
};

exports.updateDoctor = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid doctor ID' });

    const whitelisted = {};
    for (const field of DOCTOR_CREATE_FIELDS) {
      if (req.body[field] !== undefined) whitelisted[field] = req.body[field];
    }

    const doctor = await prisma.doctor.update({
      where: { id },
      data: whitelisted
    });
    res.status(200).json(doctor);
  } catch (err) {
    console.error('Update doctor error:', err.message);
    res.status(500).json({ message: 'An error occurred while updating the doctor.' });
  }
};

exports.deleteDoctor = async (req, res) => {
  try {
    // Removed role check to allow deletion by any staff member
    const doctorId = parseInt(req.params.id);

    // Unlink the doctor from any existing reports to prevent foreign key errors
    await prisma.report.updateMany({
      where: { doctorId },
      data: { doctorId: null }
    });

    // Unlink the doctor from any existing appointments
    await prisma.appointment.updateMany({
      where: { doctorId },
      data: { doctorId: null }
    });

    await prisma.doctor.delete({ where: { id: doctorId } });
    res.status(200).json({ message: 'Doctor deleted successfully' });
  } catch (err) {
    console.error('Delete Doctor Error:', err);
    res.status(500).json({ message: 'An error occurred while deleting the doctor.' });
  }
};
