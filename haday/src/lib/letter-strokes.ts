import { modelGlyph } from "@/lib/letter-models";

type InkPoint = { x: number; y: number };
type InkStroke = InkPoint[];

/** Block-print stroke models from the IIBS alef-bet writing chart (unit 100×100). */
export type StrokeModel = {
  aspect: number;
  paths: InkPoint[][];
};

function P(...n: number[]): InkPoint[] {
  const out: InkPoint[] = [];
  for (let i = 0; i < n.length; i += 2) out.push({ x: n[i], y: n[i + 1] });
  return out;
}

const MODELS: Record<string, StrokeModel[]> = {
  א: [
    { aspect: 0.72, paths: [P(62, 8, 22, 92), P(28, 18, 58, 48), P(58, 52, 78, 90)] },
    { aspect: 0.7, paths: [P(50, 12, 22, 88), P(50, 12, 78, 88), P(32, 40, 68, 40)] },
  ],
  ב: [
    { aspect: 0.95, paths: [P(22, 18, 82, 18, 82, 82), P(18, 82, 82, 82)] },
    { aspect: 0.95, paths: [P(20, 16, 84, 16, 84, 50, 84, 84, 18, 84)] },
  ],
  ג: [
    { aspect: 0.62, paths: [P(58, 10, 70, 22, 62, 58, 78, 78), P(62, 58, 32, 88)] },
    { aspect: 0.55, paths: [P(72, 8, 72, 52, 28, 90)] },
    { aspect: 0.58, paths: [P(68, 8, 78, 28, 68, 70), P(68, 48, 30, 88)] },
  ],
  ד: [
    { aspect: 0.9, paths: [P(16, 16, 86, 16), P(78, 16, 78, 88)] },
    { aspect: 0.85, paths: [P(18, 18, 82, 18, 82, 88)] },
  ],
  ה: [
    { aspect: 0.88, paths: [P(18, 16, 84, 16, 84, 88), P(22, 40, 22, 88)] },
    { aspect: 0.88, paths: [P(16, 16, 84, 16), P(84, 16, 84, 88), P(20, 42, 20, 88)] },
  ],
  ו: [
    { aspect: 0.38, paths: [P(38, 16, 64, 16, 64, 86)] },
    { aspect: 0.32, paths: [P(48, 14, 48, 88)] },
  ],
  ז: [
    { aspect: 0.48, paths: [P(24, 16, 76, 16), P(50, 16, 50, 88)] },
    { aspect: 0.42, paths: [P(30, 14, 70, 14, 50, 14, 50, 88)] },
  ],
  ח: [
    { aspect: 0.88, paths: [P(20, 16, 82, 16), P(20, 16, 20, 88), P(82, 16, 82, 88)] },
    { aspect: 0.9, paths: [P(18, 16, 84, 16, 84, 88), P(18, 16, 18, 88)] },
  ],
  ט: [
    { aspect: 0.9, paths: [P(22, 22, 18, 78, 50, 90, 82, 72, 78, 22), P(70, 28, 52, 48)] },
    { aspect: 0.92, paths: [P(18, 18, 18, 84, 82, 84, 82, 18), P(82, 18, 42, 52)] },
  ],
  י: [
    { aspect: 0.55, paths: [P(38, 22, 62, 22, 62, 52)] },
    { aspect: 0.4, paths: [P(48, 22, 48, 48)] },
  ],
  כ: [
    { aspect: 0.85, paths: [P(24, 18, 78, 18, 86, 50, 78, 84, 24, 84)] },
    { aspect: 0.88, paths: [P(22, 16, 82, 16, 82, 84, 22, 84)] },
  ],
  ך: [
    { aspect: 0.42, paths: [P(18, 14, 72, 14, 72, 96)] },
    { aspect: 0.38, paths: [P(22, 12, 68, 12, 62, 96)] },
  ],
  ל: [
    { aspect: 0.58, paths: [P(28, 6, 28, 34, 78, 34, 78, 88)] },
    { aspect: 0.5, paths: [P(42, 6, 42, 88), P(42, 6, 82, 28)] },
    { aspect: 0.48, paths: [P(55, 6, 38, 88), P(55, 6, 84, 22)] },
  ],
  מ: [
    { aspect: 0.95, paths: [P(18, 82, 22, 28, 48, 16, 50, 52), P(50, 18, 82, 18, 82, 82, 48, 82)] },
    { aspect: 0.95, paths: [P(50, 10, 16, 88), P(50, 10, 84, 88), P(16, 88, 84, 88)] },
    { aspect: 0.9, paths: [P(20, 84, 22, 20, 78, 20, 80, 84)] },
  ],
  ם: [
    { aspect: 0.95, paths: [P(22, 16, 80, 16, 80, 84, 22, 84, 22, 16)] },
    { aspect: 0.92, paths: [P(20, 18, 80, 18, 80, 82, 20, 82, 20, 18)] },
  ],
  נ: [
    { aspect: 0.7, paths: [P(28, 16, 72, 16, 72, 84, 24, 84)] },
    { aspect: 0.65, paths: [P(30, 16, 74, 16, 74, 86)] },
  ],
  ן: [
    { aspect: 0.28, paths: [P(40, 14, 62, 14, 62, 96)] },
    { aspect: 0.22, paths: [P(50, 10, 50, 96)] },
  ],
  ס: [
    { aspect: 0.92, paths: [P(50, 14, 78, 22, 86, 50, 78, 80, 50, 90, 22, 80, 14, 50, 22, 22, 50, 14)] },
    { aspect: 0.9, paths: [P(22, 16, 78, 16, 78, 84, 22, 84, 22, 16)] },
  ],
  ע: [
    { aspect: 0.85, paths: [P(18, 20, 42, 78, 16, 88), P(78, 16, 42, 78)] },
    { aspect: 0.88, paths: [P(82, 12, 28, 88), P(18, 22, 28, 88, 70, 88)] },
    { aspect: 0.85, paths: [P(78, 10, 78, 70, 22, 88), P(22, 18, 50, 70)] },
  ],
  פ: [
    { aspect: 0.82, paths: [P(22, 18, 78, 18, 84, 50, 78, 84, 22, 84), P(58, 38, 58, 62)] },
    { aspect: 0.85, paths: [P(20, 16, 80, 16, 80, 84, 20, 84), P(52, 36, 52, 60)] },
  ],
  ף: [
    { aspect: 0.42, paths: [P(20, 14, 70, 14, 70, 96), P(48, 32, 48, 52)] },
    { aspect: 0.4, paths: [P(22, 12, 68, 12, 68, 96)] },
  ],
  צ: [
    { aspect: 0.85, paths: [P(20, 18, 48, 58, 16, 84), P(78, 14, 48, 58)] },
    { aspect: 0.88, paths: [P(22, 16, 50, 55, 18, 82), P(78, 12, 50, 55, 82, 82)] },
  ],
  ץ: [
    { aspect: 0.55, paths: [P(22, 12, 50, 48), P(78, 12, 50, 48, 50, 96)] },
    { aspect: 0.5, paths: [P(24, 10, 52, 50, 52, 96), P(80, 10, 52, 50)] },
  ],
  ק: [
    { aspect: 0.55, paths: [P(22, 14, 72, 14, 72, 94)] },
    { aspect: 0.58, paths: [P(20, 14, 74, 14, 74, 94), P(74, 14, 38, 58)] },
  ],
  ר: [
    { aspect: 0.72, paths: [P(22, 16, 78, 16, 78, 86)] },
    { aspect: 0.65, paths: [P(24, 16, 72, 16, 72, 88)] },
  ],
  ש: [
    { aspect: 1.05, paths: [P(14, 28, 18, 84), P(18, 84, 50, 28, 82, 84), P(82, 84, 86, 28)] },
    { aspect: 1.05, paths: [P(14, 18, 14, 84, 50, 84, 50, 18), P(50, 84, 86, 84, 86, 18)] },
    { aspect: 1.0, paths: [P(16, 22, 16, 86, 50, 86, 84, 86, 84, 22), P(50, 86, 50, 36)] },
  ],
  ת: [
    { aspect: 0.88, paths: [P(20, 16, 82, 16, 82, 88), P(20, 16, 20, 88, 42, 88)] },
    { aspect: 0.9, paths: [P(18, 16, 84, 16, 84, 88), P(18, 16, 18, 88), P(18, 88, 44, 88)] },
  ],
};

