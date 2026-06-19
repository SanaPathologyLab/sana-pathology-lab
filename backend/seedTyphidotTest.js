const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding TYPHIDOT Test...');

  const clinPath = await prisma.testCategory.findFirst({ where: { name: 'Clinical Pathology' } });
  const clinPathId = clinPath ? clinPath.id : 1;

  const typhidotTest = await prisma.test.upsert({
    where: { testCode: 'TYPHIDOT-01' },
    update: { testName: 'TYPHIDOT (IgG & IgM)' },
    create: {
      testName: 'TYPHIDOT (IgG & IgM)',
      testCode: 'TYPHIDOT-01',
      sampleType: 'Serum',
      price: 350.0,
      categoryId: clinPathId
    }
  });

  await prisma.testParameter.deleteMany({ where: { testId: typhidotTest.id } });
  
  await prisma.testParameter.createMany({
    data: [
      { 
        testId: typhidotTest.id, 
        parameterName: 'TYPHIDOT-(IgG)', 
        referenceRange: 'NON-REACTIVE', 
        unit: '-', 
        groupName: 'IMMUNOLOGY & SEROLOGY TEST' 
      },
      { 
        testId: typhidotTest.id, 
        parameterName: 'TYPHIDOT-(IgM)', 
        referenceRange: 'NON-REACTIVE', 
        unit: '-', 
        groupName: 'IMMUNOLOGY & SEROLOGY TEST' 
      },
      { 
        testId: typhidotTest.id, 
        parameterName: 'TYPHIDOT INTERPRETATION', 
        referenceRange: '-', 
        unit: '-', 
        groupName: 'INTERPRETATION' 
      }
    ]
  });

  console.log('Upserted TYPHIDOT Test.');
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
