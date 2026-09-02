import assert from "node:assert/strict";
import test from "node:test";
import { createJiti } from "jiti";

const jiti = createJiti(import.meta.url, { alias: { "@": "/workspace/src" } });
const { lettersOnly } = await jiti.import("/workspace/src/lib/hebrew.ts");
const { lemmaForSurface, isInflected, tanakhForms, lemmaIdOf } = await jiti.import(
  "/workspace/src/lib/tanakh-pool.ts",
);

test("Gen 3:15 אשית is I will put, not fire", () => {
  assert.equal(lemmaForSurface("אָשִׁית"), undefined);
  assert.equal(lemmaForSurface("אשית"), undefined);
  assert.notEqual(lemmaForSurface("אָשִׁית")?.id, "ishah");
  assert.equal(isInflected("אָשִׁית", "אֵשׁ"), false);
  const fires = tanakhForms().filter((v) => lemmaIdOf(v.id) === "esh");
  for (const f of fires) {
    assert.notEqual(lettersOnly(f.hebrew), lettersOnly("אָשִׁית"), f.hebrew);
    assert.ok(isInflected(f.hebrew, "אֵשׁ") || lettersOnly(f.hebrew) === lettersOnly("אֵשׁ"), f.hebrew);
  }
});

test("woman is not fire; fire with article is fire", () => {
  assert.equal(lemmaForSurface("הָאִשָּׁה")?.id, "ishah");
  assert.equal(lemmaForSurface("אִשָּׁה")?.id, "ishah");
  assert.equal(lemmaForSurface("הָאֵשׁ")?.id, "esh");
  assert.equal(lemmaForSurface("בָּאֵשׁ")?.id, "esh");
  assert.notEqual(lemmaForSurface("אֲשֶׁר")?.id, "esh");
});

test("longer lemma wins over a 2-letter substring", () => {
  assert.equal(lemmaForSurface("אֱלֹהִים")?.id, "elohim");
  assert.notEqual(lemmaForSurface("אֱלֹהִים")?.id, "el-god");
  assert.equal(lemmaForSurface("יִשְׂרָאֵל")?.id, "israel");
  assert.equal(lemmaForSurface("הַמֶּלֶךְ")?.id, "melek");
  assert.equal(lemmaForSurface("בְּנֵי")?.id, "ben");
  assert.equal(lemmaForSurface("בְּרֵאשִׁית")?.id, "rosh");
});

test("a 2-letter lemma is never glued onto a longer unrelated word", () => {
  const bad = [];
  for (const item of tanakhForms()) {
    const stored = lemmaIdOf(item.id);
    const surf = lettersOnly(item.hebrew);
    const guessed = lemmaForSurface(item.hebrew);
    if (!guessed) continue;
    const g = lettersOnly(guessed.hebrew);
    if (g.length > 2) continue;
    if (guessed.id === stored) continue;
    if (surf.startsWith(g) && surf.length - g.length >= 2) {
      bad.push(`${item.hebrew} stored=${stored} guessed=${guessed.id} (${guessed.gloss})`);
    }
  }
  assert.equal(bad.length, 0, bad.slice(0, 20).join("\n"));
});
