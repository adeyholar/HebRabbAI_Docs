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

function tone(
  ac: AudioContext,
  dest: GainNode,
  opts: {
    type: OscillatorType;
    freq: number;
    start: number;
    dur: number;
    peak?: number;
    slideTo?: number;
  },
) {
  const osc = ac.createOscillator();
  const g = ac.createGain();
  const t0 = ac.currentTime + opts.start;
  const peak = opts.peak ?? 0.16;
  osc.type = opts.type;
  osc.frequency.setValueAtTime(opts.freq, t0);
  if (opts.slideTo != null) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(opts.slideTo, 1), t0 + opts.dur);
  }
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + opts.dur);
  osc.connect(g);
  g.connect(dest);
  osc.start(t0);
  osc.stop(t0 + opts.dur + 0.03);
  osc.onended = () => {
    osc.disconnect();
    g.disconnect();
  };
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

function disconnectLater(nodes: AudioNode[], when: number) {
  window.setTimeout(() => {
    for (const n of nodes) {
      try {
        n.disconnect();
      } catch {
        /* already gone */
      }
    }
  }, Math.ceil(when * 1000) + 80);
}

function panTo(ac: AudioContext, dest: GainNode, pan: number): AudioNode {
  if (typeof ac.createStereoPanner !== "function") return dest;
  const panner = ac.createStereoPanner();
  panner.pan.value = pan;
  panner.connect(dest);
  return panner;
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

function voiceAww(
  ac: AudioContext,
  dest: GainNode,
  start: number,
  freq: number,
  pan: number,
  peak: number,
) {
  const osc = ac.createOscillator();
  osc.type = "sawtooth";
  const t0 = ac.currentTime + start;
  osc.frequency.setValueAtTime(freq, t0);
  osc.frequency.exponentialRampToValueAtTime(Math.max(freq * 0.58, 90), t0 + 0.82);
  const bp = ac.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.setValueAtTime(760, t0);
  bp.frequency.exponentialRampToValueAtTime(500, t0 + 0.7);
  bp.Q.value = 2.8;
  const lp = ac.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 1500;
  const g = ac.createGain();
  const panner = panTo(ac, dest, pan);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + 0.08);
  g.gain.exponentialRampToValueAtTime(peak * 0.6, t0 + 0.4);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.05);
  osc.connect(bp);
  bp.connect(lp);
  lp.connect(g);
  g.connect(panner);
  osc.start(t0);
  osc.stop(t0 + 1.12);
  osc.onended = () => {
    osc.disconnect();
    bp.disconnect();
    lp.disconnect();
    g.disconnect();
    if (panner !== dest) panner.disconnect();
  };
}

function playCrowdAww(ac: AudioContext, dest: GainNode) {
  const bus = ac.createGain();
  bus.gain.value = 1.2;
  const comp = ac.createDynamicsCompressor();
  comp.threshold.value = -14;
  comp.knee.value = 18;
  comp.ratio.value = 5;
  comp.attack.value = 0.008;
  comp.release.value = 0.22;
  bus.connect(comp);
  comp.connect(dest);

  const delay = ac.createDelay(0.5);
  delay.delayTime.value = 0.14;
  const wet = ac.createGain();
  wet.gain.value = 0.3;
  const fb = ac.createGain();
  fb.gain.value = 0.16;
  bus.connect(delay);
  delay.connect(wet);
  wet.connect(dest);
  delay.connect(fb);
  fb.connect(delay);

  const t0 = ac.currentTime;
  const body = ac.createOscillator();
  const bg = ac.createGain();
  const blp = ac.createBiquadFilter();
  body.type = "sine";
  body.frequency.setValueAtTime(196, t0);
  body.frequency.exponentialRampToValueAtTime(110, t0 + 0.9);
  blp.type = "lowpass";
  blp.frequency.value = 320;
  bg.gain.setValueAtTime(0.0001, t0);
  bg.gain.exponentialRampToValueAtTime(0.42, t0 + 0.06);
  bg.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.05);
  body.connect(blp);
  blp.connect(bg);
  bg.connect(bus);
  body.start(t0);
  body.stop(t0 + 1.1);
  body.onended = () => {
    body.disconnect();
    blp.disconnect();
    bg.disconnect();
  };

  const voices: Array<[number, number, number, number]> = [
    [0.0, 340, -0.62, 0.28],
    [0.04, 305, -0.28, 0.26],
    [0.07, 278, 0.08, 0.24],
    [0.1, 365, 0.38, 0.25],
    [0.13, 252, 0.64, 0.22],
    [0.16, 318, -0.08, 0.2],
    [0.2, 232, 0.22, 0.18],
    [0.24, 390, -0.44, 0.2],
    [0.3, 210, 0.5, 0.16],
  ];
  for (const [start, freq, pan, peak] of voices) {
    voiceAww(ac, bus, start, freq, pan, peak);
  }

  disconnectLater([bus, comp, delay, wet, fb], 2.0);
}

export function playGrade(ok: boolean) {
  const ac = ensureGraph();
  if (!ac || !master || muted) return;
  if (ok) playCrowdClap(ac, master);
  else playCrowdAww(ac, master);
}

if (typeof window !== "undefined") {
  const unlock = () => unlockSfx();
  window.addEventListener("pointerdown", unlock, { once: true });
  window.addEventListener("keydown", unlock, { once: true });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") unlockSfx();
  });
}
