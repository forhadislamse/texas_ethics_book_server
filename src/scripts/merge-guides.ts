import * as fs from 'fs';
import * as path from 'path';

interface Metadata {
  addedBy?: string;
  practiceNotes?: string;
  agOpinions?: string;
  crossReferences?: string;
  caseLaw?: string;
  ethicsOpinions?: string;
}

interface Section {
  number: string;
  title: string;
  content: string;
  metadata: Metadata;
  subChapter: string | null;
}

interface Chapter {
  number: string;
  title: string;
  code?: string;
  titleLevel?: string;
  subtitleLevel?: string;
  sections: Section[];
  order?: number;
  isLocked?: boolean;
}

const v3Path = path.join(process.cwd(), 'structured_guide_v3.json');
const v4Path = path.join(process.cwd(), 'structured_guide_v4.json');
const v5Path = path.join(process.cwd(), 'structured_guide_v5.json');

const v4CorrectNumbers = new Set([
  '8', '10', '12', '13', '16', '18', '20', '22', '24', '26', '28', '34', '40', '45', '46', '50'
]);

function merge() {
  console.log('Loading v3 and v4...');
  const v3: Chapter[] = JSON.parse(fs.readFileSync(v3Path, 'utf8'));
  const v4: Chapter[] = JSON.parse(fs.readFileSync(v4Path, 'utf8'));

  console.log(`v3 Chapters: ${v3.length}`);
  console.log(`v4 Chapters: ${v4.length}`);

  const v4Map = new Map<string, Chapter>();
  v4.forEach(ch => v4Map.set(ch.number, ch));

  const result: Chapter[] = v3.map(ch3 => {
    if (v4CorrectNumbers.has(ch3.number)) {
      const ch4 = v4Map.get(ch3.number);
      if (ch4) {
        console.log(`Updating Chapter ${ch3.number} from v4 (keeping v3 metadata)`);
        // We take sections and title from v4, but keep metadata from v3
        return {
          ...ch3, // Keep code, titleLevel, subtitleLevel, order, isLocked from v3
          title: ch4.title,
          sections: ch4.sections
        };
      } else {
        console.warn(`Chapter ${ch3.number} marked as v4-correct but not found in v4!`);
        return ch3;
      }
    }
    return ch3;
  });

  console.log('Writing to v5...');
  fs.writeFileSync(v5Path, JSON.stringify(result, null, 2));
  console.log('Done! Merged data saved to structured_guide_v5.json');
}

merge();
