import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/panel";
import { GAME_CHAPTER_TITLES } from "@/lib/vocab";
import {
  firstIndexForChapter,
  hasHebrewVoice,
  listenPlaylist,
  loadListenIndex,
  saveListenIndex,
  speakCard,
  stopSpeech,
  waitForVoices,
} from "@/lib/listen";

export const Route = createFileRoute("/listen")({ component: ListenPage });

function ListenPage() {
  const list = useMemo(() => listenPlaylist(), []);
  const [i, setI] = useState(() => Math.min(loadListenIndex(), Math.max(0, list.length - 1)));
  const [playing, setPlaying] = useState(false);
  const [loop, setLoop] = useState(true);
  const [rate, setRate] = useState(1);
  const [heVoice, setHeVoice] = useState(true);
  const stopRef = useRef({ stop: false });
  const playGen = useRef(0);
  const item = list[i];

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
    if (!playing || !("mediaSession" in navigator)) return;
    const ms = navigator.mediaSession;
    ms.metadata = new MediaMetadata({
      title: item ? `${item.hebrew} · ${item.gloss}` : "HaDay Listen",
      artist: "HaDay",
      album: item ? `Chapter ${item.chapter}` : "BBH vocabulary",
    });
    ms.playbackState = "playing";
    ms.setActionHandler("play", () => void toggle(true));
    ms.setActionHandler("pause", () => void toggle(false));
    ms.setActionHandler("previoustrack", () => step(-1));
    ms.setActionHandler("nexttrack", () => step(1));
    return () => {
      ms.setActionHandler("play", null);
      ms.setActionHandler("pause", null);
      ms.setActionHandler("previoustrack", null);
      ms.setActionHandler("nexttrack", null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, i]);

  async function runFrom(start: number) {
    const gen = ++playGen.current;
    stopRef.current = { stop: false };
    setPlaying(true);
    try {
      await navigator.wakeLock?.request("screen");
    } catch {
      /* optional */
    }
    let at = start;
    while (!stopRef.current.stop && gen === playGen.current) {
      const card = list[at];
      if (!card) {
        if (loop) {
          at = 0;
          setI(0);
          continue;
        }
        break;
      }
      setI(at);
      await speakCard(card, rate, stopRef.current);
      if (stopRef.current.stop || gen !== playGen.current) break;
      at += 1;
    }
    if (gen === playGen.current) setPlaying(false);
  }

  function halt() {
    stopRef.current.stop = true;
    playGen.current += 1;
    stopSpeech();
    setPlaying(false);
  }

  function toggle(next = !playing) {
    if (next) void runFrom(i);
    else halt();
  }

  function step(delta: number) {
    const next = Math.min(list.length - 1, Math.max(0, i + delta));
    setI(next);
    if (playing) {
      halt();
      window.setTimeout(() => void runFrom(next), 40);
    }
  }

  function jumpChapter(ch: number) {
    const at = firstIndexForChapter(list, ch);
    setI(at);
    if (playing) {
      halt();
      window.setTimeout(() => void runFrom(at), 40);
    }
  }

  return (
    <>
      <Panel className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Hands-free</p>
        <h1 className="mt-1 font-display text-4xl font-bold text-ink">Listen</h1>
        <p className="mt-3 text-muted">
          Hebrew, then English, chapter 1 through 19. Tap play once. Then just listen — car, walk, kitchen.
        </p>
        {!heVoice && (
          <p className="mt-2 text-sm text-danger">
            This device has no Hebrew voice yet, so you will hear transliteration for the Hebrew slot. Add a Hebrew
            voice in system settings for true Hebrew audio.
          </p>
        )}
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
        <Button type="button" size="lg" className="min-h-16" onClick={() => toggle()}>
          {playing ? <Pause className="size-7" /> : <Play className="size-7" />}
          <span className="ms-2">{playing ? "Pause" : "Play"}</span>
        </Button>
        <Button type="button" variant="outline" size="lg" className="min-h-16" onClick={() => step(1)}>
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
            <option value="0.8">Slow</option>
            <option value="1">Normal</option>
            <option value="1.15">Brisk</option>
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
          Eyes on the road. Phone play/pause and car next/previous work when the screen stays open.
        </p>
      </Panel>
    </>
  );
}
