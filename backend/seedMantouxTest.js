const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Mantoux Test...');

  const clinPath = await prisma.testCategory.findFirst({ where: { name: 'Clinical Pathology' } });
  const clinPathId = clinPath ? clinPath.id : 1;

  const mantouxTest = await prisma.test.upsert({
    where: { testCode: 'MANTOUX-01' },
    update: { testName: 'MANTOUX TEST (TUBERCULIN SKIN TEST)' },
    create: {
      testName: 'MANTOUX TEST (TUBERCULIN SKIN TEST)',
      testCode: 'MANTOUX-01',
      sampleType: 'Skin',
      price: 250.0,
      categoryId: clinPathId
    }
  });

  await prisma.testParameter.deleteMany({ where: { testId: mantouxTest.id } });
  
  await prisma.testParameter.createMany({
    data: [
      { 
        testId: mantouxTest.id, 
        parameterName: 'MANTOUX TEST (Interdermal Skin Test)', 
        referenceRange: 'Negative', 
        unit: 'mm', 
        groupName: 'CLINICAL PATHOLOGY' 
      },
      { 
        testId: mantouxTest.id, 
        parameterName: 'MANTOUX INTERPRETATION', 
        referenceRange: '-', 
        unit: '-', 
        groupName: 'INTERPRETATION' 
      }
    ]
  });

  console.log('Upserted Mantoux Test.');
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
