
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
        select: { id: true, name: true, isActive: true, price: true }
    });
    console.log('Plans:', plans);
  } catch (error) {
    console.error('Error checking DB:', error);
  } finally {
    await prisma.$disconnect();
  }
}

check();
