import { matchLetter, matchVowel, type HandMatch } from "@/lib/hebrew";
import { verifyLetterInk, type InkStroke } from "@/lib/letter-shape";
import { readHandwriting } from "@/lib/read-handwriting";
import { takeWriteCheck } from "@/lib/write-cap";

export type GlyphCheck = { match: HandMatch; read: string; note?: string; counted?: boolean };

export async function checkGlyphInk(
  image: string,
  expected: string,
  mode: "letter" | "vowel",
  strokes?: InkStroke[],
): Promise<GlyphCheck> {
  const local = mode === "letter" && strokes?.length ? verifyLetterInk(strokes, expected) : null;
  if (local && (local.match === "exact" || local.match === "close")) {
    if (takeWriteCheck()) {
      /* counted */
    }
    return { match: local.match, read: local.read, counted: true };
  }

  try {
    const res = await readHandwriting({ data: { image, expected, mode } });
    if (!res.ok) {
      if (local && local.match === "close") return { match: "close", read: local.read, counted: true };
      return {
        match: "empty",
        read: local?.read ?? "",
        note: "Could not reach the handwriting reader. Draw the letter larger and try again — this was not counted as a miss.",
        counted: false,
      };
    }
    if (!takeWriteCheck()) {
      return { match: "wrong", read: "", note: "Daily check limit reached. Come back tomorrow.", counted: false };
    }
    const compared = mode === "vowel" ? matchVowel(expected, res.hebrew) : matchLetter(expected, res.hebrew);
    let match = compared.match;
    if (match !== "exact" && res.verdict === "exact" && compared.readN) match = "exact";
    else if (match === "wrong" && res.verdict === "close") match = "close";
    else if (match === "wrong" && local && local.match === "close") match = "close";
    return { match, read: res.hebrew || compared.readN || local?.read || "", counted: true };
  } catch {
    if (local && (local.match === "exact" || local.match === "close")) {
      return { match: local.match, read: local.read, counted: true };
    }
    return {
      match: "empty",
      read: "",
      note: "Could not reach the handwriting reader. Try again — this was not counted as a miss.",
      counted: false,
    };
  }
}
