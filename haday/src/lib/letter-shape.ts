import { foldLetterGlyph, type HandMatch } from "@/lib/hebrew";

export type InkPoint = { x: number; y: number };
export type InkStroke = InkPoint[];

type Feat = {
  n: number;
  w: number;
  h: number;
  aspect: number;
  closed: number;
  circ: number;
  path: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  tall: boolean;
  wide: boolean;
  square: boolean;
  small: boolean;
};

function dist(a: InkPoint, b: InkPoint): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function analyze(strokes: InkStroke[]): Feat | null {
  const clean = strokes.map((s) => s.filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y))).filter((s) => s.length);
  if (!clean.length) return null;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let path = 0;
  for (const s of clean) {
    for (const p of s) {
      minX = Math.min(minX, p.x);
      minY = Math.min(minY, p.y);
      maxX = Math.max(maxX, p.x);
      maxY = Math.max(maxY, p.y);
    }
    for (let i = 1; i < s.length; i++) path += dist(s[i - 1], s[i]);
  }
  const w = Math.max(1, maxX - minX);
  const h = Math.max(1, maxY - minY);
  const longest = clean.reduce((a, b) => (a.length >= b.length ? a : b));
  const closed = Math.max(0, 1 - dist(longest[0], longest[longest.length - 1]) / Math.max(w, h));
  let area = 0;
  for (let i = 0; i < longest.length; i++) {
    const p = longest[i];
    const q = longest[(i + 1) % longest.length];
    area += p.x * q.y - q.x * p.y;
  }
  area = Math.abs(area) / 2;
  let perim = 0;
  for (let i = 1; i < longest.length; i++) perim += dist(longest[i - 1], longest[i]);
  perim += dist(longest[longest.length - 1], longest[0]);
  const circ = perim > 0 ? Math.min(1.4, (4 * Math.PI * area) / (perim * perim)) : 0;
  const first = clean[0][0];
  const last = clean[clean.length - 1][clean[clean.length - 1].length - 1];
  return {
    n: clean.length,
    w,
    h,
    aspect: w / h,
    closed,
    circ,
    path,
    startX: (first.x - minX) / w,
    startY: (first.y - minY) / h,
    endX: (last.x - minX) / w,
    endY: (last.y - minY) / h,
    tall: h / w > 1.45,
    wide: w / h > 1.35,
    square: w / h > 0.62 && w / h < 1.45,
    small: Math.max(w, h) < 36 && path < 90,
  };
}

type Scorer = (f: Feat) => number;

