const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Updating CBC Test parameters...');

  // Find CBC test
  const cbcTest = await prisma.test.findFirst({
    where: {
      OR: [
        { testCode: 'CBC-01' },
        { testName: { contains: 'Complete Blood Count' } }
      ]
    }
  });

  if (!cbcTest) {
    console.error('CBC Test not found!');
    return;
  }

  // Delete existing parameters for CBC
  await prisma.testParameter.deleteMany({
    where: { testId: cbcTest.id }
  });

  // Create new parameters based on user input
  await prisma.testParameter.createMany({
    data: [
      {
        testId: cbcTest.id,
        parameterName: 'HAEMOGLOBIN',
        referenceRange: 'M-12-16 F- 11-14 NEW BORN-16-19',
        unit: 'GM%',
        groupName: 'HEMATOLOGICAL EXAMINATION'
      },
      {
        testId: cbcTest.id,
        parameterName: 'TOTAL LEUCOCYTES COUNT',
        referenceRange: '4000-11000',
        unit: '/CU MM',
        groupName: 'HEMATOLOGICAL EXAMINATION'
      },
      {
        testId: cbcTest.id,
        parameterName: 'NEUTROPHILS',
        referenceRange: '40-75',
        unit: '%',
        groupName: 'DIFFERENTIAL LEUCOCYTES COUNT'
      },
      {
        testId: cbcTest.id,
        parameterName: 'LYMPHOCYTES',
        referenceRange: '20-45',
        unit: '%',
        groupName: 'DIFFERENTIAL LEUCOCYTES COUNT'
      },
      {
        testId: cbcTest.id,
        parameterName: 'MONOCYTES',
        referenceRange: '2-10',
        unit: '%',
        groupName: 'DIFFERENTIAL LEUCOCYTES COUNT'
      },
      {
        testId: cbcTest.id,
        parameterName: 'EOSINOPHILS',
        referenceRange: '01-06',
        unit: '%',
        groupName: 'DIFFERENTIAL LEUCOCYTES COUNT'
      },
      {
        testId: cbcTest.id,
        parameterName: 'BASOPHILS',
        referenceRange: '00-01',
        unit: '%',
        groupName: 'DIFFERENTIAL LEUCOCYTES COUNT'
      },
      {
        testId: cbcTest.id,
        parameterName: 'PLATELETS',
        referenceRange: '150,000-400,000',
        unit: '/ CU MM',
        groupName: 'RBC INDICES & PLATELETS'
      },
      {
        testId: cbcTest.id,
        parameterName: 'RBC',
        referenceRange: '3.50—5.50',
        unit: '10^6/uL',
        groupName: 'RBC INDICES & PLATELETS'
      },
      {
        testId: cbcTest.id,
        parameterName: 'HCT',
        referenceRange: '36.0—48.0',
        unit: '%',
        groupName: 'RBC INDICES & PLATELETS'
      },
      {
        testId: cbcTest.id,
        parameterName: 'MCV',
        referenceRange: '80.0—99.0',
        unit: 'Fl',
        groupName: 'RBC INDICES & PLATELETS'
      },
      {
        testId: cbcTest.id,
        parameterName: 'MCH',
        referenceRange: '26.0—32.0',
        unit: 'pg',
        groupName: 'RBC INDICES & PLATELETS'
      },
      {
        testId: cbcTest.id,
        parameterName: 'MCHC',
        referenceRange: '32.0--36.0',
        unit: 'g/Dl',
        groupName: 'RBC INDICES & PLATELETS'
      }
    ]
  });

  // Also update the Test name itself if needed
  await prisma.test.update({
    where: { id: cbcTest.id },
    data: {
      testName: '(C.B.C.) COMPLETE BLOOD COUNT'
    }
  });

  console.log('Successfully updated CBC Test parameters!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
