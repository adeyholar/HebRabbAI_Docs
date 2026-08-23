import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { InkPad, type InkPadHandle } from "@/components/ink-pad";
import { GradeBanner } from "@/components/grade-banner";
import { WRITE_LETTERS, type HebrewLetter } from "@/lib/alphabet";
import { matchLetter, type HandMatch } from "@/lib/hebrew";
import { readHandwriting } from "@/lib/read-handwriting";
import { playGrade } from "@/lib/sfx";
import { takeWriteCheck, writeChecksLeft, WRITE_DAILY_LIMIT } from "@/lib/write-cap";
import { shuffle } from "@/lib/vocab";
import { cn } from "@/lib/cn";

type Mode = "trace" | "recall";

type Result = { match: HandMatch; read: string; note?: string };

export function LetterWrite() {
  const pad = useRef<InkPadHandle>(null);
  const [mode, setMode] = useState<Mode>("trace");
  const [deck, setDeck] = useState<HebrewLetter[]>(() => shuffle(WRITE_LETTERS));
  const [i, setI] = useState(0);
  const [empty, setEmpty] = useState(true);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [tries, setTries] = useState(0);
  const [right, setRight] = useState(0);
  const [left, setLeft] = useState(WRITE_DAILY_LIMIT);

  const letter = deck[i];

  useEffect(() => {
    setLeft(writeChecksLeft());
  }, []);

  function resetPad() {
    pad.current?.clear();
    setEmpty(true);
    setResult(null);
    setTries(0);
  }

  function pick(index: number) {
    setI(index);
    resetPad();
  }

  function newRound() {
    setDeck(shuffle(WRITE_LETTERS));
    setI(0);
    setRight(0);
    resetPad();
  }

  function next() {
    if (i + 1 >= deck.length) {
      setI(deck.length);
      return;
    }
    setI((n) => n + 1);
    resetPad();
  }

  async function check() {
    if (!letter || empty || busy || result) return;
    const image = pad.current?.toImage();
    if (!image) return;
    if (!takeWriteCheck()) {
      setResult({ match: "wrong", read: "", note: "Daily check limit reached. Come back tomorrow." });
      setLeft(0);
      playGrade(false);
      return;
    }
    setLeft(writeChecksLeft());
    setBusy(true);
    try {
      const res = await readHandwriting({
        data: { image, expected: letter.letter, mode: "letter" },
      });
      if (!res.ok) {
        setResult({ match: "wrong", read: "", note: res.error });
        playGrade(false);
        return;
      }
      const compared = matchLetter(letter.letter, res.hebrew);
      let match = compared.match;
      if (match !== "exact" && res.verdict === "exact" && compared.readN) match = "exact";
      else if (match === "wrong" && res.verdict === "close") match = "close";
      const nextTries = tries + 1;
      setTries(nextTries);
      setResult({ match, read: res.hebrew || compared.readN });
      playGrade(match === "exact" || match === "close");
      if (match === "exact" || match === "close") setRight((n) => n + 1);
    } catch {
      setResult({ match: "wrong", read: "", note: "Could not reach the reader. Try again." });
      playGrade(false);
    } finally {
      setBusy(false);
    }
  }

  const done = i >= deck.length;
  const locked = result ? result.match === "exact" || result.match === "close" || tries >= 2 : false;

  if (done) {
    return (
      <div className="mt-5 rounded-[var(--radius-xl)] bg-card p-8 text-center shadow-[var(--shadow-border)]">
        <p className="font-display text-3xl font-bold text-ink">
          {right} / {deck.length}
        </p>
        <p className="mt-2 text-sm text-muted">Letter round complete.</p>
        <Button className="mt-4" onClick={newRound}>
          New round
        </Button>
      </div>
    );
  }

  if (!letter) return null;

  return (
    <div className="mt-5">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => {
            setMode("trace");
            resetPad();
          }}
          className={cn(
            "min-h-11 flex-1 rounded-[var(--radius-md)] px-3 text-sm font-semibold",
            mode === "trace" ? "bg-ink text-parchment" : "bg-card text-muted shadow-[var(--shadow-border)]",
          )}
        >
          Trace
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("recall");
            resetPad();
          }}
          className={cn(
            "min-h-11 flex-1 rounded-[var(--radius-md)] px-3 text-sm font-semibold",
            mode === "recall" ? "bg-ink text-parchment" : "bg-card text-muted shadow-[var(--shadow-border)]",
          )}
        >
          From name
        </button>
      </div>

      <p className="mt-3 text-sm tabular-nums text-muted">
        {i + 1} / {deck.length} · {right} correct · {left} checks left
      </p>

      <div className="mt-3 rounded-[var(--radius-xl)] bg-card px-5 py-6 text-center shadow-[var(--shadow-border)]">
        {mode === "recall" ? (
          <>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Write this letter</p>
            <p className="mt-1 font-display text-3xl font-bold text-ink">{letter.name}</p>
            <p className="mt-1 text-sm text-muted">{letter.sound}</p>
          </>
        ) : (
          <>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Trace {letter.name}</p>
            <p className="he-word mt-2 text-6xl">{letter.letter}</p>
            <p className="mt-1 text-sm text-muted">{letter.sound}</p>
          </>
        )}
      </div>

      <div className="relative mt-3 overflow-hidden rounded-[var(--radius-xl)] bg-card shadow-[var(--shadow-border)]">
        {mode === "trace" && (
          <p className="pointer-events-none absolute inset-0 z-0 grid place-items-center select-none he-word text-[7.5rem] leading-none text-ink/15">
            {letter.letter}
          </p>
        )}
        <InkPad
          ref={pad}
          disabled={locked || busy}
          onChange={setEmpty}
          className={cn("relative z-10 h-56 shadow-none", mode === "trace" && "bg-transparent")}
        />
      </div>

      <div className="mt-2 flex gap-2">
        <Button type="button" variant="outline" className="flex-1" onClick={() => pad.current?.undo()} disabled={locked || busy}>
          Undo
        </Button>
        <Button type="button" variant="outline" className="flex-1" onClick={resetPad} disabled={busy}>
          Clear
        </Button>
      </div>

      {result && (
        <div className="mt-3">
          <GradeBanner ok={result.match === "exact" || result.match === "close"} />
          <p className="mt-2 text-center text-sm text-muted">
            {result.note
              ? result.note
              : result.match === "exact"
                ? `Read as ${result.read || letter.letter}`
                : result.match === "close"
                  ? `Close — I read ${result.read || "a similar letter"}. Target: ${letter.letter}`
                  : `Not that letter. Target: ${letter.letter}${result.read ? ` · I read ${result.read}` : ""}`}
          </p>
        </div>
      )}

      {!result && (
        <Button className="mt-3 w-full" onClick={() => void check()} disabled={empty || busy}>
          {busy ? "Checking…" : "Check writing"}
        </Button>
      )}

      {result && !locked && (
        <Button className="mt-3 w-full" variant="outline" onClick={resetPad}>
          Try again
        </Button>
      )}

      {locked && (
        <Button className="mt-3 w-full" onClick={next}>
          Next letter
        </Button>
      )}

      <ul dir="rtl" className="mt-4 grid grid-cols-6 gap-2 sm:grid-cols-8">
        {WRITE_LETTERS.map((c) => {
          const idx = deck.findIndex((d) => d.id === c.id);
          const on = letter.id === c.id;
          return (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => pick(idx < 0 ? 0 : idx)}
                className={cn(
                  "flex size-12 w-full items-center justify-center rounded-[var(--radius-md)] he-word text-2xl",
                  on ? "bg-ink text-parchment" : "bg-card shadow-[var(--shadow-border)]",
                )}
                title={c.name}
              >
                {c.letter}
              </button>
            </li>
          );
        })}
      </ul>
      <p className="mt-2 text-center text-xs text-muted">Tap a letter to jump. Finals are in the last row.</p>
    </div>
  );
}
