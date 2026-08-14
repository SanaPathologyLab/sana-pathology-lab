const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // List all users / staff with login credentials
  const users = await prisma.user.findMany({
    select: { id: true, email: true, role: true, createdAt: true }
  }).catch(() => []);
  
  const staffWithLogin = await prisma.staff.findMany({
    select: { id: true, staffId: true, name: true, role: true, loginEmail: true }
  }).catch(() => []);

  console.log('\n=== USERS TABLE ===');
  console.log(JSON.stringify(users, null, 2));
  
  console.log('\n=== STAFF WITH LOGINS ===');
  console.log(JSON.stringify(staffWithLogin, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
