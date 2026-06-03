const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding LFT Test...');

  const biochem = await prisma.testCategory.findFirst({ where: { name: 'Biochemistry' } });
  const biochemId = biochem ? biochem.id : 1;

  const lftTest = await prisma.test.upsert({
    where: { testCode: 'LFT-01' },
    update: { testName: '(L.F.T) LIVER FUNCTION TEST' },
    create: {
      testName: '(L.F.T) LIVER FUNCTION TEST',
      testCode: 'LFT-01',
      sampleType: 'Serum',
      price: 600.0,
      categoryId: biochemId
    }
  });

  await prisma.testParameter.deleteMany({ where: { testId: lftTest.id } });
  
  await prisma.testParameter.createMany({
    data: [
      { testId: lftTest.id, parameterName: 'TOTAL BILIRUBIN (Malloy and Evelyn Method)', referenceRange: '0.2-1.0', unit: 'MG/DL', groupName: 'BIOCHEMISTRICAL EXAMINATION' },
      { testId: lftTest.id, parameterName: 'S.BILIRUBIN DIRECT', referenceRange: '0.0-0.2', unit: 'MG/DL', groupName: 'BIOCHEMISTRICAL EXAMINATION' },
      { testId: lftTest.id, parameterName: 'S.BILIRUBIN INDIRECT', referenceRange: '0.2-0.8', unit: 'MG/DL', groupName: 'BIOCHEMISTRICAL EXAMINATION' },
      { testId: lftTest.id, parameterName: 'S.G.P.T (ALT) (Modified Reitman Frankel Method)', referenceRange: '5-35', unit: 'UNITS/ML', groupName: 'BIOCHEMISTRICAL EXAMINATION' },
      { testId: lftTest.id, parameterName: 'S.G.O.T (AST) (Modified Reitman Frankel’s Method)', referenceRange: '5-40', unit: 'UNITS/ML', groupName: 'BIOCHEMISTRICAL EXAMINATION' },
      { testId: lftTest.id, parameterName: 'ALK- PHOSPHATASE (Kind & King’s Method)', referenceRange: '53-128', unit: 'KA UNITS', groupName: 'BIOCHEMISTRICAL EXAMINATION' },
      { testId: lftTest.id, parameterName: 'TOTAL PROTEIN', referenceRange: '6.4-8.4', unit: 'GM/DL', groupName: 'BIOCHEMISTRICAL EXAMINATION' },
      { testId: lftTest.id, parameterName: 'ALBUMINE', referenceRange: '3.5-5.0', unit: 'GM/DL', groupName: 'BIOCHEMISTRICAL EXAMINATION' },
      { testId: lftTest.id, parameterName: 'GLOBULIN', referenceRange: '2.5-3.5', unit: 'GM/DL', groupName: 'BIOCHEMISTRICAL EXAMINATION' },
      { testId: lftTest.id, parameterName: 'A/G RATIO', referenceRange: '1.0-1.8', unit: 'GM', groupName: 'BIOCHEMISTRICAL EXAMINATION' },
      { testId: lftTest.id, parameterName: 'LFT INTERPRETATION', referenceRange: '-', unit: '-', groupName: 'INTERPRETATION' }
    ]
  });

  console.log('Upserted LFT Test.');
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
