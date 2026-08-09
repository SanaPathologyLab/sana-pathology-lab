const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const cbc = await prisma.test.findFirst({
    where: { OR: [{ testCode: 'CBC' }, { testCode: 'CBC-01' }] },
    include: { parameters: { orderBy: { id: 'asc' } } }
  });

  if (!cbc) { console.log('CBC test not found'); return; }
  console.log(`Test: ${cbc.testName} (${cbc.testCode})`);
  console.log('\nParameters:');
  cbc.parameters.forEach(p => {
    console.log(`  "${p.parameterName}" | ref: "${p.referenceRange}" | unit: "${p.unit}"`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
