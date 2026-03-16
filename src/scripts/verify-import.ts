
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verify() {
    const chapterCount = await prisma.chapter.count();
    const sectionCount = await prisma.section.count();
    const internalRefCount = await prisma.internalRef.count();
    const externalRefCount = await prisma.externalRef.count();

    console.log(`Verification Results:`);
    console.log(`Chapters: ${chapterCount}`);
    console.log(`Sections: ${sectionCount}`);
    console.log(`Internal References: ${internalRefCount}`);
    console.log(`External References: ${externalRefCount}`);

    // Check a sample section from the "Rules" part
    const sampleSection = await prisma.section.findFirst({
        where: { number: { contains: '6.' } },
        include: { chapter: true }
    });

    if (sampleSection) {
        console.log(`\nSample Rules Section:`);
        console.log(`Chapter: ${sampleSection.chapter.number} - ${sampleSection.chapter.title}`);
        console.log(`Section: ${sampleSection.number} - ${sampleSection.title}`);
        console.log(`Content Preview: ${sampleSection.content.substring(0, 100)}...`);
    }

    await prisma.$disconnect();
}

verify();
