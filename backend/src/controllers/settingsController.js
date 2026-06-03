const prisma = require('../prisma');

// GET all settings as key-value object
const getSettings = async (req, res) => {
  try {
    const rows = await prisma.settings.findMany();
    const settings = {};
    rows.forEach(r => { settings[r.key] = r.value; });
    // Return defaults if not set
    const defaults = {
      labName: 'Sana Pathology Lab',
      labAddress: 'Your Lab Address Here',
      labCity: 'City',
      labPhone: '+91 00000 00000',
      labPhone2: '',
      labEmail: 'lab@example.com',
      labGST: '',
      labRegNo: '',
      pathologistName: 'Dr. Pathologist',
      pathologistQual: 'MD Pathology',
      technicianName: 'Lab Technician',
      reportFooter: 'This report is electronically generated.',
      logoUrl: '',
    };
    res.json({ ...defaults, ...settings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE settings (bulk upsert)
const updateSettings = async (req, res) => {
  try {
    const updates = req.body; // { key: value, ... }
    const ops = Object.entries(updates).map(([key, value]) =>
      prisma.settings.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      })
    );
    await prisma.$transaction(ops);
    res.json({ message: 'Settings saved successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getSettings, updateSettings };
