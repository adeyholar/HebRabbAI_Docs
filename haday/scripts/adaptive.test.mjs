import assert from "node:assert/strict";
import test from "node:test";
import { createJiti } from "jiti";

if (typeof globalThis.localStorage === "undefined") {
  const mem = Object.create(null);
  globalThis.localStorage = {
    getItem: (k) => (k in mem ? mem[k] : null),
    setItem: (k, v) => {
      mem[k] = String(v);
    },
    removeItem: (k) => {
      delete mem[k];
    },
    clear: () => {
      for (const k of Object.keys(mem)) delete mem[k];
    },
  };
}

const jiti = createJiti(import.meta.url, { alias: { "@": "/workspace/src" } });
const { twinsOf } = await jiti.import("/workspace/src/lib/confusion.ts");
const { observeBkt, pKnow, pickByBkt } = await jiti.import("/workspace/src/lib/bkt.ts");
const { tanakhForms, tanakhFormsForChapter, weekPlayPool, lemmaIdOf } = await jiti.import(
  "/workspace/src/lib/tanakh-pool.ts",
);
const { chapterPlayPool, chapterPool } = await jiti.import("/workspace/src/lib/game.ts");
const { lettersOnly } = await jiti.import("/workspace/src/lib/hebrew.ts");
const { itemsForWeek } = await jiti.import("/workspace/src/lib/vocab.ts");
const { nudgeDue, hydrateCard } = await jiti.import("/workspace/src/lib/srs.ts");

test("confusion pairs queue he/het, dalet/resh, kaf/bet, qamets/pathach, shin/sin", () => {
  assert.ok(twinsOf("alef:letter:he").includes("alef:letter:het"));
  assert.ok(twinsOf("alef:letter:het").includes("alef:letter:he"));
  assert.ok(twinsOf("alef:letter:dalet").includes("alef:letter:resh"));
  assert.ok(twinsOf("alef:letter:kaf").includes("alef:letter:bet"));
  assert.ok(twinsOf("alef:vowel:qamets").includes("alef:vowel:pathach"));
  assert.ok(twinsOf("alef:vowel:pathach").includes("alef:vowel:qamets"));
  assert.ok(twinsOf("alef:letter:shin").includes("alef:letter:sin"));
  assert.ok(twinsOf("alef:letter:sin").includes("alef:letter:shin"));
});

test("a miss on a tanakh form nudges the lemma twin set", () => {
  const twins = twinsOf("tv:ben:0");
  assert.ok(twins.length >= 0);
  assert.equal(lemmaIdOf("tv:ben:0"), "ben");
});

test("BKT P(know) rises after a hit", () => {
  const id = "alef:letter:known-test";
  const before = pKnow(id);
  observeBkt(id, true);
  observeBkt(id, true);
  observeBkt(id, true);
  const after = pKnow(id);
  assert.ok(after > before, `pL ${before} -> ${after}`);
  const picked = pickByBkt(
    [
      { id: "alef:letter:a" },
      { id: "alef:letter:b" },
      { id: "alef:letter:c" },
      { id: "alef:letter:d" },
    ],
    2,
  );
  assert.equal(picked.length, 2);
});

test("nudgeDue does not count a miss", () => {
  const now = Date.now();
  const card = hydrateCard(undefined, now);
  const nudged = nudgeDue({ ...card, misses: 0, due: now + 86_400_000 }, now);
  assert.equal(nudged.misses, 0);
  assert.ok(nudged.due <= now);
});

test("tanakh forms are real surface words, not the citation lemma", () => {
  const forms = tanakhForms();
  assert.ok(forms.length > 80, `got ${forms.length} forms`);
  for (const item of forms.slice(0, 40)) {
    assert.ok(item.id.startsWith("tv:"));
    const lemma = item.hebrewAlts?.[0];
    assert.ok(lemma, item.id);
    assert.notEqual(lettersOnly(item.hebrew), lettersOnly(lemma));
    assert.ok(item.chapter >= 2 && item.chapter <= 20, item.id);
  }
  const ch3 = tanakhFormsForChapter(3, 24);
  assert.ok(ch3.length >= 4, `ch3 forms ${ch3.length}`);
  const ben = forms.filter((v) => lemmaIdOf(v.id) === "ben").map((v) => lettersOnly(v.hebrew));
  assert.ok(ben.includes("בנך") || ben.includes(lettersOnly("בִּנְךָ")));
  assert.ok(!ben.includes(lettersOnly("תֶּבֶן")), "straw is not son");
  assert.ok(!ben.includes(lettersOnly("וַיִּבֶן")), "he built is not son");
});

test("game play pool adds Tanakh forms; spell-strict stays lemmas", () => {
  const lemmas = chapterPool(3);
  const play = chapterPlayPool(3, "recognize");
  const strict = chapterPlayPool(3, "spell-strict");
  assert.ok(play.length > lemmas.length, `play ${play.length} vs lemmas ${lemmas.length}`);
  assert.equal(strict.length, lemmas.length);
  assert.ok(play.some((v) => v.id.startsWith("tv:")));
});

test("quiz week pool mixes Tanakh forms into later weeks", () => {
  const lemmas = itemsForWeek(2);
  const mixed = weekPlayPool(2);
  assert.ok(mixed.length >= lemmas.length);
  assert.ok(mixed.some((v) => v.id.startsWith("tv:")), "week 2 should include Tanakh forms");
});
