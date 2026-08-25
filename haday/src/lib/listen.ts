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
  return voices().some((v) => /^(he|iw)\b/i.test(v.lang) || /hebrew/i.test(v.name));
}

function pickVoice(langPrefix: string): SpeechSynthesisVoice | undefined {
  const all = voices();
  const want = langPrefix.toLowerCase();
  return (
    all.find((v) => v.lang.toLowerCase().startsWith(want) && v.default) ||
    all.find((v) => v.lang.toLowerCase().startsWith(want) && v.localService) ||
    all.find((v) => v.lang.toLowerCase().startsWith(want))
  );
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
    u.rate = 1.05;
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
    else if (s.speaking) {
      s.pause();
      s.resume();
    }
  } catch {
    /* ignore */
  }
}

function lineBudget(text: string, rate: number): number {
  return Math.min(18_000, Math.max(2_200, 1_100 + text.length * (140 / Math.max(rate, 0.5))));
}

export function speakLine(text: string, lang: "he" | "en", rate: number): Promise<void> {
  return new Promise((resolve) => {
    const s = synth();
    const spoken = text.trim();
    if (!s || !spoken) {
      resolve();
      return;
    }
    try {
      if (s.paused) s.resume();
    } catch {
      /* ignore */
    }
    const u = new SpeechSynthesisUtterance(spoken);
    u.volume = 1;
    u.pitch = 0.92;
    if (lang === "he") {
      const he = pickVoice("he") || pickVoice("iw");
      u.lang = he?.lang || "he-IL";
      if (he) u.voice = he;
      u.rate = Math.max(0.5, rate * 0.82);
    } else {
      const en = pickVoice("en");
      u.lang = en?.lang || "en-US";
      if (en) u.voice = en;
      u.rate = Math.max(0.55, rate * 0.94);
    }
    let settled = false;
    const done = () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      resolve();
    };
    const timer = window.setTimeout(done, lineBudget(spoken, rate));
    u.onend = () => done();
    u.onerror = () => done();
    try {
      s.speak(u);
      window.setTimeout(() => {
        try {
          if (s.paused) s.resume();
        } catch {
          /* ignore */
        }
      }, 40);
    } catch {
      done();
    }
  });
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
    await speakLine(item.announce, "en", Math.min(rate, 0.95));
    if (signal.stop) return;
    await pauseMs(restFor(rate, 900), signal);
  }
  if (signal.stop) return;

  const he = ttsHebrew(item.hebrew);
  const en = primaryGloss(item.gloss);
  const heFallback =
    !hasHebrewVoice() && item.translit
      ? item.translit.replace(/[ʾʿəâêîôûāēīōūăĕŏ]/g, "").trim()
      : "";

  async function sayHebrew() {
    if (he) await speakLine(he, "he", rate);
    if (signal.stop) return;
    if (heFallback) await speakLine(heFallback, "en", Math.max(0.55, rate * 0.8));
  }

  await sayHebrew();
  if (signal.stop) return;
  await pauseMs(restFor(rate, 850), signal);
  if (signal.stop) return;
  await sayHebrew();
  if (signal.stop) return;
  await pauseMs(restFor(rate, 750), signal);
  if (signal.stop) return;
  await speakLine(en, "en", rate);
  if (signal.stop) return;
  await pauseMs(restFor(rate, 650), signal);
  if (signal.stop) return;
  await speakLine(en, "en", rate);
  if (signal.stop) return;
  await pauseMs(restFor(rate, 1600), signal);
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
