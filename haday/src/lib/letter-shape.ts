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
  tall: boolean;
  wide: boolean;
  square: boolean;
  small: boolean;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  leftShare: number;
  topShare: number;
};

function dist(a: InkPoint, b: InkPoint): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function pathOf(s: InkStroke): number {
  let n = 0;
  for (let i = 1; i < s.length; i++) n += dist(s[i - 1], s[i]);
  return n;
}

function analyze(strokes: InkStroke[]): Feat | null {
  const clean = strokes.map((s) => s.filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y))).filter((s) => s.length);
  if (!clean.length) return null;
  const pts = clean.flat();
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
    path += pathOf(s);
  }
  const w = Math.max(1, maxX - minX);
  const h = Math.max(1, maxY - minY);
  const longest = clean.reduce((a, b) => (pathOf(a) >= pathOf(b) ? a : b));
  const closed = Math.max(0, 1 - dist(longest[0], longest[longest.length - 1]) / Math.max(w, h, 1));
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
  const circ = perim > 0 ? Math.min(1.5, (4 * Math.PI * area) / (perim * perim)) : 0;
  const first = clean[0][0];
  const lastS = clean[clean.length - 1];
  const last = lastS[lastS.length - 1];
  let left = 0;
  let top = 0;
  for (const p of pts) {
    if ((p.x - minX) / w < 0.38) left += 1;
    if ((p.y - minY) / h < 0.4) top += 1;
  }
  return {
    n: clean.length,
    w,
    h,
    aspect: w / h,
    closed,
    circ,
    path,
    tall: h / w > 1.38,
    wide: w / h > 1.28,
    square: w / h > 0.55 && w / h < 1.5,
    small: Math.max(w, h) < 42 && path < 105,
    startX: (first.x - minX) / w,
    startY: (first.y - minY) / h,
    endX: (last.x - minX) / w,
    endY: (last.y - minY) / h,
    leftShare: left / pts.length,
    topShare: top / pts.length,
  };
}

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

function baseLetter(expected: string): string {
  const g = foldLetterGlyph(expected);
  if (g.startsWith("ש")) return "ש";
  return g.replace(/[^\u05D0-\u05EA]/g, "").slice(0, 1);
}

function roundLoop(f: Feat): boolean {
  return f.circ > 0.26 && f.closed > 0.3 && f.square;
}
function boxLoop(f: Feat): boolean {
  return f.closed > 0.45 && f.square && f.circ < 0.8;
}
function stick(f: Feat): boolean {
  return f.tall && f.n <= 2 && f.closed < 0.34 && f.circ < 0.28;
}

type Scorer = (f: Feat) => number;

