const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Restoring your original patients from screenshot...");

  // 1. Create Doctors if they don't exist
  const doctors = [
    { name: 'TARIK ALAM (BSc,BEMS)', spec: 'Physician' },
    { name: 'CHAMAN (BNYS)', spec: 'Physician' },
    { name: 'HASEEB (BNYS)', spec: 'Physician' },
    { name: 'RASHID HUSAIN (BSc,BEMS)', spec: 'Physician' }
  ];
  
  const docMap = {};
  for (const d of doctors) {
    let doc = await prisma.doctor.findFirst({ where: { name: d.name } });
    if (!doc) {
      const docIdStr = `DOC-${Math.floor(1000 + Math.random() * 9000)}`;
      doc = await prisma.doctor.create({
        data: { doctorId: docIdStr, name: d.name, specialization: d.spec, isApproved: true }
      });
    }
    docMap[d.name] = doc.id;
  }

  // 2. Original Patients & Reports Data from Screenshot
  const patientsData = [
    { patientId: 'SPL-0203', fullName: 'Mrs.nisha', gender: 'Female', age: 20, reportNumber: 'RPT-000308', doctorName: null },
    { patientId: 'SPL-0202', fullName: 'Mrs.sangeeta', gender: 'Female', age: 22, reportNumber: 'RPT-000307', doctorName: 'TARIK ALAM (BSc,BEMS)' },
    { patientId: 'SPL-0201', fullName: 'Mrs.nazrul nisha', gender: 'Female', age: 20, reportNumber: 'RPT-000306', doctorName: 'CHAMAN (BNYS)' },
    { patientId: 'SPL-0200', fullName: 'Mr haneef', gender: 'Male', age: 75, reportNumber: 'RPT-000305', doctorName: 'HASEEB (BNYS)' },
    { patientId: 'SPL-0199', fullName: 'Miss.iqra', gender: 'Female', age: 15, reportNumber: 'RPT-000304', doctorName: 'HASEEB (BNYS)' },
    { patientId: 'SPL-0198', fullName: 'Mr.qasim', gender: 'Male', age: 17, reportNumber: 'RPT-000303', doctorName: 'HASEEB (BNYS)' },
    { patientId: 'SPL-0197', fullName: 'Mrs.chaman', gender: 'Female', age: 25, reportNumber: 'RPT-000302', doctorName: 'HASEEB (BNYS)' },
    { patientId: 'SPL-0196', fullName: 'Mrs.nazish', gender: 'Female', age: 25, reportNumber: 'RPT-000301', doctorName: 'RASHID HUSAIN (BSc,BEMS)' }
  ];

  // Find a test to attach as a dummy parameter
  let cbcTest = await prisma.test.findFirst({ where: { testCode: 'CBC-01' } });
  if (!cbcTest) {
    cbcTest = await prisma.test.findFirst();
  }
  const testId = cbcTest ? cbcTest.id : 1;

  for (const p of patientsData) {
    // Check if patient already exists
    let pat = await prisma.patient.findUnique({ where: { patientId: p.patientId } });
    if (!pat) {
      pat = await prisma.patient.create({
        data: {
          patientId: p.patientId,
          fullName: p.fullName,
          gender: p.gender,
          age: p.age,
          mobileNumber: '9999999999',
          city: 'Sambhal',
          createdAt: new Date('2026-07-11T14:41:24.000Z')
        }
      });
    }

    const docId = p.doctorName ? docMap[p.doctorName] : null;

    // Check if report already exists
    let report = await prisma.report.findUnique({ where: { reportNumber: p.reportNumber } });
    if (!report) {
      report = await prisma.report.create({
        data: {
          reportNumber: p.reportNumber,
          patientId: pat.id,
          doctorId: docId,
          status: 'COMPLETED',
          reportDate: new Date('2026-07-11T14:41:24.000Z'),
          createdAt: new Date('2026-07-11T14:41:24.000Z'),
          results: {
            create: [
              { testId, parameterName: 'HAEMOGLOBIN', resultValue: '12.0', flag: 'NORMAL' }
            ]
          }
        }
      });

      // Invoice
      const invIdStr = `INV-${Math.floor(100000 + Math.random() * 900000)}`;
      await prisma.invoice.create({
        data: {
          invoiceNumber: invIdStr,
          patientId: pat.id,
          reportId: report.id,
          totalAmount: 350,
          finalAmount: 350,
          paymentStatus: 'PAID',
          createdAt: new Date('2026-07-11T14:41:24.000Z')
        }
      });
    }
  }

  console.log("Restoration complete!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
