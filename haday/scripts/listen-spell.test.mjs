import assert from "node:assert/strict";
import test from "node:test";
import { createJiti } from "jiti";

const jiti = createJiti(import.meta.url, { alias: { "@": "/workspace/src" } });
const { spellLetterNames, spellSpoken, meaningRemainder, primaryGloss, titleGloss } = await jiti.import(
  "/workspace/src/lib/listen.ts",
);

test("heaven is spelled Shin Mem Yod Final mem, named, then meaning", () => {
  const names = spellLetterNames("שָׁמַיִם");
  assert.deepEqual(names, ["Shin", "Mem", "Yod", "Final mem"]);
  assert.equal(spellSpoken("שָׁמַיִם"), "Shin. Mem. Yod. Final mem");
  assert.equal(titleGloss("heaven, sky"), "Heaven");
  assert.equal(meaningRemainder("heaven, sky"), "sky");
});

test("sin vs shin is read from the dot", () => {
  assert.deepEqual(spellLetterNames("יִשְׂרָאֵל"), ["Yod", "Sin", "Resh", "Alef", "Lamed"]);
  assert.deepEqual(spellLetterNames("שָׁאוּל"), ["Shin", "Alef", "Vav", "Lamed"]);
});

test("bare shin is Shin; finals keep their names", () => {
  assert.deepEqual(spellLetterNames("שמים"), ["Shin", "Mem", "Yod", "Final mem"]);
  assert.deepEqual(spellLetterNames("אֶרֶץ"), ["Alef", "Resh", "Final tsade"]);
  assert.deepEqual(spellLetterNames("מֶלֶךְ"), ["Mem", "Lamed", "Final kaf"]);
});

test("primary gloss is the name you hear first", () => {
  assert.equal(primaryGloss("heaven, sky"), "heaven");
  assert.equal(meaningRemainder("horse"), "");
  assert.equal(titleGloss("YHWH"), "YHWH");
});
