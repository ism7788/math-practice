// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@math-practice.local';
  const adminPassword = process.env.ADMIN_PASSWORD || 'ChangeMe123!';
  const schoolName = process.env.ADMIN_SCHOOL_NAME || 'Math-practice HQ';

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  // Create or fetch the admin user
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash },    // keep existing if already there
    create: {
      email: adminEmail,
      passwordHash,
      name: 'Admin',
    },
  });

  // Create or fetch an HQ school
  let school = await prisma.school.findFirst({ where: { name: schoolName } });
  if (!school) {
    const code = 'HQ' + Math.random().toString(36).slice(2, 8).toUpperCase();
    school = await prisma.school.create({
      data: { name: schoolName, code, createdById: admin.id },
    });
  }

  // Ensure admin membership
  await prisma.schoolMembership.upsert({
    where: { userId_schoolId: { userId: admin.id, schoolId: school.id } },
    update: { role: 'ADMIN' },
    create: { userId: admin.id, schoolId: school.id, role: 'ADMIN' },
  });

  console.log('✅ Seeded admin:', adminEmail);
  console.log('🏫 School:', school.name, '• code:', school.code);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
