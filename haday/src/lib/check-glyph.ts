import { matchLetter, matchVowel, type HandMatch } from "@/lib/hebrew";
import { readHandwriting } from "@/lib/read-handwriting";
import { takeWriteCheck } from "@/lib/write-cap";

export type GlyphCheck = { match: HandMatch; read: string; note?: string };

export async function checkGlyphInk(
  image: string,
  expected: string,
  mode: "letter" | "vowel",
): Promise<GlyphCheck> {
  if (!takeWriteCheck()) {
    return { match: "wrong", read: "", note: "Daily check limit reached. Come back tomorrow." };
  }
  try {
    const res = await readHandwriting({ data: { image, expected, mode } });
    if (!res.ok) return { match: "wrong", read: "", note: res.error };
    const compared = mode === "vowel" ? matchVowel(expected, res.hebrew) : matchLetter(expected, res.hebrew);
    let match = compared.match;
    if (match !== "exact" && res.verdict === "exact" && compared.readN) match = "exact";
    else if (match === "wrong" && res.verdict === "close") match = "close";
    return { match, read: res.hebrew || compared.readN };
  } catch {
    return { match: "wrong", read: "", note: "Could not reach the reader. Try again." };
  }
}
