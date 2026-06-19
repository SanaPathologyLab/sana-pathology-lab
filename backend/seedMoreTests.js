const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Fever Profile (Widal, MP, SGOT/SGPT)...');

  const clinPath = await prisma.testCategory.findFirst({ where: { name: 'Clinical Pathology' } });
  const biochem = await prisma.testCategory.findFirst({ where: { name: 'Biochemistry' } });

  const categoryId = clinPath ? clinPath.id : 1;

  const feverProfile = await prisma.test.upsert({
    where: { testCode: 'FEVER-01' },
    update: { testName: 'FEVER PROFILE (WIDAL, MP, SGOT/SGPT)' },
    create: {
      testName: 'FEVER PROFILE (WIDAL, MP, SGOT/SGPT)',
      testCode: 'FEVER-01',
      sampleType: 'Serum',
      price: 800.0,
      categoryId: categoryId
    }
  });

  await prisma.testParameter.deleteMany({ where: { testId: feverProfile.id } });
  
  await prisma.testParameter.createMany({
    data: [
      { testId: feverProfile.id, parameterName: 'MP ELISA P.f (Antigen)', referenceRange: 'NEGATIVE', unit: '-', groupName: 'IMMUNOLOGY & SEROLOGY TEST' },
      { testId: feverProfile.id, parameterName: 'MP ELISA P.v (Antigen)', referenceRange: 'NEGATIVE', unit: '-', groupName: 'IMMUNOLOGY & SEROLOGY TEST' },
      { testId: feverProfile.id, parameterName: 'WIDAL TEST (Rapid Slid Method)', referenceRange: 'NEGATIVE', unit: '-', groupName: 'IMMUNOLOGY & SEROLOGY TEST' },
      { testId: feverProfile.id, parameterName: 'S.G.P.T (ALT) (Modified Reitman Frankel Method)', referenceRange: '5-35', unit: 'UNITS/ML', groupName: 'BIOCHEMISTRICAL EXAMINATION' },
      { testId: feverProfile.id, parameterName: 'S.G.O.T (AST) (Modified Reitman Frankel’s Method)', referenceRange: '5-40', unit: 'UNITS/ML', groupName: 'BIOCHEMISTRICAL EXAMINATION' },
      // Adding interpretation as a note/parameter for now so it's not lost
      { testId: feverProfile.id, parameterName: 'WIDAL INTERPRETATION', referenceRange: '-', unit: '-', groupName: 'INTERPRETATION' }
    ]
  });

  console.log('Upserted Fever Profile.');
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
