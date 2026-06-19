const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding custom tests provided by the user...');

  // 1. UPDATE CBC TEST
  const cbcTest = await prisma.test.findFirst({
    where: {
      OR: [
        { testCode: 'CBC-01' },
        { testName: { contains: 'Complete Blood Count' } }
      ]
    }
  });

  if (cbcTest) {
    await prisma.testParameter.deleteMany({ where: { testId: cbcTest.id } });
    await prisma.testParameter.createMany({
      data: [
        { testId: cbcTest.id, parameterName: 'HAEMOGLOBIN', referenceRange: 'M-12-16 F- 11-14 NEW BORN-16-19', unit: 'GM%', groupName: 'HEMATOLOGICAL EXAMINATION' },
        { testId: cbcTest.id, parameterName: 'TOTAL LEUCOCYTES COUNT', referenceRange: '4000-11000', unit: '/CU MM', groupName: 'HEMATOLOGICAL EXAMINATION' },
        { testId: cbcTest.id, parameterName: 'NEUTROPHILS', referenceRange: '40-75', unit: '%', groupName: 'DIFFERENTIAL LEUCOCYTES COUNT' },
        { testId: cbcTest.id, parameterName: 'LYMPHOCYTES', referenceRange: '20-45', unit: '%', groupName: 'DIFFERENTIAL LEUCOCYTES COUNT' },
        { testId: cbcTest.id, parameterName: 'MONOCYTES', referenceRange: '2-10', unit: '%', groupName: 'DIFFERENTIAL LEUCOCYTES COUNT' },
        { testId: cbcTest.id, parameterName: 'EOSINOPHILS', referenceRange: '01-06', unit: '%', groupName: 'DIFFERENTIAL LEUCOCYTES COUNT' },
        { testId: cbcTest.id, parameterName: 'BASOPHILS', referenceRange: '00-01', unit: '%', groupName: 'DIFFERENTIAL LEUCOCYTES COUNT' },
        { testId: cbcTest.id, parameterName: 'PLATELETS', referenceRange: '150,000-400,000', unit: '/ CU MM', groupName: 'HEMATOLOGICAL EXAMINATION' },
        { testId: cbcTest.id, parameterName: 'RBC', referenceRange: '3.50—5.50', unit: '10^6/uL', groupName: 'HEMATOLOGICAL EXAMINATION' },
        { testId: cbcTest.id, parameterName: 'HCT', referenceRange: '36.0—48.0', unit: '%', groupName: 'HEMATOLOGICAL EXAMINATION' },
        { testId: cbcTest.id, parameterName: 'MCV', referenceRange: '80.0—99.0', unit: 'Fl', groupName: 'HEMATOLOGICAL EXAMINATION' },
        { testId: cbcTest.id, parameterName: 'MCH', referenceRange: '26.0—32.0', unit: 'pg', groupName: 'HEMATOLOGICAL EXAMINATION' },
        { testId: cbcTest.id, parameterName: 'MCHC', referenceRange: '32.0--36.0', unit: 'g/Dl', groupName: 'HEMATOLOGICAL EXAMINATION' }
      ]
    });
    await prisma.test.update({ where: { id: cbcTest.id }, data: { testName: '(C.B.C.) COMPLETE BLOOD COUNT' } });
    console.log('Updated CBC Test');
  }

  // Get categories
  const hematology = await prisma.testCategory.findFirst({ where: { name: 'Hematology' } });
  const clinPath = await prisma.testCategory.findFirst({ where: { name: 'Clinical Pathology' } });

  const hematologyId = hematology ? hematology.id : 1;
  const clinPathId = clinPath ? clinPath.id : 1;

  // 2. CREATE ANC PROFILE
  const ancTest = await prisma.test.upsert({
    where: { testCode: 'ANC-01' },
    update: { testName: 'ANTE-NATAL CARE (ANC) PROFILE' },
    create: {
      testName: 'ANTE-NATAL CARE (ANC) PROFILE',
      testCode: 'ANC-01',
      sampleType: 'Blood',
      price: 1200.0,
      categoryId: clinPathId
    }
  });

  await prisma.testParameter.deleteMany({ where: { testId: ancTest.id } });
  await prisma.testParameter.createMany({
    data: [
      { testId: ancTest.id, parameterName: 'HAEMOGLOBIN (Shahli’s Method)', referenceRange: 'M-12-16 F- 11-14 NEW BORN-16-19', unit: 'GM%', groupName: 'HEMATOLOGICAL EXAMINATION' },
      { testId: ancTest.id, parameterName: 'ABO', referenceRange: '-', unit: '-', groupName: 'BLOOD GROUP ABO & RH FACTOR TYPING' },
      { testId: ancTest.id, parameterName: 'Rh', referenceRange: '-', unit: '-', groupName: 'BLOOD GROUP ABO & RH FACTOR TYPING' },
      { testId: ancTest.id, parameterName: 'BLEEDING TIME (Duhe’s Method)', referenceRange: '2-7', unit: 'minutes', groupName: 'HEMATOLOGICAL EXAMINATION' },
      { testId: ancTest.id, parameterName: 'CLOTTING TIME (Wright’s Method)', referenceRange: '3-10', unit: 'minutes', groupName: 'HEMATOLOGICAL EXAMINATION' },
      { testId: ancTest.id, parameterName: 'TOTAL BILIRUBIN (Malloy and Evelyn Method)', referenceRange: '0.2-1.0', unit: 'MG/DL', groupName: 'BIOCHEMISTRICAL EXAMINATION' },
      { testId: ancTest.id, parameterName: 'B.SUGAR (R) (Enzymatic GOD-POD Method)', referenceRange: '70-150', unit: 'MG/DL', groupName: 'BIOCHEMISTRICAL EXAMINATION' },
      { testId: ancTest.id, parameterName: 'H C V.1', referenceRange: 'NON-REACTIVE', unit: '-', groupName: 'IMMUNOLOGY & SEROLOGY TEST' },
      { testId: ancTest.id, parameterName: 'H C V.2', referenceRange: 'NON-REACTIVE', unit: '-', groupName: 'IMMUNOLOGY & SEROLOGY TEST' },
      { testId: ancTest.id, parameterName: 'H I V. 1', referenceRange: 'NON-REACTIVE', unit: '-', groupName: 'IMMUNOLOGY & SEROLOGY TEST' },
      { testId: ancTest.id, parameterName: 'H I V. 2', referenceRange: 'NON-REACTIVE', unit: '-', groupName: 'IMMUNOLOGY & SEROLOGY TEST' },
      { testId: ancTest.id, parameterName: 'HBsAg (Elisa)', referenceRange: 'NON -REACTIVE', unit: '-', groupName: 'IMMUNOLOGY & SEROLOGY TEST' },
      { testId: ancTest.id, parameterName: 'V.D.R.L', referenceRange: 'NON-REACTIVE', unit: '-', groupName: 'IMMUNOLOGY & SEROLOGY TEST' }
    ]
  });
  console.log('Upserted ANC Profile');

  // 3. CREATE BLOOD GROUP TEST
  const bgTest = await prisma.test.upsert({
    where: { testCode: 'BG-01' },
    update: { testName: 'BLOOD GROUP ABO & RH FACTOR TYPING' },
    create: {
      testName: 'BLOOD GROUP ABO & RH FACTOR TYPING',
      testCode: 'BG-01',
      sampleType: 'Blood',
      price: 150.0,
      categoryId: hematologyId
    }
  });

  await prisma.testParameter.deleteMany({ where: { testId: bgTest.id } });
  await prisma.testParameter.createMany({
    data: [
      { testId: bgTest.id, parameterName: 'ABO', referenceRange: '-', unit: '-', groupName: 'BLOOD GROUP ABO & RH FACTOR TYPING' },
      { testId: bgTest.id, parameterName: 'Rh', referenceRange: '-', unit: '-', groupName: 'BLOOD GROUP ABO & RH FACTOR TYPING' }
    ]
  });
  console.log('Upserted Blood Group Test');

  console.log('Done!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
