
import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function check() {
    const sections = await prisma.section.findMany({
        where: {
            OR: [
                { content: { contains: 'Γ' } },
                { content: { contains: '┬' } }
            ]
        },
        take: 1,
        select: { number: true, content: true }
    });

    if (sections.length > 0) {
        fs.writeFileSync('temp_debug.txt', sections[0].content || '');
        console.log(`Saved Section ${sections[0].number} to temp_debug.txt`);
    } else {
        console.log('No matches found.');
    }
}

check().catch(console.error).finally(() => prisma.$disconnect());
