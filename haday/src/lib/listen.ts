import { alphabetVocab, bbhVocab, GAME_CHAPTER_TITLES, type VocabItem } from "@/lib/vocab";

const POS_KEY = "haday-listen-i";

export type ListenItem = VocabItem & { announce?: string };

export function listenPlaylist(): ListenItem[] {
  const items = [...alphabetVocab(), ...bbhVocab()];
  let prev = -1;
  return items.map((item) => {
    const announce = item.chapter !== prev ? `Chapter ${item.chapter}. ${GAME_CHAPTER_TITLES[item.chapter] ?? ""}` : undefined;
    prev = item.chapter;
    return { ...item, announce };
  });
}

export function loadListenIndex(): number {
  try {
    const n = Number(localStorage.getItem(POS_KEY) || 0);
    return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
  } catch {
    return 0;
  }
}

export function saveListenIndex(i: number) {
  try {
    localStorage.setItem(POS_KEY, String(Math.max(0, i)));
  } catch {
    /* ignore */
  }
}

export function firstIndexForChapter(list: ListenItem[], chapter: number): number {
  const i = list.findIndex((x) => x.chapter === chapter);
  return i < 0 ? 0 : i;
}

export function speechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window && typeof SpeechSynthesisUtterance === "function";
}

function ttsHebrew(s: string): string {
  return s
    .normalize("NFC")
    .replace(/[\u0591-\u05AF\u05BD\u05BF\u05C0\u05C3-\u05C7]/g, "")
    .trim();
}

export function glossSpoken(gloss: string): string {
  return gloss.replace(/;/g, ".").replace(/\s+/g, " ").trim();
}

/** First sense only — “Abraham”, not the whole gloss dump. */
export function primaryGloss(gloss: string): string {
  const full = glossSpoken(gloss);
  const first = full.split(/[,;]/)[0]?.trim() ?? full;
  return first || full;
}

function restFor(rate: number, calmMs: number): number {
  return Math.round(calmMs / Math.max(rate, 0.5));
}

function synth(): SpeechSynthesis | null {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  return window.speechSynthesis;
}

function voices(): SpeechSynthesisVoice[] {
  return synth()?.getVoices() ?? [];
}

export function waitForVoices(): Promise<SpeechSynthesisVoice[]> {
  const have = voices();
  if (have.length) return Promise.resolve(have);
  return new Promise((resolve) => {
    const s = synth();
    if (!s) {
      resolve([]);
      return;
    }
    const done = () => resolve(s.getVoices());
    const t = window.setTimeout(done, 800);
    s.addEventListener(
      "voiceschanged",
      () => {
        window.clearTimeout(t);
        done();
      },
      { once: true },
    );
  });
}

export function hasHebrewVoice(): boolean {
  return voices().some((v) => /^(he|iw)\b/i.test(v.lang) || /hebrew|carmit|עברית/i.test(v.name));
}

const FEMALE =
  /female|woman|samantha|victoria|karen|moira|tessa|fiona|zira|jenny|aria|carmit|heera|nicky|susan|salli|ivy|kendra|joanna|amy|emma|olivia|linda|hazel|allison|ava|zoe|kate|serena|veena|raveena|aditi|hila|yael|natrasha|siri|google [a-z ]*female|microsoft (zira|jenny|aria)/i;
const MALE =
  /male|\bman\b|david|daniel|\balex\b|fred|tom|mark|\bguy\b|matthew|brian|ravi|aaron|nathan|ralph|bruce|gordon|oliver|james|thomas|jony|google [a-z ]*male|microsoft (david|mark|guy)/i;
const ROBOT = /compact|novelty|whisper|bells|boing|trinoids|zarvox|bad news|good news|pipe organ|cellos/i;

function scoreVoice(v: SpeechSynthesisVoice, langPrefix: string): number {
  const lang = v.lang.toLowerCase();
  const name = v.name;
  const want = langPrefix.toLowerCase();
  let n = 0;
  if (lang.startsWith(want)) n += 8;
  if (want.startsWith("he") && (lang.startsWith("he-il") || lang.startsWith("iw"))) n += 4;
  if (want.startsWith("en") && (lang.startsWith("en-us") || lang.startsWith("en-il"))) n += 1;
  if (FEMALE.test(name)) n += 6;
  if (MALE.test(name)) n -= 8;
  if (ROBOT.test(name)) n -= 12;
  if (v.localService) n += 2;
  if (v.default && FEMALE.test(name)) n += 1;
  return n;
}

function pickVoice(langPrefix: string): SpeechSynthesisVoice | undefined {
  const all = voices().filter((v) => {
    const lang = v.lang.toLowerCase();
    const want = langPrefix.toLowerCase();
    if (lang.startsWith(want)) return true;
    if (want === "he" && (lang.startsWith("iw") || /hebrew|carmit|עברית/i.test(v.name))) return true;
    return false;
  });
  const ranked = (all.length ? all : voices()).slice().sort((a, b) => scoreVoice(b, langPrefix) - scoreVoice(a, langPrefix));
  const best = ranked[0];
  if (!best) return undefined;
  if (MALE.test(best.name) || ROBOT.test(best.name)) {
    const female = ranked.find((v) => FEMALE.test(v.name) && !MALE.test(v.name));
    if (female) return female;
  }
  return best;
}

