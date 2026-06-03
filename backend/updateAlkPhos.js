const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Updating ALK-PHOSPHATASE reference range...');

  await prisma.testParameter.updateMany({
    where: { parameterName: 'ALK- PHOSPHATASE (Kind & King’s Method)' },
    data: { referenceRange: '54-369' }
  });

  console.log('Successfully updated Alk Phos reference range to 54-369.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
