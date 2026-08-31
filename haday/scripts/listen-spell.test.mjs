import assert from "node:assert/strict";
import test from "node:test";
import { createJiti } from "jiti";

const jiti = createJiti(import.meta.url, { alias: { "@": "/workspace/src" } });
const { spokenEnglish, primaryGloss, modernLatin } = await jiti.import("/workspace/src/lib/listen.ts");

test("Hebrew name then English translation", () => {
  assert.equal(spokenEnglish("Abraham"), "Abraham");
  assert.equal(modernLatin("ʾabrāhām").toLowerCase().includes("braham"), true);
});

test("English line is the full gloss, not letter spelling", () => {
  assert.equal(spokenEnglish("heaven, sky"), "Heaven, sky");
  assert.equal(primaryGloss("heaven, sky"), "heaven");
  assert.equal(spokenEnglish("YHWH"), "YHWH");
});
