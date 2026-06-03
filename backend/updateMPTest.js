const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Updating MP Test reference ranges...');

  const mpTest = await prisma.test.findUnique({
    where: { testCode: 'MP-01' }
  });

  if (!mpTest) {
    console.error('MP Test not found!');
    return;
  }

  await prisma.testParameter.updateMany({
    where: { testId: mpTest.id, parameterName: 'MP ELISA P.f (Antigen)' },
    data: { referenceRange: 'NEGATIVE (Test Card Enclosed)' }
  });

  await prisma.testParameter.updateMany({
    where: { testId: mpTest.id, parameterName: 'MP ELISA P.v (Antigen)' },
    data: { referenceRange: 'NEGATIVE (Test Card Enclosed)' }
  });

  console.log('Successfully updated MP ELISA reference ranges!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
