const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding CRP (QUANTITATIVE) Test...');

  const biochem = await prisma.testCategory.findFirst({ where: { name: 'Biochemistry' } });
  const biochemId = biochem ? biochem.id : 1;

  const crpQuantTest = await prisma.test.upsert({
    where: { testCode: 'CRP-QUANT-01' },
    update: { testName: '(CRP) C-REACTIVE PROTEIN (QUANTITATIVE)' },
    create: {
      testName: '(CRP) C-REACTIVE PROTEIN (QUANTITATIVE)',
      testCode: 'CRP-QUANT-01',
      sampleType: 'Serum',
      price: 350.0,
      categoryId: biochemId
    }
  });

  await prisma.testParameter.deleteMany({ where: { testId: crpQuantTest.id } });
  
  await prisma.testParameter.createMany({
    data: [
      { 
        testId: crpQuantTest.id, 
        parameterName: '(CRP) C-REACTIVE PROTEIN (QUANTITATIVE)', 
        referenceRange: '0.00-5.00', 
        unit: 'mg/dl', 
        groupName: 'BIOCHEMISTRICAL EXAMINATION' 
      },
      { 
        testId: crpQuantTest.id, 
        parameterName: 'CRP QUANTITATIVE INTERPRETATION', 
        referenceRange: '-', 
        unit: '-', 
        groupName: 'INTERPRETATION' 
      }
    ]
  });

  console.log('Upserted CRP (QUANTITATIVE) Test.');
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
