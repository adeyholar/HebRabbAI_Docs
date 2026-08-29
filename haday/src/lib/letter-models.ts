import { foldLetterGlyph } from "@/lib/hebrew";

/** IIBS Biblical Hebrew A (lessons 1–4): block letters on a two-line stave. */
export type LetterBand = "body" | "ascender" | "descender" | "hang" | "small";

export type LetterModel = {
  glyph: string;
  band: LetterBand;
  hint: string;
};

const MODELS: Record<string, LetterModel> = {
  א: { glyph: "א", band: "body", hint: "Diagonal with two arms. Sits between the lines. Not a stick, not a circle." },
  ב: { glyph: "ב", band: "body", hint: "Open on the left, with a floor. Between the lines." },
  ג: { glyph: "ג", band: "body", hint: "A short stem with a foot kicking left. Between the lines." },
  ד: { glyph: "ד", band: "body", hint: "Roof and a right stem. Between the lines. Not a circle." },
  ה: { glyph: "ה", band: "body", hint: "Roof, right stem, left stem that does not join the roof. Between the lines." },
  ו: { glyph: "ו", band: "body", hint: "One short stem. Between the lines — not below, no roof bar." },
  ז: { glyph: "ז", band: "body", hint: "Short roof bar plus a stem. Stays between the lines. Not a final nun." },
  ח: { glyph: "ח", band: "body", hint: "Roof joining two stems. Between the lines." },
  ט: { glyph: "ט", band: "body", hint: "Rounded, slightly open. Between the lines. Not a closed samekh." },
  י: { glyph: "י", band: "small", hint: "Tiny mark in the upper half of the body. Not a long stem." },
  כ: { glyph: "כ", band: "body", hint: "Open on the left, no long floor. Between the lines." },
  ך: { glyph: "ך", band: "descender", hint: "Final kaf: long stem that drops below the bottom line." },
  ל: { glyph: "ל", band: "ascender", hint: "The only letter that rises above the top line." },
  מ: { glyph: "מ", band: "body", hint: "Open at the bottom-left. Between the lines. Not a closed box." },
  ם: { glyph: "ם", band: "body", hint: "Final mem: a closed square on the line — it does not drop below." },
  נ: { glyph: "נ", band: "body", hint: "Short, open, between the lines. Not a long descender." },
  ן: { glyph: "ן", band: "descender", hint: "Final nun: one long stem below the bottom line. No roof bar." },
  ס: { glyph: "ס", band: "body", hint: "Closed oval between the lines. No slash through it." },
  ע: { glyph: "ע", band: "body", hint: "Two arms from the top (a fork). Open, not a circle." },
  פ: { glyph: "פ", band: "body", hint: "Open on the left with a nose inside. Between the lines." },
  ף: { glyph: "ף", band: "descender", hint: "Final pe: the stem drops below the bottom line." },
  צ: { glyph: "צ", band: "body", hint: "A fork / bent arm. Between the lines, not a long descender." },
  ץ: { glyph: "ץ", band: "descender", hint: "Final tsade: fork plus a stem that drops below the bottom line." },
  ק: { glyph: "ק", band: "hang", hint: "Body on the line; the leg hangs a little below the bottom line." },
  ר: { glyph: "ר", band: "body", hint: "Rounded roof and a right stem. Between the lines." },
  ש: { glyph: "ש", band: "body", hint: "Three arms. Between the lines. Shin-dot on the right, sin-dot on the left." },
  ת: { glyph: "ת", band: "body", hint: "Like het, with a small left foot. Between the lines." },
};

export function modelGlyph(expected: string): string {
  const g = foldLetterGlyph(expected);
  if (g.startsWith("ש")) return "ש";
  return g.replace(/[^\u05D0-\u05EA]/g, "").slice(0, 1);
}

export function letterModel(expected: string): LetterModel | null {
  const id = modelGlyph(expected);
  return MODELS[id] ?? null;
}

export function writingHint(expected: string): string {
  return letterModel(expected)?.hint ?? "Block letter. Body between the two lines.";
}

export function ghostStyle(expected: string): { top: string; height: string; fontSize: string } {
  const band = letterModel(expected)?.band ?? "body";
  if (band === "ascender") return { top: "4%", height: "58%", fontSize: "5.2rem" };
  if (band === "descender") return { top: "28%", height: "68%", fontSize: "5.6rem" };
  if (band === "hang") return { top: "22%", height: "58%", fontSize: "5.2rem" };
  if (band === "small") return { top: "18%", height: "28%", fontSize: "3.2rem" };
  return { top: "24%", height: "42%", fontSize: "5.5rem" };
}
