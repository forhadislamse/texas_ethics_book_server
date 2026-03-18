
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
  try {
    const planCount = await prisma.subscriptionPlan.count();
    const chapterCount = await prisma.chapter.count();
    const sectionCount = await prisma.section.count();
    const userCount = await prisma.user.count();

    console.log({
      planCount,
      chapterCount,
      sectionCount,
      userCount
    });
  } catch (error) {
    console.error('Error checking DB:', error);
  } finally {
    await prisma.$disconnect();
  }
}

check();
