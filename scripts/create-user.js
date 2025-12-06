/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🔄 Creating user...');

    // Delete existing user with this email
    await prisma.user.deleteMany({
      where: { email: 'admin@xeno.com' }
    });

    // Hash password
    const hashedPassword = await bcrypt.hash('password123', 10);

    console.log('🔐 Hashed password:', hashedPassword.substring(0, 30) + '...');

    // Create user
    const user = await prisma.user.create({
      data: {
        email: 'admin@xeno.com',
        password: hashedPassword,
        name: 'Admin User',
        tenantId: 'cmiox4f90000069tly9xty8o1'
      }
    });

    console.log('\n✅ User created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:', user.email);
    console.log('🔑 Password: password123');
    console.log('👤 Name:', user.name);
    console.log('🏪 TenantId:', user.tenantId);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\nYou can now login at: http://localhost:3000/login');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();