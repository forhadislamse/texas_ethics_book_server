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

    // TOC skipping logic: we look for indicators of body content
    let inTOC = true;

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        if (!line) continue;

        // Skip Page Headers & Footers & Page Numbers
        if (line.match(/^-- \d+ of \d+ --$/)) continue;
        if (line === 'T E X A S E T H I C S L A W S') continue;
        if (line === 'TEC Rules') continue;
        if (line.match(/^Ch\.\s+\d+$/i)) continue;
        if (line === 'Government Code') continue;
        if (line === 'Election Code') continue;
        if (line === 'Penal Code') continue;
        if (line === 'Local Government Code') continue;
        if (line.match(/^\d+$/)) continue; // Page number alone
        
        // Skip common roman numeral page numbers if they appear alone
        const romanNumerals = ['xi', 'xii', 'xiii', 'xiv', 'xv', 'xvi', 'xvii', 'xviii', 'xix', 'xx', 'xxi', 'xxii', 'xxiii', 'xxiv', 'xxv', 'xxvi', 'xxvii', 'xxviii', 'xxix', 'xxx', 'xxxi', 'xxxii'];
        if (romanNumerals.includes(line.toLowerCase())) continue;

        // Transition logic for multiple TOCs
        // If we see a line that looks like a TOC entry (dots followed by number), we might have entered a TOC
        if (line.includes('. . .') || line.match(/\.\s+\d+$/)) {
            inTOC = true;
            continue;
        }

        // If we were in TOC and find a section start or a clear chapter header, we exit TOC mode
        // Body Chapters usually start with CHAPTER X. 
        // Body Sections start with Sec. X.Y or § X.Y
        const potentialChapter = line.match(/^CHAPTER\s+(\d+)\.\s+(.*)$/i);
        const potentialSection = line.match(/^(?:Sec\.|┬º)\s+(\d+(?:\.\d+)?)\.\s+(.*)$/i);

        if (inTOC) {
            if (potentialSection || (potentialChapter && !line.includes('. . .'))) {
                inTOC = false;
                // fall through to process this line
            } else {
                continue;
            }
        }

        // Detect Chapter
        if (potentialChapter && !line.includes('. . .')) {
            // New Chapter Found
            currentChapter = {
                number: potentialChapter[1],
                title: potentialChapter[2],
                sections: []
            };

            // Handle Multi-line Chapter Title
            let nextLineIndex = i + 1;
            while (nextLineIndex < lines.length) {
                const nextLine = lines[nextLineIndex].trim();
                // Continuation criteria: Uppercase, not a section, not a separator, not empty
                if (nextLine &&
                    nextLine === nextLine.toUpperCase() &&
                    !nextLine.match(/^(?:Sec\.|┬º)\s+\d+/i) &&
                    !nextLine.match(/^CHAPTER\s+\d+/i) &&
                    !nextLine.match(/^-- \d+ of \d+ --$/) &&
                    !nextLine.match(/^\d+$/) &&
                    nextLine.length > 2) {
                    currentChapter.title += ' ' + nextLine;
                    i = nextLineIndex;
                    nextLineIndex++;
                } else {
                    break;
                }
            }

            chapters.push(currentChapter);
            currentSection = null;
            collectionMode = 'none';
            continue;
        }

        // Detect Section (Pattern: Sec. 556.001. or § 6.1.)
        const sectionMatch = line.match(/^(?:Sec\.|┬º)\s+(\d+(?:\.\d+)?)\.\s+(.*)$/i);
        if (sectionMatch) {
            if (!currentChapter) {
                const inferredChapterNum = sectionMatch[1].split('.')[0];
                currentChapter = {
                    number: inferredChapterNum,
                    title: `CHAPTER ${inferredChapterNum}`,
                    sections: []
                };
                chapters.push(currentChapter);
            }

            currentSection = {
                number: sectionMatch[1],
                title: sectionMatch[2],
                content: '',
                metadata: {}
            };

            // Handle Multi-line Section Title
            let nextLineIndex = i + 1;
            while (nextLineIndex < lines.length) {
                const nextLine = lines[nextLineIndex].trim();
                // If next line is all caps and not a new section/chapter/metadata heading
                if (nextLine &&
                    nextLine === nextLine.toUpperCase() &&
                    !nextLine.match(/^(?:Sec\.|┬º)\s+\d+/i) &&
                    !nextLine.match(/^CHAPTER\s+\d+/i) &&
                    !nextLine.match(/^-- \d+ of \d+ --$/) &&
                    !['PRACTICE NOTE', 'CROSS REFERENCE', 'CROSS -REFERENCE', 'CASE LAW', 'ATTORNEY GENERAL OPINIONS', 'ETHICS COMMISSION OPINIONS', 'ADDED BY'].some(m => nextLine.includes(m))) {
                    currentSection.title += ' ' + nextLine;
                    i = nextLineIndex;
                    nextLineIndex++;
                } else {
                    break;
                }
            }

            currentChapter.sections.push(currentSection);
            collectionMode = 'content';
            continue;
        }

        // Detect Metadata Sub-headings
        const lowerLine = line.toLowerCase().replace(/\s+/g, '');
        if (lowerLine === 'practicenotes' || lowerLine === 'practicenote') {
            collectionMode = 'practiceNotes';
            if (currentSection) currentSection.metadata.practiceNotes = '';
            continue;
        } else if (lowerLine === 'attorneygeneralopinions' || lowerLine === 'attorneygeneralopinion') {
            collectionMode = 'agOpinions';
            if (currentSection) currentSection.metadata.agOpinions = '';
            continue;
        } else if (lowerLine === 'crossreference' || lowerLine === 'cross-reference') {
            collectionMode = 'crossReference';
            if (currentSection) currentSection.metadata.crossReferences = '';
            continue;
        } else if (lowerLine === 'caselaw') {
            collectionMode = 'caseLaw';
            if (currentSection) currentSection.metadata.caseLaw = '';
            continue;
        } else if (lowerLine === 'ethicscommissionopinions' || lowerLine === 'ethicscommissionopinion') {
            collectionMode = 'ethicsOpinions';
            if (currentSection) currentSection.metadata.ethicsOpinions = '';
            continue;
        }

        // Detect "Added by..."
        if (line.toLowerCase().startsWith('added by acts')) {
            if (currentSection) {
                currentSection.metadata.addedBy = (currentSection.metadata.addedBy || '') + ' ' + line;
                collectionMode = 'none'; // Stop collecting content/metadata for this section usually
            }
            continue;
        }

        // Collect text based on mode
        if (currentSection) {
            // Prevent common footer/header noise from leaking into content if possible
            if (line.match(/^-- \d+ of \d+ --$/) || line.match(/^Ch\.\s+\d+$/i)) continue;

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

    // Post-process cleanup
    chapters.forEach(ch => {
        ch.title = ch.title.trim().replace(/\s+/g, ' ');
        ch.sections.forEach(sec => {
            sec.title = sec.title.trim().replace(/\s+/g, ' ');
            sec.content = sec.content.trim().replace(/\s+/g, ' ');
            if (sec.metadata.practiceNotes) sec.metadata.practiceNotes = sec.metadata.practiceNotes.trim().replace(/\s+/g, ' ');
            if (sec.metadata.agOpinions) sec.metadata.agOpinions = sec.metadata.agOpinions.trim().replace(/\s+/g, ' ');
            if (sec.metadata.caseLaw) sec.metadata.caseLaw = sec.metadata.caseLaw.trim().replace(/\s+/g, ' ');
            if (sec.metadata.ethicsOpinions) sec.metadata.ethicsOpinions = sec.metadata.ethicsOpinions.trim().replace(/\s+/g, ' ');
            if (sec.metadata.crossReferences) sec.metadata.crossReferences = sec.metadata.crossReferences.trim().replace(/\s+/g, ' ');
            if (sec.metadata.addedBy) sec.metadata.addedBy = sec.metadata.addedBy.trim().replace(/\s+/g, ' ');
        });
    });

    // Deduplicate and keep most complete
    const chapterMap = new Map<string, Chapter>();
    chapters.forEach(ch => {
        if (!chapterMap.has(ch.number) || ch.sections.length > (chapterMap.get(ch.number)?.sections.length || 0)) {
            chapterMap.set(ch.number, ch);
        }
    });

    const cleanChapters = Array.from(chapterMap.values()).filter(ch => ch.sections.length > 0);

    fs.writeFileSync('structured_guide_v3.json', JSON.stringify(cleanChapters, null, 2));
    console.log(`Parsed ${cleanChapters.length} valid chapters.`);
    console.log(`Total sections: ${cleanChapters.reduce((acc, ch) => acc + ch.sections.length, 0)}`);
    console.log('Saved to structured_guide_v3.json');
}

parseText();

