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
      include: { patient: true, doctor: true },
      orderBy: { date: 'desc' },
    });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createAppointment = async (req, res) => {
  try {
    const { date, time, patientId, doctorId, notes } = req.body;
    const appointment = await prisma.appointment.create({
      data: {
        date: new Date(date),
        time,
        patientId: parseInt(patientId),
        doctorId: doctorId ? parseInt(doctorId) : null,
        notes,
        status: 'SCHEDULED',
      },
      include: { patient: true, doctor: true },
    });
    res.json(appointment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, time, patientId, doctorId, notes, status } = req.body;
    const appointment = await prisma.appointment.update({
      where: { id: parseInt(id) },
      data: {
        date: date ? new Date(date) : undefined,
        time,
        patientId: patientId ? parseInt(patientId) : undefined,
        doctorId: doctorId ? parseInt(doctorId) : null,
        notes,
        status,
      },
      include: { patient: true, doctor: true },
    });
    res.json(appointment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.appointment.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Appointment deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getAppointments, createAppointment, updateAppointment, deleteAppointment };
