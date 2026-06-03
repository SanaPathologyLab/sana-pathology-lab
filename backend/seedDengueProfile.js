const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Dengue Profile...');

  const clinPath = await prisma.testCategory.findFirst({ where: { name: 'Clinical Pathology' } });
  const clinPathId = clinPath ? clinPath.id : 1;

  const dengueTest = await prisma.test.upsert({
    where: { testCode: 'DENGUE-01' },
    update: { testName: 'DENGUE PROFILE (IgG & IgM & NS1)' },
    create: {
      testName: 'DENGUE PROFILE (IgG & IgM & NS1)',
      testCode: 'DENGUE-01',
      sampleType: 'Serum',
      price: 1200.0,
      categoryId: clinPathId
    }
  });

  await prisma.testParameter.deleteMany({ where: { testId: dengueTest.id } });
  
  await prisma.testParameter.createMany({
    data: [
      { 
        testId: dengueTest.id, 
        parameterName: 'DENGUE ELISA (NS1Ag)', 
        referenceRange: 'NON-REACTIVE', 
        unit: '-', 
        groupName: 'DENGUE PROFILE (IgG & IgM ANTIBODY & NS1 ANTIGEN) BY ELISA SERUM' 
      },
      { 
        testId: dengueTest.id, 
        parameterName: 'DENGUE ELISA (IgG)', 
        referenceRange: 'NON-REACTIVE', 
        unit: '-', 
        groupName: 'DENGUE PROFILE (IgG & IgM ANTIBODY & NS1 ANTIGEN) BY ELISA SERUM' 
      },
      { 
        testId: dengueTest.id, 
        parameterName: 'DENGUE ELISA (IgM)', 
        referenceRange: 'NON-REACTIVE', 
        unit: '-', 
        groupName: 'DENGUE PROFILE (IgG & IgM ANTIBODY & NS1 ANTIGEN) BY ELISA SERUM' 
      },
      { 
        testId: dengueTest.id, 
        parameterName: 'DENGUE INTERPRETATION & COMMENTS', 
        referenceRange: '-', 
        unit: '-', 
        groupName: 'INTERPRETATION' 
      }
    ]
  });

  console.log('Upserted Dengue Profile Test.');
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
