import { clusterAtTime } from "@/lib/hebrew-phones";
import raw from "@/lib/genesis-1-5.json";
import audioRaw from "@/lib/tanakh-audio.json";
import { shuffle } from "@/lib/vocab";

type GenesisDump = {
  heSource: string;
  enSource: string;
  chapters: Record<string, Array<{ v: number; he: string; en: string; words: string[] }>>;
};

const data = raw as GenesisDump;

type ChapterAudio = { src: string; duration: number; verses: number[]; words?: number[][] };
const AUDIO = audioRaw as Record<string, ChapterAudio>;

export const AUDIO_CREDIT =
  "Hebrew reading: Abraham Shmuelof (chapter recordings). English: World English Bible (public domain). Hebrew text: Westminster Leningrad Codex (public domain).";

export const READ_RATES = [
  { value: 0.7, label: "Slow" },
  { value: 1, label: "Recorded" },
  { value: 1.25, label: "Faster" },
] as const;

export type MediaClock = { media: number; wall: number; rate: number };

/** Highlight sits this far ahead of the playhead so the mark is on the word as it is spoken. */
export const HIGHLIGHT_LEAD = 0.14;

/** Media-time for highlighting. Independent of Slow / Recorded / Faster wall clock. */
export function mediaClockTime(
  currentTime: number,
  paused: boolean,
  clock: MediaClock,
  now: number,
  duration = 0,
): number {
  if (paused || clock.rate <= 0) return currentTime;
  const interpolated = clock.media + ((now - clock.wall) / 1000) * clock.rate;
  // Never sit behind the element or the wall clock — iOS currentTime often lags.
  const t = Math.max(currentTime, interpolated);
  const cap = duration > 0 ? duration : Number.POSITIVE_INFINITY;
  return Math.min(cap, Math.max(0, t));
}

export function formatPlayTime(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) sec = 0;
  const s = Math.floor(sec);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

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

export function chapterAudio(chapter: number): ChapterAudio | undefined {
  return AUDIO[String(chapter)];
}

export function verseStartTime(chapter: number, verse: number): number {
  const starts = chapterAudio(chapter)?.verses;
  if (!starts?.length) return 0;
  return starts[Math.max(0, Math.min(starts.length, verse) - 1)] ?? 0;
}

/** Verse number (1-based) for a playback time in that chapter’s MP3. */
export function verseAtTime(chapter: number, time: number): number {
  const starts = chapterAudio(chapter)?.verses ?? [];
  if (!starts.length) return 1;
  let v = 1;
  for (let i = 0; i < starts.length; i++) {
    const prev = i > 0 ? starts[i - 1] : undefined;
    const gap = prev != null ? (starts[i] ?? 0) - prev : 1;
    const lead = Math.min(HIGHLIGHT_LEAD, Math.max(0.04, gap * 0.4));
    if (time + lead >= (starts[i] ?? 0)) v = i + 1;
    else break;
  }
  return v;
}

/** 0-based word index inside a verse for a playback time. */
export function wordAtTime(chapter: number, verse: number, time: number): number {
  const starts = chapterAudio(chapter)?.words?.[Math.max(0, verse - 1)] ?? [];
  if (!starts.length) return 0;
  let w = 0;
  for (let i = 0; i < starts.length; i++) {
    const prev = i > 0 ? starts[i - 1] : undefined;
    const gap = prev != null ? (starts[i] ?? 0) - prev : 1;
    const lead = Math.min(HIGHLIGHT_LEAD, Math.max(0.04, gap * 0.4));
    if (time + lead >= (starts[i] ?? 0)) w = i;
    else break;
  }
  return w;
}

export function wordEndTime(chapter: number, verse: number, word: number): number {
  const meta = chapterAudio(chapter);
  const starts = meta?.words?.[Math.max(0, verse - 1)] ?? [];
  const next = starts[word + 1];
  if (next != null) return next;
  const verses = meta?.verses ?? [];
  const vEnd = verses[verse];
  if (vEnd != null) return vEnd;
  return meta?.duration ?? starts[word] ?? 0;
}

export function clusterAtPlay(chapter: number, verse: number, word: number, time: number, surface: string): number {
  const starts = chapterAudio(chapter)?.words?.[Math.max(0, verse - 1)] ?? [];
  const t0 = starts[word] ?? 0;
  const t1 = wordEndTime(chapter, verse, word);
  const lead = Math.min(HIGHLIGHT_LEAD, Math.max(0.04, (t1 - t0) * 0.2));
  return clusterAtTime(surface, t0, t1, time + lead);
}

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
