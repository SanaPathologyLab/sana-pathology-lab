const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Splitting tests into separate profiles...');

  const clinPath = await prisma.testCategory.findFirst({ where: { name: 'Clinical Pathology' } });
  const biochem = await prisma.testCategory.findFirst({ where: { name: 'Biochemistry' } });

  const clinPathId = clinPath ? clinPath.id : 1;
  const biochemId = biochem ? biochem.id : 1;

  // 1. Delete the combined Fever Profile
  const feverProfile = await prisma.test.findUnique({ where: { testCode: 'FEVER-01' } });
  if (feverProfile) {
    await prisma.testParameter.deleteMany({ where: { testId: feverProfile.id } });
    await prisma.test.delete({ where: { id: feverProfile.id } });
    console.log('Deleted combined FEVER PROFILE.');
  }

  // 2. Create MP ELISA
  const mpTest = await prisma.test.upsert({
    where: { testCode: 'MP-01' },
    update: { testName: 'MALARIA (MP) ELISA' },
    create: {
      testName: 'MALARIA (MP) ELISA',
      testCode: 'MP-01',
      sampleType: 'Serum',
      price: 300.0,
      categoryId: clinPathId
    }
  });
  await prisma.testParameter.deleteMany({ where: { testId: mpTest.id } });
  await prisma.testParameter.createMany({
    data: [
      { testId: mpTest.id, parameterName: 'MP ELISA P.f (Antigen)', referenceRange: 'NEGATIVE', unit: '-', groupName: 'IMMUNOLOGY & SEROLOGY TEST' },
      { testId: mpTest.id, parameterName: 'MP ELISA P.v (Antigen)', referenceRange: 'NEGATIVE', unit: '-', groupName: 'IMMUNOLOGY & SEROLOGY TEST' }
    ]
  });

  // 3. Create WIDAL TEST
  const widalTest = await prisma.test.upsert({
    where: { testCode: 'WIDAL-01' },
    update: { testName: 'WIDAL TEST' },
    create: {
      testName: 'WIDAL TEST',
      testCode: 'WIDAL-01',
      sampleType: 'Serum',
      price: 250.0,
      categoryId: clinPathId
    }
  });
  await prisma.testParameter.deleteMany({ where: { testId: widalTest.id } });
  await prisma.testParameter.createMany({
    data: [
      { testId: widalTest.id, parameterName: 'WIDAL TEST (Rapid Slid Method)', referenceRange: 'NEGATIVE', unit: '-', groupName: 'IMMUNOLOGY & SEROLOGY TEST' },
      { testId: widalTest.id, parameterName: 'WIDAL INTERPRETATION', referenceRange: '-', unit: '-', groupName: 'INTERPRETATION' }
    ]
  });

  // 4. Create SGPT
  const sgptTest = await prisma.test.upsert({
    where: { testCode: 'SGPT-01' },
    update: { testName: 'S.G.P.T (ALT)' },
    create: {
      testName: 'S.G.P.T (ALT)',
      testCode: 'SGPT-01',
      sampleType: 'Serum',
      price: 150.0,
      categoryId: biochemId
    }
  });
  await prisma.testParameter.deleteMany({ where: { testId: sgptTest.id } });
  await prisma.testParameter.createMany({
    data: [
      { testId: sgptTest.id, parameterName: 'S.G.P.T (ALT) (Modified Reitman Frankel Method)', referenceRange: '5-35', unit: 'UNITS/ML', groupName: 'BIOCHEMISTRICAL EXAMINATION' }
    ]
  });

  // 5. Create SGOT
  const sgotTest = await prisma.test.upsert({
    where: { testCode: 'SGOT-01' },
    update: { testName: 'S.G.O.T (AST)' },
    create: {
      testName: 'S.G.O.T (AST)',
      testCode: 'SGOT-01',
      sampleType: 'Serum',
      price: 150.0,
      categoryId: biochemId
    }
  });
  await prisma.testParameter.deleteMany({ where: { testId: sgotTest.id } });
  await prisma.testParameter.createMany({
    data: [
      { testId: sgotTest.id, parameterName: 'S.G.O.T (AST) (Modified Reitman Frankel’s Method)', referenceRange: '5-40', unit: 'UNITS/ML', groupName: 'BIOCHEMISTRICAL EXAMINATION' }
    ]
  });

  console.log('Successfully created separate MP, Widal, SGPT, and SGOT tests.');
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