const SCORES: Record<string, Scorer> = {
  א: (f) => (f.n >= 2 ? 0.35 : 0.1) + (f.tall ? 0.15 : 0) + (f.closed < 0.5 ? 0.2 : 0),
  ב: (f) => (f.closed < 0.55 ? 0.25 : 0) + (f.endX < 0.45 || f.startX < 0.45 ? 0.3 : 0) + (f.n <= 2 ? 0.2 : 0),
  ג: (f) => (f.n <= 2 ? 0.25 : 0) + (f.closed < 0.5 ? 0.25 : 0) + (f.endY > 0.55 ? 0.2 : 0),
  ד: (f) => (f.wide || f.square ? 0.2 : 0) + (f.startY < 0.35 ? 0.25 : 0) + (f.closed < 0.55 ? 0.2 : 0),
  ה: (f) => (f.n >= 2 ? 0.45 : 0.1) + (f.closed < 0.6 ? 0.2 : 0),
  ו: (f) => (f.tall ? 0.45 : 0) + (f.n === 1 ? 0.25 : 0) + (f.small ? 0 : 0.1) + (f.closed < 0.5 ? 0.1 : 0) - (f.circ > 0.45 ? 0.4 : 0),
  ז: (f) => (f.n <= 2 ? 0.25 : 0) + (f.startY < 0.3 ? 0.25 : 0) + (f.closed < 0.5 ? 0.2 : 0),
  ח: (f) => (f.n >= 2 ? 0.4 : 0.15) + (f.square ? 0.2 : 0) + (f.closed > 0.35 ? 0.15 : 0),
  ט: (f) => (f.closed > 0.45 ? 0.3 : 0.1) + (f.square ? 0.2 : 0) + (f.n <= 2 ? 0.2 : 0),
  י: (f) => (f.small ? 0.5 : 0) + (f.n === 1 ? 0.25 : 0) + (f.path < 120 ? 0.15 : 0) - (f.tall && !f.small ? 0.35 : 0),
  כ: (f) => (f.closed < 0.55 ? 0.25 : 0) + (f.n <= 2 ? 0.2 : 0) + (f.circ > 0.25 && f.circ < 0.7 ? 0.2 : 0),
  ך: (f) => (f.tall ? 0.4 : 0) + (f.n <= 2 ? 0.2 : 0) + (f.endY > 0.7 ? 0.2 : 0) - (f.circ > 0.5 ? 0.3 : 0),
  ל: (f) => (f.tall ? 0.4 : 0) + (f.startY < 0.25 ? 0.25 : 0) + (f.n <= 2 ? 0.15 : 0),
  מ: (f) => (f.n <= 2 ? 0.2 : 0) + (f.closed < 0.7 ? 0.25 : 0) + (f.square ? 0.2 : 0) - (f.circ > 0.7 ? 0.25 : 0),
  ם: (f) => (f.closed > 0.72 ? 0.4 : 0.1) + (f.square ? 0.25 : 0) + (f.circ < 0.72 ? 0.2 : 0) - (f.circ > 0.78 ? 0.35 : 0),
  נ: (f) => (f.n <= 2 ? 0.25 : 0) + (f.closed < 0.5 ? 0.25 : 0) + (!f.small && f.aspect < 1.1 ? 0.15 : 0),
  ן: (f) => (f.tall ? 0.45 : 0) + (f.n === 1 ? 0.25 : 0) - (f.circ > 0.45 ? 0.4 : 0) - (f.small ? 0.3 : 0),
  ס: (f) =>
    (f.closed > 0.62 ? 0.4 : f.closed > 0.4 ? 0.2 : 0) +
    (f.circ > 0.45 ? 0.4 : f.circ > 0.28 ? 0.2 : 0) +
    (f.square ? 0.15 : 0) +
    (f.n <= 2 ? 0.1 : 0),
  ע: (f) => (f.n <= 2 ? 0.2 : 0) + (f.closed < 0.65 ? 0.2 : 0) + (f.endY > 0.5 ? 0.15 : 0),
  פ: (f) => (f.closed < 0.6 ? 0.25 : 0) + (f.n <= 2 ? 0.2 : 0),
  ף: (f) => (f.tall ? 0.35 : 0) + (f.n <= 2 ? 0.2 : 0),
  צ: (f) => (f.n <= 3 ? 0.2 : 0) + (f.closed < 0.55 ? 0.2 : 0),
  ץ: (f) => (f.tall ? 0.35 : 0) + (f.n <= 2 ? 0.2 : 0),
  ק: (f) => (f.tall || f.endY > 0.7 ? 0.3 : 0) + (f.n <= 2 ? 0.2 : 0),
  ר: (f) => (f.n === 1 ? 0.25 : 0) + (f.closed < 0.5 ? 0.25 : 0) + (f.startY < 0.35 ? 0.2 : 0),
  ש: (f) => (f.n >= 1 ? 0.15 : 0) + (f.wide || f.square ? 0.2 : 0) + (f.closed < 0.55 ? 0.15 : 0),
  ת: (f) => (f.n <= 3 ? 0.2 : 0) + (f.square || f.wide ? 0.2 : 0) + (f.endX > 0.55 ? 0.15 : 0),
};

function baseLetter(expected: string): string {
  const g = foldLetterGlyph(expected);
  if (g.startsWith("ש")) return "ש";
  return g.replace(/[^\u05D0-\u05EA]/g, "").slice(0, 1);
}

/** Local ink check so a circle for samekh (and similar shapes) can grade without the cloud reader. */
export function verifyLetterInk(strokes: InkStroke[], expected: string): { match: HandMatch; read: string; score: number } {
  const want = baseLetter(expected);
  const feat = analyze(strokes);
  if (!feat || !want) return { match: "empty", read: "", score: 0 };
  const scorer = SCORES[want];
  const score = scorer ? Math.max(0, Math.min(1.2, scorer(feat))) : 0;
  let bestOther = 0;
  let bestId = "";
  for (const [id, fn] of Object.entries(SCORES)) {
    if (id === want) continue;
    const s = fn(feat);
    if (s > bestOther) {
      bestOther = s;
      bestId = id;
    }
  }
  if (score >= 0.55 && score + 0.04 >= bestOther) return { match: "exact", read: want, score };
  if (score >= 0.4 && score + 0.12 >= bestOther) return { match: "close", read: want, score };
  if (bestOther >= 0.55 && bestOther > score + 0.12) return { match: "wrong", read: bestId, score };
  if (score >= 0.32) return { match: "close", read: want, score };
  return { match: "wrong", read: bestId, score };
}
