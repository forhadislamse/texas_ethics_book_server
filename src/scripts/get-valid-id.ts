
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
  try {
    const section = await prisma.section.findFirst({
        select: { id: true, number: true, title: true }
    });
    console.log('Valid Section ID:', section?.id);
  } catch (error) {
    console.error('Error checking DB:', error);
  } finally {
    await prisma.$disconnect();
  }
}

check();
