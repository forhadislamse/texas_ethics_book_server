import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verify() {
    try {
        const chapterCount = await prisma.chapter.count();
        const sectionCount = await prisma.section.count();
        const internalRefCount = await prisma.internalRef.count();
        const externalRefCount = await prisma.externalRef.count();

        console.log(`Verification Results:`);
        console.log(`Total Chapters: ${chapterCount}`);
        console.log(`Total Sections: ${sectionCount}`);
        console.log(`Total Internal Refs: ${internalRefCount}`);
        console.log(`Total External Refs: ${externalRefCount}`);

        const chapters = await prisma.chapter.findMany({
            orderBy: { order: 'asc' },
            select: { number: true, title: true, order: true }
        });

        console.log('\nChapters in Order:');
        chapters.forEach(ch => {
            console.log(`${ch.order}: Chapter ${ch.number} - ${ch.title}`);
        });

    } catch (error) {
        console.error('Error during verification:', error);
    } finally {
        await prisma.$disconnect();
    }
}

verify();
