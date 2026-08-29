import { type HandMatch } from "@/lib/hebrew";
import { FINAL_DESCENDERS, PAD_BASE, PAD_TOP } from "@/lib/pad-guides";
import { letterModel, modelGlyph } from "@/lib/letter-models";
import { matchStrokeModel, rankStrokeModels } from "@/lib/letter-strokes";

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
  hasBottomBar: boolean;
  descender: number;
  belowShare: number;
  ascender: number;
  hasSlash: boolean;
  hasFork: boolean;
  footX: number;
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
  let botMinX = Infinity;
  let botMaxX = -Infinity;
  for (const p of pts) {
    const yn = (p.y - minY) / h;
    if (yn > 0.72) {
      botMinX = Math.min(botMinX, p.x);
      botMaxX = Math.max(botMaxX, p.x);
    }
  }
  const botSpan = Number.isFinite(botMinX) ? botMaxX - botMinX : 0;
  const hasBottomBar = botSpan > w * 0.4 && botSpan > Math.max(midSpan, w * 0.18) * 1.15;
  const baseY = height > 0 ? height * PAD_BASE : maxY;
  const topLine = height > 0 ? height * PAD_TOP : minY;
  const descender = height > 0 ? Math.max(0, (maxY - baseY) / height) : 0;
  const ascender = height > 0 ? Math.max(0, (topLine - minY) / height) : 0;
  let below = 0;
  if (height > 0) {
    for (const p of pts) {
      if (p.y > baseY + 1) below += 1;
    }
  }
  const belowShare = pts.length ? below / pts.length : 0;
  let footSum = 0;
  let footN = 0;
  for (const p of pts) {
    if ((p.y - minY) / h > 0.82) {
      footSum += (p.x - minX) / w;
      footN += 1;
    }
  }
  const footX = footN ? footSum / footN : 0.5;
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
  let topL = 0;
  let topR = 0;
  for (const p of pts) {
    const xn = (p.x - minX) / w;
    const yn = (p.y - minY) / h;
    if (yn < 0.5) {
      if (xn < 0.38) topL += 1;
      if (xn > 0.62) topR += 1;
    }
  }
  const hasFork = topL >= 4 && topR >= 4;
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
    hasBottomBar,
    descender,
    belowShare,
    ascender,
    hasSlash,
    hasFork,
    footX,
  };
}

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

function baseLetter(expected: string): string {
  return modelGlyph(expected);
}

