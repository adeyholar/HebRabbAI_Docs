import assert from "node:assert/strict";
import test from "node:test";
import { createJiti } from "jiti";

const jiti = createJiti(import.meta.url, { alias: { "@": "/workspace/src" } });
const { verifyLetterInk } = await jiti.import("/workspace/src/lib/letter-shape.ts");
const { strokeModels } = await jiti.import("/workspace/src/lib/letter-strokes.ts");
const { staveRegion } = await jiti.import("/workspace/src/lib/letter-models.ts");

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

function curve(pts, n = 12) {
  const s = [];
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    for (let k = 0; k < n; k++) {
      const t = k / n;
      s.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
    }
  }
  s.push(pts[pts.length - 1]);
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

function chartAyin() {
  const jx = 310;
  const jy = BASE - 8;
  return [line(230, TOP + 8, jx, jy, 22).concat(line(jx, jy, 225, BASE - 2, 8).slice(1)), line(390, TOP + 6, jx, jy, 22)];
}

function compactYAyin() {
  const jx = 340;
  const jy = BASE - 4;
  return [
    line(305, TOP + 42, jx, jy, 18),
    curve([{ x: jx, y: jy }, { x: 350, y: TOP + 36 }, { x: 360, y: TOP + 8 }], 12),
  ];
}

function oneStrokeUAyin() {
  return [
    curve(
      [
        { x: 260, y: TOP + 18 },
        { x: 270, y: TOP + 50 },
        { x: 290, y: BASE - 10 },
        { x: 320, y: BASE - 2 },
        { x: 350, y: BASE - 12 },
        { x: 365, y: TOP + 40 },
        { x: 372, y: TOP + 8 },
      ],
      14,
    ),
  ];
}

function screenshotAyin() {
  const jx = 340;
  const jy = BASE - 4;
  return [
    curve(
      [
        { x: 312, y: TOP + 38 },
        { x: 328, y: BASE - 20 },
        { x: 338, y: BASE - 2 },
        { x: 328, y: BASE + 2 },
        { x: 350, y: BASE - 10 },
        { x: 358, y: TOP + 28 },
        { x: 352, y: TOP + 6 },
      ],
      16,
    ),
  ];
}

function tsadeY() {
  return [
    line(270, TOP + 12, 320, TOP + 50, 16),
    line(370, TOP + 8, 320, TOP + 50, 16),
    line(320, TOP + 50, 280, BASE - 4, 12),
    line(320, TOP + 50, 360, BASE - 4, 12),
  ];
}

function chartShin() {
  const L = 250;
  const R = 390;
  const M = 320;
  return [
    line(L, TOP + 12, L + 6, BASE - 4, 20),
    curve(
      [
        { x: L + 6, y: BASE - 4 },
        { x: M, y: TOP + 10 },
        { x: R - 6, y: BASE - 4 },
      ],
      16,
    ),
    line(R - 6, BASE - 4, R, TOP + 12, 20),
  ];
}

function screenshotShin() {
  return [
    curve(
      [
        { x: 250, y: TOP + 28 },
        { x: 258, y: BASE - 8 },
        { x: 280, y: BASE - 4 },
        { x: 300, y: TOP + 36 },
        { x: 318, y: BASE - 6 },
        { x: 340, y: BASE - 2 },
        { x: 358, y: TOP + 8 },
      ],
      12,
    ),
  ];
}

