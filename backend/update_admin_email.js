const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Update the admin email to the lab's real email
  const updated = await prisma.user.update({
    where: { email: 'admin@sanapathology.com' },
    data: { email: 'labsanapathology@gmail.com' }
  });
  
  console.log('✅ Admin email updated successfully!');
  console.log(`Email: ${updated.email}`);
  console.log(`Role:  ${updated.role}`);
  console.log(`\nYou can now login with:`);
  console.log(`  Email:    labsanapathology@gmail.com`);
  console.log(`  Password: admin123`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
