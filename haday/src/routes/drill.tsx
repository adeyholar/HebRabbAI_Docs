import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { WeekSelect } from "@/components/week-select";
import { POS_LABEL, itemsForWeek, type VocabItem } from "@/lib/vocab";
import { queueForFocus, useStudy } from "@/lib/store";
import { VerseCard } from "@/components/verse-card";
import { FocusToggle } from "@/components/focus-toggle";

export const Route = createFileRoute("/drill")({ component: DrillPage });

function DrillPage() {
  const week = useStudy((s) => s.week);
  const cards = useStudy((s) => s.cards);
  const direction = useStudy((s) => s.direction);
  const setDirection = useStudy((s) => s.setDirection);
  const focus = useStudy((s) => s.focus);
  const rate = useStudy((s) => s.rate);
  const pool = useMemo(() => itemsForWeek(week), [week]);
  const queue = useMemo(() => queueForFocus(pool, cards, focus, 18), [pool, cards, focus]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState<VocabItem[]>([]);

  const remaining = queue.filter((q) => !done.some((d) => d.id === q.id));
  const current = remaining[index] ?? remaining[0];

  useEffect(() => {
    setIndex(0);
    setFlipped(false);
    setDone([]);
  }, [week, focus]);

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
  });

  function grade(r: "again" | "good" | "easy") {
    if (!current) return;
    rate(current.id, r);
    setFlipped(false);
    setDone((d) => [...d, current]);
    setIndex(0);
  }

  if (!current) {
    return (
      <>
        <WeekSelect />
        <div className="mt-8 rounded-[var(--radius-xl)] bg-card p-8 text-center shadow-[var(--shadow-border)]">
          <p className="he-word text-4xl text-primary">שָׁלוֹם</p>
          <h1 className="mt-3 font-display text-3xl font-semibold">Caught up</h1>
          <p className="mt-2 text-muted">No cards due in this set. Quiz it, or switch weeks.</p>
        </div>
      </>
    );
  }

  const frontHe = direction === "he-en";
  const total = Math.min(18, queue.length);
  const progressed = done.length;

  return (
    <>
      <div className="mb-4 flex items-end justify-between gap-3">
        <div className="flex-1">
          <WeekSelect />
          <FocusToggle />
        </div>
      </div>

      <div className="mb-3 flex items-center justify-between text-sm text-muted">
        <span className="tabular-nums">
          {progressed + 1} / {total}
        </span>
        <button
          type="button"
          className="min-h-11 text-sm font-medium text-primary"
          onClick={() => setDirection(frontHe ? "en-he" : "he-en")}
        >
          {frontHe ? "Hebrew → English" : "English → Hebrew"}
        </button>
      </div>
      <div className="mb-4 h-1 overflow-hidden rounded-full bg-surface">
        <div
          className="h-full bg-primary transition-[width] duration-[var(--motion-fast)]"
          style={{ width: `${(progressed / total) * 100}%` }}
        />
      </div>

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
          <Button variant="danger" onClick={() => grade("again")}>
            Again
            <span className="text-xs opacity-70">1</span>
          </Button>
          <Button variant="outline" onClick={() => grade("good")}>
            Good
            <span className="text-xs opacity-70">2</span>
          </Button>
          <Button variant="primary" onClick={() => grade("easy")}>
            Easy
            <span className="text-xs opacity-70">3</span>
          </Button>
        </div>
      )}
      <p className="mt-3 text-center text-xs text-subtle">Keys 1 / 2 / 3 after flip</p>
    </>
  );
}
