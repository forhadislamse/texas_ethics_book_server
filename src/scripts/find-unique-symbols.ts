
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function findUniqueSymbols() {
    try {
        console.log('Fetching all sections and chapters...');
        const sections = await prisma.section.findMany({
            select: { 
                title: true, 
                content: true, 
                practiceNotes: true, 
                ethicsOpinions: true, 
                caseLaw: true, 
                agOpinions: true, 
                crossReferences: true, 
                addedBy: true 
            }
        });
        const chapters = await prisma.chapter.findMany({
            select: { title: true }
        });

        const nonAsciiRegex = /[^\x00-\x7F]/g;
        const symbolCounts: Record<string, number> = {};

        const addSymbols = (text: string | null) => {
            if (!text) return;
            const matches = text.match(nonAsciiRegex);
            if (matches) {
                matches.forEach(sym => {
                    symbolCounts[sym] = (symbolCounts[sym] || 0) + 1;
                });
            }
        };

        sections.forEach(s => {
            addSymbols(s.title);
            addSymbols(s.content);
            addSymbols(s.practiceNotes);
            addSymbols(s.ethicsOpinions);
            addSymbols(s.caseLaw);
            addSymbols(s.agOpinions);
            addSymbols(s.crossReferences);
            addSymbols(s.addedBy);
        });

        chapters.forEach(c => {
            addSymbols(c.title);
        });

        console.log('--- Unique Non-ASCII Symbols Found ---');
        const sortedSymbols = Object.entries(symbolCounts).sort((a, b) => b[1] - a[1]);
        sortedSymbols.forEach(([sym, count]) => {
            console.log(`${sym} (Hex: ${sym.charCodeAt(0).toString(16)}): ${count} occurrences`);
        });

    } catch (error) {
        console.error('Error finding symbols:', error);
    } finally {
        await prisma.$disconnect();
    }
}

findUniqueSymbols();
