import { foldLetterGlyph, type HandMatch } from "@/lib/hebrew";

export type InkPoint = { x: number; y: number };
export type InkStroke = InkPoint[];

type Feat = {
  n: number;
  w: number;
  h: number;
  closed: number;
  circ: number;
  path: number;
  tall: boolean;
  square: boolean;
  small: boolean;
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
  return {
    n: clean.length,
    w,
    h,
    closed,
    circ,
    path,
    tall: h / w > 1.4,
    square: w / h > 0.55 && w / h < 1.55,
    small: Math.max(w, h) < 40 && path < 100,
  };
}

function baseLetter(expected: string): string {
  const g = foldLetterGlyph(expected);
  if (g.startsWith("ש")) return "ש";
  return g.replace(/[^\u05D0-\u05EA]/g, "").slice(0, 1);
}

function roundLoop(f: Feat): boolean {
  return f.circ > 0.24 && f.closed > 0.28 && f.square;
}
function boxLoop(f: Feat): boolean {
  return f.closed > 0.42 && f.square && f.circ < 0.82;
}
function stick(f: Feat): boolean {
  return f.tall && f.n <= 2 && f.closed < 0.32 && f.circ < 0.26;
}

const ROUND = new Set(["ס", "ם", "ט"]);
const TALL = new Set(["ו", "ן", "ך", "ל", "ק", "ף", "ץ"]);

function verdict(ok: HandMatch, read: string, score: number) {
  return { match: ok, read, score };
}

/** Known-target check. A circle is only Samekh/mem/tet. A stick is only vav/nun/kaf-final. */
export function verifyLetterInk(strokes: InkStroke[], expected: string): { match: HandMatch; read: string; score: number } {
  const want = baseLetter(expected);
  const f = analyze(strokes);
  if (!f || !want) return verdict("empty", "", 0);
  if (f.path < 18) return verdict("empty", "", 0);

  if (roundLoop(f) && !ROUND.has(want)) return verdict("wrong", "ס", 0.2);
  if (f.small && want !== "י" && f.path < 80) return verdict("wrong", "י", 0.2);
  if (stick(f) && !TALL.has(want) && want !== "י") return verdict("wrong", "ו", 0.2);

  switch (want) {
    case "ס":
      if (roundLoop(f) || (f.closed > 0.48 && f.circ > 0.2 && f.square)) return verdict("exact", "ס", 0.85);
      if (f.closed > 0.32 && f.circ > 0.16 && !stick(f)) return verdict("close", "ס", 0.5);
      return verdict("wrong", "", 0.1);
    case "ם":
      if (boxLoop(f) || (f.closed > 0.5 && f.square)) return verdict("exact", "ם", 0.85);
      if (f.closed > 0.35 && f.square && !stick(f)) return verdict("close", "ם", 0.5);
      return verdict("wrong", "", 0.1);
    case "ט":
      if (roundLoop(f) || boxLoop(f) || (f.closed > 0.35 && f.n <= 3)) return verdict("exact", "ט", 0.8);
      if (f.closed > 0.22 && !stick(f)) return verdict("close", "ט", 0.45);
      return verdict("wrong", "", 0.1);
    case "י":
      if (f.small) return verdict("exact", "י", 0.85);
      if (f.n === 1 && f.path < 130 && !roundLoop(f) && !f.tall) return verdict("close", "י", 0.5);
      return verdict("wrong", "", 0.1);
    case "ו":
    case "ן":
      if (stick(f) && !roundLoop(f)) return verdict("exact", want, 0.85);
      if (f.tall && f.n <= 2 && f.circ < 0.3) return verdict("close", want, 0.5);
      return verdict("wrong", "", 0.1);
    case "ך":
    case "ל":
    case "ק":
    case "ף":
    case "ץ":
      if (f.tall && !roundLoop(f)) return verdict(f.h / f.w > 1.6 ? "exact" : "close", want, 0.7);
      return verdict("wrong", "", 0.1);
    case "ה":
    case "ח":
    case "ת":
    case "א":
    case "ש":
      if (roundLoop(f) || stick(f)) return verdict("wrong", roundLoop(f) ? "ס" : "ו", 0.2);
      if (f.n >= 2 && f.path > 40) return verdict("exact", want, 0.75);
      if (f.path > 55 && f.n >= 1) return verdict("close", want, 0.45);
      return verdict("wrong", "", 0.1);
    default:
      if (roundLoop(f) || (stick(f) && !TALL.has(want))) return verdict("wrong", roundLoop(f) ? "ס" : "ו", 0.2);
      if (f.path > 45 && f.n >= 1) return verdict("close", want, 0.45);
      if (f.path > 80) return verdict("exact", want, 0.6);
      return verdict("wrong", "", 0.1);
  }
}
