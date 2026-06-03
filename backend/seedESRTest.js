const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding ESR Test...');

  const hematology = await prisma.testCategory.findFirst({ where: { name: 'Hematology' } });
  const categoryId = hematology ? hematology.id : 1;

  const esrTest = await prisma.test.upsert({
    where: { testCode: 'ESR-01' },
    update: { testName: 'ESR (Erythrocyte Sedimentation Rate)' },
    create: {
      testName: 'ESR (Erythrocyte Sedimentation Rate)',
      testCode: 'ESR-01',
      sampleType: 'Blood',
      price: 150.0,
      categoryId: categoryId
    }
  });

  await prisma.testParameter.deleteMany({ where: { testId: esrTest.id } });
  
  await prisma.testParameter.createMany({
    data: [
      { 
        testId: esrTest.id, 
        parameterName: 'ESR (Erythrocyte sedimentation rate)', 
        referenceRange: '0-9 M 0-20 F', 
        unit: 'mm/hour', 
        groupName: 'HEMATOLOGICAL EXAMINATION' 
      }
    ]
  });

  console.log('Upserted ESR Test.');
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
