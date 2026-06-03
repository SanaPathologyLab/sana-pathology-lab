const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Rheumatoid Factor Test...');

  const clinPath = await prisma.testCategory.findFirst({ where: { name: 'Clinical Pathology' } });
  const clinPathId = clinPath ? clinPath.id : 1;

  const rfTest = await prisma.test.upsert({
    where: { testCode: 'RF-01' },
    update: { testName: 'RHEUMATOID FACTOR (SERUM)' },
    create: {
      testName: 'RHEUMATOID FACTOR (SERUM)',
      testCode: 'RF-01',
      sampleType: 'Serum',
      price: 350.0,
      categoryId: clinPathId
    }
  });

  await prisma.testParameter.deleteMany({ where: { testId: rfTest.id } });
  
  await prisma.testParameter.createMany({
    data: [
      { 
        testId: rfTest.id, 
        parameterName: 'RHEUMATOID FACTOR (SERUM)', 
        referenceRange: 'NON-REACTIVE', 
        unit: '-', 
        groupName: 'IMMUNOLOGY & SEROLOGY TEST' 
      },
      { 
        testId: rfTest.id, 
        parameterName: 'RF COMMENTS', 
        referenceRange: '-', 
        unit: '-', 
        groupName: 'INTERPRETATION' 
      }
    ]
  });

  console.log('Upserted Rheumatoid Factor Test.');
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
