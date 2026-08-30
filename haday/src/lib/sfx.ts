const MUTE_KEY = "haday-sfx-muted";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let muted = false;
let noise: AudioBuffer | null = null;
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
  ensureGraph();
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

function noiseBuffer(ac: AudioContext): AudioBuffer {
  if (noise && noise.sampleRate === ac.sampleRate) return noise;
  const len = Math.floor(ac.sampleRate * 0.18);
  const buf = ac.createBuffer(1, len, ac.sampleRate);
  const data = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) {
    const white = Math.random() * 2 - 1;
    last = last * 0.86 + white * 0.14;
    data[i] = last * 1.8;
  }
  noise = buf;
  return buf;
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

function clap(
  ac: AudioContext,
  dest: GainNode,
  start: number,
  peak: number,
  pan: number,
  bright: number,
) {
  const src = ac.createBufferSource();
  src.buffer = noiseBuffer(ac);
  src.playbackRate.value = 0.92 + Math.random() * 0.22;
  const hp = ac.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 550;
  const bp = ac.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = bright;
  bp.Q.value = 0.95;
  const g = ac.createGain();
  const panner = panTo(ac, dest, pan);
  const t0 = ac.currentTime + start;
  const dur = 0.055 + Math.random() * 0.03;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + 0.004);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(hp);
  hp.connect(bp);
  bp.connect(g);
  g.connect(panner);
  src.start(t0);
  src.stop(t0 + dur + 0.04);
  disconnectLater(panner === dest ? [src, hp, bp, g] : [src, hp, bp, g, panner], start + dur + 0.05);
}

function playCrowdClap(ac: AudioContext, dest: GainNode) {
  const n = 14;
  for (let i = 0; i < n; i++) {
    const t = i === 0 ? 0 : 0.03 + i * 0.032 + Math.random() * 0.028;
    const peak = (i < 5 ? 0.085 : 0.05) * (0.7 + Math.random() * 0.5);
    const pan = (Math.random() * 2 - 1) * 0.72;
    const bright = 1400 + Math.random() * 1600;
    clap(ac, dest, t, peak, pan, bright);
  }
  // Tiny bright ping under the claps so a hit still feels like a hit.
  tone(ac, dest, { type: "triangle", freq: 784, start: 0.02, dur: 0.16, peak: 0.05 });
  tone(ac, dest, { type: "sine", freq: 1175, start: 0.08, dur: 0.2, peak: 0.035 });
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
  osc.frequency.exponentialRampToValueAtTime(Math.max(freq * 0.62, 90), t0 + 0.58);
  const bp = ac.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.setValueAtTime(760, t0);
  bp.frequency.exponentialRampToValueAtTime(540, t0 + 0.5);
  bp.Q.value = 3.2;
  const lp = ac.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 1350;
  const g = ac.createGain();
  const panner = panTo(ac, dest, pan);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + 0.07);
  g.gain.exponentialRampToValueAtTime(peak * 0.55, t0 + 0.32);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.78);
  osc.connect(bp);
  bp.connect(lp);
  lp.connect(g);
  g.connect(panner);
  osc.start(t0);
  osc.stop(t0 + 0.85);
  osc.onended = () => {
    osc.disconnect();
    bp.disconnect();
    lp.disconnect();
    g.disconnect();
    if (panner !== dest) panner.disconnect();
  };
}

function playCrowdAww(ac: AudioContext, dest: GainNode) {
  const voices: Array<[number, number, number, number]> = [
    [0.0, 330, -0.48, 0.07],
    [0.05, 292, -0.14, 0.065],
    [0.08, 268, 0.22, 0.06],
    [0.12, 355, 0.52, 0.055],
    [0.16, 248, 0.05, 0.045],
  ];
  for (const [start, freq, pan, peak] of voices) {
    voiceAww(ac, dest, start, freq, pan, peak);
  }
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
