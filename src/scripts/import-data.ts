import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

// Helper to extract internal and external references from text
function extractReferences(text: string) {
    const internalRefs: { linkText: string; popupTitle: string; popupExcerpt: string }[] = [];
    const externalRefs: { linkText: string; url: string }[] = [];

    if (!text) return { internalRefs, externalRefs };

    // 1. Extract Internal References (e.g., "Section 556.002", "Sec. 1.05", "Chapter 556")
    // This regex looks for "Section", "Sec.", or "Chapter" followed by numbers/dots
    const internalRegex = /(?:Section|Sec\.|Chapter)\s+\d+(?:\.\d+)?/gi;
    const internalMatches = text.match(internalRegex);

    if (internalMatches) {
        // Remove duplicates to avoid redundant popups for the same exact keyword phrase in one section
        const uniqueMatches = [...new Set(internalMatches)];
        
        uniqueMatches.forEach(match => {
            internalRefs.push({
                linkText: match,
                popupTitle: `Reference: ${match}`,
                popupExcerpt: `This is a cross-reference to ${match} found within the text. Click to view full details.`
            });
        });
    }

    // 2. Extract External References (URLs)
    const urlRegex = /(https?:\/\/[^\s\)]+)/g;
    const urlMatches = text.match(urlRegex);

    if (urlMatches) {
        const uniqueUrls = [...new Set(urlMatches)];
        
        uniqueUrls.forEach(url => {
            // Clean up trailing punctuation if caught in regex
            const cleanUrl = url.replace(/[.,;:]$/, '');
            externalRefs.push({
                linkText: cleanUrl,
                url: cleanUrl
            });
        });
    }

    return { internalRefs, externalRefs };
}

async function importData() {
    try {
        const filePath = 'structured_guide_v3.json';
        if (!fs.existsSync(filePath)) {
            console.error(`Error: File ${filePath} not found. Please run parse-text.ts first.`);
            return;
        }

        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        console.log(`Loaded ${data.length} chapters from JSON.`);

        // Clear existing data (use with caution)
        console.log('Clearing existing data from Guide models...');
        await prisma.internalRef.deleteMany({});
        await prisma.externalRef.deleteMany({});
        await prisma.section.deleteMany({});
        await prisma.chapter.deleteMany({});

        let chapterOrder = 0;
        for (const chData of data) {
            if (!chData.sections || chData.sections.length === 0) {
                console.log(`Skipping empty chapter: ${chData.number} - ${chData.title}`);
                continue;
            }

            console.log(`Importing Chapter ${chData.number}: ${chData.title}`);
            
            // Using upsert to handle uniqueness smoothly, though we just deleted all
            const chapter = await prisma.chapter.upsert({
                where: { number: chData.number },
                update: {}, // if exists, do nothing or update order
                create: {
                    number: chData.number,
                    title: chData.title,
                    order: chapterOrder++,
                    isLocked: true // Default all to locked
                }
            });

            let sectionOrder = 0;
            for (const secData of chData.sections) {
                
                // Combine all text to extract references
                const fullText = [
                    secData.content,
                    secData.metadata?.practiceNotes,
                    secData.metadata?.ethicsOpinions,
                    secData.metadata?.caseLaw,
                    secData.metadata?.agOpinions,
                    secData.metadata?.crossReferences
                ].filter(Boolean).join(' ');

                const { internalRefs, externalRefs } = extractReferences(fullText);

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
                        order: sectionOrder++,
                        
                        // Create nested records directly
                        internalRefs: {
                            create: internalRefs
                        },
                        externalRefs: {
                            create: externalRefs
                        }
                    }
                });
            }
            console.log(`  Imported ${chData.sections.length} sections for Chapter ${chData.number}.`);
        }

        console.log('Import completed successfully!');
        console.log('Check your database to see the generated InternalRef and ExternalRef records.');
    } catch (error) {
        console.error('Error importing data:', error);
    } finally {
        await prisma.$disconnect();
    }
}

importData();
