import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ListenMenu } from "@/components/listen-menu";
import { Panel } from "@/components/panel";
import { playGrade } from "@/lib/sfx";
import {
  AUDIO_CREDIT,
  READING_CREDIT,
  chapterAudio,
  loadReadingProgress,
  parseReadingKey,
  readingGradeQuiz,
  readingVerses,
  saveReadingResult,
  verseAtTime,
  verseStartTime,
  type GradeItem,
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
  const [playing, setPlaying] = useState(false);
  const [rate, setRate] = useState(1);
  const [quiz, setQuiz] = useState<GradeItem[] | null>(null);
  const [qi, setQi] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [hits, setHits] = useState(0);
  const [seen, setSeen] = useState(0);
  const [done, setDone] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const iRef = useRef(0);
  const versesRef = useRef(verses);
  const rateRef = useRef(rate);
  const verse = verses[i];
  const rec = loadReadingProgress()[String(key)];
  iRef.current = i;
  versesRef.current = verses;
  rateRef.current = rate;

  function audio(): HTMLAudioElement {
    if (!audioRef.current) {
      const el = new Audio();
      el.preload = "auto";
      el.addEventListener("timeupdate", onTime);
      el.addEventListener("ended", onEnded);
      el.addEventListener("pause", () => {
        if (el.ended) return;
        if (el.currentTime > 0 && el.currentTime < el.duration - 0.15) setPlaying(false);
      });
      el.addEventListener("play", () => setPlaying(true));
      audioRef.current = el;
    }
    return audioRef.current;
  }

  function onTime() {
    const el = audioRef.current;
    const list = versesRef.current;
    const cur = list[iRef.current];
    if (!el || !cur) return;
    const vn = verseAtTime(cur.chapter, el.currentTime);
    const next = list.findIndex((v) => v.chapter === cur.chapter && v.verse === vn);
    if (next >= 0 && next !== iRef.current) {
      iRef.current = next;
      setI(next);
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
    if (!item || !meta) return;
    const el = audio();
    if (!el.src.endsWith(meta.src) && !el.src.includes(meta.src)) {
      el.src = meta.src;
    }
    el.playbackRate = rateRef.current;
    const start = verseStartTime(item.chapter, item.verse);
    try {
      if (kick || Math.abs(el.currentTime - start) > 0.35 || el.paused) {
        el.currentTime = start;
      }
      await el.play();
      setPlaying(true);
    } catch {
      setPlaying(false);
    }
  }

  function halt() {
    const el = audioRef.current;
    if (el) {
      el.pause();
    }
    setPlaying(false);
  }

  useEffect(() => {
    setI(0);
    iRef.current = 0;
    setMode("follow");
    setQuiz(null);
    setDone(false);
    halt();
    const first = verses[0];
    const meta = first ? chapterAudio(first.chapter) : undefined;
    if (meta) {
      const el = audio();
      el.src = meta.src;
      el.playbackRate = rateRef.current;
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

  function step(delta: number) {
    const next = Math.max(0, Math.min(verses.length - 1, iRef.current + delta));
    iRef.current = next;
    setI(next);
    if (playing) void playFrom(next, true);
    else {
      const item = verses[next];
      const meta = item ? chapterAudio(item.chapter) : undefined;
      const el = audio();
      if (item && meta) {
        if (!el.src.includes(meta.src)) el.src = meta.src;
        el.currentTime = verseStartTime(item.chapter, item.verse);
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
          verse={verse}
          i={i}
          total={verses.length}
          playing={playing}
          rate={rate}
          onToggle={() => {
            if (playing) halt();
            else void playFrom(i, true);
          }}
          onStep={step}
          onRate={(n) => {
            setRate(n);
            rateRef.current = n;
            const el = audioRef.current;
            if (el) el.playbackRate = n;
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
  verse,
  i,
  total,
  playing,
  rate,
  onToggle,
  onStep,
  onRate,
}: {
  verse: ReadingVerse;
  i: number;
  total: number;
  playing: boolean;
  rate: number;
  onToggle: () => void;
  onStep: (d: number) => void;
  onRate: (n: number) => void;
}) {
  return (
    <>
      <div className="rounded-[var(--radius-xl)] bg-card px-5 py-8 shadow-[var(--shadow-border)]">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">{verse.ref}</p>
        <p className="he-word mt-4 text-2xl leading-relaxed sm:text-3xl" lang="he" dir="rtl">
          {verse.he}
        </p>
        <p className="mt-4 text-base leading-relaxed text-ink">{verse.en}</p>
        <p className="mt-6 text-sm tabular-nums text-muted">
          {i + 1} / {total}
        </p>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <Button type="button" variant="outline" size="lg" className="min-h-16" onClick={() => onStep(-1)}>
          <SkipBack className="size-6" />
          <span className="sr-only">Previous</span>
        </Button>
        <Button type="button" size="lg" className="min-h-16" onClick={onToggle}>
          {playing ? <Pause className="size-7" /> : <Play className="size-7" />}
          <span className="ms-2">{playing ? "Pause" : "Play"}</span>
        </Button>
        <Button type="button" variant="outline" size="lg" className="min-h-16" onClick={() => onStep(1)}>
          <SkipForward className="size-6" />
          <span className="sr-only">Next</span>
        </Button>
      </div>
      <label className="mt-3 flex min-h-12 items-center justify-between gap-2 rounded-[var(--radius-md)] bg-card px-3 text-sm font-semibold shadow-[var(--shadow-border)]">
        Speed
        <select className="bg-transparent text-ink" value={String(rate)} onChange={(e) => onRate(Number(e.target.value))}>
          <option value="0.85">Slow</option>
          <option value="1">Recorded</option>
          <option value="1.15">Faster</option>
        </select>
      </label>
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
    <div className="rounded-[var(--radius-xl)] bg-card px-5 py-8 shadow-[var(--shadow-border)]">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">
        {item.verse.ref} · {qi + 1}/{total}
      </p>
      <p className="he-word mt-4 text-2xl leading-relaxed" lang="he" dir="rtl">
        {item.verse.he}
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
