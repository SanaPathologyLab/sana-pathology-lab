const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

const categories = ['Hematology', 'Biochemistry', 'Serology', 'Microbiology', 'Histopathology', 'Clinical Pathology', 'Hormone Tests'];

const tests = [
  { name: 'Complete Blood Count (CBC)', code: 'CBC01', type: 'Blood', ref: 'N/A', unit: '-', price: 350, cat: 'Hematology' },
  { name: 'Hemoglobin (Hb)', code: 'HB01', type: 'Blood', ref: '12-16', unit: 'g/dL', price: 150, cat: 'Hematology' },
  { name: 'Total Leukocyte Count (TLC)', code: 'TLC01', type: 'Blood', ref: '4000-11000', unit: 'cumm', price: 150, cat: 'Hematology' },
  { name: 'Platelet Count', code: 'PLT01', type: 'Blood', ref: '1.5-4.5', unit: 'lakhs/cumm', price: 200, cat: 'Hematology' },
  { name: 'Fasting Blood Sugar (FBS)', code: 'FBS01', type: 'Blood', ref: '70-110', unit: 'mg/dL', price: 100, cat: 'Biochemistry' },
  { name: 'Post Prandial Blood Sugar (PPBS)', code: 'PPBS01', type: 'Blood', ref: '110-140', unit: 'mg/dL', price: 100, cat: 'Biochemistry' },
  { name: 'HbA1c', code: 'HBA1C01', type: 'Blood', ref: '4.5-5.6', unit: '%', price: 500, cat: 'Biochemistry' },
  { name: 'Lipid Profile', code: 'LIP01', type: 'Blood', ref: 'N/A', unit: '-', price: 800, cat: 'Biochemistry' },
  { name: 'Liver Function Test (LFT)', code: 'LFT01', type: 'Blood', ref: 'N/A', unit: '-', price: 750, cat: 'Biochemistry' },
  { name: 'Kidney Function Test (KFT)', code: 'KFT01', type: 'Blood', ref: 'N/A', unit: '-', price: 750, cat: 'Biochemistry' },
  { name: 'Serum Creatinine', code: 'CRE01', type: 'Blood', ref: '0.6-1.2', unit: 'mg/dL', price: 200, cat: 'Biochemistry' },
  { name: 'Widal Test', code: 'WID01', type: 'Blood', ref: 'Negative', unit: '-', price: 250, cat: 'Serology' },
  { name: 'Dengue NS1 Antigen', code: 'DEN01', type: 'Blood', ref: 'Negative', unit: '-', price: 600, cat: 'Serology' },
  { name: 'HIV 1 & 2', code: 'HIV01', type: 'Blood', ref: 'Non Reactive', unit: '-', price: 400, cat: 'Serology' },
  { name: 'Urine Routine', code: 'URR01', type: 'Urine', ref: 'N/A', unit: '-', price: 150, cat: 'Clinical Pathology' },
  { name: 'Stool Routine', code: 'STR01', type: 'Stool', ref: 'N/A', unit: '-', price: 150, cat: 'Clinical Pathology' },
  { name: 'Thyroid Profile (T3, T4, TSH)', code: 'THY01', type: 'Blood', ref: 'N/A', unit: '-', price: 650, cat: 'Hormone Tests' },
  { name: 'Vitamin B12', code: 'VITB12', type: 'Blood', ref: '200-900', unit: 'pg/mL', price: 800, cat: 'Hormone Tests' },
  { name: 'Vitamin D3', code: 'VITD3', type: 'Blood', ref: '30-100', unit: 'ng/mL', price: 1200, cat: 'Hormone Tests' },
  { name: 'Urine Culture', code: 'URC01', type: 'Urine', ref: 'Sterile', unit: '-', price: 450, cat: 'Microbiology' }
];

