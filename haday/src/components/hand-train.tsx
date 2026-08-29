import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { InkPad, type InkPadHandle } from "@/components/ink-pad";
import { Panel } from "@/components/panel";
import { WRITE_LETTERS, type HebrewLetter } from "@/lib/alphabet";
import {
  HAND_GOAL,
  clearLetterHand,
  handStats,
  sampleCount,
  saveHandSample,
  subscribeHand,
} from "@/lib/hand-style";
import { writingHint } from "@/lib/letter-models";
import { cn } from "@/lib/cn";

const TRAIN_LETTERS = WRITE_LETTERS.filter((l) => l.id !== "sin");

export function HandTrain() {
  const pad = useRef<InkPadHandle>(null);
  const [active, setActive] = useState<HebrewLetter>(TRAIN_LETTERS[0]);
  const [empty, setEmpty] = useState(true);
  const [n, setN] = useState(() => sampleCount(active.letter));
  const [note, setNote] = useState<string | null>(null);
  const [okNote, setOkNote] = useState<string | null>(null);
  const [stats, setStats] = useState(handStats);
  const [padKey, setPadKey] = useState(0);

  useEffect(() => {
    return subscribeHand(() => setStats(handStats()));
  }, []);

  useEffect(() => {
    setN(sampleCount(active.letter));
    setNote(null);
    setOkNote(null);
    setEmpty(true);
    setPadKey((k) => k + 1);
  }, [active]);

  function resetPad() {
    pad.current?.clear();
    setEmpty(true);
    setPadKey((k) => k + 1);
  }

  function save() {
    pad.current?.commit();
    const strokes = pad.current?.getStrokes() ?? [];
    const height = pad.current?.getHeight() ?? 0;
    const next = saveHandSample(active.letter, strokes, { height, replace: true });
    if (!next.ok) {
      setNote(next.note || "That doesn’t match this letter.");
      setOkNote(null);
      return;
    }
    setN(next.n);
    setNote(null);
    setOkNote(next.n >= HAND_GOAL ? "This letter will now grade against your hand." : `${next.n} of ${HAND_GOAL} saved.`);
    resetPad();
    if (next.n >= HAND_GOAL) {
      const i = TRAIN_LETTERS.findIndex((l) => l.id === active.id);
      const rest = [...TRAIN_LETTERS.slice(i + 1), ...TRAIN_LETTERS.slice(0, i)];
      const nextLetter = rest.find((l) => sampleCount(l.letter) < HAND_GOAL);
      if (nextLetter) setTimeout(() => setActive(nextLetter), 650);
    }
  }

  function clearThis() {
    clearLetterHand(active.letter);
    setN(0);
    setNote(null);
    setOkNote("Samples cleared for this letter.");
    resetPad();
  }

  return (
    <div className="mt-5 space-y-4">
      <Panel>
        <h2 className="font-display text-2xl font-bold text-ink">Train my hand</h2>
        <p className="mt-2 text-sm text-muted">
          Write each letter {HAND_GOAL} times, tracing the faint chart. HaDay keeps those samples and grades your later
          writing against <em>your</em> hand — not only the printed block form. Latin look-alikes (a T for kaf, a P for
          qof) are still rejected. You do not have to finish the whole alef-bet first; train a letter when you want it
          to stick.
        </p>
        <p className="mt-2 text-sm text-ink">
          {stats.full} letter{stats.full === 1 ? "" : "s"} ready · {stats.samples} sample
          {stats.samples === 1 ? "" : "s"} stored
        </p>
      </Panel>

      <ul dir="rtl" className="grid grid-cols-6 gap-2 sm:grid-cols-8">
        {TRAIN_LETTERS.map((c) => {
          const count = sampleCount(c.letter);
          const on = c.id === active.id;
          return (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => setActive(c)}
                className={cn(
                  "flex w-full flex-col items-center rounded-[var(--radius-md)] py-1.5",
                  on ? "bg-ink text-parchment" : "bg-card text-ink shadow-[var(--shadow-border)]",
                )}
              >
                <span className="he-word text-2xl leading-none">{c.letter}</span>
                <span className={cn("mt-1 flex gap-0.5", on ? "text-parchment" : "text-muted")}>
                  {Array.from({ length: HAND_GOAL }, (_, i) => (
                    <span
                      key={i}
                      className={cn(
                        "size-1.5 rounded-full",
                        i < count ? (on ? "bg-parchment" : "bg-primary") : on ? "bg-parchment/30" : "bg-border",
                      )}
                    />
                  ))}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="rounded-[var(--radius-xl)] bg-card p-4 shadow-[var(--shadow-border)]">
        <p className="text-center font-display text-xl font-bold text-ink">{active.name}</p>
        <p className="mt-1 text-center he-word text-5xl leading-none">{active.letter}</p>
        <p className="mt-2 text-center text-xs text-muted">{writingHint(active.letter)}</p>
        <p className="mt-1 text-center text-sm font-medium text-ink">
          {n} / {HAND_GOAL} saved
        </p>
        <div className="relative mt-3 overflow-hidden rounded-[var(--radius-xl)] bg-card shadow-[var(--shadow-border)]">
          <InkPad
            key={padKey}
            ref={pad}
            guides
            model={active.letter}
            showModel
            onChange={setEmpty}
            className="relative z-10 h-56 shadow-none"
          />
        </div>
        <p className="mt-1 text-center text-xs text-muted">Trace the faint strokes. Body between the two lines.</p>
        {note && <p className="mt-2 text-center text-sm text-danger">{note}</p>}
        {okNote && <p className="mt-2 text-center text-sm text-good">{okNote}</p>}
        <div className="mt-3 flex gap-2">
          <Button type="button" variant="outline" className="flex-1" onClick={() => pad.current?.undo()}>
            Undo
          </Button>
          <Button type="button" variant="outline" className="flex-1" onClick={resetPad}>
            Clear
          </Button>
          <Button type="button" className="flex-1" onClick={save} disabled={empty}>
            Save this writing
          </Button>
        </div>
        {n > 0 && (
          <Button type="button" variant="outline" className="mt-2 w-full" onClick={clearThis}>
            Clear my samples for {active.name}
          </Button>
        )}
      </div>
    </div>
  );
}
