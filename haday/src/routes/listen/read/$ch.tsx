import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Pause, Play, Rewind, FastForward, SkipBack, SkipForward } from "lucide-react";
import { hebrewClusters } from "@/lib/hebrew-phones";
import { Button } from "@/components/ui/button";
import { ListenMenu } from "@/components/listen-menu";
import { Panel } from "@/components/panel";
import { playGrade } from "@/lib/sfx";
import {
  AUDIO_CREDIT,
  READ_RATES,
  READING_CREDIT,
  chapterAudio,
  clusterAtPlay,
  formatPlayTime,
  loadReadingProgress,
  mediaClockTime,
  parseReadingKey,
  readingGradeQuiz,
  readingVerses,
  saveReadingResult,
  verseAtTime,
  verseStartTime,
  wordAtTime,
  type GradeItem,
  type MediaClock,
  type ReadingVerse,
} from "@/lib/reading";

export const Route = createFileRoute("/listen/read/$ch")({ component: ReadingPage });

type Mode = "follow" | "grade";

function ReadingPage() {
  const { ch } = Route.useParams();
  const key = parseReadingKey(ch);
  const verses = useMemo(() => readingVerses(key), [key]);
  const [mode, setMode] = useState<Mode>("follow");
  const [i, setI] = useState(0);
  const [wordI, setWordI] = useState(0);
  const [clusterI, setClusterI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [rate, setRate] = useState(1);
  const [tnow, setTnow] = useState(0);
  const [tdur, setTdur] = useState(0);
  const [quiz, setQuiz] = useState<GradeItem[] | null>(null);
  const [qi, setQi] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [hits, setHits] = useState(0);
  const [seen, setSeen] = useState(0);
  const [done, setDone] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const clockRef = useRef<MediaClock>({ media: 0, wall: 0, rate: 1 });
  const seekingRef = useRef(false);
  const iRef = useRef(0);
  const wordRef = useRef(0);
  const clusterRef = useRef(0);
  const versesRef = useRef(verses);
  const rateRef = useRef(rate);
  const verse = verses[i];
  const rec = loadReadingProgress()[String(key)];
  iRef.current = i;
  versesRef.current = verses;
  rateRef.current = rate;

  function applyRate(el: HTMLAudioElement, n: number) {
    const next = n > 0 ? n : 1;
    el.playbackRate = next;
    el.defaultPlaybackRate = next;
    el.preservesPitch = true;
    clockRef.current = { media: el.currentTime, wall: performance.now(), rate: next };
  }

  function elAudio(): HTMLAudioElement | null {
    return audioRef.current;
  }

  function syncClock(el: HTMLAudioElement) {
    clockRef.current = {
      media: el.currentTime,
      wall: performance.now(),
      rate: el.playbackRate || rateRef.current,
    };
  }

  function onTime() {
    const el = elAudio();
    const list = versesRef.current;
    const cur = list[iRef.current];
    if (!el || !cur) return;
    const t = mediaClockTime(el.currentTime, el.paused, clockRef.current, performance.now(), el.duration || 0);
    if (!seekingRef.current) {
      setTnow(t);
      if (el.duration) setTdur(el.duration);
    }
    const vn = verseAtTime(cur.chapter, t);
    const next = list.findIndex((v) => v.chapter === cur.chapter && v.verse === vn);
    const item = next >= 0 ? list[next] : cur;
    if (next >= 0 && next !== iRef.current) {
      iRef.current = next;
      setI(next);
    }
    if (item) {
      const w = wordAtTime(item.chapter, item.verse, t);
      if (w !== wordRef.current) {
        wordRef.current = w;
        setWordI(w);
      }
      const surface = item.words[w] ?? "";
      const c = clusterAtPlay(item.chapter, item.verse, w, t, surface);
      if (c !== clusterRef.current) {
        clusterRef.current = c;
        setClusterI(c);
      }
    }
  }

  function onEnded() {
    const list = versesRef.current;
    const cur = list[iRef.current];
    if (!cur) {
      setPlaying(false);
      return;
    }
    const next = list.findIndex((v, idx) => idx > iRef.current && v.chapter !== cur.chapter);
    if (next >= 0) {
      iRef.current = next;
      setI(next);
      void playFrom(next, false);
      return;
    }
    setPlaying(false);
  }

  async function playFrom(index: number, kick: boolean) {
    const item = versesRef.current[index];
    const meta = item ? chapterAudio(item.chapter) : undefined;
    const el = elAudio();
    if (!item || !meta || !el) return;
    if (!el.src.endsWith(meta.src) && !el.src.includes(meta.src)) {
      el.src = meta.src;
    }
    applyRate(el, rateRef.current);
    const start = verseStartTime(item.chapter, item.verse);
    try {
      if (kick || Math.abs(el.currentTime - start) > 0.35 || el.paused) {
        el.currentTime = start;
        syncClock(el);
      }
      await el.play();
      applyRate(el, rateRef.current);
      setPlaying(true);
    } catch {
      setPlaying(false);
    }
  }

  function halt() {
    const el = elAudio();
    if (el) el.pause();
    setPlaying(false);
  }

  function seekTo(t: number) {
    const el = elAudio();
    if (!el) return;
    const dur = el.duration || tdur;
    el.currentTime = Math.max(0, Math.min(dur || t, t));
    syncClock(el);
    setTnow(el.currentTime);
    onTime();
  }

  function nudge(sec: number) {
    const el = elAudio();
    if (!el) return;
    seekTo(el.currentTime + sec);
  }

  useEffect(() => {
    const el = elAudio();
    if (!el) return;
    const onUpdate = () => {
      const guess = mediaClockTime(el.currentTime, el.paused, clockRef.current, performance.now(), el.duration || 0);
      if (el.paused || Math.abs(el.currentTime - guess) > 0.6) syncClock(el);
      onTime();
    };
    const onSeeked = () => {
      syncClock(el);
      onTime();
    };
    const onMeta = () => setTdur(el.duration || 0);
    const onPlay = () => {
      applyRate(el, rateRef.current);
      setPlaying(true);
    };
    const onPause = () => {
      syncClock(el);
      if (!el.ended) setPlaying(false);
    };
    el.addEventListener("timeupdate", onUpdate);
    el.addEventListener("seeked", onSeeked);
    el.addEventListener("loadedmetadata", onMeta);
    el.addEventListener("durationchange", onMeta);
    el.addEventListener("playing", onPlay);
    el.addEventListener("pause", onPause);
    el.addEventListener("ended", onEnded);
    return () => {
      el.removeEventListener("timeupdate", onUpdate);
      el.removeEventListener("seeked", onSeeked);
      el.removeEventListener("loadedmetadata", onMeta);
      el.removeEventListener("durationchange", onMeta);
      el.removeEventListener("playing", onPlay);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("ended", onEnded);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  useEffect(() => {
    setI(0);
    iRef.current = 0;
    setWordI(0);
    wordRef.current = 0;
    setClusterI(0);
    clusterRef.current = 0;
    setMode("follow");
    setQuiz(null);
    setDone(false);
    halt();
    const first = verses[0];
    const meta = first ? chapterAudio(first.chapter) : undefined;
    const el = elAudio();
    if (meta && el) {
      el.src = meta.src;
      applyRate(el, rateRef.current);
      setTnow(0);
      setTdur(meta.duration);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    return () => {
      const el = audioRef.current;
      if (!el) return;
      el.pause();
      el.src = "";
    };
  }, []);

  useEffect(() => {
    if (!playing) return;
    let id = 0;
    const tick = () => {
      onTime();
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
    // onTime reads refs only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing]);

  function step(delta: number) {
    const next = Math.max(0, Math.min(verses.length - 1, iRef.current + delta));
    iRef.current = next;
    setI(next);
    setWordI(0);
    wordRef.current = 0;
    setClusterI(0);
    clusterRef.current = 0;
    if (playing) void playFrom(next, true);
    else {
      const item = verses[next];
      const meta = item ? chapterAudio(item.chapter) : undefined;
      const el = elAudio();
      if (item && meta && el) {
        if (!el.src.includes(meta.src)) el.src = meta.src;
        el.currentTime = verseStartTime(item.chapter, item.verse);
        syncClock(el);
        onTime();
      }
    }
  }

  function startGrade() {
    halt();
    setMode("grade");
    setQuiz(readingGradeQuiz(key, 10));
    setQi(0);
    setPicked(null);
    setHits(0);
    setSeen(0);
    setDone(false);
  }

  function pickChoice(choice: string, item: GradeItem) {
    if (picked) return;
    const ok = choice === item.answer;
    playGrade(ok);
    setPicked(choice);
    const nextHits = hits + (ok ? 1 : 0);
    const nextSeen = seen + 1;
    setHits(nextHits);
    setSeen(nextSeen);
    window.setTimeout(() => {
      if (qi + 1 >= (quiz?.length ?? 0)) {
        const score = Math.round((nextHits / nextSeen) * 100);
        saveReadingResult(key, score);
        setDone(true);
      } else {
        setQi((n) => n + 1);
        setPicked(null);
      }
    }, 700);
  }

  const pct = seen ? Math.round((hits / seen) * 100) : 0;

  return (
    <>
      <Panel className="mb-4">
        <ListenMenu />
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
          Tanakh reading · Genesis {key === "all" ? "1–5" : key}
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold text-ink">Follow along, then grade</h1>
        <p className="mt-3 text-muted">
          Recorded Hebrew chapter audio — the same Tanakh reading, not a computer voice. English stays on the page. 90%
          first-answer clears the chapter.
        </p>
        {rec ? (
          <p className="mt-2 text-sm text-muted">
            Best {rec.best}%{rec.cleared ? " · cleared" : ""} · {rec.attempts} run{rec.attempts === 1 ? "" : "s"}
          </p>
        ) : null}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              setMode("follow");
              setQuiz(null);
              setDone(false);
            }}
            className={`min-h-12 rounded-[var(--radius-md)] px-3 text-sm font-semibold shadow-[var(--shadow-border)] ${
              mode === "follow" ? "bg-ink text-parchment" : "bg-card text-ink"
            }`}
          >
            Follow along
          </button>
          <button
            type="button"
            onClick={startGrade}
            className={`min-h-12 rounded-[var(--radius-md)] px-3 text-sm font-semibold shadow-[var(--shadow-border)] ${
              mode === "grade" ? "bg-ink text-parchment" : "bg-card text-ink"
            }`}
          >
            Grade reading
          </button>
        </div>
      </Panel>

      {mode === "follow" && verse ? (
        <FollowCard
          audioRef={audioRef}
          verse={verse}
          i={i}
          wordI={wordI}
          clusterI={clusterI}
          total={verses.length}
          playing={playing}
          rate={rate}
          now={tnow}
          duration={tdur}
          onToggle={() => {
            if (playing) halt();
            else void playFrom(i, true);
          }}
          onStep={step}
          onNudge={nudge}
          onSeek={(t) => seekTo(t)}
          onSeeking={(yes) => {
            seekingRef.current = yes;
          }}
          onRate={(n) => {
            setRate(n);
            rateRef.current = n;
            const node = elAudio();
            if (node) applyRate(node, n);
          }}
        />
      ) : null}

      {mode === "grade" && quiz && !done ? (
        <GradeCard item={quiz[qi]!} qi={qi} total={quiz.length} picked={picked} onPick={pickChoice} />
      ) : null}

      {mode === "grade" && done ? (
        <Panel className="text-center">
          <h2 className="font-display text-3xl font-bold text-ink">{pct >= 90 ? "Reading cleared" : "Need 90% to clear"}</h2>
          <p className="mt-3 text-muted">
            {hits}/{seen} · {pct}%
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Button size="lg" onClick={startGrade}>
              Try again
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => {
                setMode("follow");
                setDone(false);
              }}
            >
              Back to follow along
            </Button>
          </div>
        </Panel>
      ) : null}

      <p className="mt-6 text-xs text-muted">
        {AUDIO_CREDIT} {READING_CREDIT.he} {READING_CREDIT.en}
      </p>
    </>
  );
}

function FollowCard({
  audioRef,
  verse,
  i,
  wordI,
  clusterI,
  total,
  playing,
  rate,
  now,
  duration,
  onToggle,
  onStep,
  onNudge,
  onSeek,
  onSeeking,
  onRate,
}: {
  audioRef: RefObject<HTMLAudioElement | null>;
  verse: ReadingVerse;
  i: number;
  wordI: number;
  clusterI: number;
  total: number;
  playing: boolean;
  rate: number;
  now: number;
  duration: number;
  onToggle: () => void;
  onStep: (d: number) => void;
  onNudge: (sec: number) => void;
  onSeek: (t: number) => void;
  onSeeking: (yes: boolean) => void;
  onRate: (n: number) => void;
}) {
  const max = duration > 0 ? duration : 0;
  return (
    <>
      <div className="min-w-0 overflow-x-hidden rounded-[var(--radius-xl)] bg-card px-4 py-6 shadow-[var(--shadow-border)] sm:px-5 sm:py-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">{verse.ref}</p>
        <p className="he-verse mt-4 text-xl sm:text-2xl md:text-3xl" lang="he" dir="rtl">
          {verse.words.map((w, wi) => (
            <span
              key={`${verse.ref}-${wi}`}
              className={wi === wordI ? "he-spoken max-w-full" : "max-w-full text-ink"}
            >
              {hebrewClusters(w).map((part, pi) => (
                <span
                  key={`${verse.ref}-${wi}-${pi}`}
                  className={wi === wordI && pi === clusterI ? "rounded-sm bg-primary px-0.5 text-primary-foreground" : undefined}
                >
                  {part.glyph}
                </span>
              ))}
            </span>
          ))}
        </p>
        <p className="mt-4 max-w-full text-base leading-relaxed break-words text-ink">{verse.en}</p>
        <p className="mt-6 text-sm tabular-nums text-muted">
          {i + 1} / {total}
        </p>
      </div>

      <div className="mt-4 rounded-[var(--radius-xl)] bg-card px-4 py-4 shadow-[var(--shadow-border)]">
        <div className="flex items-center justify-between text-sm font-semibold tabular-nums text-muted">
          <span>{formatPlayTime(now)}</span>
          <span>{formatPlayTime(max)}</span>
        </div>
        <input
          className="audio-seek mt-1"
          type="range"
          min={0}
          max={max || 1}
          step={0.1}
          value={Math.min(now, max || now)}
          aria-label="Seek recording"
          onPointerDown={() => onSeeking(true)}
          onPointerUp={() => onSeeking(false)}
          onChange={(e) => {
            const t = Number(e.target.value);
            onSeeking(true);
            onSeek(t);
          }}
        />
        <audio
          ref={audioRef}
          className="mt-1 w-full"
          controls
          preload="auto"
          controlsList="nodownload noplaybackrate"
        />
        <div className="mt-3 grid grid-cols-5 gap-2">
          <Button type="button" variant="outline" size="lg" className="min-h-14" onClick={() => onNudge(-5)}>
            <Rewind className="size-5" />
            <span className="sr-only">Back 5 seconds</span>
          </Button>
          <Button type="button" variant="outline" size="lg" className="min-h-14" onClick={() => onStep(-1)}>
            <SkipBack className="size-5" />
            <span className="sr-only">Previous verse</span>
          </Button>
          <Button type="button" size="lg" className="min-h-14" onClick={onToggle}>
            {playing ? <Pause className="size-6" /> : <Play className="size-6 ms-0.5" />}
            <span className="sr-only">{playing ? "Pause" : "Play"}</span>
          </Button>
          <Button type="button" variant="outline" size="lg" className="min-h-14" onClick={() => onStep(1)}>
            <SkipForward className="size-5" />
            <span className="sr-only">Next verse</span>
          </Button>
          <Button type="button" variant="outline" size="lg" className="min-h-14" onClick={() => onNudge(5)}>
            <FastForward className="size-5" />
            <span className="sr-only">Forward 5 seconds</span>
          </Button>
        </div>
        <p className="mt-3 text-center text-xs font-semibold uppercase tracking-wide text-muted">Speed</p>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {READ_RATES.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => onRate(r.value)}
              className={`min-h-12 rounded-[var(--radius-md)] px-2 text-sm font-semibold shadow-[var(--shadow-border)] ${
                rate === r.value ? "bg-ink text-parchment" : "bg-surface text-ink"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

function GradeCard({
  item,
  qi,
  total,
  picked,
  onPick,
}: {
  item: GradeItem;
  qi: number;
  total: number;
  picked: string | null;
  onPick: (choice: string, item: GradeItem) => void;
}) {
  return (
    <div className="min-w-0 overflow-x-hidden rounded-[var(--radius-xl)] bg-card px-4 py-6 shadow-[var(--shadow-border)] sm:px-5 sm:py-8">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">
        {item.verse.ref} · {qi + 1}/{total}
      </p>
      <p className="he-verse mt-4 text-xl sm:text-2xl" lang="he" dir="rtl">
        {item.verse.words.map((w, wi) => (
          <span key={`${item.id}-g-${wi}`} className="text-ink">
            {w}
          </span>
        ))}
      </p>
      <p className="mt-6 text-sm font-semibold text-ink">Which English is this verse?</p>
      <ul className="mt-3 grid gap-2">
        {item.choices.map((c) => {
          const show = Boolean(picked);
          const right = c === item.answer;
          return (
            <li key={c}>
              <button
                type="button"
                disabled={show}
                onClick={() => onPick(c, item)}
                className={`w-full rounded-[var(--radius-md)] px-4 py-3 text-start text-sm shadow-[var(--shadow-border)] ${
                  show && right ? "bg-good text-parchment" : show && picked === c ? "bg-danger text-parchment" : "bg-surface text-ink"
                }`}
              >
                {c}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