const patients = [
  { fullName: 'Rahul Sharma', gender: 'Male', age: 45, mobile: '9876543210', city: 'Delhi', bg: 'O+' },
  { fullName: 'Priya Singh', gender: 'Female', age: 32, mobile: '8765432109', city: 'Mumbai', bg: 'A+' },
  { fullName: 'Amit Kumar', gender: 'Male', age: 28, mobile: '7654321098', city: 'Bangalore', bg: 'B+' },
  { fullName: 'Sneha Patel', gender: 'Female', age: 52, mobile: '6543210987', city: 'Ahmedabad', bg: 'O-' },
  { fullName: 'Vikram Reddy', gender: 'Male', age: 61, mobile: '5432109876', city: 'Hyderabad', bg: 'AB+' }
];

const doctors = [
  { name: 'Dr. Sameer Desai', spec: 'General Physician', mobile: '9988776655', clinic: 'Desai Clinic' },
  { name: 'Dr. Anita Roy', spec: 'Endocrinologist', mobile: '8877665544', clinic: 'Roy Care Center' },
  { name: 'Dr. Ramesh Gupta', spec: 'Cardiologist', mobile: '7766554433', clinic: 'Heart Institute' }
];

async function main() {
  console.log('Seeding massive data...');
  
  // 1. Categories
  const catMap = {};
  for (const c of categories) {
    const created = await prisma.testCategory.upsert({
      where: { name: c },
      update: {},
      create: { name: c }
    });
    catMap[c] = created.id;
  }

  // 2. Tests
  for (const t of tests) {
    await prisma.test.upsert({
      where: { testCode: t.code },
      update: {},
      create: {
        testName: t.name, testCode: t.code, sampleType: t.type,
        referenceRange: t.ref, unit: t.unit, price: t.price,
        categoryId: catMap[t.cat]
      }
    });
  }

  // 3. Doctors
  const docIds = [];
  let dCount = 1;
  for (const d of doctors) {
    const docIdStr = `DOC-${dCount.toString().padStart(4, '0')}`;
    const doc = await prisma.doctor.upsert({
      where: { doctorId: docIdStr },
      update: {},
      create: { doctorId: docIdStr, name: d.name, specialization: d.spec, mobileNumber: d.mobile, clinicName: d.clinic }
    });
    docIds.push(doc.id);
    dCount++;
  }

  // 4. Patients & Reports
  let pCount = 1;
  let rCount = 1;
  let iCount = 1;
  
  const allTests = await prisma.test.findMany();

  for (const p of patients) {
    const pIdStr = `SPL-${pCount.toString().padStart(4, '0')}`;
    const pat = await prisma.patient.upsert({
      where: { patientId: pIdStr },
      update: {},
      create: {
        patientId: pIdStr, fullName: p.fullName, gender: p.gender, age: p.age,
        mobileNumber: p.mobile, city: p.city, bloodGroup: p.bg
      }
    });
    
    // Create 2 reports for each patient
    for (let i = 0; i < 2; i++) {
      const rIdStr = `RPT-${rCount.toString().padStart(6, '0')}`;
      const invIdStr = `INV-${iCount.toString().padStart(6, '0')}`;
      
      const docId = docIds[Math.floor(Math.random() * docIds.length)];
      const test1 = allTests[Math.floor(Math.random() * allTests.length)];
      const test2 = allTests[Math.floor(Math.random() * allTests.length)];
      
      const report = await prisma.report.upsert({
        where: { reportNumber: rIdStr },
        update: {},
        create: {
          reportNumber: rIdStr, patientId: pat.id, doctorId: docId, status: i === 0 ? 'COMPLETED' : 'PENDING',
          results: {
            create: [
              { testId: test1.id, resultValue: i === 0 ? 'Normal' : '', flag: 'NORMAL' },
              { testId: test2.id, resultValue: i === 0 ? '12.5' : '', flag: 'NORMAL' }
            ]
          }
        }
      });
      
      const totalAmount = test1.price + test2.price;
      
      await prisma.invoice.upsert({
        where: { invoiceNumber: invIdStr },
        update: {},
        create: {
          invoiceNumber: invIdStr, patientId: pat.id, reportId: report.id,
          totalAmount, finalAmount: totalAmount, paymentStatus: i === 0 ? 'PAID' : 'UNPAID'
        }
      });
      
      rCount++;
      iCount++;
    }
    pCount++;
  }
  
  console.log('Seeding complete!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
