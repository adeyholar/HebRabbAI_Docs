import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { InkPad, type InkPadHandle } from "@/components/ink-pad";
import { VerseCard } from "@/components/verse-card";
import { WeekSelect } from "@/components/week-select";
import { FocusToggle } from "@/components/focus-toggle";
import { matchHandwriting, type HandMatch } from "@/lib/hebrew";
import { readHandwriting } from "@/lib/read-handwriting";
import { queueForFocus, useStudy } from "@/lib/store";
import { itemsForWeek, POS_LABEL, type VocabItem } from "@/lib/vocab";
import { takeWriteCheck, writeChecksLeft, WRITE_DAILY_LIMIT } from "@/lib/write-cap";
import { cn } from "@/lib/cn";

export const Route = createFileRoute("/write")({ component: WritePage });

type Result = {
  match: HandMatch;
  read: string;
  note?: string;
};

function WritePage() {
  const week = useStudy((s) => s.week);
  const focus = useStudy((s) => s.focus);
  const rate = useStudy((s) => s.rate);
  const pool = useMemo(() => itemsForWeek(week), [week]);
  const [round, setRound] = useState<VocabItem[]>([]);
  const pad = useRef<InkPadHandle>(null);
  const [i, setI] = useState(0);
  const [empty, setEmpty] = useState(true);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [left, setLeft] = useState(WRITE_DAILY_LIMIT);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setRound(queueForFocus(pool, useStudy.getState().cards, focus, 12));
    setI(0);
    setResult(null);
    pad.current?.clear();
    setEmpty(true);
    setReady(true);
  }, [week, focus, pool]);

  useEffect(() => {
    setLeft(writeChecksLeft());
  }, []);

  const item = round[i];

  function nextCard() {
    setResult(null);
    pad.current?.clear();
    setEmpty(true);
    setI((n) => n + 1);
  }

  async function check() {
    if (!item || empty || busy) return;
    const image = pad.current?.toImage();
    if (!image) return;
    if (!takeWriteCheck()) {
      setResult({ match: "wrong", read: "", note: "Daily check limit reached. Come back tomorrow, or reveal and self-grade." });
      setLeft(0);
      return;
    }
    setLeft(writeChecksLeft());
    setBusy(true);
    try {
      const res = await readHandwriting({ data: { image } });
      if (!res.ok) {
        setResult({ match: "wrong", read: "", note: res.error });
        return;
      }
      const compared = matchHandwriting(item.hebrew, res.hebrew);
      const match = compared.match;
      setResult({ match, read: res.hebrew });
      if (match === "exact") rate(item.id, "easy");
      else if (match === "close") rate(item.id, "good");
      else rate(item.id, "again");
    } catch {
      setResult({ match: "wrong", read: "", note: "Could not reach the reader. Try again." });
    } finally {
      setBusy(false);
    }
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
        <p className="mt-8 text-sm text-muted">Preparing a writing round…</p>
      </>
    );
  }

  if (!item) {
    return (
      <>
        <WeekSelect />
        <div className="mt-8 rounded-[var(--radius-xl)] bg-card p-8 text-center shadow-[var(--shadow-border)]">
          <h1 className="font-display text-3xl font-semibold">Pad complete</h1>
          <p className="mt-2 text-muted">You worked this writing round. Start another, or drill the weak list.</p>
          <Button
            className="mt-6"
            onClick={() => {
              setRound(queueForFocus(pool, useStudy.getState().cards, focus, 12));
              setI(0);
              setResult(null);
              pad.current?.clear();
              setEmpty(true);
            }}
          >
            New round
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <h1 className="font-display text-3xl font-semibold tracking-tight">Write it</h1>
      <p className="mt-1 text-sm text-muted">
        English first. Scribble the Hebrew on the pad — right to left — then check. Vowels are optional.
      </p>
      <div className="mt-4">
        <WeekSelect />
        <FocusToggle />
      </div>
      <p className="mt-3 text-sm tabular-nums text-muted">
        {i + 1} / {round.length} · {left} checks left today
      </p>

      <div className="mt-3 rounded-[var(--radius-xl)] bg-card px-5 py-6 text-center shadow-[var(--shadow-border)]">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">
          {POS_LABEL[item.pos]} · Ch. {item.chapter}
        </p>
        <p className="mt-2 font-display text-3xl font-semibold">{item.gloss}</p>
      </div>

      <div className="relative mt-4">
        <InkPad ref={pad} disabled={busy || result !== null} onChange={setEmpty} />
        {empty && !result && (
          <p className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-subtle">
            Write the Hebrew here
          </p>
        )}
      </div>

      <div className="mt-3 flex gap-2">
        <Button variant="outline" className="flex-1" onClick={() => pad.current?.undo()} disabled={busy || !!result}>
          Undo
        </Button>
        <Button
          variant="ghost"
          className="flex-1"
          onClick={() => {
            pad.current?.clear();
            setEmpty(true);
          }}
          disabled={busy || !!result}
        >
          Clear
        </Button>
        <Button className="flex-[2]" onClick={() => void check()} disabled={busy || empty || !!result}>
          {busy ? "Reading…" : "Check writing"}
        </Button>
      </div>

      {result && (
        <ResultPanel item={item} result={result} onNext={nextCard} />
      )}
    </>
  );
}

function ResultPanel({ item, result, onNext }: { item: VocabItem; result: Result; onNext: () => void }) {
  const tone =
    result.match === "exact" ? "text-good" : result.match === "close" ? "text-primary" : "text-danger";
  const label =
    result.match === "exact" ? "Correct." : result.match === "close" ? "Close — count it." : result.match === "empty" ? "Nothing readable." : "Not yet.";

  return (
    <div className="mt-4">
      <p className={cn("font-display text-2xl font-semibold", tone)}>{label}</p>
      <p className="mt-1 text-sm text-muted">
        Target <span className="he-word text-lg text-fg">{item.hebrew}</span>
        {result.read ? (
          <>
            {" "}
            · read as <span className="he-word text-lg text-fg">{result.read}</span>
          </>
        ) : null}
      </p>
      {result.note && <p className="mt-2 text-sm text-muted">{result.note}</p>}
      <VerseCard item={item} />
      <Button className="mt-4 w-full" onClick={onNext}>
        Next word
      </Button>
    </div>
  );
}
