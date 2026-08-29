import assert from "node:assert/strict";
import test from "node:test";
import { createJiti } from "jiti";

const jiti = createJiti(import.meta.url, { alias: { "@": "/workspace/src" } });
const { verifyLetterInk } = await jiti.import("/workspace/src/lib/letter-shape.ts");

const H = 208;
const TOP = H * 0.24;
const BASE = H * 0.66;

function line(x1, y1, x2, y2, n = 24) {
  const s = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    s.push({ x: x1 + (x2 - x1) * t, y: y1 + (y2 - y1) * t });
  }
  return s;
}

function grade(strokes, letter) {
  return verifyLetterInk(strokes, letter, { height: H });
}

function openHangQof(below = 36) {
  const stemX = 230;
  return [line(155, TOP + 8, stemX, TOP + 8), line(stemX, TOP + 8, stemX, BASE + below)];
}

function latinP(below = 2) {
  const stemX = 175;
  const r = 32;
  const stem = line(stemX, TOP + 6, stemX, BASE + below, 28);
  const bowl = [];
  for (let i = 0; i <= 22; i++) {
    const t = i / 22;
    const ang = -Math.PI / 2 + Math.PI * t;
    bowl.push({ x: stemX + Math.cos(ang) * r * 1.15 + r * 0.15, y: TOP + 6 + r + Math.sin(ang) * r });
  }
  bowl.push({ x: stemX, y: TOP + 6 + r * 2 });
  return [stem, bowl];
}

function printedHangQof() {
  const stemX = 230;
  const stem = line(stemX, TOP + 6, stemX, BASE + 38, 30);
  const bowl = [];
  const r = 30;
  for (let i = 0; i <= 24; i++) {
    const t = i / 24;
    const ang = -Math.PI / 2 - Math.PI * t;
    bowl.push({ x: stemX + Math.cos(ang) * r * 1.15, y: TOP + 8 + r + Math.sin(ang) * r });
  }
  return [stem, bowl];
}

function latinT() {
  return [line(150, TOP + 10, 250, TOP + 10), line(200, TOP + 10, 200, BASE - 4)];
}

function kafC() {
  return [line(150, TOP + 8, 250, TOP + 8, 16), line(250, TOP + 8, 250, BASE - 6, 16), line(250, BASE - 6, 150, BASE - 6, 16)];
}

test("chart qof (open resh + hanging right leg) counts", () => {
  const r = grade(openHangQof(), "ק");
  assert.ok(r.match === "exact" || r.match === "close", JSON.stringify(r));
  assert.equal(r.read, "ק");
});

test("qof sitting on the line looks like resh, not qof", () => {
  const r = grade(openHangQof(0), "ק");
  assert.equal(r.match, "wrong");
  assert.notEqual(r.read, "ק");
  assert.match(r.note || "", /below/);
});

test("a 3px hang still counts as qof", () => {
  const r = grade(openHangQof(3), "ק");
  assert.ok(r.match === "exact" || r.match === "close", JSON.stringify(r));
});

test("Latin P is not qof", () => {
  const onLine = grade(latinP(2), "ק");
  assert.equal(onLine.match, "wrong");
  assert.notEqual(onLine.read, "ק");
  assert.match(onLine.note || "", /Latin P/);

  const hanging = grade(latinP(40), "ק");
  assert.equal(hanging.match, "wrong");
  assert.notEqual(hanging.read, "ק");
});

test("printed qof (bowl on the left, right leg hanging) counts", () => {
  const r = grade(printedHangQof(), "ק");
  assert.ok(r.match === "exact" || r.match === "close", JSON.stringify(r));
  assert.equal(r.read, "ק");
});

test("screenshot-like Latin P on the line is not qof", () => {
  const x = 190;
  const top = TOP + 10;
  const bowl = [...line(x, top, 245, top, 10), ...line(245, top, 245, top + 42, 10), ...line(245, top + 42, x, top + 42, 10)];
  const r = grade([line(x, top, x, BASE, 24), bowl], "ק");
  assert.equal(r.match, "wrong");
  assert.notEqual(r.read, "ק");
  assert.match(r.note || "", /Latin P/);
});

test("Latin T is not kaf", () => {
  const r = grade(latinT(), "כ");
  assert.equal(r.match, "wrong");
  assert.ok(r.read === "ז" || r.read === "ד" || r.read === "ו", JSON.stringify(r));
});

test("open backwards C is kaf", () => {
  const r = grade(kafC(), "כ");
  assert.ok(r.match === "exact" || r.match === "close", JSON.stringify(r));
});

test("hanging resh is read as qof", () => {
  const r = grade(openHangQof(40), "ר");
  assert.equal(r.match, "wrong");
  assert.equal(r.read, "ק");
});
