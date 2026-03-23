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
    subChapter?: string | null;
}

interface Chapter {
    number: string;
    title: string;
    code?: string;
    titleLevel?: string;
    subtitleLevel?: string;
    sections: Section[];
    order?: number;
}

function parseText() {
    const text = fs.readFileSync('pdf_text_utf8.txt', 'utf-8');
    const lines = text.split('\n');

    const chapters: Chapter[] = [];
    let currentChapter: Chapter | null = null;
    let currentSection: Section | null = null;
    let collectionMode: 'content' | 'practiceNotes' | 'agOpinions' | 'crossReference' | 'caseLaw' | 'ethicsOpinions' | 'none' = 'none';

    let lastCode = "";
    let lastTitleLevel = "";
    let lastSubtitleLevel = "";

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        if (!line) continue;

        if (line.match(/^-- \d+ of \d+ --$/)) continue;
        if (line === 'T E X A S E T H I C S L A W S' || line === 'TEC Rules') continue;
        if (line.match(/^\d+$/)) continue;

        // Robust Metadata detection (Mixed Case allowed)
        if (line.toUpperCase().includes('CODE') && line.length < 50) { lastCode = line.replace(/Prohibited$/, '').trim(); }
        else if (line.toUpperCase().startsWith('TITLE ') && line.length < 100) { lastTitleLevel = line.replace(/--before.*$/, '').trim(); }
        else if (line.toUpperCase().startsWith('SUBTITLE ') && line.length < 100) { lastSubtitleLevel = line.replace(/I C S L$/, '').trim(); }

        const potentialChapter = line.match(/^CHAPTER\s+(\d+)\.\s+(.*)$/i);
        if (potentialChapter && !line.includes('. . .')) {
            currentChapter = {
                number: potentialChapter[1],
                title: potentialChapter[2],
                code: lastCode,
                titleLevel: lastTitleLevel,
                subtitleLevel: lastSubtitleLevel,
                sections: []
            };
            let nextIdx = i + 1;
            while (nextIdx < lines.length) {
                const nl = lines[nextIdx].trim();
                if (nl && nl === nl.toUpperCase() && !nl.match(/^(?:Sec\.|┬º|CHAPTER)/i) && nl.length > 2) {
                    currentChapter.title += ' ' + nl; i = nextIdx; nextIdx++;
                } else break;
            }
            chapters.push(currentChapter);
            currentSection = null;
            continue;
        }

        const sectionMatch = line.match(/^(?:Sec\.|┬º)\s+(\d+(?:\.\d+)?)\.\s+(.*)$/i);
        if (sectionMatch) {
            if (!currentChapter) continue; 
            currentSection = { number: sectionMatch[1], title: sectionMatch[2], content: '', metadata: {} };
            let nextIdx = i + 1;
            while (nextIdx < lines.length) {
                const nl = lines[nextIdx].trim();
                if (nl && nl === nl.toUpperCase() && !nl.match(/^(?:Sec\.|┬º|CHAPTER)/i) && 
                    !['PRACTICE', 'CROSS', 'CASE', 'ATTORNEY', 'ETHICS', 'ADDED'].some(kw => nl.includes(kw))) {
                    currentSection.title += ' ' + nl; i = nextIdx; nextIdx++;
                } else break;
            }
            currentChapter.sections.push(currentSection);
            collectionMode = 'content';
            continue;
        }

        const low = line.toLowerCase().replace(/\s+/g, '');
        if (low === 'practicenotes' || low === 'practicenote') { collectionMode = 'practiceNotes'; currentSection && (currentSection.metadata.practiceNotes = ''); continue; }
        if (low === 'attorneygeneralopinions' || low === 'attorneygeneralopinion') { collectionMode = 'agOpinions'; currentSection && (currentSection.metadata.agOpinions = ''); continue; }
        if (low === 'crossreference' || low === 'cross-reference') { collectionMode = 'crossReference'; currentSection && (currentSection.metadata.crossReferences = ''); continue; }
        if (low === 'caselaw') { collectionMode = 'caseLaw'; currentSection && (currentSection.metadata.caseLaw = ''); continue; }
        if (low === 'ethicscommissionopinions' || low === 'ethicscommissionopinion') { collectionMode = 'ethicsOpinions'; currentSection && (currentSection.metadata.ethicsOpinions = ''); continue; }
        if (line.toLowerCase().startsWith('added by acts')) { if (currentSection) currentSection.metadata.addedBy = (currentSection.metadata.addedBy || '') + ' ' + line; collectionMode = 'none'; continue; }

        if (currentSection) {
            switch (collectionMode) {
                case 'content': currentSection.content += line + ' '; break;
                case 'practiceNotes': currentSection.metadata.practiceNotes += line + ' '; break;
                case 'agOpinions': currentSection.metadata.agOpinions += line + ' '; break;
                case 'crossReference': currentSection.metadata.crossReferences += line + ' '; break;
                case 'caseLaw': currentSection.metadata.caseLaw += line + ' '; break;
                case 'ethicsOpinions': currentSection.metadata.ethicsOpinions += line + ' '; break;
            }
        }
    }

    const chapterMap = new Map<string, Chapter>();
    let orderNum = 0;
    chapters.forEach(ch => {
        ch.title = ch.title.trim().replace(/\s+/g, ' ');
        ch.order = orderNum++;
        ch.sections.forEach(sec => {
            sec.title = sec.title.trim().replace(/\s+/g, ' ');
            sec.content = sec.content.trim().replace(/\s+/g, ' ');
        });
        if (!chapterMap.has(ch.number) || ch.sections.length > (chapterMap.get(ch.number)?.sections.length || 0)) {
            chapterMap.set(ch.number, ch);
        }
    });

    const cleanChapters = Array.from(chapterMap.values()).filter(ch => ch.sections.length > 0);
    fs.writeFileSync('structured_guide_v3.json', JSON.stringify(cleanChapters, null, 2));
    console.log(`Parsed ${cleanChapters.length} valid chapters. Total sections: ${cleanChapters.reduce((acc, ch) => acc + ch.sections.length, 0)}`);
}
parseText();
