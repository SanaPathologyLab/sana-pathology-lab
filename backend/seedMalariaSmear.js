const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Malaria Smear Test...');

  const hematology = await prisma.testCategory.findFirst({ where: { name: 'Hematology' } });
  const categoryId = hematology ? hematology.id : 1;

  const malariaSmearTest = await prisma.test.upsert({
    where: { testCode: 'MP-SMEAR-01' },
    update: { testName: 'MALARIA PARASITE IDENTIFICATION (MICROSCOPY)' },
    create: {
      testName: 'MALARIA PARASITE IDENTIFICATION (MICROSCOPY)',
      testCode: 'MP-SMEAR-01',
      sampleType: 'Blood',
      price: 150.0,
      categoryId: categoryId
    }
  });

  await prisma.testParameter.deleteMany({ where: { testId: malariaSmearTest.id } });
  
  await prisma.testParameter.createMany({
    data: [
      { 
        testId: malariaSmearTest.id, 
        parameterName: 'MALARIA PARASITE IDENTIFICATION (MICROSCOPY)', 
        referenceRange: 'NOT-SEEN', 
        unit: '-', 
        groupName: 'HEMATOLOGICAL EXAMINATION' 
      },
      { 
        testId: malariaSmearTest.id, 
        parameterName: 'MALARIA SMEAR NOTE', 
        referenceRange: '-', 
        unit: '-', 
        groupName: 'INTERPRETATION' 
      }
    ]
  });

  console.log('Upserted Malaria Smear Test.');
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
