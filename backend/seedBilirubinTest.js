const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Total Bilirubin Test...');

  const biochem = await prisma.testCategory.findFirst({ where: { name: 'Biochemistry' } });
  const biochemId = biochem ? biochem.id : 1;

  const bilirubinTest = await prisma.test.upsert({
    where: { testCode: 'BILIRUBIN-TOTAL-01' },
    update: { testName: 'TOTAL BILIRUBIN' },
    create: {
      testName: 'TOTAL BILIRUBIN',
      testCode: 'BILIRUBIN-TOTAL-01',
      sampleType: 'Serum',
      price: 150.0,
      categoryId: biochemId
    }
  });

  await prisma.testParameter.deleteMany({ where: { testId: bilirubinTest.id } });
  
  await prisma.testParameter.createMany({
    data: [
      { 
        testId: bilirubinTest.id, 
        parameterName: 'TOTAL BILIRUBIN (Malloy and Evelyn Method)', 
        referenceRange: '0.2-1.0', 
        unit: 'MG/DL', 
        groupName: 'BIOCHEMISTRICAL EXAMINATION' 
      }
    ]
  });

  console.log('Upserted Total Bilirubin Test.');
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
