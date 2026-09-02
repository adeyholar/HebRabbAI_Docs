#!/usr/bin/env python3
"""Forced-align Genesis 1–5 words onto speech energy.

Keeps the existing verse windows (already counted against WLC) and maps each
word onto voiced islands. Island onsets are pulled back to the rise of energy
so the highlight is not late to the voice.
"""
from __future__ import annotations

import json
import subprocess
from pathlib import Path

import numpy as np

ROOT = Path("/workspace")
GEN = json.loads((ROOT / "src/lib/genesis-1-5.json").read_text())
AUDIO_META = json.loads((ROOT / "src/lib/tanakh-audio.json").read_text())
OUT = ROOT / "src/lib/tanakh-audio.json"
AUDIO_DIR = ROOT / "public/audio/tanakh"


def letters(word: str) -> int:
    return sum(1 for c in word if "\u05d0" <= c <= "\u05ea") or 1


def decode(path: Path) -> tuple[np.ndarray, int]:
    raw = subprocess.check_output(
        ["ffmpeg", "-hide_banner", "-loglevel", "error", "-i", str(path), "-ac", "1", "-ar", "16000", "-f", "s16le", "-"],
        stderr=subprocess.DEVNULL,
    )
    return np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768.0, 16000


def envelope(samples: np.ndarray, sr: int, hop=0.01, win=0.02) -> tuple[np.ndarray, float]:
    w = max(1, int(win * sr))
    h = max(1, int(hop * sr))
    rms = [float(np.sqrt(np.mean(samples[i : i + w] ** 2) + 1e-12)) for i in range(0, max(1, len(samples) - w), h)]
    env = np.array(rms, dtype=np.float32)
    if len(env) >= 3:
        env = np.convolve(env, np.ones(3) / 3, mode="same")
    return env, h / sr


def islands(env: np.ndarray, dt: float, t0: float, min_dur=0.03) -> list[tuple[float, float]]:
    if not len(env):
        return []
    thr = max(0.01, float(np.percentile(env, 24)) * 0.7)
    speech = env > thr
    segs: list[tuple[float, float]] = []
    on = False
    st = 0
    for i, flag in enumerate(speech):
        if flag and not on:
            on = True
            st = i
        elif not flag and on:
            if (i - st) * dt >= min_dur:
                segs.append((t0 + st * dt, t0 + i * dt))
            on = False
    if on and (len(env) - st) * dt >= min_dur:
        segs.append((t0 + st * dt, t0 + len(env) * dt))
    return segs


def pull_onset(env: np.ndarray, dt: float, t0: float, start: float, peak_t: float, floor: float) -> float:
    if not len(env):
        return max(floor, start)
    i_end = int(np.clip((start - t0) / dt, 0, len(env) - 1))
    i_peak = int(np.clip((peak_t - t0) / dt, 0, len(env) - 1))
    peak = float(env[i_peak])
    thr = max(0.006, peak * 0.10)
    i_min = int(np.clip((max(floor, start - 0.5) - t0) / dt, 0, len(env) - 1))
    hit = i_end
    for i in range(i_end, i_min - 1, -1):
        if env[i] < thr:
            hit = min(len(env) - 1, i + 1)
            break
        hit = i
    return max(floor, t0 + hit * dt)


def merge_close(segs: list[tuple[float, float]], gap=0.12) -> list[tuple[float, float]]:
    if not segs:
        return []
    out = [segs[0]]
    for a, b in segs[1:]:
        pa, pb = out[-1]
        if a - pb <= gap:
            out[-1] = (pa, b)
        else:
            out.append((a, b))
    return out


def place_words(segs: list[tuple[float, float]], words: list[str], t0: float, t1: float) -> list[float]:
    n = len(words)
    if n == 0:
        return []
    segs = [(a, b) for a, b in segs if b - a >= 0.08]
    segs = merge_close(segs, 0.12)
    if not segs:
        step = max(0.08, (t1 - t0) / n)
        return [round(t0 + i * step, 3) for i in range(n)]
    # Always walk speech by letter weight. Island count is not word count
    # in this cantillation, so 1:1 mapping lags or skips.
    wts = np.array([letters(w) for w in words], dtype=float)
    wts = wts / wts.sum()
    speech = max(0.08, sum(b - a for a, b in segs))
    durs = wts * speech
    starts: list[float] = []
    ii = 0
    t = segs[0][0]
    for d in durs:
        while ii < len(segs) and t >= segs[ii][1] - 1e-4:
            ii += 1
            if ii < len(segs):
                t = segs[ii][0]
        starts.append(float(t))
        remain = float(d)
        while remain > 1e-4 and ii < len(segs):
            room = segs[ii][1] - t
            if room >= remain:
                t += remain
                remain = 0.0
            else:
                remain -= max(0.0, room)
                ii += 1
                if ii < len(segs):
                    t = segs[ii][0]
                else:
                    t += remain
                    remain = 0.0
        if remain > 1e-4:
            t += remain
    out: list[float] = []
    last = t0
    for j, s in enumerate(starts):
        s = s - 0.06
        s = min(max(s, last + 0.04), t1 - 0.04 * (n - j))
        out.append(round(float(s), 3))
        last = out[-1]
    return out


def align_chapter(ch: str) -> dict:
    path = AUDIO_DIR / f"01-Gen_{int(ch):02d}.mp3"
    samples, sr = decode(path)
    prev = AUDIO_META[ch]
    duration = round(len(samples) / sr, 2)
    env, dt = envelope(samples, sr)
    verses = GEN["chapters"][ch]
    starts = [float(x) for x in prev["verses"]]
    pulled: list[float] = []
    for i, t in enumerate(starts):
        floor = (pulled[-1] + 0.3) if i else max(2.0, t - 0.6)
        pulled.append(round(pull_onset(env, dt, 0.0, t, t + 0.2, floor), 3))
    starts = pulled
    words_times = []
    for i, row in enumerate(verses):
        t0 = starts[i]
        t1 = starts[i + 1] if i + 1 < len(starts) else duration
        i0 = int(t0 * sr)
        i1 = int(min(len(samples), t1 * sr))
        chunk = samples[i0:i1]
        cenv, cdt = envelope(chunk, sr)
        segs = islands(cenv, cdt, t0, min_dur=0.03)
        pulled_segs: list[tuple[float, float]] = []
        for j, (a, b) in enumerate(segs):
            floor = t0 if j == 0 else pulled_segs[-1][1] - 0.02
            a2 = pull_onset(cenv, cdt, t0, a, (a + b) / 2, floor)
            pulled_segs.append((a2, b))
        times = place_words(pulled_segs, row["words"], t0, t1 - 0.03)
        words_times.append(times)
    return {
        "src": f"/audio/tanakh/01-Gen_{int(ch):02d}.mp3",
        "duration": duration,
        "verses": [round(x, 2) for x in starts],
        "words": words_times,
    }


def main() -> None:
    out = {}
    for ch in ["1", "2", "3", "4", "5"]:
        meta = align_chapter(ch)
        out[ch] = meta
        print(f"ch {ch} v1 {meta['words'][0]} verse0={meta['verses'][0]} n={len(meta['verses'])}")
    OUT.write_text(json.dumps(out, separators=(",", ":")))
    print("wrote", OUT, "bytes", OUT.stat().st_size)


if __name__ == "__main__":
    main()
