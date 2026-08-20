/** Strip niqqud, cantillation, and map final letters to their medial forms. */
export function stripNiqqud(s: string): string {
  return s
    .normalize("NFC")
    .replace(/[\u0591-\u05C7]/g, "")
    .replace(/[\u05F3\u05F4\u05BE\u05C0\u05C3\u05C6]/g, "")
    .replace(/[־–—]/g, "")
    .replace(/\s+/g, "");
}

const FINALS: Record<string, string> = {
  ך: "כ",
  ם: "מ",
  ן: "נ",
  ף: "פ",
  ץ: "צ",
};

export function foldFinals(s: string): string {
  return [...s].map((ch) => FINALS[ch] ?? ch).join("");
}

export function normalizeHebrew(s: string): string {
  return foldFinals(stripNiqqud(s)).replace(/[^\u05D0-\u05EA]/g, "");
}

export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = i - 1;
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = row[j];
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + cost);
      prev = tmp;
    }
  }
  return row[b.length];
}

export type HandMatch = "exact" | "close" | "wrong" | "empty";

export function matchHandwriting(expected: string, read: string): { match: HandMatch; distance: number; expectedN: string; readN: string } {
  const expectedN = normalizeHebrew(expected);
  const readN = normalizeHebrew(read);
  if (!readN) return { match: "empty", distance: expectedN.length, expectedN, readN };
  const distance = levenshtein(expectedN, readN);
  if (distance === 0) return { match: "exact", distance, expectedN, readN };
  const close = distance <= 1 || (expectedN.length >= 4 && distance / expectedN.length <= 0.25);
  return { match: close ? "close" : "wrong", distance, expectedN, readN };
}

export function findHitRange(hebrew: string, hit: string): { start: number; end: number } | null {
  if (!hit) return null;
  const direct = hebrew.indexOf(hit);
  if (direct >= 0) return { start: direct, end: direct + hit.length };

  const want = normalizeHebrew(hit);
  if (!want) return null;
  let acc = "";
  const map: number[] = [];
  for (let i = 0; i < hebrew.length; i++) {
    const folded = normalizeHebrew(hebrew[i]);
    if (!folded) continue;
    map.push(i);
    acc += folded;
  }
  const at = acc.indexOf(want);
  if (at < 0) return null;
  const start = map[at];
  const last = map[at + want.length - 1];
  if (start == null || last == null) return null;
  return { start, end: last + 1 };
}
