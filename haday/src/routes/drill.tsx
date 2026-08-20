import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { WeekSelect } from "@/components/week-select";
import { POS_LABEL, itemsForWeek, type VocabItem } from "@/lib/vocab";
import { queueForFocus, useStudy } from "@/lib/store";
import { VerseCard } from "@/components/verse-card";
import { FocusToggle } from "@/components/focus-toggle";
import { Panel } from "@/components/panel";

export const Route = createFileRoute("/drill")({ component: DrillPage });

function DrillPage() {
  const week = useStudy((s) => s.week);
  const direction = useStudy((s) => s.direction);
  const setDirection = useStudy((s) => s.setDirection);
  const focus = useStudy((s) => s.focus);
  const rate = useStudy((s) => s.rate);
  const pool = useMemo(() => itemsForWeek(week), [week]);
  const [session, setSession] = useState<VocabItem[]>([]);
  const [total, setTotal] = useState(0);
  const [cleared, setCleared] = useState(0);
  const [flipped, setFlipped] = useState(false);

  function deal() {
    const next = queueForFocus(pool, useStudy.getState().cards, focus, 18);
    setSession(next);
    setTotal(next.length);
    setCleared(0);
    setFlipped(false);
  }

  useEffect(() => {
    deal();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- rebuild only when the study set changes
  }, [week, focus, pool]);

  const current = session[0];

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
    setSession((s) => {
      const rest = s.slice(1);
      if (r !== "again") return rest;
      if (rest.length === 0) return [current];
      const later = Math.min(rest.length, 2);
      return [...rest.slice(0, later), current, ...rest.slice(later)];
    });
    if (r !== "again") setCleared((n) => n + 1);
  }

  if (!current) {
    return (
      <>
        <WeekSelect />
        <FocusToggle />
        <div className="mt-8 rounded-[var(--radius-xl)] bg-card p-8 text-center shadow-[var(--shadow-border)]">
          <p className="he-word text-4xl text-primary">שָׁלוֹם</p>
          <h1 className="mt-3 font-display text-3xl font-semibold">Caught up</h1>
          <p className="mt-2 text-muted">
            {total === 0
              ? "No cards due in this set. Quiz it, or switch weeks."
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
  const step = Math.min(cleared + 1, Math.max(total, 1));

  return (
    <>
      <Panel className="mb-4">
        <WeekSelect />
        <FocusToggle />
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="tabular-nums font-medium text-ink">
            {step} / {total}
            {session.length > 1 ? ` · ${session.length} left` : ""}
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
