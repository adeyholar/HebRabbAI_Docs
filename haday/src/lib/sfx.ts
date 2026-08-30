const MUTE_KEY = "haday-sfx-muted";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let muted = false;
let applause: AudioBuffer | null = null;
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
  if (ac) applauseBuffer(ac);
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

function addHandClap(
  L: Float32Array,
  R: Float32Array,
  sr: number,
  t0: number,
  peak: number,
  pan: number,
  tone: number,
) {
  const n = L.length;
  const lg = Math.cos((pan + 1) * 0.25 * Math.PI);
  const rg = Math.sin((pan + 1) * 0.25 * Math.PI);
  const bursts: Array<[number, number]> = [
    [0, 1],
    [0.008 + Math.random() * 0.005, 0.78],
    [0.018 + Math.random() * 0.007, 0.48],
    [0.032 + Math.random() * 0.008, 0.26],
  ];
  const lpA = 0.72 - tone * 0.16;
  const attackN = Math.max(5, Math.floor(sr * 0.0028));
  for (const [off, amp] of bursts) {
    const start = Math.floor((t0 + off) * sr);
    const samples = Math.floor(sr * (0.011 + Math.random() * 0.008));
    let lp = 0;
    for (let s = 0; s < samples; s++) {
      const idx = start + s;
      if (idx < 0 || idx >= n) continue;
      const env =
        s < attackN ? s / attackN : Math.exp((-(s - attackN) / sr) * (95 + tone * 30));
      const white = Math.random() * 2 - 1;
      lp += (white - lp) * (1 - lpA);
      const slap = (white - lp) * (0.82 + tone * 0.25);
      const v = slap * env * peak * amp;
      L[idx] += v * lg;
      R[idx] += v * rg;
    }
  }
}

function applauseBuffer(ac: AudioContext): AudioBuffer {
  if (applause && applause.sampleRate === ac.sampleRate) return applause;
  const sr = ac.sampleRate;
  const seconds = 1.7;
  const n = Math.floor(sr * seconds);
  const buf = ac.createBuffer(2, n, sr);
  const L = buf.getChannelData(0);
  const R = buf.getChannelData(1);

  const people = 26;
  for (let p = 0; p < people; p++) {
    const near = p < 8;
    const pan = (Math.random() * 2 - 1) * (near ? 0.55 : 0.92);
    const tone = Math.random();
    const rate = 0.2 + Math.random() * 0.09;
    const phase = Math.random() * 0.12;
    const base = near ? 0.34 : 0.1;
    const beats = near ? 7 : 5;
    for (let b = 0; b < beats; b++) {
      const t0 = phase + b * rate + (Math.random() - 0.5) * 0.018;
      if (t0 < 0.01 || t0 > 1.45) continue;
      const fall = Math.exp(-b * 0.32);
      const peak = base * fall * (0.78 + Math.random() * 0.4);
      addHandClap(L, R, sr, t0, peak, pan, tone);
    }
  }

  const d1 = Math.floor(0.028 * sr);
  const d2 = Math.floor(0.062 * sr);
  const Lc = new Float32Array(L);
  const Rc = new Float32Array(R);
  for (let i = 0; i < n; i++) {
    if (i >= d1) {
      L[i] += Rc[i - d1] * 0.16;
      R[i] += Lc[i - d1] * 0.16;
    }
    if (i >= d2) {
      L[i] += Rc[i - d2] * 0.08;
      R[i] += Lc[i - d2] * 0.08;
    }
  }

  let peak = 1e-6;
  for (let i = 0; i < n; i++) {
    peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
  }
  const scale = 0.9 / peak;
  for (let i = 0; i < n; i++) {
    L[i] *= scale;
    R[i] *= scale;
  }

  applause = buf;
  return buf;
}

function playCrowdClap(ac: AudioContext, dest: GainNode) {
  const src = ac.createBufferSource();
  src.buffer = applauseBuffer(ac);
  const rate = 0.97 + Math.random() * 0.05;
  src.playbackRate.value = rate;
  const g = ac.createGain();
  const t0 = ac.currentTime;
  const playDur = src.buffer.duration / rate;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.linearRampToValueAtTime(1, t0 + 0.01);
  g.gain.setValueAtTime(1, t0 + playDur * 0.72);
  g.gain.linearRampToValueAtTime(0.0001, t0 + playDur);
  src.connect(g);
  g.connect(dest);
  src.start(t0);
  src.stop(t0 + playDur + 0.03);
  src.onended = () => {
    src.disconnect();
    g.disconnect();
  };
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
