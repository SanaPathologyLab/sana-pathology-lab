const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding CRP Test...');

  const clinPath = await prisma.testCategory.findFirst({ where: { name: 'Clinical Pathology' } });
  const clinPathId = clinPath ? clinPath.id : 1;

  const crpTest = await prisma.test.upsert({
    where: { testCode: 'CRP-01' },
    update: { testName: '(CRP) C-REACTIVE PROTEIN' },
    create: {
      testName: '(CRP) C-REACTIVE PROTEIN',
      testCode: 'CRP-01',
      sampleType: 'Serum',
      price: 250.0,
      categoryId: clinPathId
    }
  });

  await prisma.testParameter.deleteMany({ where: { testId: crpTest.id } });
  
  await prisma.testParameter.createMany({
    data: [
      { 
        testId: crpTest.id, 
        parameterName: '(CRP) C-REACTIVE PROTEIN', 
        referenceRange: 'NON-REACTIVE', 
        unit: '-', 
        groupName: 'IMMUNOLOGY & SEROLOGY TEST' 
      },
      { 
        testId: crpTest.id, 
        parameterName: 'CRP INTERPRETATION', 
        referenceRange: '-', 
        unit: '-', 
        groupName: 'INTERPRETATION' 
      }
    ]
  });

  console.log('Upserted CRP Test.');
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
