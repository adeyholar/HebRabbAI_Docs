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
  dest: AudioNode,
  start: number,
  peak: number,
  pan: number,
  bright: number,
  body = 0.07,
) {
  const src = ac.createBufferSource();
  src.buffer = noiseBuffer(ac);
  src.playbackRate.value = 0.82 + Math.random() * 0.35;
  const hp = ac.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 220;
  const bp = ac.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = bright;
  bp.Q.value = 0.7;
  const g = ac.createGain();
  const panner = typeof ac.createStereoPanner === "function" ? ac.createStereoPanner() : null;
  if (panner) panner.pan.value = pan;
  const t0 = ac.currentTime + start;
  const dur = body + Math.random() * 0.04;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + 0.003);
  g.gain.exponentialRampToValueAtTime(peak * 0.35, t0 + dur * 0.35);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(hp);
  hp.connect(bp);
  bp.connect(g);
  if (panner) {
    g.connect(panner);
    panner.connect(dest);
  } else {
    g.connect(dest);
  }
  src.start(t0);
  src.stop(t0 + dur + 0.05);
  disconnectLater(panner ? [src, hp, bp, g, panner] : [src, hp, bp, g], start + dur + 0.08);
}

function thunderThump(ac: AudioContext, dest: AudioNode) {
  const t0 = ac.currentTime;
  for (const [freq, peak, dur] of [
    [62, 0.55, 0.28],
    [92, 0.38, 0.22],
    [48, 0.32, 0.4],
  ] as const) {
    const osc = ac.createOscillator();
    const g = ac.createGain();
    const lp = ac.createBiquadFilter();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, t0);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.55, t0 + dur);
    lp.type = "lowpass";
    lp.frequency.value = 180;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(peak, t0 + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(lp);
    lp.connect(g);
    g.connect(dest);
    osc.start(t0);
    osc.stop(t0 + dur + 0.04);
    osc.onended = () => {
      osc.disconnect();
      lp.disconnect();
      g.disconnect();
    };
  }
  const rumble = ac.createBufferSource();
  rumble.buffer = noiseBuffer(ac);
  const rlp = ac.createBiquadFilter();
  rlp.type = "lowpass";
  rlp.frequency.value = 140;
  const rg = ac.createGain();
  rg.gain.setValueAtTime(0.0001, t0);
  rg.gain.exponentialRampToValueAtTime(0.45, t0 + 0.02);
  rg.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.45);
  rumble.connect(rlp);
  rlp.connect(rg);
  rg.connect(dest);
  rumble.start(t0);
  rumble.stop(t0 + 0.5);
  disconnectLater([rumble, rlp, rg], 0.55);
}

function playCrowdClap(ac: AudioContext, dest: GainNode) {
  const bus = ac.createGain();
  bus.gain.value = 1.15;
  const comp = ac.createDynamicsCompressor();
  comp.threshold.value = -14;
  comp.knee.value = 18;
  comp.ratio.value = 5;
  comp.attack.value = 0.002;
  comp.release.value = 0.18;
  bus.connect(comp);
  comp.connect(dest);

  const delay = ac.createDelay(0.4);
  delay.delayTime.value = 0.12;
  const wet = ac.createGain();
  wet.gain.value = 0.32;
  const fb = ac.createGain();
  fb.gain.value = 0.18;
  bus.connect(delay);
  delay.connect(wet);
  wet.connect(dest);
  delay.connect(fb);
  fb.connect(delay);

  thunderThump(ac, bus);

  const n = 42;
  for (let i = 0; i < n; i++) {
    const early = i < 10;
    const t = early ? Math.random() * 0.07 : 0.06 + (i - 10) * 0.026 + Math.random() * 0.03;
    const fall = early ? 1 : Math.max(0.28, 1 - (i - 10) / 38);
    const peak = (early ? 0.32 : 0.18) * fall * (0.75 + Math.random() * 0.5);
    const pan = (Math.random() * 2 - 1) * 0.92;
    const bright = early ? 900 + Math.random() * 900 : 1500 + Math.random() * 1800;
    clap(ac, bus, t, peak, pan, bright, early ? 0.1 : 0.065);
  }

  disconnectLater([bus, comp, delay, wet, fb], 1.8);
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
