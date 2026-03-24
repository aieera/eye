import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Admin users
  const adminHash = await bcrypt.hash('Admin@123', 12);
  const admin = await prisma.adminUser.upsert({
    where: { email: 'admin@eye.com' },
    update: {},
    create: {
      email: 'admin@eye.com',
      passwordHash: adminHash,
      name: 'Admin',
      role: 'admin',
    },
  });
  console.log(`Admin user: ${admin.email} (id: ${admin.id})`);

  const superAdminHash = await bcrypt.hash('12345678', 12);
  const superAdmin = await prisma.adminUser.upsert({
    where: { email: 'superadmin@gmail.com' },
    update: {},
    create: {
      email: 'superadmin@gmail.com',
      passwordHash: superAdminHash,
      name: 'Super Admin',
      role: 'admin',
    },
  });
  console.log(`Super Admin user: ${superAdmin.email} (id: ${superAdmin.id})`);

  // 2. Locations
  const locations = [
    { name: 'Dubai Duty Free - Terminal 1', oracleLocationId: '506' },
    { name: 'Dubai Duty Free - Terminal 2', oracleLocationId: '602' },
    { name: 'Dubai Duty Free - Terminal 3', oracleLocationId: '714' },
  ];

  for (const loc of locations) {
    const location = await prisma.location.upsert({
      where: { oracleLocationId: loc.oracleLocationId },
      update: {},
      create: loc,
    });
    console.log(`Location: ${location.name} (oracle: ${location.oracleLocationId})`);
  }

  // 3. Categories
  const categories = [
    { name: 'Electronics', oracleDept: '100', level: 'dept' },
    { name: 'Perfumes & Cosmetics', oracleDept: '200', level: 'dept' },
    { name: 'Food & Beverages', oracleDept: '300', level: 'dept' },
  ];

  for (const cat of categories) {
    const existing = await prisma.category.findFirst({
      where: { oracleDept: cat.oracleDept, level: cat.level },
    });

    if (!existing) {
      const category = await prisma.category.create({ data: cat });
      console.log(`Category: ${category.name} (dept: ${category.oracleDept})`);
    } else {
      console.log(`Category already exists: ${existing.name}`);
    }
  }

  console.log('Seed completed.');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
