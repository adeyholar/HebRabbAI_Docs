import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ListenMenu } from "@/components/listen-menu";
import { Panel } from "@/components/panel";
import { playGrade } from "@/lib/sfx";
import {
  READING_CREDIT,
  loadReadingProgress,
  parseReadingKey,
  readingGradeQuiz,
  readingVerses,
  saveReadingResult,
  type GradeItem,
  type ReadingVerse,
} from "@/lib/reading";
import {
  hasHebrewVoice,
  isAppleMobile,
  keepSpeechAlive,
  playListenChime,
  speechSupported,
  speakReadingVerse,
  stopSpeech,
  unlockSpeech,
  waitForVoices,
} from "@/lib/listen";

export const Route = createFileRoute("/listen/read/$ch")({ component: ReadingPage });

type Mode = "follow" | "grade";

function ReadingPage() {
  const { ch } = Route.useParams();
  const key = parseReadingKey(ch);
  const verses = useMemo(() => readingVerses(key), [key]);
  const [mode, setMode] = useState<Mode>("follow");
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [rate, setRate] = useState(0.8);
  const [heVoice, setHeVoice] = useState(true);
  const [quiz, setQuiz] = useState<GradeItem[] | null>(null);
  const [qi, setQi] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [hits, setHits] = useState(0);
  const [seen, setSeen] = useState(0);
  const [done, setDone] = useState(false);
  const stopRef = useRef({ stop: false });
  const playGen = useRef(0);
  const iRef = useRef(0);
  const rateRef = useRef(rate);
  const verse = verses[i];
  const rec = loadReadingProgress()[String(key)];
  iRef.current = i;
  rateRef.current = rate;

  useEffect(() => {
    setI(0);
    iRef.current = 0;
    setMode("follow");
    setQuiz(null);
    setDone(false);
    halt();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    void waitForVoices().then(() => setHeVoice(hasHebrewVoice()));
  }, []);

  useEffect(() => {
    return () => {
      stopRef.current.stop = true;
      stopSpeech();
    };
  }, []);

  useEffect(() => {
    if (!playing) return;
    const ms = isAppleMobile() ? 2_000 : 8_000;
    const id = window.setInterval(keepSpeechAlive, ms);
    return () => window.clearInterval(id);
  }, [playing]);

  function halt() {
    stopRef.current.stop = true;
    playGen.current += 1;
    stopSpeech();
    setPlaying(false);
  }

  function startFrom(start: number, kick = false) {
    if (!speechSupported() || !verses.length) return;
    stopRef.current.stop = false;
    const gen = ++playGen.current;
    setPlaying(true);
    if (kick) {
      if (!isAppleMobile()) playListenChime();
      unlockSpeech();
    } else {
      stopSpeech();
    }
    void navigator.wakeLock?.request("screen").catch(() => {});
    void (async () => {
      let at = start;
      while (!stopRef.current.stop && gen === playGen.current) {
        const v = verses[at];
        if (!v) break;
        setI(at);
        iRef.current = at;
        await speakReadingVerse(v, rateRef.current, stopRef.current);
        if (stopRef.current.stop || gen !== playGen.current) break;
        if (at + 1 >= verses.length) break;
        at += 1;
      }
      if (gen === playGen.current) setPlaying(false);
    })();
  }

  function step(delta: number) {
    const next = Math.max(0, Math.min(verses.length - 1, iRef.current + delta));
    setI(next);
    iRef.current = next;
    if (playing) startFrom(next, false);
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
          Public-domain Masoretic Hebrew (WLC) with the World English Bible. Listen and follow the verse, then grade the
          reading. 90% first-answer clears the chapter.
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
          heVoice={heVoice}
          onToggle={() => (playing ? halt() : startFrom(i, true))}
          onStep={step}
          onRate={(n) => {
            setRate(n);
            rateRef.current = n;
            if (playing) startFrom(iRef.current, false);
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
        {READING_CREDIT.he} {READING_CREDIT.en}
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
  heVoice,
  onToggle,
  onStep,
  onRate,
}: {
  verse: ReadingVerse;
  i: number;
  total: number;
  playing: boolean;
  rate: number;
  heVoice: boolean;
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
      {!speechSupported() && (
        <p className="mt-3 text-sm text-danger">This browser has no speech engine. iPhone: Safari. Android: Chrome.</p>
      )}
      {speechSupported() && !heVoice && (
        <p className="mt-3 text-sm text-muted">No Hebrew voice on this device yet. Install one for true Hebrew audio.</p>
      )}
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
          <option value="0.62">Slow</option>
          <option value="0.8">Warm</option>
          <option value="1.05">Faster</option>
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