const SCORES: Record<string, Scorer> = {
  א: (f) => (f.n >= 2 ? 0.4 : 0.08) + (f.path > 50 ? 0.2 : 0) + (roundLoop(f) || stick(f) ? -0.5 : 0.15),
  ב: (f) =>
    (f.closed < 0.55 ? 0.25 : -0.2) +
    (f.leftShare < 0.42 ? 0.3 : 0) +
    (f.n <= 2 ? 0.2 : 0) +
    (roundLoop(f) || stick(f) ? -0.45 : 0.1),
  ג: (f) => (f.n <= 2 ? 0.25 : 0) + (f.closed < 0.5 ? 0.25 : 0) + (f.endY > 0.5 ? 0.2 : 0) + (roundLoop(f) ? -0.5 : 0.1),
  ד: (f) => (f.wide || f.square ? 0.2 : 0) + (f.topShare > 0.28 ? 0.25 : 0) + (f.closed < 0.55 ? 0.2 : 0) + (roundLoop(f) || stick(f) ? -0.4 : 0.1),
  ה: (f) => (f.n >= 2 ? 0.45 : 0.05) + (f.closed < 0.65 ? 0.2 : 0) + (roundLoop(f) || stick(f) ? -0.45 : 0.1),
  ו: (f) => (stick(f) ? 0.55 : f.tall ? 0.3 : 0) + (f.n === 1 ? 0.2 : 0) + (f.small ? -0.25 : 0.1) + (roundLoop(f) ? -0.6 : 0.1),
  ז: (f) => (f.n <= 2 ? 0.25 : 0) + (f.topShare > 0.28 ? 0.25 : 0) + (f.closed < 0.5 ? 0.2 : 0) + (roundLoop(f) ? -0.45 : 0.1),
  ח: (f) => (f.n >= 2 ? 0.4 : 0.08) + (f.square ? 0.2 : 0) + (roundLoop(f) || stick(f) ? -0.4 : 0.15),
  ט: (f) => (f.closed > 0.35 ? 0.4 : 0.1) + (f.square ? 0.2 : 0) + (f.n <= 3 ? 0.15 : 0) + (stick(f) ? -0.4 : 0.1),
  י: (f) => (f.small ? 0.6 : 0) + (f.n === 1 ? 0.2 : 0) + (f.path < 120 ? 0.15 : -0.2) + (f.tall && !f.small ? -0.4 : 0) + (roundLoop(f) ? -0.5 : 0.05),
  כ: (f) =>
    (f.closed < 0.55 ? 0.25 : -0.15) +
    (f.n <= 2 ? 0.2 : 0) +
    (f.circ > 0.18 && f.circ < 0.65 ? 0.2 : 0) +
    (f.tall ? -0.35 : 0.1) +
    (roundLoop(f) ? -0.4 : 0.1),
  ך: (f) => (f.tall ? 0.45 : 0) + (f.n <= 2 ? 0.2 : 0) + (f.endY > 0.65 ? 0.2 : 0) + (roundLoop(f) || f.small ? -0.45 : 0.1),
  ל: (f) => (f.tall ? 0.4 : 0) + (f.startY < 0.3 || f.topShare < 0.35 ? 0.2 : 0) + (f.n <= 2 ? 0.15 : 0) + (roundLoop(f) ? -0.45 : 0.1),
  מ: (f) => (f.n <= 3 ? 0.2 : 0) + (f.closed < 0.72 ? 0.25 : -0.2) + (f.square ? 0.2 : 0) + (roundLoop(f) || stick(f) ? -0.4 : 0.1),
  ם: (f) => (boxLoop(f) || (f.closed > 0.5 && f.square) ? 0.55 : f.closed > 0.35 ? 0.25 : 0) + (f.square ? 0.2 : 0) + (f.circ > 0.8 ? -0.3 : 0.1) + (stick(f) ? -0.5 : 0.1),
  נ: (f) => (f.n <= 2 ? 0.25 : 0) + (f.closed < 0.5 ? 0.25 : 0) + (!f.small && !f.tall ? 0.15 : 0) + (roundLoop(f) || (f.tall && f.n === 1) ? -0.4 : 0.1),
  ן: (f) => (stick(f) || (f.tall && f.n === 1) ? 0.55 : f.tall ? 0.25 : 0) + (f.n === 1 ? 0.2 : 0) + (roundLoop(f) || f.small ? -0.5 : 0.1),
  ס: (f) =>
    (roundLoop(f) ? 0.55 : f.closed > 0.4 && f.circ > 0.18 ? 0.35 : 0) +
    (f.square ? 0.2 : 0) +
    (f.n <= 2 ? 0.15 : 0) +
    (stick(f) || f.small ? -0.5 : 0.1),
  ע: (f) => (f.n <= 3 ? 0.2 : 0) + (f.closed < 0.7 ? 0.2 : 0) + (f.endY > 0.45 ? 0.15 : 0) + (stick(f) || (roundLoop(f) && f.n === 1) ? -0.4 : 0.15),
  פ: (f) => (f.closed < 0.6 ? 0.25 : -0.1) + (f.n <= 2 ? 0.2 : 0) + (f.tall ? -0.3 : 0.1) + (roundLoop(f) || stick(f) ? -0.4 : 0.15),
  ף: (f) => (f.tall ? 0.4 : 0) + (f.n <= 2 ? 0.2 : 0) + (roundLoop(f) || f.small ? -0.45 : 0.15),
  צ: (f) => (f.n <= 3 ? 0.25 : 0) + (f.closed < 0.55 ? 0.2 : 0) + (f.tall ? -0.25 : 0.1) + (roundLoop(f) || stick(f) ? -0.4 : 0.15),
  ץ: (f) => (f.tall ? 0.4 : 0) + (f.n <= 2 ? 0.2 : 0) + (roundLoop(f) || f.small ? -0.45 : 0.15),
  ק: (f) => (f.tall || f.endY > 0.7 ? 0.35 : 0) + (f.n <= 2 ? 0.2 : 0) + (roundLoop(f) ? -0.4 : 0.15),
  ר: (f) => (f.n === 1 ? 0.25 : 0.1) + (f.closed < 0.5 ? 0.25 : 0) + (f.startY < 0.4 || f.topShare > 0.28 ? 0.2 : 0) + (roundLoop(f) || stick(f) ? -0.4 : 0.1),
  ש: (f) => (f.n >= 1 ? 0.15 : 0) + (f.wide || f.square ? 0.25 : 0) + (f.closed < 0.55 ? 0.2 : 0) + (f.n >= 2 ? 0.2 : 0) + (roundLoop(f) || stick(f) ? -0.45 : 0.1),
  ת: (f) => (f.n <= 3 ? 0.2 : 0) + (f.square || f.wide ? 0.2 : 0) + (f.endX > 0.5 || f.n >= 2 ? 0.2 : 0) + (roundLoop(f) || stick(f) ? -0.4 : 0.1),
};

function scoreOf(id: string, f: Feat): number {
  const fn = SCORES[id];
  return fn ? clamp01(fn(f)) : 0;
}

/** Every alef-bet letter (and finals) is scored. The asked letter must win its own family. */
export function verifyLetterInk(strokes: InkStroke[], expected: string): { match: HandMatch; read: string; score: number } {
  const want = baseLetter(expected);
  const f = analyze(strokes);
  if (!f || !want) return { match: "empty", read: "", score: 0 };
  if (f.path < 16) return { match: "empty", read: "", score: 0 };

  let bestId = "";
  let best = -1;
  for (const id of Object.keys(SCORES)) {
    const s = scoreOf(id, f);
    if (s > best) {
      best = s;
      bestId = id;
    }
  }
  const mine = scoreOf(want, f);

  if (mine >= 0.55 && mine + 0.02 >= best) return { match: "exact", read: want, score: mine };
  if (mine >= 0.4 && mine + 0.1 >= best) return { match: "close", read: want, score: mine };

  if (best >= 0.55 && best > mine + 0.12) return { match: "wrong", read: bestId, score: mine };

  if (mine >= 0.32 && mine + 0.16 >= best) return { match: "close", read: want, score: mine };

  return { match: "wrong", read: bestId && best > mine ? bestId : "", score: mine };
}
