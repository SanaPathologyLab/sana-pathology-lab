const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Serum Calcium Test...');

  const biochem = await prisma.testCategory.findFirst({ where: { name: 'Biochemistry' } });
  const biochemId = biochem ? biochem.id : 1;

  const calciumTest = await prisma.test.upsert({
    where: { testCode: 'CALCIUM-01' },
    update: { testName: 'SERUM CALCIUM' },
    create: {
      testName: 'SERUM CALCIUM',
      testCode: 'CALCIUM-01',
      sampleType: 'Serum',
      price: 200.0,
      categoryId: biochemId
    }
  });

  await prisma.testParameter.deleteMany({ where: { testId: calciumTest.id } });
  
  await prisma.testParameter.createMany({
    data: [
      { 
        testId: calciumTest.id, 
        parameterName: 'SERUM CALCIUM (ARSENAZO III)', 
        referenceRange: '8.1-10.4', 
        unit: 'MG/DL', 
        groupName: 'BIOCHEMISTRICAL EXAMINATION' 
      }
    ]
  });

  console.log('Upserted Serum Calcium Test.');
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
