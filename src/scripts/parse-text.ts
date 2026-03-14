
import fs from 'fs';

interface Section {
    number: string;
    title: string;
    content: string;
    metadata: {
        practiceNotes?: string;
        agOpinions?: string;
        crossReferences?: string;
        caseLaw?: string;
        ethicsOpinions?: string;
        addedBy?: string;
    };
}

interface Chapter {
    number: string;
    title: string;
    sections: Section[];
}

function parseText() {
    const text = fs.readFileSync('pdf_text_utf8.txt', 'utf-8');
    const lines = text.split('\n');
    
    const chapters: Chapter[] = [];
    let currentChapter: Chapter | null = null;
    let currentSection: Section | null = null;
    
    // Tracking what we are currently collecting
    let collectionMode: 'content' | 'practiceNotes' | 'agOpinions' | 'crossReference' | 'caseLaw' | 'ethicsOpinions' | 'none' = 'none';

    // Start parsing only after we reach the body
    let bodyStarted = false;

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        if (!line) continue;

        // Skip obvious page headers/metadata
        if (line.match(/^-- \d+ of \d+ --$/)) continue;
        if (line === 'T E X A S E T H I C S L A W S') continue;
        if (line.match(/^Ch\.\s+\d+$/)) continue;
        if (line === 'Government Code') continue;
        if (line === 'Election Code') continue;
        if (line === 'Penal Code') continue;
        if (line === 'Local Government Code') continue;
        if (line.match(/^\d+$/)) continue; // Page number at bottom/top

        // Detect body start
        if (!bodyStarted) {
            if (line.includes('Sec. 556.001. DEFINITIONS')) {
                bodyStarted = true;
            } else {
                continue;
            }
        }

        // Detect Chapter
        // Chapters in body have different format: CHAPTER 556. ...
        const chapterMatch = line.match(/^CHAPTER\s+(\d+)\.\s+(.*)$/i);
        if (chapterMatch) {
            currentChapter = {
                number: chapterMatch[1],
                title: chapterMatch[2],
                sections: []
            };
            chapters.push(currentChapter);
            currentSection = null;
            collectionMode = 'none';
            continue;
        }

        // Detect Section (e.g., Sec. 556.001. DEFINITIONS)
        const sectionMatch = line.match(/^Sec\.\s+(\d+\.\d+)\.\s+(.*)$/i);
        if (sectionMatch && currentChapter) {
            currentSection = {
                number: sectionMatch[1],
                title: sectionMatch[2],
                content: '',
                metadata: {}
            };
            currentChapter.sections.push(currentSection);
            collectionMode = 'content';
            continue;
        }

        // Detect Sub-headings (Metadata)
        const lowerLine = line.toLowerCase();
        if (lowerLine === 'practice notes') {
            collectionMode = 'practiceNotes';
            if (currentSection) currentSection.metadata.practiceNotes = '';
            continue;
        } else if (lowerLine === 'attorney general opinions') {
            collectionMode = 'agOpinions';
            if (currentSection) currentSection.metadata.agOpinions = '';
            continue;
        } else if (lowerLine === 'cross reference') {
            collectionMode = 'crossReference';
            if (currentSection) currentSection.metadata.crossReferences = '';
            continue;
        } else if (lowerLine === 'case law') {
            collectionMode = 'caseLaw';
            if (currentSection) currentSection.metadata.caseLaw = '';
            continue;
        } else if (lowerLine === 'ethics commission opinions') {
            collectionMode = 'ethicsOpinions';
            if (currentSection) currentSection.metadata.ethicsOpinions = '';
            continue;
        }

        // Detect "Added by..." which is usually at the end of content
        if (line.startsWith('Added by Acts')) {
            if (currentSection) {
                currentSection.metadata.addedBy = line;
                collectionMode = 'none'; // End of core content
            }
            continue;
        }

        // Collect text based on mode
        if (currentSection) {
            switch (collectionMode) {
                case 'content':
                    currentSection.content += line + ' ';
                    break;
                case 'practiceNotes':
                    currentSection.metadata.practiceNotes += line + ' ';
                    break;
                case 'agOpinions':
                    currentSection.metadata.agOpinions += line + ' ';
                    break;
                case 'crossReference':
                    currentSection.metadata.crossReferences += line + ' ';
                    break;
                case 'caseLaw':
                    currentSection.metadata.caseLaw += line + ' ';
                    break;
                case 'ethicsOpinions':
                    currentSection.metadata.ethicsOpinions += line + ' ';
                    break;
            }
        }
    }

    // Post-process to trim text and handle multi-line titles if needed
    chapters.forEach(ch => {
        ch.sections.forEach(sec => {
            sec.content = sec.content.trim();
            if (sec.metadata.practiceNotes) sec.metadata.practiceNotes = sec.metadata.practiceNotes.trim();
            if (sec.metadata.agOpinions) sec.metadata.agOpinions = sec.metadata.agOpinions.trim();
            if (sec.metadata.caseLaw) sec.metadata.caseLaw = sec.metadata.caseLaw.trim();
            // ... etc
        });
    });

    fs.writeFileSync('structured_guide_v2.json', JSON.stringify(chapters, null, 2));
    console.log(`Parsed ${chapters.length} chapters.`);
    console.log('Saved to structured_guide_v2.json');
}

parseText();
