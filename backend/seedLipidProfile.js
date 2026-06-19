const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Lipid Profile Test...');

  const biochem = await prisma.testCategory.findFirst({ where: { name: 'Biochemistry' } });
  const biochemId = biochem ? biochem.id : 1;

  const lipidTest = await prisma.test.upsert({
    where: { testCode: 'LIPID-01' },
    update: { testName: 'LIPID PROFILE' },
    create: {
      testName: 'LIPID PROFILE',
      testCode: 'LIPID-01',
      sampleType: 'Serum',
      price: 650.0,
      categoryId: biochemId
    }
  });

  await prisma.testParameter.deleteMany({ where: { testId: lipidTest.id } });
  
  await prisma.testParameter.createMany({
    data: [
      { testId: lipidTest.id, parameterName: 'TC-(TOTAL CHOLESTEROL)', referenceRange: '< 200', unit: 'mg/dL', groupName: 'BIOCHEMISTRICAL EXAMINATION' },
      { testId: lipidTest.id, parameterName: 'HDL-(HIGH DENSITY LIPOPROTEIN)', referenceRange: '30-70', unit: 'mg/dL', groupName: 'BIOCHEMISTRICAL EXAMINATION' },
      { testId: lipidTest.id, parameterName: 'LDL-(LOW DENSITY LIPOPROTEIN)', referenceRange: '< 100', unit: 'mg/dL', groupName: 'BIOCHEMISTRICAL EXAMINATION' },
      { testId: lipidTest.id, parameterName: 'VLDL-(VERY LOW DENSITY LIPOPROTEIN)', referenceRange: '< 30', unit: 'mg/dL', groupName: 'BIOCHEMISTRICAL EXAMINATION' },
      { testId: lipidTest.id, parameterName: 'TG-(TRIGLYCERIDES)', referenceRange: '< 150', unit: 'mg/dL', groupName: 'BIOCHEMISTRICAL EXAMINATION' },
      { testId: lipidTest.id, parameterName: 'TOTAL CHOLESTROL/HDL RATIO', referenceRange: '-', unit: '-', groupName: 'BIOCHEMISTRICAL EXAMINATION' },
      { testId: lipidTest.id, parameterName: 'TRIGLYCERIDES/HDL RATIO', referenceRange: '-', unit: '-', groupName: 'BIOCHEMISTRICAL EXAMINATION' },
      { testId: lipidTest.id, parameterName: 'LDL/HDL RATIO', referenceRange: '-', unit: '-', groupName: 'BIOCHEMISTRICAL EXAMINATION' },
      { testId: lipidTest.id, parameterName: 'LIPID PROFILE RECOMMENDATIONS', referenceRange: '-', unit: '-', groupName: 'INTERPRETATION' }
    ]
  });

  console.log('Upserted Lipid Profile Test.');
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
