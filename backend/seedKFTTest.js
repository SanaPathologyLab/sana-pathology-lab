const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding KFT Test...');

  const biochem = await prisma.testCategory.findFirst({ where: { name: 'Biochemistry' } });
  const biochemId = biochem ? biochem.id : 1;

  const kftTest = await prisma.test.upsert({
    where: { testCode: 'KFT-01' },
    update: { testName: '(K.F.T.) KIDNEY FUNCTION TEST' },
    create: {
      testName: '(K.F.T.) KIDNEY FUNCTION TEST',
      testCode: 'KFT-01',
      sampleType: 'Serum',
      price: 600.0,
      categoryId: biochemId
    }
  });

  await prisma.testParameter.deleteMany({ where: { testId: kftTest.id } });
  
  await prisma.testParameter.createMany({
    data: [
      { testId: kftTest.id, parameterName: 'B.UREA (Berthelot Method)', referenceRange: '20-45', unit: 'MG/DL', groupName: 'BIOCHEMISTRICAL EXAMINATION' },
      { testId: kftTest.id, parameterName: 'S.CREATININE (Alkaline Picrate Method)', referenceRange: 'M-0.9-1.4 F-0.8-1.2', unit: 'MG/DL', groupName: 'BIOCHEMISTRICAL EXAMINATION' },
      { testId: kftTest.id, parameterName: 'S.URIC ACID (Phosphotungstate method)', referenceRange: 'M-2.5-7.0 F-1.5-6.0', unit: 'MG/DL', groupName: 'BIOCHEMISTRICAL EXAMINATION' },
      { testId: kftTest.id, parameterName: 'TOTAL PROTEIN', referenceRange: '6.4-8.4', unit: 'GM/DL', groupName: 'BIOCHEMISTRICAL EXAMINATION' },
      { testId: kftTest.id, parameterName: 'ALBUMINE', referenceRange: '3.5-5.0', unit: 'GM/DL', groupName: 'BIOCHEMISTRICAL EXAMINATION' },
      { testId: kftTest.id, parameterName: 'GLOBULIN', referenceRange: '2.5-3.5', unit: 'GM/DL', groupName: 'BIOCHEMISTRICAL EXAMINATION' },
      { testId: kftTest.id, parameterName: 'A/G RATIO', referenceRange: '1.0-1.8', unit: 'GM', groupName: 'BIOCHEMISTRICAL EXAMINATION' },
      { testId: kftTest.id, parameterName: 'SODIUM (Na)', referenceRange: '135-148', unit: 'mmol/L', groupName: 'BIOCHEMISTRICAL EXAMINATION' },
      { testId: kftTest.id, parameterName: 'POTASSIUM (K+)', referenceRange: '3.8-5.2', unit: 'mmol/L', groupName: 'BIOCHEMISTRICAL EXAMINATION' },
      { testId: kftTest.id, parameterName: 'KFT ADVICE & CKD RISK', referenceRange: '-', unit: '-', groupName: 'INTERPRETATION' }
    ]
  });

  console.log('Upserted KFT Test.');
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
