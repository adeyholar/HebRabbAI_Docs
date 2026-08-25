import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/panel";
import { GAME_CHAPTER_TITLES } from "@/lib/vocab";
import {
  firstIndexForChapter,
  hasHebrewVoice,
  keepSpeechAlive,
  listenPlaylist,
  loadListenIndex,
  playListenChime,
  saveListenIndex,
  speakCard,
  speechSupported,
  stopSpeech,
  unlockSpeech,
  waitForVoices,
} from "@/lib/listen";

export const Route = createFileRoute("/listen")({ component: ListenPage });

function ListenPage() {
  const list = useMemo(() => listenPlaylist(), []);
  const [i, setI] = useState(() => Math.min(loadListenIndex(), Math.max(0, list.length - 1)));
  const [playing, setPlaying] = useState(false);
  const [loop, setLoop] = useState(true);
  const [rate, setRate] = useState(0.8);
  const [heVoice, setHeVoice] = useState(true);
  const [supported] = useState(() => speechSupported());
  const [status, setStatus] = useState("");
  const stopRef = useRef({ stop: false });
  const playGen = useRef(0);
  const loopRef = useRef(loop);
  const rateRef = useRef(rate);
  const iRef = useRef(i);
  const item = list[i];
  loopRef.current = loop;
  rateRef.current = rate;
  iRef.current = i;

  useEffect(() => {
    void waitForVoices().then(() => setHeVoice(hasHebrewVoice()));
  }, []);

  useEffect(() => {
    saveListenIndex(i);
  }, [i]);

  useEffect(() => {
    return () => {
      stopRef.current.stop = true;
      stopSpeech();
    };
  }, []);

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(keepSpeechAlive, 8_000);
    return () => window.clearInterval(id);
  }, [playing]);

  useEffect(() => {
    if (!playing || !("mediaSession" in navigator)) return;
    const ms = navigator.mediaSession;
    ms.metadata = new MediaMetadata({
      title: item ? `${item.hebrew} · ${item.gloss}` : "HaDay Listen",
      artist: "HaDay",
      album: item ? `Chapter ${item.chapter}` : "BBH vocabulary",
    });
    ms.playbackState = "playing";
    ms.setActionHandler("play", () => startFrom(iRef.current, true));
    ms.setActionHandler("pause", () => halt());
    ms.setActionHandler("previoustrack", () => step(-1));
    ms.setActionHandler("nexttrack", () => step(1));
    return () => {
      ms.setActionHandler("play", null);
      ms.setActionHandler("pause", null);
      ms.setActionHandler("previoustrack", null);
      ms.setActionHandler("nexttrack", null);
    };
  }, [playing, i, item]);

  function halt() {
    stopRef.current.stop = true;
    playGen.current += 1;
    stopSpeech();
    setPlaying(false);
    setStatus("");
  }

  function startFrom(start: number, kick = false) {
    if (!speechSupported()) {
      setStatus("This browser cannot speak text. Try Safari or Chrome, and unmute the phone.");
      return;
    }
    stopRef.current.stop = false;
    const gen = ++playGen.current;
    setPlaying(true);
    setStatus("Speaking…");
    if (kick) {
      playListenChime();
      unlockSpeech();
    } else {
      stopSpeech();
    }
    void navigator.wakeLock?.request("screen").catch(() => {});
    void (async () => {
      await waitForVoices();
      if (stopRef.current.stop || gen !== playGen.current) return;
      setHeVoice(hasHebrewVoice());
      let at = start;
      while (!stopRef.current.stop && gen === playGen.current) {
        const card = list[at];
        if (!card) {
          if (loopRef.current) {
            at = 0;
            setI(0);
            continue;
          }
          break;
        }
        setI(at);
        iRef.current = at;
        await speakCard(card, rateRef.current, stopRef.current);
        if (stopRef.current.stop || gen !== playGen.current) break;
        at += 1;
      }
      if (gen === playGen.current) {
        setPlaying(false);
        setStatus("");
      }
    })();
  }

  function toggle() {
    if (playing) halt();
    else startFrom(i, true);
  }

  function step(delta: number) {
    const next = Math.min(list.length - 1, Math.max(0, iRef.current + delta));
    setI(next);
    iRef.current = next;
    if (playing) startFrom(next, false);
  }

  function jumpChapter(ch: number) {
    const at = firstIndexForChapter(list, ch);
    setI(at);
    iRef.current = at;
    if (playing) startFrom(at, false);
  }

  return (
    <>
      <Panel className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Hands-free</p>
        <h1 className="mt-1 font-display text-4xl font-bold text-ink">Listen</h1>
        <p className="mt-3 text-muted">
          Hebrew twice, then English twice, with a rest in between. Default is calm. Slow it further or speed it up if you want.
        </p>
        {!supported && (
          <p className="mt-2 text-sm text-danger">This browser has no speech engine. Open the site in Safari or Chrome.</p>
        )}
        {supported && !heVoice && (
          <p className="mt-2 text-sm text-muted">
            No Hebrew system voice on this device — you will hear Hebrew as best it can, plus transliteration, then
            English. Add a Hebrew voice in Settings for a clearer Hebrew line.
          </p>
        )}
        {status && <p className="mt-2 text-sm font-semibold text-primary">{status}</p>}
      </Panel>

      <div className="rounded-[var(--radius-xl)] bg-card px-5 py-10 text-center shadow-[var(--shadow-border)]">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          Chapter {item?.chapter ?? "—"}
          {item ? ` · ${GAME_CHAPTER_TITLES[item.chapter] ?? ""}` : ""}
        </p>
        <p className="he-word mt-4 text-5xl sm:text-6xl">{item?.hebrew}</p>
        <p className="mt-3 font-display text-2xl font-semibold text-ink">{item?.gloss}</p>
        <p className="mt-1 text-sm text-muted">{item?.translit}</p>
        <p className="mt-6 text-sm tabular-nums text-muted">
          {i + 1} / {list.length}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <Button type="button" variant="outline" size="lg" className="min-h-16" onClick={() => step(-1)}>
          <SkipBack className="size-6" />
          <span className="sr-only">Previous</span>
        </Button>
        <Button type="button" size="lg" className="min-h-16" onClick={toggle}>
          {playing ? <Pause className="size-7" /> : <Play className="size-7" />}
          <span className="ms-2">{playing ? "Pause" : "Play"}</span>
        </Button>
        <Button type="button" variant="outline" size="lg" onClick={() => step(1)} className="min-h-16">
          <SkipForward className="size-6" />
          <span className="sr-only">Next</span>
        </Button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setLoop((v) => !v)}
          className="min-h-12 rounded-[var(--radius-md)] bg-card px-3 text-sm font-semibold shadow-[var(--shadow-border)]"
        >
          {loop ? "Loop on" : "Loop off"}
        </button>
        <label className="flex min-h-12 items-center justify-between gap-2 rounded-[var(--radius-md)] bg-card px-3 text-sm font-semibold shadow-[var(--shadow-border)]">
          Speed
          <select
            className="bg-transparent text-ink"
            value={String(rate)}
            onChange={(e) => setRate(Number(e.target.value))}
          >
            <option value="0.62">Slow</option>
            <option value="0.8">Calm</option>
            <option value="1.05">Faster</option>
          </select>
        </label>
      </div>

      <Panel className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Jump to chapter</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {Array.from({ length: 19 }, (_, n) => n + 1).map((ch) => (
            <button
              key={ch}
              type="button"
              onClick={() => jumpChapter(ch)}
              className={`min-h-11 min-w-11 rounded-[var(--radius-md)] px-2 text-sm font-semibold ${
                item?.chapter === ch ? "bg-ink text-parchment" : "bg-card shadow-[var(--shadow-border)]"
              }`}
            >
              {ch}
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted">
          Turn the ringer/volume up. You should hear a short chime, then “Ready,” then the words. Keep the screen on.
        </p>
      </Panel>
    </>
  );
}
