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

function ttsHebrew(s: string): string {
  return s
    .normalize("NFC")
    .replace(/[\u0591-\u05AF\u05BD\u05BF\u05C0\u05C3-\u05C7]/g, "")
    .trim();
}

export function glossSpoken(gloss: string): string {
  return gloss.replace(/;/g, ".").replace(/\s+/g, " ").trim();
}

function voices(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !window.speechSynthesis) return [];
  return window.speechSynthesis.getVoices();
}

export function waitForVoices(): Promise<SpeechSynthesisVoice[]> {
  const have = voices();
  if (have.length) return Promise.resolve(have);
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      resolve([]);
      return;
    }
    const done = () => resolve(window.speechSynthesis.getVoices());
    const t = window.setTimeout(done, 1200);
    window.speechSynthesis.addEventListener(
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
  return voices().some((v) => /^he\b|^iw\b/i.test(v.lang));
}

function pickVoice(langPrefix: string): SpeechSynthesisVoice | undefined {
  const all = voices();
  const want = langPrefix.toLowerCase();
  return (
    all.find((v) => v.lang.toLowerCase().startsWith(want) && v.localService) ||
    all.find((v) => v.lang.toLowerCase().startsWith(want))
  );
}

export function speakLine(text: string, lang: "he" | "en", rate: number): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !window.speechSynthesis || !text.trim()) {
      resolve();
      return;
    }
    const u = new SpeechSynthesisUtterance(text);
    if (lang === "he") {
      const he = pickVoice("he") || pickVoice("iw");
      u.lang = he?.lang || "he-IL";
      if (he) u.voice = he;
      u.rate = Math.max(0.6, rate * 0.92);
    } else {
      const en = pickVoice("en");
      u.lang = en?.lang || "en-US";
      if (en) u.voice = en;
      u.rate = rate;
    }
    u.onend = () => resolve();
    u.onerror = () => resolve();
    window.speechSynthesis.speak(u);
  });
}

export function stopSpeech() {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
}

export function pauseMs(ms: number, signal: { stop: boolean }): Promise<void> {
  return new Promise((resolve) => {
    const t = window.setTimeout(resolve, ms);
    const check = window.setInterval(() => {
      if (signal.stop) {
        window.clearTimeout(t);
        window.clearInterval(check);
        resolve();
      }
    }, 80);
    window.setTimeout(() => window.clearInterval(check), ms + 20);
  });
}

export async function speakCard(
  item: ListenItem,
  rate: number,
  signal: { stop: boolean },
): Promise<void> {
  if (signal.stop) return;
  if (item.announce) {
    await speakLine(item.announce, "en", rate);
    if (signal.stop) return;
    await pauseMs(280, signal);
  }
  if (signal.stop) return;
  const he = ttsHebrew(item.hebrew);
  if (hasHebrewVoice()) {
    await speakLine(he, "he", rate);
  } else {
    await speakLine(item.translit.replace(/[ʾʿ]/g, ""), "en", rate * 0.85);
  }
  if (signal.stop) return;
  await pauseMs(380, signal);
  if (signal.stop) return;
  await speakLine(glossSpoken(item.gloss), "en", rate);
  if (signal.stop) return;
  await pauseMs(620, signal);
}
