import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { VerseCard } from "@/components/verse-card";
import { WeekSelect } from "@/components/week-select";
import { FocusToggle } from "@/components/focus-toggle";
import { glossMatches, itemsForWeek, quizChoices, type VocabItem } from "@/lib/vocab";
import { useStudy, weightedQuizDeck, weakQueue } from "@/lib/store";
import { cn } from "@/lib/cn";
import { Panel } from "@/components/panel";

export const Route = createFileRoute("/quiz")({ component: QuizPage });

type Mode = "choice" | "type";

function QuizPage() {
  const week = useStudy((s) => s.week);
  const focus = useStudy((s) => s.focus);
  const rate = useStudy((s) => s.rate);
  const pool = useMemo(() => itemsForWeek(week), [week]);
  const [mode, setMode] = useState<Mode>("choice");
  const [seed, setSeed] = useState(0);
  const [deck, setDeck] = useState<VocabItem[]>([]);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [typed, setTyped] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState({ right: 0, wrong: 0 });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const snapshot = useStudy.getState().cards;
    const source = focus === "weak" ? weakQueue(pool, snapshot, 12) : pool;
    const base = source.length ? source : pool;
    setDeck(weightedQuizDeck(base, snapshot, 12));
    setI(0);
    setPicked(null);
    setTyped("");
    setRevealed(false);
    setReady(true);
  }, [pool, seed, focus]);

  const item = deck[i];
  const choices = useMemo(() => (item ? quizChoices(item, pool) : []), [item, pool]);
  const showVerse = (mode === "choice" && picked !== null) || (mode === "type" && revealed);

  function resetRound() {
    setI(0);
    setPicked(null);
    setTyped("");
    setRevealed(false);
    setScore({ right: 0, wrong: 0 });
    setSeed((s) => s + 1);
  }

  function mark(ok: boolean) {
    if (!item) return;
    rate(item.id, ok ? "good" : "again");
    setScore((s) => ({ right: s.right + (ok ? 1 : 0), wrong: s.wrong + (ok ? 0 : 1) }));
  }

  function next() {
    setPicked(null);
    setTyped("");
    setRevealed(false);
    setI((n) => n + 1);
  }

  if (!pool.length) {
    return (
      <>
        <WeekSelect />
        <p className="mt-6 text-muted">No words in this set.</p>
      </>
    );
  }

  if (!ready || (deck.length > 0 && !item && i === 0)) {
    return (
      <>
        <WeekSelect />
        <p className="mt-8 text-sm text-muted">Shuffling a round…</p>
      </>
    );
  }

  if (!item) {
    const total = score.right + score.wrong;
    return (
      <>
        <WeekSelect />
        <div className="mt-8 rounded-[var(--radius-xl)] bg-card p-8 text-center shadow-[var(--shadow-border)]">
          <h1 className="font-display text-3xl font-semibold">Round complete</h1>
          <p className="mt-2 font-display text-4xl tabular-nums">
            {score.right}
            <span className="text-xl text-muted"> / {total}</span>
          </p>
          <Button className="mt-6" onClick={resetRound}>
            New round
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <Panel className="mb-4">
        <WeekSelect />
        <FocusToggle />
        <div className="mt-4 flex gap-2">
          <Button size="sm" variant={mode === "choice" ? "primary" : "outline"} onClick={() => { setMode("choice"); resetRound(); }}>
            Multiple choice
          </Button>
          <Button size="sm" variant={mode === "type" ? "primary" : "outline"} onClick={() => { setMode("type"); resetRound(); }}>
            Type the gloss
          </Button>
        </div>
        <p className="mt-4 text-sm font-medium tabular-nums text-ink">
          {i + 1} / {deck.length} · {score.right} correct
        </p>
      </Panel>

      <div className="mt-3 rounded-[var(--radius-xl)] bg-card px-5 py-8 text-center shadow-[var(--shadow-border)]">
        <p className="he-word text-5xl">{item.hebrew}</p>
        <p className="mt-2 text-sm text-muted">{item.translit}</p>
      </div>

      {mode === "choice" ? (
        <ul className="mt-4 grid gap-2">
          {choices.map((c) => {
            const selected = picked === c;
            const correct = c === item.gloss;
            const show = picked !== null;
            return (
              <li key={c}>
                <button
                  type="button"
                  disabled={picked !== null}
                  onClick={() => {
                    setPicked(c);
                    mark(c === item.gloss);
                  }}
                  className={cn(
                    "w-full min-h-12 rounded-[var(--radius-md)] px-4 py-3 text-left text-sm shadow-[var(--shadow-border)]",
                    !show && "bg-card hover:bg-surface",
                    show && correct && "bg-good text-parchment",
                    show && selected && !correct && "bg-danger text-parchment",
                    show && !selected && !correct && "bg-card text-muted",
                  )}
                >
                  {c}
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <form
          className="mt-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (revealed) {
              next();
              return;
            }
            const ok = glossMatches(item, typed);
            setRevealed(true);
            mark(ok);
          }}
        >
          <input
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            disabled={revealed}
            placeholder="English gloss"
            className="h-12 w-full rounded-[var(--radius-md)] bg-card px-4 shadow-[var(--shadow-border)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            autoCapitalize="off"
            autoCorrect="off"
          />
          {revealed && (
            <p className={`mt-3 text-sm ${glossMatches(item, typed) ? "text-good" : "text-danger"}`}>
              {glossMatches(item, typed) ? "Correct." : `Answer: ${item.gloss}`}
            </p>
          )}
          <Button className="mt-3 w-full" type="submit">
            {revealed ? "Next" : "Check"}
          </Button>
        </form>
      )}

      {showVerse && <VerseCard item={item} />}

      {mode === "choice" && picked && (
        <Button className="mt-4 w-full" onClick={next}>
          Next
        </Button>
      )}
    </>
  );
}