export function strokeModels(expected: string): StrokeModel[] {
  return MODELS[modelGlyph(expected)] ?? [];
}

export function strokeModel(expected: string): StrokeModel | null {
  return strokeModels(expected)[0] ?? null;
}

function dist(a: InkPoint, b: InkPoint) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function densify(path: InkPoint[], step = 3.2): InkPoint[] {
  const out: InkPoint[] = [];
  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1];
    const b = path[i];
    const n = Math.max(1, Math.round(dist(a, b) / step));
    for (let k = 0; k < n; k++) {
      const t = k / n;
      out.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
    }
  }
  if (path.length) out.push(path[path.length - 1]);
  return out;
}

function flatten(strokes: InkStroke[]): InkPoint[] {
  return strokes.flatMap((s) => (s.length === 1 ? s : densify(s)));
}

function bbox(pts: InkPoint[]) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const p of pts) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }
  return { minX, minY, w: Math.max(1, maxX - minX), h: Math.max(1, maxY - minY) };
}

/** Fit ink into 0–100, keeping shape. Big or small is the same after this. */
function toUnit(pts: InkPoint[], targetAspect: number): InkPoint[] {
  const b = bbox(pts);
  const boxW = 100;
  const boxH = 100;
  const want = targetAspect;
  const have = b.w / b.h;
  let dw = boxW;
  let dh = boxH;
  if (have > want) dh = boxW / have;
  else dw = boxH * have;
  const ox = (boxW - dw) / 2;
  const oy = (boxH - dh) / 2;
  return pts.map((p) => ({
    x: ox + ((p.x - b.minX) / b.w) * dw,
    y: oy + ((p.y - b.minY) / b.h) * dh,
  }));
}

