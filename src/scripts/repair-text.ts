
import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

const mapping: Record<string, string> = {
    'ΓÇ£': '“',
    'ΓÇ¥': '”',
    'ΓÇÿ': '‘',
    'ΓÇÖ': '’',
    '┬º': '§',
    '┬⌐': '©',
    'ΓÇô': '–',
    'ΓÇö': '—',
    'ΓÇª': '…',
    '┬ ╜': '½',
    '┬╜': '½',
    '┬ó': '©', // Seen in some variations
};

// Function to repair text using the mapping
function repairText(text: string | null): string | null {
    if (!text) return text;
    let repaired = text;
    for (const [bad, good] of Object.entries(mapping)) {
        repaired = repaired.split(bad).join(good);
    }
    // Handle cases where symbols are partially corrupted or nested
    repaired = repaired.replace(/ΓÇô/g, '–');
    repaired = repaired.replace(/ΓÇö/g, '—');
    repaired = repaired.replace(/ΓÇÿ/g, '‘');
    repaired = repaired.replace(/ΓÇª/g, '…');
    
    return repaired;
}

async function repairDatabase() {
    console.log('--- Starting Database Repair ---');
    
    // Repair Chapters
    const chapters = await prisma.chapter.findMany();
    console.log(`Processing ${chapters.length} chapters...`);
    for (const ch of chapters) {
        const newTitle = repairText(ch.title);
        if (newTitle !== ch.title) {
            await prisma.chapter.update({
                where: { id: ch.id },
                data: { title: newTitle! }
            });
        }
    }

    // Repair Sections
    const sections = await prisma.section.findMany();
    console.log(`Processing ${sections.length} sections...`);
    for (const sec of sections) {
        const data: any = {};
        
        const fields = [
            'title', 'content', 'practiceNotes', 'ethicsOpinions', 
            'caseLaw', 'agOpinions', 'crossReferences', 'addedBy'
        ];

        let hasChange = false;
        for (const field of fields) {
            const original = (sec as any)[field];
            const repaired = repairText(original);
            if (repaired !== original) {
                data[field] = repaired;
                hasChange = true;
            }
        }

        if (hasChange) {
            await prisma.section.update({
                where: { id: sec.id },
                data
            });
        }
    }
    console.log('Database repair completed.');
}

async function repairJson() {
    console.log('--- Starting JSON File Repair ---');
    const filePath = 'structured_guide_v3.json';
    if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        const repaired = repairText(content);
        if (repaired !== content) {
            fs.writeFileSync(filePath, repaired!);
            console.log(`Repaired ${filePath}`);
        } else {
            console.log(`${filePath} already seems clean or no matches found.`);
        }
    } else {
        console.log(`${filePath} not found.`);
    }
}

async function main() {
    try {
        await repairDatabase();
        await repairJson();
        console.log('\nAll repair tasks finished successfully!');
    } catch (error) {
        console.error('Error during repair:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
