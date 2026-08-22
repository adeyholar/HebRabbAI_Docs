/** Strip niqqud and cantillation. Final letters are kept as-is. */
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

export function lettersOnly(s: string): string {
  return stripNiqqud(s).replace(/[^\u05D0-\u05EA]/g, "");
}

/** וּ (shureq) writes the same û as qibbuts ֻ — the vav is a vowel letter, not a root consonant. */
export function foldShureq(s: string): string {
  return s.replaceAll("וּ", "ֻ");
}

/** Hireq in ירושלים sits between lamed and mem. Typing it on ם is the same as on ל. */
function foldJerusalemHireq(s: string): string {
  return s.replace(/([\u05DC][\u05B7\u05B8])(\u05DD)\u05B4/g, "$1\u05B4$2");
}

/** Lexical form is patah; pausal/qamets on that lamed is the same name. */
function foldJerusalemPatah(s: string): string {
  return s.replace(/\u05DC\u05B4\u05B8\u05DD/g, "\u05DC\u05B4\u05B7\u05DD");
}

function canonMarks(s: string): string {
  const cons = /[\u05D0-\u05EA]/;
  const chars = [...s];
  let out = "";
  let i = 0;
  while (i < chars.length) {
    const ch = chars[i];
    if (!cons.test(ch)) {
      out += ch;
      i += 1;
      continue;
    }
    i += 1;
    const marks: string[] = [];
    while (i < chars.length && !cons.test(chars[i])) {
      marks.push(chars[i]);
      i += 1;
    }
    marks.sort();
    out += ch + marks.join("");
  }
  return out;
}

export function normalizeHebrew(s: string): string {
  return lettersOnly(foldShureq(s));
}

/** True when consonants match except a medial was used in place of a final (or the reverse). */
export function isFinalFormMismatch(expected: string, typed: string): boolean {
  const want = lettersOnly(expected);
  const got = lettersOnly(typed);
  if (!want || !got) return false;
  return foldFinals(want) === foldFinals(got) && want !== got;
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

const LOOKALIKE: Record<string, string> = {
  ד: "ר",
  ר: "ד",
  ב: "כ",
  כ: "ב",
  ו: "י",
  י: "ו",
  ה: "ח",
  ח: "ה",
  ת: "ח",
  ס: "ם",
  ם: "ס",
  מ: "ס",
  נ: "ג",
  ג: "נ",
  ע: "צ",
  צ: "ע",
  ך: "ר",
  ן: "ו",
};

function substCost(a: string, b: string): number {
  if (a === b) return 0;
  if (LOOKALIKE[a] === b || LOOKALIKE[b] === a) return 0.35;
  const matres = new Set(["ו", "י", "ה"]);
  if (matres.has(a) && matres.has(b)) return 0.4;
  return 1;
}

export function weightedDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const rows = Array.from({ length: a.length + 1 }, () => new Array<number>(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) rows[i][0] = i;
  for (let j = 0; j <= b.length; j++) rows[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = substCost(a[i - 1], b[j - 1]);
      const insCost = a[i - 1] === "ו" || a[i - 1] === "י" ? 0.45 : 1;
      const delCost = b[j - 1] === "ו" || b[j - 1] === "י" ? 0.45 : 1;
      rows[i][j] = Math.min(rows[i - 1][j] + insCost, rows[i][j - 1] + delCost, rows[i - 1][j - 1] + cost);
    }
  }
  return rows[a.length][b.length];
}

export function liveMatch(expected: string, typed: string): "empty" | "prefix" | "exact" | "off" {
  const want = normalizeHebrew(expected);
  const got = normalizeHebrew(typed);
  if (!got) return "empty";
  if (isFinalFormMismatch(expected, typed)) return "off";
  if (got === want || consonantsMatch(expected, typed)) return "exact";
  if (want.startsWith(got)) return "prefix";
  return "off";
}

/** Keep vowels, dagesh, and shin/sin dots; drop cantillation and whitespace. */
export function normalizeHebrewFull(s: string): string {
  return foldJerusalemPatah(
    canonMarks(
    foldJerusalemHireq(
      foldShureq(
        s
          .normalize("NFC")
          .replace(/[\u0591-\u05AF\u05BD\u05BF\u05C0\u05C3-\u05C5\u05C6\u05C7]/g, "")
          .replace(/[\u05F3\u05F4\u05BE]/g, "")
          .replace(/[־–—]/g, "")
          .replace(/\s+/g, ""),
      ).replace(/[^\u05D0-\u05EA\u05B0-\u05BC\u05C1\u05C2]/g, ""),
    ),
    ),
  );
}

