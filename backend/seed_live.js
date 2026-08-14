const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log("Cleaning database...");
  await prisma.payment.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.reportResult.deleteMany();
  await prisma.report.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.staff.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.testPackageItem.deleteMany();
  await prisma.testPackage.deleteMany();
  await prisma.testParameter.deleteMany();
  await prisma.test.deleteMany();
  await prisma.testCategory.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.user.deleteMany();

  console.log("Creating admin user...");
  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.create({
    data: {
      email: 'admin@sanapathology.com',
      password: adminPassword,
      name: 'Sana Pathology Admin',
      role: 'ADMIN',
    }
  });

  // Re-create categories
  const categories = ['Hematology', 'Biochemistry', 'Serology', 'Microbiology', 'Histopathology', 'Clinical Pathology', 'Hormone Tests'];
  const catMap = {};
  for (const c of categories) {
    const created = await prisma.testCategory.create({
      data: { name: c }
    });
    catMap[c] = created.id;
  }

  // Create some default tests
  const testsData = [
    { name: '(C.B.C.) COMPLETE BLOOD COUNT', code: 'CBC-01', type: 'Blood', price: 350, cat: 'Hematology',
      params: [
        { parameterName: 'HAEMOGLOBIN', referenceRange: 'M-12-16 F- 11-14', unit: 'GM%', groupName: 'HEMATOLOGICAL EXAMINATION' },
        { parameterName: 'TOTAL LEUCOCYTES COUNT', referenceRange: '4000-11000', unit: '/CU MM', groupName: 'HEMATOLOGICAL EXAMINATION' },
        { parameterName: 'PLATELETS', referenceRange: '150,000-400,000', unit: '/ CU MM', groupName: 'HEMATOLOGICAL EXAMINATION' },
      ]
    },
    { name: 'BLOOD SUGAR FASTING (BSF)', code: 'BSF', type: 'Blood', price: 80, cat: 'Biochemistry',
      params: [
        { parameterName: 'BLOOD GLUCOSE FASTING', referenceRange: '70-100', unit: 'mg/dL', groupName: 'BLOOD SUGAR' }
      ]
    },
    { name: 'KIDNEY FUNCTION TEST (KFT)', code: 'KFT-01', type: 'Blood', price: 750, cat: 'Biochemistry',
      params: [
        { parameterName: 'SERUM UREA', referenceRange: '15-45', unit: 'mg/dL', groupName: 'RENAL FUNCTION' },
        { parameterName: 'SERUM CREATININE', referenceRange: '0.6-1.2', unit: 'mg/dL', groupName: 'RENAL FUNCTION' },
      ]
    },
    { name: 'LIVER FUNCTION TEST (LFT)', code: 'LFT-01', type: 'Blood', price: 750, cat: 'Biochemistry',
      params: [
        { parameterName: 'BILIRUBIN TOTAL', referenceRange: '0.2-1.0', unit: 'mg/dL', groupName: 'LIVER FUNCTION' },
        { parameterName: 'SGOT (AST)', referenceRange: '5-40', unit: 'U/L', groupName: 'LIVER FUNCTION' },
        { parameterName: 'SGPT (ALT)', referenceRange: '5-40', unit: 'U/L', groupName: 'LIVER FUNCTION' },
      ]
    },
    { name: 'WIDAL TEST', code: 'WID-01', type: 'Blood', price: 250, cat: 'Serology',
      params: [
        { parameterName: 'TYPHI O', referenceRange: 'Negative (<1:80)', unit: 'titer', groupName: 'WIDAL REACTION' },
        { parameterName: 'TYPHI H', referenceRange: 'Negative (<1:80)', unit: 'titer', groupName: 'WIDAL REACTION' },
      ]
    },
  ];

  const testMap = {};
  for (const t of testsData) {
    const created = await prisma.test.create({
      data: {
        testName: t.name,
        testCode: t.code,
        sampleType: t.type,
        price: t.price,
        categoryId: catMap[t.cat],
        parameters: {
          create: t.params
        }
      }
    });
    testMap[t.code] = created;
  }

  // Create Test Packages
  const pkg1 = await prisma.testPackage.create({
    data: {
      name: 'SANA PATHOLOGY TOTAL PLUS',
      code: 'PKG-PLUS',
      description: 'Comprehensive health package including CBC, Liver Profile, Kidney Profile, Fasting Blood Sugar.',
      price: 1500,
      items: {
        create: [
          { testId: testMap['CBC-01'].id },
          { testId: testMap['BSF'].id },
          { testId: testMap['KFT-01'].id },
          { testId: testMap['LFT-01'].id }
        ]
      }
    }
  });

  const pkg2 = await prisma.testPackage.create({
    data: {
      name: 'FEVER PROFILE BASIC',
      code: 'PKG-FEVER',
      description: 'Basic diagnostic package for fevers including CBC and Widal test.',
      price: 500,
      items: {
        create: [
          { testId: testMap['CBC-01'].id },
          { testId: testMap['WID-01'].id }
        ]
      }
    }
  });

  // Create Doctors
  const doctorsData = [
    { name: 'Dr. Sameer Desai', spec: 'General Physician', clinic: 'Desai Clinic' },
    { name: 'Dr. Anita Roy', spec: 'Endocrinologist', clinic: 'Roy Care Center' },
    { name: 'Dr. Ramesh Gupta', spec: 'Cardiologist', clinic: 'Heart Institute' },
    { name: 'Dr. Vipin Choudhary', spec: 'General Physician', clinic: 'Choudhary Nursing Home' },
  ];
  const docIds = [];
  let dCount = 1;
  for (const d of doctorsData) {
    const docIdStr = `DOC-${dCount.toString().padStart(4, '0')}`;
    const doc = await prisma.doctor.create({
      data: { doctorId: docIdStr, name: d.name, specialization: d.spec, clinicName: d.clinic, commissionRate: 15 }
    });
    docIds.push(doc.id);
    dCount++;
  }

  // Create Patients, Reports, Invoices, Payments spread over 30 days
  const patientNames = [
    'Rahul Sharma', 'Priya Singh', 'Amit Kumar', 'Sneha Patel', 'Vikram Reddy',
    'Mohd Yusuf', 'Seema Verma', 'Rajesh Yadav', 'Nisha Khan', 'Haneef Ahmed',
    'Chaman Lal', 'Nazish Praveen', 'Arham Ali', 'Sangeeta Devi', 'Nazrul Nisha',
    'Iqra Bano', 'Qasim Rizvi', 'Haris Ansari', 'Farhan Akhtar', 'Sofia Bi'
  ];

  let pCount = 1;
  let rCount = 1;
  let iCount = 1;

  const now = new Date();

  for (let i = 29; i >= 0; i--) {
    const dayDate = new Date();
    dayDate.setDate(now.getDate() - i);
    
    // On some days we have multiple patients, on others we have none.
    const numPatientsThisDay = i === 0 ? 3 : (i % 3 === 0 ? 2 : (i % 5 === 0 ? 1 : 0));
    
    for (let pIndex = 0; pIndex < numPatientsThisDay; pIndex++) {
      const name = patientNames[(i + pIndex * 7) % patientNames.length];
      const pIdStr = `SPL-${pCount.toString().padStart(4, '0')}`;
      
      const pat = await prisma.patient.create({
        data: {
          patientId: pIdStr,
          fullName: name,
          gender: Math.random() > 0.5 ? 'Male' : 'Female',
          age: 20 + Math.floor(Math.random() * 50),
          mobileNumber: `9${Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')}`,
          city: 'Sambhal',
          bloodGroup: ['A+', 'B+', 'O+', 'AB+'][Math.floor(Math.random() * 4)],
          createdAt: dayDate,
          updatedAt: dayDate
        }
      });

      // Create a report
      const rIdStr = `RPT-${rCount.toString().padStart(6, '0')}`;
      const invIdStr = `INV-${iCount.toString().padStart(6, '0')}`;
      const docId = docIds[Math.floor(Math.random() * docIds.length)];
      
      // Select 1 or 2 random tests
      const testCodes = ['CBC-01', 'BSF', 'KFT-01', 'LFT-01', 'WID-01'];
      const chosen1 = testMap[testCodes[Math.floor(Math.random() * testCodes.length)]];
      const chosen2 = testMap[testCodes[(Math.floor(Math.random() * testCodes.length) + 1) % testCodes.length]];
      
      const isCompleted = i !== 0 || Math.random() > 0.5; // Today has some pending
      
      const report = await prisma.report.create({
        data: {
          reportNumber: rIdStr,
          patientId: pat.id,
          doctorId: docId,
          status: isCompleted ? 'COMPLETED' : 'PENDING',
          reportDate: dayDate,
          createdAt: dayDate,
          updatedAt: dayDate,
          results: {
            create: [
              { testId: chosen1.id, parameterName: 'HAEMOGLOBIN', resultValue: isCompleted ? '13.5' : '', flag: 'NORMAL' },
              { testId: chosen2.id, parameterName: 'GLUCOSE', resultValue: isCompleted ? '95' : '', flag: 'NORMAL' }
            ]
          }
        }
      });

      const totalAmount = chosen1.price + chosen2.price;
      
      // Create Invoice
      const invoice = await prisma.invoice.create({
        data: {
          invoiceNumber: invIdStr,
          patientId: pat.id,
          reportId: report.id,
          totalAmount,
          finalAmount: totalAmount,
          paymentStatus: isCompleted ? 'PAID' : 'UNPAID',
          paymentMethod: isCompleted ? 'CASH' : null,
          createdAt: dayDate,
          updatedAt: dayDate
        }
      });

      if (isCompleted) {
        // Create Payment
        await prisma.payment.create({
          data: {
            invoiceId: invoice.id,
            amount: totalAmount,
            paymentMethod: 'CASH',
            paymentDate: dayDate,
            createdAt: dayDate
          }
        });
      }

      rCount++;
      iCount++;
      pCount++;
    }
  }

  console.log("Seeding overdue patients for checkup reminders...");
  const overduePatients = [
    { name: 'Vijay Malhotra', monthsAgo: 12, gender: 'Male', age: 58, mobile: '9812345678' },
    { name: 'Kiran Johar', monthsAgo: 18, gender: 'Female', age: 62, mobile: '9823456789' }
  ];

  for (const op of overduePatients) {
    const oldDate = new Date();
    oldDate.setMonth(oldDate.getMonth() - op.monthsAgo);

    const pIdStr = `SPL-${pCount.toString().padStart(4, '0')}`;
    const pat = await prisma.patient.create({
      data: {
        patientId: pIdStr,
        fullName: op.name,
        gender: op.gender,
        age: op.age,
        mobileNumber: op.mobile,
        city: 'Sambhal',
        createdAt: oldDate,
        updatedAt: oldDate
      }
    });

    const rIdStr = `RPT-${rCount.toString().padStart(6, '0')}`;
    const invIdStr = `INV-${iCount.toString().padStart(6, '0')}`;

    const report = await prisma.report.create({
      data: {
        reportNumber: rIdStr,
        patientId: pat.id,
        doctorId: docIds[0],
        status: 'COMPLETED',
        reportDate: oldDate,
        createdAt: oldDate,
        updatedAt: oldDate,
        results: {
          create: [
            { testId: testMap['CBC-01'].id, parameterName: 'HAEMOGLOBIN', resultValue: '12.0', flag: 'NORMAL' }
          ]
        }
      }
    });

    await prisma.invoice.create({
      data: {
        invoiceNumber: invIdStr,
        patientId: pat.id,
        reportId: report.id,
        totalAmount: 350,
        finalAmount: 350,
        paymentStatus: 'PAID',
        createdAt: oldDate,
        updatedAt: oldDate
      }
    });

    pCount++;
    rCount++;
    iCount++;
  }

  // Create Inventory
  const inventoryItems = [
    { itemName: 'EDTA Vacutainer Tubes (Purple)', category: 'Test Tubes', currentStock: 150, lowStockAlert: 50, supplierName: 'SurgiCare' },
    { itemName: 'Fluoride Vacutainer Tubes (Grey)', category: 'Test Tubes', currentStock: 120, lowStockAlert: 40, supplierName: 'SurgiCare' },
    { itemName: 'Widal Antigen Kit', category: 'Kits', currentStock: 8, lowStockAlert: 10, supplierName: 'MediDiag' }, // Low stock!
    { itemName: 'CBC Reagent Pack', category: 'Reagents', currentStock: 2, lowStockAlert: 3, supplierName: 'Sysmex' }, // Low stock!
    { itemName: 'Urine Culture Plates', category: 'Consumables', currentStock: 80, lowStockAlert: 20, supplierName: 'BioRad' },
  ];

  for (const item of inventoryItems) {
    await prisma.inventory.create({
      data: item
    });
  }

  // Create some Staff
  const staffData = [
    { name: 'Amit Verma', role: 'TECHNICIAN', mobile: '9988112233' },
    { name: 'Pooja Rani', role: 'RECEPTIONIST', mobile: '9988112244' }
  ];
  let sCount = 1;
  for (const s of staffData) {
    await prisma.staff.create({
      data: {
        staffId: `STF-${sCount.toString().padStart(4, '0')}`,
        name: s.name,
        role: s.role,
        mobile: s.mobile,
        isActive: true
      }
    });
    sCount++;
  }

  // Create Appointments
  const appPatients = await prisma.patient.findMany({ take: 5 });
  const appStaff = await prisma.staff.findFirst({ where: { role: 'TECHNICIAN' } });
  
  let appCount = 0;
  for (const pat of appPatients) {
    const appDate = new Date();
    appDate.setDate(now.getDate() - 1 + appCount); // Yesterday, Today, Tomorrow, etc.
    await prisma.appointment.create({
      data: {
        date: appDate,
        time: '10:30 AM',
        patientId: pat.id,
        assignedToId: appStaff?.id,
        type: appCount % 2 === 0 ? 'LAB_VISIT' : 'HOME_COLLECTION',
        address: appCount % 2 === 0 ? null : '123, Street No. 4, Sambhal',
        status: appCount < 2 ? 'COMPLETED' : 'SCHEDULED',
        paymentStatus: appCount < 2 ? 'PAID' : 'UNPAID',
        createdAt: new Date()
      }
    });
    appCount++;
  }

  console.log("Database seeded successfully with beautiful live dashboard data!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
