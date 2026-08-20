import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { normalizeHebrew } from "@/lib/hebrew";

const MAX_IMAGE_CHARS = 1_800_000;

type Ok = { ok: true; hebrew: string; verdict: "exact" | "close" | "different" };
type Err = { ok: false; error: string };
export type ReadHandwritingResult = Ok | Err;

export const readHandwriting = createServerFn({ method: "POST" })
  .validator((input: { image: string; expected: string }) => input)
  .middleware([authMiddleware])
  .handler(async ({ data }): Promise<ReadHandwritingResult> => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { ok: false, error: "Handwriting check is unavailable right now." };
    if (!data.image || data.image.length < 32) return { ok: false, error: "Empty drawing." };
    if (data.image.length > MAX_IMAGE_CHARS) return { ok: false, error: "Drawing is too large. Clear and try a simpler stroke." };

    const target = normalizeHebrew(data.expected);
    const prompt = `You are checking a student's Biblical Hebrew handwriting on a white pad (black ink, right-to-left).

The assigned lemma (consonants only) is: ${target || "(unknown)"}

1. Transcribe the consonants you actually see (א-ת). Ignore English, ruling, and decoration. Niqqud is optional and should be omitted from "hebrew".
2. Judge whether the ink is that lemma.

Lookalike student shapes: ד/ר, ב/כ, ו/י/ן, ה/ח/ת, ס/ם, ג/נ. A missing or extra mater (ו/י) can still be close.

Reply JSON only, no markdown:
{"hebrew":"...consonants in word order...","verdict":"exact"|"close"|"different"}

exact = clearly the assigned lemma (vowels may be missing).
close = same word with one lookalike, missing mater, or messy but recognizable.
different = another word, extra letters, or unreadable.
If nothing readable: {"hebrew":"","verdict":"different"}.
Do not mark exact unless the strokes support it. Do not translate.`;

    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-4.5",
        temperature: 0,
        max_tokens: 120,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: data.image } },
            ],
          },
        ],
      }),
    });

    if (!res.ok) {
      return { ok: false, error: `Could not read the writing (${res.status}). Try again in a moment.` };
    }

    const body = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const text = body.choices?.[0]?.message?.content ?? "";
    const parsed = parseReply(text);
    return { ok: true, hebrew: parsed.hebrew, verdict: parsed.verdict };
  });

function parseReply(text: string): { hebrew: string; verdict: "exact" | "close" | "different" } {
  const trimmed = text.trim();
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]) as { hebrew?: unknown; verdict?: unknown };
      const hebrew = typeof parsed.hebrew === "string" ? parsed.hebrew.trim() : "";
      const v = parsed.verdict;
      const verdict = v === "exact" || v === "close" || v === "different" ? v : "different";
      return { hebrew, verdict };
    } catch {
      /* fall through */
    }
  }
  const letters = trimmed.replace(/[`*"']/g, "").match(/[\u05D0-\u05EA\u0591-\u05C7]+/g);
  return { hebrew: letters ? letters.join("") : "", verdict: "different" };
}
