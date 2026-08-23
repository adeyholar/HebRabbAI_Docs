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
  if (mode === "letter") {
    const local = verifyLetterInk(strokes ?? [], expected);
    if (local.match === "exact" || local.match === "close") {
      takeWriteCheck();
      return { match: local.match, read: local.read || expected, counted: true };
    }
    if (local.match === "wrong") {
      takeWriteCheck();
      return { match: "wrong", read: local.read, counted: true };
    }
  }

  try {
    const res = await readHandwriting({ data: { image, expected, mode } });
    if (res.ok) {
      takeWriteCheck();
      const compared = mode === "vowel" ? matchVowel(expected, res.hebrew) : matchLetter(expected, res.hebrew);
      let match = compared.match;
      if (match !== "exact" && res.verdict === "exact" && compared.readN) match = "exact";
      else if (match === "wrong" && res.verdict === "close") match = "close";
      return { match, read: res.hebrew || compared.readN || "", counted: true };
    }
  } catch {
    /* reader offline */
  }

  if (mode === "letter" && (strokes?.length ?? 0) > 0) {
    takeWriteCheck();
    return { match: "close", read: expected, counted: true };
  }

  return {
    match: "empty",
    read: "",
    note: "Could not judge that ink. Count it if the letter looks right, or mark a miss.",
    counted: false,
  };
}
