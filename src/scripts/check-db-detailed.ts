
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
  try {
    const plans = await prisma.subscriptionPlan.findMany();
    console.log('Plans in DB:', JSON.stringify(plans, null, 2));

    const chapters = await prisma.chapter.findMany({ take: 1 });
    console.log('First Chapter:', JSON.stringify(chapters, null, 2));
  } catch (error) {
    console.error('Error checking DB:', error);
  } finally {
    await prisma.$disconnect();
  }
}

check();
