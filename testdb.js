import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Testing database connection...');
  const tenants = await prisma.tenant.findMany();
  console.log('✅ Database connected! Tenants:', tenants.length);
}

main()
  .catch((e) => console.error('❌ Error:', e))
  .finally(async () => await prisma.$disconnect());