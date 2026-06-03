const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Combined SGPT & SGOT Test...');

  const biochem = await prisma.testCategory.findFirst({ where: { name: 'Biochemistry' } });
  const biochemId = biochem ? biochem.id : 1;

  const combinedTest = await prisma.test.upsert({
    where: { testCode: 'SGOT-SGPT-01' },
    update: { testName: 'SGPT & SGOT' },
    create: {
      testName: 'SGPT & SGOT',
      testCode: 'SGOT-SGPT-01',
      sampleType: 'Serum',
      price: 250.0,
      categoryId: biochemId
    }
  });

  await prisma.testParameter.deleteMany({ where: { testId: combinedTest.id } });
  
  await prisma.testParameter.createMany({
    data: [
      { 
        testId: combinedTest.id, 
        parameterName: 'S.G.P.T (ALT) (Modified Reitman Frankel Method)', 
        referenceRange: '5-35', 
        unit: 'UNITS/ML', 
        groupName: 'BIOCHEMISTRICAL EXAMINATION' 
      },
      { 
        testId: combinedTest.id, 
        parameterName: 'S.G.O.T (AST) (Modified Reitman Frankel’s Method)', 
        referenceRange: '5-40', 
        unit: 'UNITS/ML', 
        groupName: 'BIOCHEMISTRICAL EXAMINATION' 
      }
    ]
  });

  console.log('Upserted Combined SGPT & SGOT Test.');
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
