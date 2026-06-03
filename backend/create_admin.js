const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@sanapathology.com' },
    update: { password },
    create: {
      email: 'admin@sanapathology.com',
      password,
      name: 'Sana Pathology Admin',
      role: 'ADMIN',
    },
  });

  console.log('✅ Admin user created/updated:');
  console.log('   Email:', admin.email);
  console.log('   Password: admin123');
  console.log('   Role:', admin.role);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
