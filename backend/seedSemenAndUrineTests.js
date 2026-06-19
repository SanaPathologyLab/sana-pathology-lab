const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Semen and Urine Tests...');

  const clinPath = await prisma.testCategory.findFirst({ where: { name: 'Clinical Pathology' } });
  const clinPathId = clinPath ? clinPath.id : 1;

  // 1. Semen Analysis
  const semenTest = await prisma.test.upsert({
    where: { testCode: 'SEMEN-01' },
    update: { testName: 'SEMEN ANALYSIS' },
    create: {
      testName: 'SEMEN ANALYSIS',
      testCode: 'SEMEN-01',
      sampleType: 'Semen',
      price: 350.0,
      categoryId: clinPathId
    }
  });

  await prisma.testParameter.deleteMany({ where: { testId: semenTest.id } });
  
  await prisma.testParameter.createMany({
    data: [
      { testId: semenTest.id, parameterName: 'SEMEN NOTE', referenceRange: '-', unit: '-', groupName: 'NOTE' },
      { testId: semenTest.id, parameterName: 'QUANTITY', referenceRange: '1.5-5.0 AVERAGE 3.5', unit: 'ML', groupName: 'PHYSICAL EXAMINATION' },
      { testId: semenTest.id, parameterName: 'VISCOSITY', referenceRange: 'HIGHLY VISCOUS', unit: '-', groupName: 'PHYSICAL EXAMINATION' },
      { testId: semenTest.id, parameterName: 'COLOR', referenceRange: 'WHITE OR GRAY-WHITE', unit: '-', groupName: 'PHYSICAL EXAMINATION' },
      { testId: semenTest.id, parameterName: 'REACTION', referenceRange: 'ALKALINE', unit: '-', groupName: 'PHYSICAL EXAMINATION' },
      { testId: semenTest.id, parameterName: 'LIQUIFICATION TIME', referenceRange: 'COMPLETED IN 15-30', unit: 'MIN', groupName: 'PHYSICAL EXAMINATION' },
      { testId: semenTest.id, parameterName: 'TOTAL SPERM COUNT', referenceRange: '40-150', unit: 'MILLION/ML', groupName: 'MICROSCOPIC EXAMINATION' },
      { testId: semenTest.id, parameterName: 'ACTIVE MOTILE', referenceRange: '> 70', unit: '%', groupName: 'MOTILITY' },
      { testId: semenTest.id, parameterName: 'SLUGGISH MOTILE', referenceRange: '20', unit: '%', groupName: 'MOTILITY' },
      { testId: semenTest.id, parameterName: 'NON MOTILE', referenceRange: '10', unit: '%', groupName: 'MOTILITY' },
      { testId: semenTest.id, parameterName: 'NORMAL', referenceRange: '> 80', unit: '%', groupName: 'MORPHOLOGY' },
      { testId: semenTest.id, parameterName: 'ABNORMAL', referenceRange: 'UPTO 20', unit: '%', groupName: 'MORPHOLOGY' },
      { testId: semenTest.id, parameterName: 'PUS CELLS', referenceRange: '0-2', unit: '/HPF', groupName: 'CELLS' },
      { testId: semenTest.id, parameterName: 'RBCs', referenceRange: 'NIL', unit: '/HPF', groupName: 'CELLS' }
    ]
  });

  // 2. Urine Examination
  const urineTest = await prisma.test.upsert({
    where: { testCode: 'URINE-01' },
    update: { testName: 'URINE EXAMINATION (ROUTINE & MICROSCOPY)' },
    create: {
      testName: 'URINE EXAMINATION (ROUTINE & MICROSCOPY)',
      testCode: 'URINE-01',
      sampleType: 'Urine',
      price: 150.0,
      categoryId: clinPathId
    }
  });

  await prisma.testParameter.deleteMany({ where: { testId: urineTest.id } });

  await prisma.testParameter.createMany({
    data: [
      { testId: urineTest.id, parameterName: 'COLOUR', referenceRange: 'WHITE', unit: '-', groupName: 'URINE EXAMINATION' },
      { testId: urineTest.id, parameterName: 'TRANSPARENCY', referenceRange: 'TRANSPARENT', unit: '-', groupName: 'URINE EXAMINATION' },
      { testId: urineTest.id, parameterName: 'SPECIFIC GRAVITY', referenceRange: '1015-1025', unit: '-', groupName: 'URINE EXAMINATION' },
      { testId: urineTest.id, parameterName: 'REACTION', referenceRange: 'ACIDIC', unit: '-', groupName: 'URINE EXAMINATION' },
      { testId: urineTest.id, parameterName: 'ALBUMIN', referenceRange: 'ABSENT', unit: 'MG/DL', groupName: 'CHEMICAL EXAMINATION' },
      { testId: urineTest.id, parameterName: 'SUGAR', referenceRange: 'ABSENT', unit: 'MG/DL', groupName: 'CHEMICAL EXAMINATION' },
      { testId: urineTest.id, parameterName: 'BLOOD', referenceRange: 'ABSENT', unit: 'MG/DL', groupName: 'CHEMICAL EXAMINATION' },
      { testId: urineTest.id, parameterName: 'PUS CELLS', referenceRange: '2-4', unit: '/HPF', groupName: 'MICROSCOPIC EXAMNATION' },
      { testId: urineTest.id, parameterName: 'RBCs', referenceRange: 'NIL', unit: '/HPF', groupName: 'MICROSCOPIC EXAMNATION' },
      { testId: urineTest.id, parameterName: 'EPITHILIAL CELLS', referenceRange: '2-4', unit: '/HPF', groupName: 'MICROSCOPIC EXAMNATION' },
      { testId: urineTest.id, parameterName: 'CRYSTALS (CAL OXALATE)', referenceRange: 'NIL', unit: '/HPF', groupName: 'MICROSCOPIC EXAMNATION' }
    ]
  });

  console.log('Upserted Semen Analysis and Urine Examination Tests.');
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
