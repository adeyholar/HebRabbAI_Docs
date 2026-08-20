import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { WeekSelect } from "@/components/week-select";
import { POS_LABEL, itemsForWeek, type VocabItem } from "@/lib/vocab";
import { queueForFocus, useStudy } from "@/lib/store";
import { VerseCard } from "@/components/verse-card";
import { FocusToggle } from "@/components/focus-toggle";
import { Panel } from "@/components/panel";

export const Route = createFileRoute("/drill")({ component: DrillPage });

function buildRound(pool: VocabItem[], focus: "due" | "weak", limit = 18): VocabItem[] {
  const cards = useStudy.getState().cards;
  const first = queueForFocus(pool, cards, focus, limit);
  const seen = new Set(first.map((item) => item.id));
  const rest = pool.filter((item) => !seen.has(item.id));
  return [...first, ...rest].slice(0, Math.min(limit, pool.length));
}

function nextOpen(from: number, round: VocabItem[], done: Set<string>): number {
  if (!round.length || done.size >= round.length) return -1;
  for (let step = 1; step <= round.length; step++) {
    const j = (from + step) % round.length;
    if (!done.has(round[j].id)) return j;
  }
  return -1;
}

function DrillPage() {
  const week = useStudy((s) => s.week);
  const direction = useStudy((s) => s.direction);
  const setDirection = useStudy((s) => s.setDirection);
  const focus = useStudy((s) => s.focus);
  const rate = useStudy((s) => s.rate);
  const pool = useMemo(() => itemsForWeek(week), [week]);

  const [round, setRound] = useState<VocabItem[]>([]);
  const [pos, setPos] = useState(0);
  const [done, setDone] = useState<Set<string>>(() => new Set());
  const [flipped, setFlipped] = useState(false);
  const [ready, setReady] = useState(false);
  const roundRef = useRef(round);
  roundRef.current = round;

  function deal() {
    const next = buildRound(pool, focus, 18);
    setRound(next);
    setPos(0);
    setDone(new Set());
    setFlipped(false);
    setReady(true);
  }

  useEffect(() => {
    deal();
    // Rebuild only when the set itself changes — not after each rating.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [week, focus, pool]);

  const current = pos >= 0 ? round[pos] : undefined;
  const cleared = done.size;
  const finished = round.length > 0 && (pos < 0 || cleared >= round.length || !current);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return;
      if (e.code === "Space") {
        e.preventDefault();
        setFlipped(true);
      }
      if (!flipped || !current) return;
      if (e.key === "1") grade("again");
      if (e.key === "2") grade("good");
      if (e.key === "3") grade("easy");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [flipped, current?.id]);

  function grade(r: "again" | "good" | "easy") {
    if (!current) return;
    const list = roundRef.current;
    const here = pos;
    rate(current.id, r);
    setFlipped(false);
    if (r === "again") {
      const nxt = nextOpen(here, list, done);
      setPos(nxt === -1 ? here : nxt);
      return;
    }
    const nextDone = new Set(done);
    nextDone.add(current.id);
    setDone(nextDone);
    setPos(nextOpen(here, list, nextDone));
  }

  if (!pool.length) {
    return (
      <>
        <WeekSelect />
        <p className="mt-6 text-muted">No words in this set.</p>
      </>
    );
  }

  if (!ready) {
    return (
      <>
        <WeekSelect />
        <p className="mt-8 text-sm text-muted">Dealing a round…</p>
      </>
    );
  }

  if (finished || !current) {
    return (
      <>
        <Panel className="mb-4">
          <WeekSelect />
          <FocusToggle />
        </Panel>
        <div className="mt-4 rounded-[var(--radius-xl)] bg-card p-8 text-center shadow-[var(--shadow-border)]">
          <p className="he-word text-4xl text-primary">שָׁלוֹם</p>
          <h1 className="mt-3 font-display text-3xl font-semibold">Caught up</h1>
          <p className="mt-2 text-muted">
            {round.length === 0
              ? "No cards in this set. Quiz it, or switch weeks."
              : "You finished this round. Start another, or quiz the weak list."}
          </p>
          <Button className="mt-6" onClick={deal}>
            New round
          </Button>
        </div>
      </>
    );
  }

  const frontHe = direction === "he-en";
  const total = round.length;

  return (
    <>
      <Panel className="mb-4">
        <WeekSelect />
        <FocusToggle />
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="tabular-nums font-medium text-ink">
            {Math.min(cleared + 1, total)} / {total}
          </span>
          <button
            type="button"
            className="min-h-11 text-sm font-semibold text-primary"
            onClick={() => setDirection(frontHe ? "en-he" : "he-en")}
          >
            {frontHe ? "Hebrew → English" : "English → Hebrew"}
          </button>
        </div>
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-surface">
          <div
            className="h-full bg-primary transition-[width] duration-[var(--motion-fast)]"
            style={{ width: `${total ? (cleared / total) * 100 : 0}%` }}
          />
        </div>
      </Panel>

      <button
        type="button"
        onClick={() => setFlipped(true)}
        className="block w-full rounded-[var(--radius-xl)] bg-card px-5 py-12 text-center shadow-[var(--shadow-border)] transition-transform duration-[var(--motion-fast)] ease-[var(--ease-out)] active:scale-[0.99]"
      >
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted">
          {POS_LABEL[current.pos]} · Ch. {current.chapter}
        </p>
        {!flipped ? (
          frontHe ? (
            <p className="he-word mt-4 text-5xl sm:text-6xl">{current.hebrew}</p>
          ) : (
            <p className="mt-4 font-display text-3xl font-semibold">{current.gloss}</p>
          )
        ) : (
          <div className="mt-4">
            <p className="he-word text-5xl sm:text-6xl">{current.hebrew}</p>
            <p className="mt-3 font-display text-2xl font-semibold">{current.gloss}</p>
            <p className="mt-1 text-sm text-muted">{current.translit}</p>
          </div>
        )}
        {!flipped && <p className="mt-8 text-sm text-subtle">Tap to reveal · Space</p>}
      </button>

      {flipped && <VerseCard item={current} />}

      {flipped && (
        <div className="mt-4 grid grid-cols-3 gap-2">
          <Button type="button" variant="danger" onClick={() => grade("again")}>
            Again
            <span className="text-xs opacity-70">1</span>
          </Button>
          <Button type="button" variant="outline" onClick={() => grade("good")}>
            Good
            <span className="text-xs opacity-70">2</span>
          </Button>
          <Button type="button" variant="primary" onClick={() => grade("easy")}>
            Easy
            <span className="text-xs opacity-70">3</span>
          </Button>
        </div>
      )}
      <p className="mt-3 text-center text-xs text-subtle">Keys 1 / 2 / 3 after flip</p>
    </>
  );
}
