import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";

const MAX_IMAGE_CHARS = 1_800_000;

type Ok = { ok: true; hebrew: string };
type Err = { ok: false; error: string };
export type ReadHandwritingResult = Ok | Err;

export const readHandwriting = createServerFn({ method: "POST" })
  .validator((input: { image: string }) => input)
  .middleware([authMiddleware])
  .handler(async ({ data }): Promise<ReadHandwritingResult> => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { ok: false, error: "Handwriting check is unavailable right now." };
    if (!data.image || data.image.length < 32) return { ok: false, error: "Empty drawing." };
    if (data.image.length > MAX_IMAGE_CHARS) return { ok: false, error: "Drawing is too large. Clear and try a simpler stroke." };

    const prompt =
      "This image is a student's handwriting on a blank pad. Transcribe ONLY the Biblical Hebrew letters you can actually see. Ignore English, ruling, smudges, and decoration. Niqqud/vowels are optional. Reply with JSON only, no markdown: {\"hebrew\":\"...\"}. If nothing readable, {\"hebrew\":\"\"}. Do not translate. Do not invent letters.";

    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-4.5",
        temperature: 0,
        max_tokens: 80,
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
    const hebrew = parseHebrew(text);
    return { ok: true, hebrew };
  });

function parseHebrew(text: string): string {
  const trimmed = text.trim();
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]) as { hebrew?: unknown };
      if (typeof parsed.hebrew === "string") return parsed.hebrew.trim();
    } catch {
      /* fall through */
    }
  }
  const letters = trimmed.replace(/[`*"']/g, "").match(/[\u05D0-\u05EA\u0591-\u05C7]+/g);
  return letters ? letters.join("") : "";
}