function oneStrokeW() {
  return [
    curve(
      [
        { x: 240, y: TOP + 16 },
        { x: 248, y: BASE - 4 },
        { x: 290, y: TOP + 20 },
        { x: 330, y: BASE - 4 },
        { x: 372, y: TOP + 12 },
      ],
      16,
    ),
  ];
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

test("chart ayin (two arms meeting like a Y) counts", () => {
  const r = grade(chartAyin(), "ע");
  assert.ok(r.match === "exact" || r.match === "close", JSON.stringify(r));
  assert.equal(r.read, "ע");
});

test("compact Y with a taller right arm counts as ayin", () => {
  const r = grade(compactYAyin(), "ע");
  assert.ok(r.match === "exact" || r.match === "close", JSON.stringify(r));
  assert.equal(r.read, "ע");
});

test("one-stroke rounded U counts as ayin", () => {
  const r = grade(oneStrokeUAyin(), "ע");
  assert.ok(r.match === "exact" || r.match === "close", JSON.stringify(r));
  assert.equal(r.read, "ע");
});

test("screenshot-like rounded Y on the line counts as ayin", () => {
  const r = grade(screenshotAyin(), "ע");
  assert.ok(r.match === "exact" || r.match === "close", JSON.stringify(r));
  assert.equal(r.read, "ע");
});

test("closed oval is not ayin", () => {
  const r = grade(
    [
      curve(
        [
          { x: 280, y: TOP + 10 },
          { x: 360, y: TOP + 10 },
          { x: 370, y: BASE - 10 },
          { x: 280, y: BASE - 10 },
          { x: 270, y: TOP + 20 },
          { x: 280, y: TOP + 10 },
        ],
        10,
      ),
    ],
    "ע",
  );
  assert.equal(r.match, "wrong");
  assert.notEqual(r.read, "ע");
});

test("a single stem is not ayin", () => {
  const r = grade([line(320, TOP + 8, 320, BASE - 4)], "ע");
  assert.equal(r.match, "wrong");
  assert.notEqual(r.read, "ע");
});

test("tsade with a right foot is not ayin", () => {
  const r = grade(tsadeY(), "ע");
  assert.equal(r.match, "wrong");
  assert.ok(r.read === "צ" || r.read === "ץ", JSON.stringify(r));
});

test("chart shin (three arms like a W) counts", () => {
  const r = grade(chartShin(), "ש");
  assert.ok(r.match === "exact" || r.match === "close", JSON.stringify(r));
  assert.equal(r.read, "ש");
});

test("screenshot-like lopsided W counts as shin", () => {
  const r = grade(screenshotShin(), "ש");
  assert.ok(r.match === "exact" || r.match === "close", JSON.stringify(r));
  assert.equal(r.read, "ש");
});

test("screenshot-like lopsided W counts as dotted shin", () => {
  const r = grade(screenshotShin(), "שׁ");
  assert.ok(r.match === "exact" || r.match === "close", JSON.stringify(r));
  assert.equal(r.read, "ש");
});

test("one-stroke W counts as shin", () => {
  const r = grade(oneStrokeW(), "ש");
  assert.ok(r.match === "exact" || r.match === "close", JSON.stringify(r));
  assert.equal(r.read, "ש");
});

test("two-arm ayin is not shin", () => {
  const r = grade(chartAyin(), "ש");
  assert.equal(r.match, "wrong");
  assert.notEqual(r.read, "ש");
});

test("closed oval is not shin", () => {
  const r = grade(
    [
      curve(
        [
          { x: 280, y: TOP + 10 },
          { x: 360, y: TOP + 10 },
          { x: 370, y: BASE - 10 },
          { x: 280, y: BASE - 10 },
          { x: 270, y: TOP + 20 },
          { x: 280, y: TOP + 10 },
        ],
        10,
      ),
    ],
    "ש",
  );
  assert.equal(r.match, "wrong");
  assert.notEqual(r.read, "ש");
});

test("a single stem is not shin", () => {
  const r = grade([line(320, TOP + 8, 320, BASE - 4)], "ש");
  assert.equal(r.match, "wrong");
  assert.notEqual(r.read, "ש");
});

function densify(path, step = 3.2) {
  const out = [];
  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1];
    const b = path[i];
    const d = Math.hypot(b.x - a.x, b.y - a.y);
    const n = Math.max(1, Math.round(d / step));
    for (let k = 0; k < n; k++) {
      const t = k / n;
      out.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
    }
  }
  if (path.length) out.push(path[path.length - 1]);
  return out;
}

function modelInk(letter, mi = 0) {
  const model = strokeModels(letter)[mi];
  const region = staveRegion(letter);
  const bandH = H * (region.bottom - region.top);
  const ox = (640 - bandH) / 2;
  const oy = H * region.top;
  return model.paths.map((path) =>
    densify(path.map((p) => ({ x: ox + (p.x / 100) * bandH, y: oy + (p.y / 100) * bandH }))),
  );
}

function oval(cx, cy, rx, ry, n = 36) {
  const s = [];
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2;
    s.push({ x: cx + Math.cos(a) * rx, y: cy + Math.sin(a) * ry });
  }
  return s;
}

const LETTERS = "אבגדהוזחטיכךלמםנןסעפףצץקרשת";

