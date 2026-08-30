const MUTE_KEY = "haday-sfx-muted";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let muted = false;
let applause: AudioBuffer | null = null;
let applauseLoad: Promise<AudioBuffer | null> | null = null;
const listeners = new Set<(value: boolean) => void>();

function readMuted() {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(MUTE_KEY) === "1";
  } catch {
    return false;
  }
}

muted = readMuted();

function ensureGraph() {
  if (typeof window === "undefined") return null;
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  if (!ctx) {
    ctx = new AC({ latencyHint: "interactive" });
    master = ctx.createGain();
    master.gain.value = muted ? 0 : 1;
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function setMasterGain(value: number) {
  if (!ctx || !master) return;
  master.gain.setTargetAtTime(value, ctx.currentTime, 0.02);
}

export function unlockSfx() {
  const ac = ensureGraph();
  if (ac) void loadApplause(ac);
}

export function isMuted() {
  return muted;
}

export function setMuted(next: boolean) {
  muted = next;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(MUTE_KEY, next ? "1" : "0");
    } catch {
      /* ignore quota */
    }
  }
  if (!ensureGraph() || !master || !ctx) {
    listeners.forEach((fn) => fn(muted));
    return;
  }
  setMasterGain(next ? 0 : 1);
  listeners.forEach((fn) => fn(muted));
}

export function subscribeMute(fn: (value: boolean) => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

function loadApplause(ac: AudioContext): Promise<AudioBuffer | null> {
  if (applause) return Promise.resolve(applause);
  if (applauseLoad) return applauseLoad;
  applauseLoad = fetch("/sfx/crowd-cheer.mp3")
    .then((res) => {
      if (!res.ok) throw new Error("sfx");
      return res.arrayBuffer();
    })
    .then((raw) => ac.decodeAudioData(raw.slice(0)))
    .then((buf) => {
      applause = buf;
      return buf;
    })
    .catch(() => {
      applauseLoad = null;
      return null;
    });
  return applauseLoad;
}

function playCrowdClap(ac: AudioContext, dest: GainNode) {
  const play = (buf: AudioBuffer) => {
    const src = ac.createBufferSource();
    src.buffer = buf;
    const g = ac.createGain();
    const t0 = ac.currentTime;
    const dur = buf.duration;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(0.95, t0 + 0.018);
    g.gain.setValueAtTime(0.95, t0 + Math.max(0.08, dur - 0.28));
    g.gain.linearRampToValueAtTime(0.0001, t0 + dur);
    src.connect(g);
    g.connect(dest);
    src.start(t0);
    src.stop(t0 + dur + 0.03);
    src.onended = () => {
      src.disconnect();
      g.disconnect();
    };
  };
  if (applause) {
    play(applause);
    return;
  }
  void loadApplause(ac).then((buf) => {
    if (buf && !muted) play(buf);
  });
}

export function playGrade(ok: boolean) {
  const ac = ensureGraph();
  if (!ac || !master || muted) return;
  if (ok) playCrowdClap(ac, master);
}

if (typeof window !== "undefined") {
  const unlock = () => unlockSfx();
  window.addEventListener("pointerdown", unlock, { once: true });
  window.addEventListener("keydown", unlock, { once: true });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") unlockSfx();
  });
}
