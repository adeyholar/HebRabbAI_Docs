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
  return {
    n: clean.length,
    w,
    h,
    aspect: w / h,
    closed,
    circ,
    path,
    tall: h / w > 1.35,
    wide: w / h > 1.3,
    square: w / h > 0.5 && w / h < 1.6,
    small: Math.max(w, h) < 42 && path < 110,
  };
}

function pathOf(s: InkStroke): number {
  let n = 0;
  for (let i = 1; i < s.length; i++) n += dist(s[i - 1], s[i]);
  return n;
}

function baseLetter(expected: string): string {
  const g = foldLetterGlyph(expected);
  if (g.startsWith("ש")) return "ש";
  return g.replace(/[^\u05D0-\u05EA]/g, "").slice(0, 1);
}

function loop(f: Feat): boolean {
  return f.closed > 0.22 || f.circ > 0.16;
}

function stick(f: Feat): boolean {
  return f.tall && f.closed < 0.35 && f.circ < 0.28;
}

/** Known-target check: is the ink a plausible form of this letter? */
export function verifyLetterInk(strokes: InkStroke[], expected: string): { match: HandMatch; read: string; score: number } {
  const want = baseLetter(expected);
  const feat = analyze(strokes);
  if (!feat || !want) return { match: "empty", read: "", score: 0 };
  if (feat.path < 12) return { match: "empty", read: "", score: 0 };

  let ok = false;
  let strong = false;

  switch (want) {
    case "ס":
      ok = loop(feat) || (feat.square && feat.n <= 3);
      strong = feat.circ > 0.22 || feat.closed > 0.4;
      break;
    case "ם":
      ok = loop(feat) || (feat.square && feat.closed > 0.18);
      strong = feat.closed > 0.45;
      break;
    case "ט":
    case "ע":
    case "מ":
      ok = feat.path > 30 && !stick(feat);
      strong = loop(feat);
      break;
    case "ו":
    case "ן":
    case "ך":
    case "י":
      ok = feat.n <= 3 && (feat.small || stick(feat) || feat.tall || feat.path < 180);
      strong = stick(feat) || feat.small;
      break;
    case "ל":
      ok = feat.tall || feat.h > feat.w;
      strong = feat.tall;
      break;
    case "ה":
    case "ח":
    case "ת":
    case "א":
    case "ש":
      ok = feat.n >= 1 && feat.path > 28;
      strong = feat.n >= 2;
      break;
    case "ב":
    case "כ":
    case "פ":
    case "ג":
    case "נ":
    case "ד":
    case "ר":
    case "ק":
    case "ז":
    case "צ":
    case "ץ":
    case "ף":
      ok = feat.path > 24 && !(want !== "ק" && loop(feat) && feat.circ > 0.55);
      strong = feat.path > 50;
      break;
    default:
      ok = feat.path > 24;
      strong = feat.path > 70;
  }

  if (strong && ok) return { match: "exact", read: want, score: 0.8 };
  if (ok) return { match: "close", read: want, score: 0.5 };
  if (feat.path > 50 && !stick(feat)) return { match: "close", read: want, score: 0.28 };
  return { match: "wrong", read: "", score: 0.1 };
}
