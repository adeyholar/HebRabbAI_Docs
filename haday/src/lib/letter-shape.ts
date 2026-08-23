import { foldLetterGlyph, type HandMatch } from "@/lib/hebrew";
import { FINAL_DESCENDERS, PAD_BASE, QOF } from "@/lib/pad-guides";

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
  hasTopBar: boolean;
  descender: number;
  belowShare: number;
  hasSlash: boolean;
};

function dist(a: InkPoint, b: InkPoint): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function pathOf(s: InkStroke): number {
  let n = 0;
  for (let i = 1; i < s.length; i++) n += dist(s[i - 1], s[i]);
  return n;
}

function strokeStraight(s: InkStroke): boolean {
  if (s.length < 2) return false;
  const chord = dist(s[0], s[s.length - 1]);
  const p = pathOf(s);
  return chord > 18 && p > 0 && chord / p > 0.78;
}

function analyze(strokes: InkStroke[], height = 0): Feat | null {
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
  let topMinX = Infinity;
  let topMaxX = -Infinity;
  let midMinX = Infinity;
  let midMaxX = -Infinity;
  for (const p of pts) {
    const xn = (p.x - minX) / w;
    const yn = (p.y - minY) / h;
    if (xn < 0.38) left += 1;
    if (yn < 0.4) top += 1;
    if (yn < 0.28) {
      topMinX = Math.min(topMinX, p.x);
      topMaxX = Math.max(topMaxX, p.x);
    }
    if (yn > 0.35 && yn < 0.75) {
      midMinX = Math.min(midMinX, p.x);
      midMaxX = Math.max(midMaxX, p.x);
    }
  }
  const topSpan = Number.isFinite(topMinX) ? topMaxX - topMinX : 0;
  const midSpan = Number.isFinite(midMinX) ? midMaxX - midMinX : 0;
  const hasTopBar = topSpan > w * 0.4 && topSpan > Math.max(midSpan, w * 0.18) * 1.2;
  const baseY = height > 0 ? height * PAD_BASE : maxY;
  const descender = height > 0 ? Math.max(0, (maxY - baseY) / height) : 0;
  let below = 0;
  if (height > 0) {
    for (const p of pts) {
      if (p.y > baseY + 3) below += 1;
    }
  }
  const belowShare = pts.length ? below / pts.length : 0;
  const span = Math.max(w, h);
  let hasSlash = false;
  for (const s of clean) {
    if (s === longest) continue;
    if (strokeStraight(s) && pathOf(s) > span * 0.32) hasSlash = true;
  }
  if (clean.length === 1 && longest.length > 8) {
    const mid = longest[Math.floor(longest.length / 2)];
    const chord = dist(longest[0], longest[longest.length - 1]);
    if (chord > span * 0.45 && closed < 0.35) hasSlash = hasSlash || chord / pathOf(longest) > 0.55;
    void mid;
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
    hasTopBar,
    descender,
    belowShare,
    hasSlash,
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
  return f.circ > 0.34 && f.closed > 0.5 && f.square && !f.hasSlash && f.n <= 2;
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
  ו: (f) => (stick(f) && !f.hasTopBar ? 0.55 : f.tall && !f.hasTopBar ? 0.3 : 0) + (f.n === 1 ? 0.2 : 0) + (f.small ? -0.25 : 0.1) + (roundLoop(f) || f.hasTopBar ? -0.45 : 0.1),
  ז: (f) =>
    (f.hasTopBar ? 0.5 : f.topShare > 0.22 ? 0.2 : 0) +
    (f.n <= 2 ? 0.2 : 0) +
    (f.closed < 0.5 ? 0.15 : 0) +
    (roundLoop(f) ? -0.45 : 0.1) +
    (stick(f) && !f.hasTopBar ? -0.35 : 0.05),
  ן: (f) => (stick(f) && !f.hasTopBar ? 0.4 : f.tall && f.n === 1 && !f.hasTopBar ? 0.2 : 0) + (f.descender > 0.04 || f.belowShare > 0.1 ? 0.35 : -0.3) + (f.n === 1 ? 0.1 : 0) + (roundLoop(f) || f.small || f.hasTopBar ? -0.5 : 0.1),
  ח: (f) => (f.n >= 2 ? 0.4 : 0.08) + (f.square ? 0.2 : 0) + (roundLoop(f) || stick(f) ? -0.4 : 0.15),
  ט: (f) => (f.closed > 0.35 ? 0.4 : 0.1) + (f.square ? 0.2 : 0) + (f.n <= 3 ? 0.15 : 0) + (stick(f) ? -0.4 : 0.1),
  י: (f) => (f.small ? 0.6 : 0) + (f.n === 1 ? 0.2 : 0) + (f.path < 120 ? 0.15 : -0.2) + (f.tall && !f.small ? -0.4 : 0) + (roundLoop(f) ? -0.5 : 0.05),
  כ: (f) =>
    (f.closed < 0.55 ? 0.25 : -0.15) +
    (f.n <= 2 ? 0.2 : 0) +
    (f.circ > 0.18 && f.circ < 0.65 ? 0.2 : 0) +
    (f.tall ? -0.35 : 0.1) +
    (roundLoop(f) ? -0.4 : 0.1),
  ך: (f) => (f.tall ? 0.35 : 0) + (f.descender > 0.04 || f.belowShare > 0.1 ? 0.4 : -0.35) + (f.n <= 2 ? 0.1 : 0) + (roundLoop(f) || f.small ? -0.45 : 0.1),
  ל: (f) => (f.tall ? 0.4 : 0) + (f.startY < 0.3 || f.topShare < 0.35 ? 0.2 : 0) + (f.n <= 2 ? 0.15 : 0) + (roundLoop(f) ? -0.45 : 0.1) + (f.descender > 0.1 ? -0.25 : 0),
  מ: (f) => (f.n <= 3 ? 0.2 : 0) + (f.closed < 0.72 ? 0.25 : -0.2) + (f.square ? 0.2 : 0) + (roundLoop(f) || stick(f) ? -0.4 : 0.1),
  ם: (f) => (boxLoop(f) || (f.closed > 0.5 && f.square) ? 0.55 : f.closed > 0.35 ? 0.25 : 0) + (f.square ? 0.2 : 0) + (f.circ > 0.8 ? -0.3 : 0.1) + (stick(f) ? -0.5 : 0.1),
  נ: (f) => (f.n <= 2 ? 0.25 : 0) + (f.closed < 0.5 ? 0.25 : 0) + (!f.small && !f.tall ? 0.15 : 0) + (roundLoop(f) || (f.tall && f.n === 1) ? -0.4 : 0.1),
  ס: (f) =>
    (roundLoop(f) && !f.hasSlash ? 0.65 : 0) +
    (f.n === 1 ? 0.15 : f.n === 2 && !f.hasSlash ? 0.05 : -0.35) +
    (f.square ? 0.1 : 0) +
    (f.hasSlash || f.closed < 0.45 ? -0.55 : 0.1),
  ע: (f) => (f.n <= 3 ? 0.2 : 0) + (f.closed < 0.7 ? 0.2 : 0) + (f.endY > 0.45 ? 0.15 : 0) + (stick(f) || (roundLoop(f) && f.n === 1) ? -0.4 : 0.15),
  פ: (f) => (f.closed < 0.6 ? 0.25 : -0.1) + (f.n <= 2 ? 0.2 : 0) + (f.tall ? -0.3 : 0.1) + (roundLoop(f) || stick(f) ? -0.4 : 0.15),
  ף: (f) => (f.tall ? 0.3 : 0) + (f.descender > 0.04 || f.belowShare > 0.1 ? 0.4 : -0.35) + (f.n <= 2 ? 0.1 : 0) + (f.wide || roundLoop(f) || f.small ? -0.35 : 0.1),
  צ: (f) => (f.n <= 3 ? 0.25 : 0) + (f.closed < 0.55 ? 0.2 : 0) + (f.tall ? -0.25 : 0.1) + (roundLoop(f) || stick(f) ? -0.4 : 0.15) + (f.descender > 0.1 ? -0.2 : 0),
  ץ: (f) => (f.tall ? 0.3 : 0) + (f.descender > 0.04 || f.belowShare > 0.1 ? 0.4 : -0.35) + (f.n <= 2 ? 0.1 : 0) + (f.wide || roundLoop(f) || f.small ? -0.35 : 0.1),
  ק: (f) => (f.tall || f.endY > 0.7 ? 0.25 : 0) + (f.descender > 0.02 || f.belowShare > 0.05 ? 0.35 : -0.2) + (f.n <= 2 ? 0.15 : 0) + (roundLoop(f) ? -0.4 : 0.1),
  ר: (f) => (f.n === 1 ? 0.25 : 0.1) + (f.closed < 0.5 ? 0.25 : 0) + (f.startY < 0.4 || f.topShare > 0.28 ? 0.2 : 0) + (roundLoop(f) || stick(f) ? -0.4 : 0.1),
  ש: (f) => (f.n >= 1 ? 0.15 : 0) + (f.wide || f.square ? 0.25 : 0) + (f.closed < 0.55 ? 0.2 : 0) + (f.n >= 2 ? 0.2 : 0) + (roundLoop(f) || stick(f) ? -0.45 : 0.1),
  ת: (f) => (f.n <= 3 ? 0.2 : 0) + (f.square || f.wide ? 0.2 : 0) + (f.endX > 0.5 || f.n >= 2 ? 0.2 : 0) + (roundLoop(f) || stick(f) ? -0.4 : 0.1),
};

function scoreOf(id: string, f: Feat): number {
  const fn = SCORES[id];
  return fn ? clamp01(fn(f)) : 0;
}

const NEAR: string[][] = [
  ["ז", "ו", "ן", "ך"],
  ["ו", "ן", "י"],
  ["ב", "כ", "פ"],
  ["ד", "ר", "ז"],
  ["ה", "ח", "ת"],
  ["מ", "ם", "ס", "ט"],
  ["נ", "ג"],
  ["ך", "ל", "ק"],
];

function isNear(a: string, b: string): boolean {
  return NEAR.some((g) => g.includes(a) && g.includes(b));
}

/** Every alef-bet letter (and finals) is scored. Trace mode verifies the shown letter, not the whole alphabet. */
export function verifyLetterInk(
  strokes: InkStroke[],
  expected: string,
  opts?: { trace?: boolean; height?: number },
): { match: HandMatch; read: string; score: number } {
  const want = baseLetter(expected);
  const f = analyze(strokes, opts?.height ?? 0);
  if (!f || !want) return { match: "empty", read: "", score: 0 };
  if (f.path < 16) return { match: "empty", read: "", score: 0 };

  const ROUND = new Set(["ס", "ם", "ט"]);
  if (roundLoop(f) && !ROUND.has(want)) return { match: "wrong", read: "ס", score: 0.15 };
  if (f.small && want !== "י" && f.path < 70) return { match: "wrong", read: "י", score: 0.15 };
  if (want === "ס" && (f.hasSlash || f.closed < 0.48 || f.circ < 0.3 || f.n > 2)) {
    return { match: "wrong", read: f.hasSlash ? "" : "", score: 0.1 };
  }

  const lined = (opts?.height ?? 0) > 40;
  const dropped = f.descender >= 0.04 || f.belowShare >= 0.1;
  const bitLow = f.descender >= 0.018 || f.belowShare >= 0.05;
  if (lined && FINAL_DESCENDERS.has(want) && !dropped) {
    return { match: "wrong", read: want, score: 0.12 };
  }
  if (lined && want === QOF && !bitLow) {
    return { match: "wrong", read: want, score: 0.12 };
  }
  if (lined && dropped && !FINAL_DESCENDERS.has(want) && want !== QOF && f.descender > 0.09) {
    const asFinal = want === "כ" ? "ך" : want === "נ" ? "ן" : want === "פ" ? "ף" : want === "צ" ? "ץ" : "";
    if (asFinal) return { match: "wrong", read: asFinal, score: 0.15 };
  }

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

  if (opts?.trace) {
    if (want === "ז" && f.hasTopBar && mine >= 0.22) return { match: "close", read: want, score: Math.max(mine, 0.45) };
    if (mine >= 0.5 && mine + 0.02 >= best) return { match: "exact", read: want, score: mine };
    if (mine >= 0.34 && (mine + 0.1 >= best || isNear(want, bestId))) return { match: "close", read: want, score: mine };
    if (best >= 0.5 && best > mine + 0.08) return { match: "wrong", read: bestId, score: mine };
    if (mine < 0.34) return { match: "wrong", read: bestId && best > mine ? bestId : "", score: mine };
  }

  if (mine >= 0.55 && mine + 0.02 >= best) return { match: "exact", read: want, score: mine };
  if (mine >= 0.38 && (mine + 0.12 >= best || isNear(want, bestId))) return { match: "close", read: want, score: mine };
  if (isNear(want, bestId) && mine >= 0.25) return { match: "close", read: want, score: mine };

  if (best >= 0.55 && best > mine + 0.14 && !isNear(want, bestId)) return { match: "wrong", read: bestId, score: mine };

  if (mine >= 0.32) return { match: "close", read: want, score: mine };
  return { match: "wrong", read: bestId && best > mine ? bestId : "", score: mine };
}
