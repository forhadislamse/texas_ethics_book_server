
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function inspectContent() {
  try {
    const sections = await prisma.section.findMany({
        take: 5,
        select: { id: true, number: true, title: true, content: true }
    });
    
    console.log('--- Database Content Inspection ---');
    sections.forEach(s => {
        console.log(`\nSection: ${s.number} - ${s.title}`);
        console.log(`Content Preview (first 500 chars):`);
        console.log(s.content?.substring(0, 500));
        console.log('-----------------------------------');
    });
  } catch (error) {
    console.error('Error inspecting DB:', error);
  } finally {
    await prisma.$disconnect();
  }
}

inspectContent();
