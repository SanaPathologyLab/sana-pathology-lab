const prisma = require('../prisma');

const getAppointments = async (req, res) => {
  try {
    let where = {};
    if (req.userType === 'PATIENT') {
      where.patientId = req.userId;
    } else if (req.userType === 'DOCTOR') {
      where.doctorId = req.userId;
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: { patient: true, doctor: true, assignedTo: true },
      orderBy: { date: 'desc' },
    });
    res.json(appointments);
  } catch (err) {
    console.error('Get appointments error:', err.message);
    res.status(500).json({ message: 'An error occurred.' });
  }
};

const createAppointment = async (req, res) => {
  try {
    const { date, time, patientId, doctorId, notes, type, address, assignedToId } = req.body;
    const appointment = await prisma.appointment.create({
      data: {
        date: new Date(date),
        time,
        patientId: parseInt(patientId),
        doctorId: doctorId ? parseInt(doctorId) : null,
        notes,
        type: type || 'LAB_VISIT',
        address: address || null,
        assignedToId: assignedToId ? parseInt(assignedToId) : null,
        status: 'SCHEDULED',
      },
      include: { patient: true, doctor: true, assignedTo: true },
    });
    res.json(appointment);
  } catch (err) {
    console.error('Create appointment error:', err.message);
    res.status(500).json({ message: 'An error occurred.' });
  }
};

const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, time, patientId, doctorId, notes, type, address, assignedToId, status, transactionId, paymentStatus } = req.body;
    const appointment = await prisma.appointment.update({
      where: { id: parseInt(id) },
      data: {
        date: date ? new Date(date) : undefined,
        time,
        patientId: patientId ? parseInt(patientId) : undefined,
        doctorId: doctorId ? parseInt(doctorId) : null,
        notes,
        type,
        address,
        assignedToId: assignedToId !== undefined ? (assignedToId ? parseInt(assignedToId) : null) : undefined,
        status,
        transactionId,
        paymentStatus,
      },
      include: { patient: true, doctor: true, assignedTo: true },
    });
    res.json(appointment);
  } catch (err) {
    console.error('Update appointment error:', err.message);
    res.status(500).json({ message: 'An error occurred.' });
  }
};

const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.appointment.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Appointment deleted' });
  } catch (err) {
    console.error('Delete appointment error:', err.message);
    res.status(500).json({ message: 'An error occurred.' });
  }
};

module.exports = { getAppointments, createAppointment, updateAppointment, deleteAppointment };
