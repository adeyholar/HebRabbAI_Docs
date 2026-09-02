import raw from "@/lib/genesis-1-5.json";
import { shuffle } from "@/lib/vocab";

type GenesisDump = {
  heSource: string;
  enSource: string;
  chapters: Record<string, Array<{ v: number; he: string; en: string; words: string[] }>>;
};

const data = raw as GenesisDump;

export type ReadingVerse = {
  chapter: number;
  verse: number;
  he: string;
  en: string;
  words: string[];
  ref: string;
};

export type ReadingCh = 1 | 2 | 3 | 4 | 5;
export type ReadingKey = ReadingCh | "all";

const KEY = "haday-gen-read-v1";

export const READING_CHAPTERS: ReadingCh[] = [1, 2, 3, 4, 5];

export function parseReadingKey(raw: string | undefined): ReadingKey {
  if (raw === "all") return "all";
  const n = Number(raw);
  if (n >= 1 && n <= 5) return n as ReadingCh;
  return 1;
}

export function readingVerses(key: ReadingKey): ReadingVerse[] {
  const chs = key === "all" ? READING_CHAPTERS : [key];
  const out: ReadingVerse[] = [];
  for (const ch of chs) {
    const rows = (data.chapters as Record<string, Array<{ v: number; he: string; en: string; words: string[] }>>)[String(ch)] ?? [];
    for (const row of rows) {
      out.push({
        chapter: ch,
        verse: row.v,
        he: row.he,
        en: row.en,
        words: row.words,
        ref: `Gen ${ch}:${row.v}`,
      });
    }
  }
  return out;
}

export const READING_CREDIT = {
  he: data.heSource as string,
  en: data.enSource as string,
};

export type GradeItem = {
  id: string;
  verse: ReadingVerse;
  choices: string[];
  answer: string;
};

export function readingGradeQuiz(key: ReadingKey, n = 10): GradeItem[] {
  const verses = readingVerses(key).filter((v) => v.en.length > 8);
  const pool = shuffle(verses).slice(0, Math.min(n, verses.length));
  return pool.map((verse, i) => {
    const others = shuffle(verses.filter((v) => v.ref !== verse.ref).map((v) => v.en)).slice(0, 3);
    const choices = shuffle([verse.en, ...others]);
    return { id: `${verse.ref}:${i}`, verse, choices, answer: verse.en };
  });
}

export type ChapterReadRec = { best: number; cleared: boolean; attempts: number };

export function loadReadingProgress(): Record<string, ChapterReadRec> {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "{}") as Record<string, ChapterReadRec>;
    return raw && typeof raw === "object" ? raw : {};
  } catch {
    return {};
  }
}

export function saveReadingResult(key: ReadingKey, score: number): ChapterReadRec {
  const all = loadReadingProgress();
  const id = String(key);
  const prev = all[id] ?? { best: 0, cleared: false, attempts: 0 };
  const passed = score >= 90;
  const next: ChapterReadRec = {
    best: Math.max(prev.best, score),
    cleared: passed,
    attempts: prev.attempts + 1,
  };
  all[id] = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    /* ignore */
  }
  return next;
}
