const prisma = require('../prisma');

exports.createPatient = async (req, res) => {
  try {
    const data = req.body;
    // Generate patientId e.g. SPL-0001
    const lastPatient = await prisma.patient.findFirst({
      orderBy: { id: 'desc' }
    });
    const nextIdNum = lastPatient ? lastPatient.id + 1 : 1;
    data.patientId = `SPL-${nextIdNum.toString().padStart(4, '0')}`;
    
    // Parse date if present
    if (data.dateOfBirth) data.dateOfBirth = new Date(data.dateOfBirth);

    const patient = await prisma.patient.create({ data });
    res.status(201).json(patient);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPatients = async (req, res) => {
  try {
    if (req.userType === 'PATIENT') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const patients = await prisma.patient.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(patients);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPatientById = async (req, res) => {
  try {
    const patient = await prisma.patient.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        reports: true,
        appointments: true,
        invoices: true
      }
    });
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    res.status(200).json(patient);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updatePatient = async (req, res) => {
  try {
    const data = req.body;
    if (data.dateOfBirth) data.dateOfBirth = new Date(data.dateOfBirth);

    const patient = await prisma.patient.update({
      where: { id: parseInt(req.params.id) },
      data
    });
    res.status(200).json(patient);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.bulkDeletePatients = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'IDs array is required' });
    }

    await prisma.invoice.deleteMany({ where: { patientId: { in: ids } } });
    await prisma.report.deleteMany({ where: { patientId: { in: ids } } });
    await prisma.appointment.deleteMany({ where: { patientId: { in: ids } } });

    const result = await prisma.patient.deleteMany({ where: { id: { in: ids } } });
    res.status(200).json({ message: `${result.count} patients deleted successfully`, count: result.count });
  } catch (err) {
    console.error('Bulk Delete Patients Error:', err);
    res.status(500).json({ message: err.message || 'Unknown error occurred while bulk deleting patients' });
  }
};

exports.deletePatient = async (req, res) => {
  try {
    const patientId = parseInt(req.params.id);

    // Delete dependent records first to avoid foreign key constraint errors
    // Order matters: Invoice references Report, so delete invoices first
    await prisma.invoice.deleteMany({ where: { patientId } });
    await prisma.report.deleteMany({ where: { patientId } });
    await prisma.appointment.deleteMany({ where: { patientId } });

    await prisma.patient.delete({ where: { id: patientId } });
    res.status(200).json({ message: 'Patient deleted successfully' });
  } catch (err) {
    console.error('Delete Patient Error:', err);
    res.status(500).json({ message: err.message || 'Unknown error occurred while deleting the patient' });
  }
};

exports.getPatientTrends = async (req, res) => {
  try {
    const targetPatientId = parseInt(req.params.id);
    
    // RBAC check: Patient can only view their own trends
    if (req.userType === 'PATIENT' && targetPatientId !== req.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Fetch all completed reports for this patient, including results
    const reports = await prisma.report.findMany({
      where: {
        patientId: targetPatientId,
        status: 'COMPLETED'
      },
      include: {
        results: true
      },
      orderBy: {
        reportDate: 'asc' // old to new
      }
    });

    // Group by parameterName
    const trends = {};

    reports.forEach(report => {
      const dateStr = report.reportDate.toISOString();
      report.results.forEach(resItem => {
        const pName = resItem.parameterName;
        if (!pName || pName === '-') return;

        // Try to parse the result value as a number. Clean any commas/whitespace.
        const cleanVal = resItem.resultValue ? resItem.resultValue.toString().replace(/,/g, '').trim() : '';
        const numVal = parseFloat(cleanVal);

        if (!isNaN(numVal)) {
          if (!trends[pName]) {
            trends[pName] = {
              parameterName: pName,
              unit: resItem.unit || '',
              referenceRange: resItem.referenceRange || '',
              history: []
            };
          }
          trends[pName].history.push({
            reportNumber: report.reportNumber,
            date: dateStr,
            value: numVal,
            rawValue: resItem.resultValue,
            flag: resItem.flag
          });
        }
      });
    });

    res.status(200).json(Object.values(trends));
  } catch (err) {
    console.error('getPatientTrends error:', err);
    res.status(500).json({ message: err.message });
  }
};
