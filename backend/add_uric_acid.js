const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addTest() {
  let category = await prisma.testCategory.findFirst({
    where: { name: { contains: 'Biochem', mode: 'insensitive' } }
  });

  if (!category) {
    category = await prisma.testCategory.findFirst();
  }

  if (!category) {
    category = await prisma.testCategory.create({
      data: { name: 'Biochemistry' }
    });
  }

  const test = await prisma.test.create({
    data: {
      testName: 'S.URIC ACID (Phosphotungstate method)',
      testCode: 'URIC_ACID',
      sampleType: 'SERUM',
      price: 150, // Default price
      categoryId: category.id,
      parameters: {
        create: [
          {
            parameterName: 'S.URIC ACID',
            unit: 'MG/DL',
            referenceRange: 'M-2.5-7.0 F-1.5-6.0'
          }
        ]
      }
    }
  });

  console.log('Test added:', test);
}

addTest()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