export function liveMatchFull(expected: string, typed: string): "empty" | "prefix" | "exact" | "off" {
  const want = normalizeHebrewFull(expected);
  const got = normalizeHebrewFull(typed);
  if (!got) return "empty";
  if (got === want) return "exact";
  if (want.startsWith(got)) return "prefix";
  return "off";
}

export function consonantsMatch(expected: string, typed: string): boolean {
  const want = normalizeHebrew(expected);
  const got = normalizeHebrew(typed);
  if (!want || !got) return false;
  if (isFinalFormMismatch(expected, typed)) return false;
  if (got === want) return true;
  const distance = weightedDistance(want, got);
  return distance <= 0.9 || (want.length >= 4 && distance / want.length <= 0.28);
}

export function matchHandwriting(expected: string, read: string): { match: HandMatch; distance: number; expectedN: string; readN: string } {
  const expectedN = normalizeHebrew(expected);
  const readN = normalizeHebrew(read);
  if (!readN) return { match: "empty", distance: expectedN.length, expectedN, readN };
  if (isFinalFormMismatch(expected, read)) {
    return { match: "wrong", distance: 1, expectedN, readN };
  }
  const distance = weightedDistance(expectedN, readN);
  if (distance === 0) return { match: "exact", distance, expectedN, readN };
  const close = distance <= 0.9 || (expectedN.length >= 4 && distance / expectedN.length <= 0.28);
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

const CONS = /[\u05D0-\u05EA]/;
const DAGESH = "\u05BC";
const FULL_VOWEL = /[\u05B1-\u05BB]/;
const BEGAD = new Set(["ב", "ג", "ד", "כ", "פ", "ת", "ך", "ף"]);

export type DageshMark = { letter: string; kind: "lene" | "forte" | "shureq" | "mappiq" };

export function classifyDagesh(hebrew: string): DageshMark[] {
  const clusters: { letter: string; marks: string }[] = [];
  for (let i = 0; i < hebrew.length; i++) {
    if (!CONS.test(hebrew[i])) continue;
    let marks = "";
    let j = i + 1;
    while (j < hebrew.length && !CONS.test(hebrew[j])) {
      marks += hebrew[j];
      j++;
    }
    clusters.push({ letter: hebrew[i], marks });
    i = j - 1;
  }

  const out: DageshMark[] = [];
  for (let i = 0; i < clusters.length; i++) {
    const c = clusters[i];
    if (!c.marks.includes(DAGESH)) continue;
    if (c.letter === "ו") {
      out.push({ letter: "ו", kind: "shureq" });
      continue;
    }
    if (c.letter === "ה") {
      out.push({ letter: "ה", kind: "mappiq" });
      continue;
    }
    if (!BEGAD.has(c.letter)) {
      out.push({ letter: c.letter, kind: "forte" });
      continue;
    }
    const prev = clusters[i - 1];
    const vowelBefore = Boolean(prev && FULL_VOWEL.test(prev.marks));
    out.push({ letter: c.letter, kind: vowelBefore ? "forte" : "lene" });
  }
  return out;
}

export function dageshCoach(hebrew: string): string | null {
  const hits = classifyDagesh(hebrew);
  if (!hits.length) return null;
  return hits
    .map((h) => {
      if (h.kind === "shureq") {
        return `וּ is shureq (û) — the dot in the vav is the vowel, not dagesh forte.`;
      }
      if (h.kind === "mappiq") {
        return `הּ is mappiq — a sounded h at the end of the word, not doubling.`;
      }
      if (h.kind === "lene") {
        return `${h.letter} has dagesh lene — no vowel before it. Hard sound, not doubled.`;
      }
      if (BEGAD.has(h.letter)) {
        return `${h.letter} has dagesh forte — a vowel sits before it, so the letter is doubled.`;
      }
      return `${h.letter} has dagesh forte — this letter is doubled.`;
    })
    .join(" ");
}