function nearest(p: InkPoint, cloud: InkPoint[]): number {
  let best = Infinity;
  for (const q of cloud) {
    const d = dist(p, q);
    if (d < best) best = d;
  }
  return best;
}

function coverage(from: InkPoint[], to: InkPoint[], limit: number): number {
  if (!from.length) return 0;
  let hit = 0;
  for (const p of from) if (nearest(p, to) <= limit) hit += 1;
  return hit / from.length;
}

export function matchStrokeModel(strokes: InkStroke[], expected: string): { score: number; cover: number; extra: number } | null {
  const models = strokeModels(expected);
  if (!models.length) return null;
  const ink = flatten(strokes);
  if (ink.length < 6) return null;
  const b = bbox(ink);
  if (b.w < 8 && b.h < 8) return null;

  let best = { score: 0, cover: 0, extra: 0 };
  for (const model of models) {
    const modelPts = model.paths.flatMap((p) => densify(p));
    const inkU = toUnit(ink, model.aspect);
    const cover = coverage(modelPts, inkU, 14);
    const extra = coverage(inkU, modelPts, 16);
    const score = cover * 0.58 + extra * 0.42;
    if (score > best.score) best = { score, cover, extra };
  }
  return best;
}

export function modelToPad(
  expected: string,
  width: number,
  height: number,
  region: { top: number; bottom: number },
): InkPoint[][] {
  const model = strokeModel(expected);
  if (!model) return [];
  const padW = width * 0.62;
  const padH = height * (region.bottom - region.top);
  const ox = (width - padW) / 2;
  const oy = height * region.top;
  return model.paths.map((path) =>
    path.map((p) => ({
      x: ox + (p.x / 100) * padW,
      y: oy + (p.y / 100) * padH,
    })),
  );
}
