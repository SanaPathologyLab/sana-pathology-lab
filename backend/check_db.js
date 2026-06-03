const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const tests = await prisma.test.findMany({ include: { parameters: true } });
  console.log('Total tests in DB:', tests.length);
  tests.forEach(t => {
    console.log(`  - [${t.testCode}] ${t.testName} (${t.parameters.length} params)`);
  });
  const categories = await prisma.testCategory.findMany();
  console.log('Total categories:', categories.length);
  categories.forEach(c => console.log(`  - ${c.name}`));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