test("every chart model of every letter counts as that letter", () => {
  for (const L of LETTERS) {
    const models = strokeModels(L);
    for (let i = 0; i < models.length; i++) {
      const r = grade(modelInk(L, i), L);
      assert.ok(r.match === "exact" || r.match === "close", `${L} model ${i} ${JSON.stringify(r)}`);
      assert.equal(r.read, L, `${L} model ${i} read ${r.read}`);
    }
  }
});

test("body-sized vav is not yod", () => {
  const r = grade(modelInk("ו", 0), "י");
  assert.equal(r.match, "wrong");
  assert.notEqual(r.read, "י");
});

test("Latin C is not shin, tet, or mem", () => {
  const ink = [
    curve(
      [
        { x: 280, y: TOP + 10 },
        { x: 180, y: TOP + 18 },
        { x: 170, y: (TOP + BASE) / 2 },
        { x: 180, y: BASE - 10 },
        { x: 280, y: BASE - 4 },
      ],
      14,
    ),
  ];
  for (const L of ["ש", "ט", "מ", "ע", "כ"]) {
    const r = grade(ink, L);
    assert.equal(r.match, "wrong", `${L} accepted C ${JSON.stringify(r)}`);
  }
});

test("Latin O is samekh, not mem sofit, tet, or ayin", () => {
  const ink = [oval(240, (TOP + BASE) / 2, 55, 38)];
  const samekh = grade(ink, "ס");
  assert.ok(samekh.match === "exact" || samekh.match === "close", JSON.stringify(samekh));
  for (const L of ["ם", "ט", "ע", "מ"]) {
    const r = grade(ink, L);
    assert.equal(r.match, "wrong", `${L} accepted O ${JSON.stringify(r)}`);
  }
});

test("Latin U is ayin, not shin or mem", () => {
  const ink = [
    curve(
      [
        { x: 190, y: TOP + 8 },
        { x: 195, y: BASE - 8 },
        { x: 240, y: BASE },
        { x: 285, y: BASE - 8 },
        { x: 290, y: TOP + 8 },
      ],
      16,
    ),
  ];
  const ayin = grade(ink, "ע");
  assert.ok(ayin.match === "exact" || ayin.match === "close", JSON.stringify(ayin));
  for (const L of ["ש", "מ"]) {
    const r = grade(ink, L);
    assert.equal(r.match, "wrong", `${L} accepted U ${JSON.stringify(r)}`);
  }
});

test("Latin W is shin, not ayin", () => {
  const ink = [
    curve(
      [
        { x: 160, y: TOP + 8 },
        { x: 190, y: BASE - 4 },
        { x: 220, y: TOP + 30 },
        { x: 250, y: BASE - 4 },
        { x: 280, y: TOP + 8 },
      ],
      14,
    ),
  ];
  const shin = grade(ink, "ש");
  assert.ok(shin.match === "exact" || shin.match === "close", JSON.stringify(shin));
  const ayin = grade(ink, "ע");
  assert.equal(ayin.match, "wrong");
});

test("Latin Y is not tsade", () => {
  const ink = [
    line(200, TOP + 8, 240, (TOP + BASE) / 2),
    line(280, TOP + 8, 240, (TOP + BASE) / 2),
    line(240, (TOP + BASE) / 2, 240, BASE - 4),
  ];
  for (const L of ["צ", "ץ"]) {
    const r = grade(ink, L);
    assert.equal(r.match, "wrong", `${L} accepted Latin Y ${JSON.stringify(r)}`);
  }
});

test("Latin X is not tsade", () => {
  const ink = [line(180, TOP + 8, 300, BASE - 4), line(300, TOP + 8, 180, BASE - 4)];
  const r = grade(ink, "צ");
  assert.equal(r.match, "wrong");
});

test("alef, chet, and tav charts are not shin", () => {
  for (const L of ["א", "ח", "ת"]) {
    const r = grade(modelInk(L, 0), "ש");
    assert.equal(r.match, "wrong", `shin accepted ${L} ${JSON.stringify(r)}`);
  }
});

test("a long hanging stem is final nun, not vav or yod", () => {
  const ink = [line(240, TOP + 8, 240, BASE + 50)];
  const nun = grade(ink, "ן");
  assert.ok(nun.match === "exact" || nun.match === "close", JSON.stringify(nun));
  assert.equal(grade(ink, "ו").match, "wrong");
  assert.equal(grade(ink, "י").match, "wrong");
});

test("pe without a nose is not pe", () => {
  const r = grade(kafC(), "פ");
  assert.equal(r.match, "wrong");
});