function gateLetter(want: string, f: Feat, lined: boolean): { ok: boolean; as: string } {
  const model = letterModel(want);
  const dropped = f.descender >= 0.045 || f.belowShare >= 0.12;
  const bitLow = f.descender >= 0.01 || f.belowShare >= 0.025;
  const rose = f.ascender >= 0.04;

  if (roundLoop(f) && want !== "ס" && want !== "ם" && want !== "ט" && want !== "ק") return { ok: false, as: "ס" };
  if (f.small && want !== "י" && f.path < 70) return { ok: false, as: "י" };
  if (want === "ס" && (f.hasSlash || f.closed < 0.48 || f.circ < 0.3 || f.n > 2)) return { ok: false, as: "" };
  if (want === "ם" && f.closed < 0.45) return { ok: false, as: "" };
  if (want === "י" && (f.tall || dropped || f.path > 140)) return { ok: false, as: "ו" };
  if (want === "ו" && (f.hasTopBar || dropped || f.small)) return { ok: false, as: f.hasTopBar ? "ז" : dropped ? "ן" : "י" };
  if (want === "ז" && (dropped || (!f.hasTopBar && f.topShare < 0.18))) return { ok: false, as: dropped ? "ן" : "ו" };
  if (want === "ע" && (!f.hasFork || roundLoop(f))) return { ok: false, as: "" };
  if (want === "צ" && !f.hasFork) return { ok: false, as: "" };
  if (want === "ץ" && (!f.hasFork || (!dropped && !f.tall))) return { ok: false, as: f.hasFork ? "צ" : "" };
  if (want === "א" && (roundLoop(f) || stick(f))) return { ok: false, as: "" };
  if (want === "ב" && (f.closed > 0.62 || roundLoop(f))) return { ok: false, as: "ם" };
  if (want === "ק" && f.footX < 0.42) return { ok: false, as: "" };

  const tBar = f.hasTopBar && !f.hasBottomBar;
  if (tBar && (want === "כ" || want === "ב" || want === "פ" || want === "ס" || want === "ם" || want === "מ")) {
    return { ok: false, as: f.leftShare < 0.3 ? "ד" : "ז" };
  }
  if (want === "כ" && !f.hasBottomBar && (stick(f) || f.tall)) return { ok: false, as: "ו" };

  if (lined && model) {
    if (model.band === "descender" && !dropped) return { ok: false, as: want };
    if (model.band === "hang" && !bitLow) return { ok: false, as: want === "ק" ? "ר" : want };
    if (model.band === "ascender" && !rose) return { ok: false, as: want };
    if (model.band === "body" && dropped && f.descender > 0.09 && FINAL_DESCENDERS.has(want === "כ" ? "ך" : want === "נ" ? "ן" : want === "פ" ? "ף" : want === "צ" ? "ץ" : "")) {
      const asFinal = want === "כ" ? "ך" : want === "נ" ? "ן" : want === "פ" ? "ף" : want === "צ" ? "ץ" : "";
      if (asFinal) return { ok: false, as: asFinal };
    }
    if (model.band === "body" && dropped && f.descender > 0.12 && want !== "ק") {
      if (want === "ר" || want === "ד") return { ok: false, as: "ק" };
      return { ok: false, as: "ן" };
    }
    if (model.band === "small" && (dropped || rose && f.h > 80)) return { ok: false, as: "ו" };
    if (want === "ם" && dropped && f.descender > 0.08) return { ok: false, as: "" };
  }
  return { ok: true, as: want };
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
  א: (f) => (f.path > 40 && !roundLoop(f) && !stick(f) ? 0.4 : 0.1) + (f.n >= 2 ? 0.2 : 0.1) + (f.hasSlash || f.hasFork ? 0.15 : 0) + (roundLoop(f) || stick(f) ? -0.5 : 0.1),
  ה: (f) =>
    (f.path > 40 && !roundLoop(f) && !stick(f) && !f.hasFork ? 0.45 : 0.1) +
    (f.hasTopBar || f.topShare > 0.22 ? 0.25 : 0.1) +
    (f.n >= 1 ? 0.15 : 0) +
    (roundLoop(f) || stick(f) || f.hasFork ? -0.45 : 0.1),
  ח: (f) =>
    (f.path > 40 && !roundLoop(f) && !stick(f) ? 0.4 : 0.1) +
    (f.hasTopBar || f.square ? 0.25 : 0.1) +
    (f.n >= 1 ? 0.15 : 0) +
    (roundLoop(f) || stick(f) || f.hasFork ? -0.4 : 0.1),
  ת: (f) =>
    (f.path > 40 && !roundLoop(f) && !stick(f) ? 0.35 : 0.1) +
    (f.hasTopBar || f.square || f.wide ? 0.2 : 0) +
    (f.n >= 1 ? 0.15 : 0) +
    (roundLoop(f) || stick(f) || f.hasFork ? -0.4 : 0.1),
  ע: (f) =>
    (f.hasFork && !f.tall ? 0.35 : 0) +
    (f.n >= 2 ? 0.15 : 0) +
    (f.closed < 0.55 ? 0.1 : 0) +
    (stick(f) || roundLoop(f) || f.hasTopBar ? -0.4 : 0.1),
  ב: (f) =>
    (f.closed < 0.55 ? 0.25 : -0.2) +
    (f.leftShare < 0.42 ? 0.3 : 0) +
    (f.n <= 2 ? 0.2 : 0) +
    (roundLoop(f) || stick(f) ? -0.45 : 0.1),
  ג: (f) => (f.n <= 2 ? 0.25 : 0) + (f.closed < 0.5 ? 0.25 : 0) + (f.endY > 0.5 ? 0.2 : 0) + (roundLoop(f) ? -0.5 : 0.1),
  ד: (f) => (f.wide || f.square ? 0.2 : 0) + (f.topShare > 0.28 ? 0.25 : 0) + (f.closed < 0.55 ? 0.2 : 0) + (roundLoop(f) || stick(f) ? -0.4 : 0.1),
  ו: (f) => (stick(f) && !f.hasTopBar ? 0.55 : f.tall && !f.hasTopBar ? 0.3 : 0) + (f.n === 1 ? 0.2 : 0) + (f.small ? -0.25 : 0.1) + (roundLoop(f) || f.hasTopBar ? -0.45 : 0.1),
  ז: (f) =>
    (f.hasTopBar ? 0.5 : f.topShare > 0.22 ? 0.2 : 0) +
    (f.n <= 2 ? 0.2 : 0) +
    (f.closed < 0.5 ? 0.15 : 0) +
    (roundLoop(f) ? -0.45 : 0.1) +
    (stick(f) && !f.hasTopBar ? -0.35 : 0.05),
  ן: (f) =>
    (stick(f) && !f.hasTopBar && !f.hasFork ? 0.4 : f.tall && f.n === 1 && !f.hasTopBar && !f.hasFork ? 0.2 : 0) +
    (f.descender > 0.04 || f.belowShare > 0.1 ? 0.25 : 0) +
    (f.hasFork ? -0.55 : 0.1) +
    (f.n === 1 ? 0.1 : 0) +
    (roundLoop(f) || f.small || f.hasTopBar ? -0.5 : 0.1),
  ט: (f) => (f.closed > 0.35 ? 0.4 : 0.1) + (f.square ? 0.2 : 0) + (f.n <= 3 ? 0.15 : 0) + (stick(f) ? -0.4 : 0.1),
  י: (f) => (f.small ? 0.6 : 0) + (f.n === 1 ? 0.2 : 0) + (f.path < 120 ? 0.15 : -0.2) + (f.tall && !f.small ? -0.4 : 0) + (roundLoop(f) ? -0.5 : 0.05),
  כ: (f) =>
    (f.hasBottomBar ? 0.3 : -0.3) +
    (f.closed < 0.55 ? 0.15 : -0.15) +
    (f.n <= 2 ? 0.1 : 0) +
    (f.circ > 0.18 && f.circ < 0.65 ? 0.15 : 0) +
    (f.hasTopBar && !f.hasBottomBar ? -0.55 : 0.1) +
    (f.tall ? -0.35 : 0.1) +
    (roundLoop(f) || stick(f) ? -0.45 : 0.05),
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
  פ: (f) => (f.closed < 0.6 ? 0.25 : -0.1) + (f.n <= 2 ? 0.2 : 0) + (f.tall ? -0.3 : 0.1) + (roundLoop(f) || stick(f) ? -0.4 : 0.15),
  ף: (f) => (f.tall ? 0.3 : 0) + (f.descender > 0.04 || f.belowShare > 0.1 ? 0.4 : -0.35) + (f.n <= 2 ? 0.1 : 0) + (f.wide || roundLoop(f) || f.small ? -0.35 : 0.1),
  צ: (f) => (f.hasFork ? 0.4 : 0.1) + (f.n <= 3 ? 0.15 : 0) + (f.closed < 0.55 ? 0.15 : 0) + (f.tall ? -0.2 : 0.1) + (roundLoop(f) || stick(f) ? -0.4 : 0.1),
  ץ: (f) =>
    (f.hasFork ? 0.55 : 0) +
    (f.tall || f.descender > 0.03 ? 0.25 : 0.1) +
    (f.descender > 0.04 || f.belowShare > 0.1 ? 0.15 : 0) +
    (f.hasFork ? 0.1 : -0.4) +
    (roundLoop(f) || f.small || !f.hasFork ? -0.2 : 0.1),
  ק: (f) =>
    (f.tall || f.endY > 0.7 ? 0.2 : 0) +
    (f.descender > 0.012 || f.belowShare > 0.03 ? 0.3 : -0.2) +
    (f.n <= 2 ? 0.1 : 0) +
    (f.footX > 0.5 ? 0.25 : -0.5) +
    (roundLoop(f) ? -0.2 : 0.1),
  ר: (f) => (f.n === 1 ? 0.25 : 0.1) + (f.closed < 0.5 ? 0.25 : 0) + (f.startY < 0.4 || f.topShare > 0.28 ? 0.2 : 0) + (roundLoop(f) || stick(f) ? -0.4 : 0.1),
  ש: (f) => (f.n >= 1 ? 0.15 : 0) + (f.wide || f.square ? 0.25 : 0) + (f.closed < 0.55 ? 0.2 : 0) + (f.n >= 2 ? 0.2 : 0) + (roundLoop(f) || stick(f) ? -0.45 : 0.1),
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
  ["ק", "ר", "ד"],
  ["ה", "ח", "ת"],
  ["מ", "ם", "ס", "ט"],
  ["צ", "ץ"],
];

