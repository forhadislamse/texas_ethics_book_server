
import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function importData() {
    try {
        const data = JSON.parse(fs.readFileSync('structured_guide_v2.json', 'utf-8'));
        console.log(`Loaded ${data.length} chapters from JSON.`);

        // Clear existing data (use with caution)
        console.log('Clearing existing chapters and sections...');
        await prisma.section.deleteMany({});
        await prisma.chapter.deleteMany({});

        let chapterOrder = 0;
        for (const chData of data) {
            if (!chData.sections || chData.sections.length === 0) {
                console.log(`Skipping empty chapter: ${chData.number} - ${chData.title}`);
                continue;
            }

            console.log(`Importing Chapter ${chData.number}: ${chData.title}`);
            const chapter = await prisma.chapter.create({
                data: {
                    number: chData.number,
                    title: chData.title,
                    order: chapterOrder++,
                    isLocked: true // Default all to locked
                }
            });

            let sectionOrder = 0;
            for (const secData of chData.sections) {
                await prisma.section.create({
                    data: {
                        chapterId: chapter.id,
                        number: secData.number,
                        title: secData.title,
                        content: secData.content,
                        practiceNotes: secData.metadata.practiceNotes || null,
                        ethicsOpinions: secData.metadata.ethicsOpinions || null,
                        caseLaw: secData.metadata.caseLaw || null,
                        agOpinions: secData.metadata.agOpinions || null,
                        crossReferences: secData.metadata.crossReferences || null,
                        addedBy: secData.metadata.addedBy || null,
                        order: sectionOrder++
                    }
                });
            }
            console.log(`  Imported ${chData.sections.length} sections.`);
        }

        console.log('Import completed successfully!');
    } catch (error) {
        console.error('Error importing data:', error);
    } finally {
        await prisma.$disconnect();
    }
}

importData();
