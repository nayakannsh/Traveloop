const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.local' });

const prisma = new PrismaClient();

async function main() {
  try {
    const cols = await prisma.$queryRaw`SELECT column_name FROM information_schema.columns WHERE table_name = 'budgets'`;
    console.log('Columns in budgets table:', cols);
    
    const count = await prisma.budget.count();
    console.log('Budget count:', count);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