function isNear(a: string, b: string): boolean {
  return NEAR.some((g) => g.includes(a) && g.includes(b));
}

function qofMissNote(f: Feat, gate: { ok: boolean; as: string }): string | undefined {
  if (f.footX < 0.42) {
    return "That looks like a Latin P. Qof’s leg is on the right, like resh, hanging a little below the line.";
  }
  if (!gate.ok && gate.as === "ר") {
    return "Drop the right leg a little below the bottom line — like resh, just longer.";
  }
  return undefined;
}

/** Every alef-bet letter (and finals) is scored. Trace mode verifies the shown letter, not the whole alphabet. */
export function verifyLetterInk(
  strokes: InkStroke[],
  expected: string,
  opts?: { trace?: boolean; height?: number },
): { match: HandMatch; read: string; score: number; note?: string } {
  const want = baseLetter(expected);
  const f = analyze(strokes, opts?.height ?? 0);
  if (!f || !want) return { match: "empty", read: "", score: 0 };
  if (f.path < 16) return { match: "empty", read: "", score: 0 };

  const lined = (opts?.height ?? 0) > 40;
  const gate = gateLetter(want, f, lined);
  const ranked = rankStrokeModels(strokes);
  const shape = ranked.find((r) => r.id === want) ?? matchStrokeModel(strokes, want);
  const rival = ranked[0];
  const qofNote = want === "ק" ? qofMissNote(f, gate) : undefined;
  const tBar = f.hasTopBar && !f.hasBottomBar;

  if (want === "ק" && f.footX < 0.42) {
    return { match: "wrong", read: "", score: shape?.score ?? 0, note: qofNote };
  }
  if (want === "ק" && lined && !gate.ok && gate.as === "ר") {
    return { match: "wrong", read: "ר", score: shape?.score ?? 0.12, note: qofNote };
  }
  if ((want === "ר" || want === "ד") && lined && !gate.ok && gate.as === "ק") {
    return { match: "wrong", read: "ק", score: shape?.score ?? 0.12 };
  }
  if (tBar && (want === "כ" || want === "ב" || want === "פ" || want === "ס" || want === "ם" || want === "מ")) {
    return { match: "wrong", read: f.leftShare < 0.3 ? "ד" : "ז", score: shape?.score ?? 0 };
  }

  const hangTwins = want === "ק" && gate.ok ? new Set(["ד", "ר", "ן", "ך", "ו", "ה", "נ", "ף"]) : null;

  if (rival && rival.id !== want && rival.score >= 0.52 && rival.score >= (shape?.score ?? 0) + 0.07) {
    if (hangTwins?.has(rival.id)) {
      /* qof’s hang already passed — resh/dalet/nun look the same after fit */
    } else if (isNear(want, rival.id) && (shape?.score ?? 0) >= 0.55 && (shape?.extra ?? 0) >= 0.55) {
      return { match: "close", read: want, score: shape?.score ?? rival.score };
    } else {
      return { match: "wrong", read: rival.id, score: shape?.score ?? 0, note: qofNote };
    }
  }

  if (shape && shape.score >= 0.7 && shape.cover >= 0.6 && shape.extra >= 0.58) {
    if (lined && !gate.ok && (letterModel(want)?.band === "descender" || letterModel(want)?.band === "hang" || letterModel(want)?.band === "ascender")) {
      return { match: "wrong", read: gate.as, score: shape.score * 0.4, note: qofNote };
    }
    if (!gate.ok) return { match: "wrong", read: gate.as, score: shape.score * 0.45, note: qofNote };
    if (shape.score >= 0.82 && shape.cover >= 0.72 && shape.extra >= 0.7) return { match: "exact", read: want, score: shape.score };
    return { match: "close", read: want, score: shape.score };
  }

  if (!gate.ok) return { match: "wrong", read: gate.as === want ? "" : gate.as, score: shape?.score ?? 0.12, note: qofNote };
  if (shape && shape.score < 0.42) return { match: "wrong", read: rival && rival.id !== want ? rival.id : "", score: shape.score, note: qofNote };

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
    if (mine >= 0.5 && mine + 0.02 >= best) return { match: "exact", read: want, score: mine };
    if (mine >= 0.34) return { match: "close", read: want, score: mine };
    if (best >= 0.62 && best > mine + 0.2 && !isNear(want, bestId)) return { match: "wrong", read: bestId, score: mine, note: qofNote };
    return { match: "wrong", read: bestId && best > mine ? bestId : "", score: mine, note: qofNote };
  }

  if (mine >= 0.58 && mine + 0.02 >= best) return { match: "exact", read: want, score: mine };
  if (mine >= 0.48 && (mine + 0.08 >= best || isNear(want, bestId))) return { match: "close", read: want, score: mine };
  if (isNear(want, bestId) && mine >= 0.42 && best - mine < 0.16) return { match: "close", read: want, score: mine };
  if (best >= 0.5 && best > mine + 0.1 && !isNear(want, bestId)) return { match: "wrong", read: bestId, score: mine, note: qofNote };
  if (mine >= 0.46) return { match: "close", read: want, score: mine };
  return { match: "wrong", read: bestId && best > mine ? bestId : "", score: mine, note: qofNote };
}