/** Israeli-style Latin if the device has no Hebrew voice. */
function modernLatin(translit: string): string {
  return translit
    .replace(/[ʾʿ]/g, "")
    .replace(/[âāă]/g, "a")
    .replace(/[êēĕə]/g, "e")
    .replace(/[îī]/g, "i")
    .replace(/[ôōŏ]/g, "o")
    .replace(/[ûū]/g, "u")
    .replace(/ḥ/g, "ch")
    .replace(/[ṣ]/g, "ts")
    .replace(/š/g, "sh")
    .replace(/ś/g, "s")
    .replace(/ṭ/g, "t")
    .replace(/[ḇ]/g, "v")
    .replace(/[ḵ]/g, "kh")
    .replace(/[ḡ]/g, "g")
    .replace(/[ḏ]/g, "d")
    .replace(/[ṯ]/g, "t")
    .replace(/p̄/g, "f")
    .replace(/[-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Must run inside the Play click, before any await. */
export function unlockSpeech() {
  const s = synth();
  if (!s) return;
  try {
    if (s.paused) s.resume();
    s.cancel();
    const u = new SpeechSynthesisUtterance("Ready.");
    u.lang = "en-US";
    u.rate = 1.02;
    u.pitch = 1.12;
    u.volume = 1;
    const en = pickVoice("en");
    if (en) u.voice = en;
    s.speak(u);
  } catch {
    /* ignore */
  }
}

export function stopSpeech() {
  const s = synth();
  if (!s) return;
  try {
    s.cancel();
  } catch {
    /* ignore */
  }
}

export function keepSpeechAlive() {
  const s = synth();
  if (!s) return;
  try {
    if (s.paused) s.resume();
  } catch {
    /* ignore */
  }
}

function waitUntilQuiet(s: SpeechSynthesis, signal: { stop: boolean }, maxMs: number): Promise<void> {
  return new Promise((resolve) => {
    const t0 = Date.now();
    const tick = () => {
      if (signal.stop || Date.now() - t0 > maxMs || (!s.speaking && !s.pending)) {
        resolve();
        return;
      }
      window.setTimeout(tick, 70);
    };
    tick();
  });
}

export async function speakLine(
  text: string,
  lang: "he" | "en",
  rate: number,
  signal: { stop: boolean } = { stop: false },
): Promise<void> {
  const s = synth();
  const spoken = text.trim();
  if (!s || !spoken || signal.stop) return;
  try {
    if (s.paused) s.resume();
  } catch {
    /* ignore */
  }
  const u = new SpeechSynthesisUtterance(spoken);
  u.volume = 1;
  u.pitch = 1.12;
  const spokenRate = Math.min(1.15, Math.max(0.55, lang === "he" ? rate * 0.94 : rate));
  if (lang === "he") {
    const he = pickVoice("he") || pickVoice("iw");
    u.lang = he?.lang || "he-IL";
    if (he) u.voice = he;
    u.rate = spokenRate;
  } else {
    const en = pickVoice("en");
    u.lang = en?.lang || "en-US";
    if (en) u.voice = en;
    u.rate = spokenRate;
  }

  await new Promise<void>((resolve) => {
    let settled = false;
    let heard = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(safety);
      window.clearInterval(poll);
      resolve();
    };
    const safety = window.setTimeout(finish, Math.min(28_000, 3_000 + spoken.length * (220 / spokenRate)));
    const poll = window.setInterval(() => {
      if (signal.stop) {
        finish();
        return;
      }
      if (s.speaking || s.pending) heard = true;
      else if (heard) finish();
    }, 70);
    u.onend = () => finish();
    u.onerror = () => finish();
    try {
      s.speak(u);
    } catch {
      finish();
    }
  });
  if (signal.stop) return;
  await waitUntilQuiet(s, signal, 2_500);
}

export function pauseMs(ms: number, signal: { stop: boolean }): Promise<void> {
  return new Promise((resolve) => {
    if (signal.stop || ms <= 0) {
      resolve();
      return;
    }
    const t = window.setTimeout(() => {
      window.clearInterval(check);
      resolve();
    }, ms);
    const check = window.setInterval(() => {
      if (!signal.stop) return;
      window.clearTimeout(t);
      window.clearInterval(check);
      resolve();
    }, 80);
  });
}

export async function speakCard(item: ListenItem, rate: number, signal: { stop: boolean }): Promise<void> {
  if (signal.stop) return;
  if (item.announce) {
    await speakLine(item.announce, "en", Math.min(rate, 1), signal);
    if (signal.stop) return;
    await pauseMs(restFor(rate, 500), signal);
  }
  if (signal.stop) return;

  const he = ttsHebrew(item.hebrew);
  const en = primaryGloss(item.gloss);

  if (hasHebrewVoice()) {
    await speakLine(he, "he", rate, signal);
  } else {
    const latin = modernLatin(item.translit) || he;
    await speakLine(latin, "en", rate, signal);
  }
  if (signal.stop) return;
  await pauseMs(restFor(rate, 420), signal);
  if (signal.stop) return;
  await speakLine(en, "en", rate, signal);
  if (signal.stop) return;
  await pauseMs(restFor(rate, 900), signal);
}

export function playListenChime() {
  if (typeof window === "undefined") return;
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return;
  const ac = new AC();
  const g = ac.createGain();
  g.connect(ac.destination);
  g.gain.value = 0.18;
  const beep = (freq: number, start: number, dur: number) => {
    const o = ac.createOscillator();
    const eg = ac.createGain();
    o.type = "sine";
    o.frequency.value = freq;
    eg.gain.setValueAtTime(0.0001, start);
    eg.gain.exponentialRampToValueAtTime(0.2, start + 0.02);
    eg.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    o.connect(eg);
    eg.connect(g);
    o.start(start);
    o.stop(start + dur + 0.02);
  };
  const t0 = ac.currentTime;
  beep(523, t0, 0.12);
  beep(784, t0 + 0.12, 0.16);
  window.setTimeout(() => void ac.close(), 700);
}
