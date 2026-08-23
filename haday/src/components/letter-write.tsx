import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { GlyphInk } from "@/components/glyph-ink";
import { VOWELS, WRITE_LETTERS, type HebrewLetter, type HebrewVowel } from "@/lib/alphabet";
import { alefByKeys, alefKey, alefLetters, alefVowels, pickAlefRound } from "@/lib/alef";
import { useStudy } from "@/lib/store";
import { cn } from "@/lib/cn";

type Kind = "letter" | "vowel";
type Mode = "trace" | "recall";

export function LetterWrite() {
  const queue = useStudy((s) => s.alefQueue);
  const cards = useStudy((s) => s.cards);
  const focus = useStudy((s) => s.focus);
  const rate = useStudy((s) => s.rate);
  const setAlefQueue = useStudy((s) => s.setAlefQueue);
  const queued = alefByKeys(queue);
  const [kind, setKind] = useState<Kind>(() =>
    queued.some((x) => x.kind === "vowel") && !queued.some((x) => x.kind === "letter") ? "vowel" : "letter",
  );
  const [mode, setMode] = useState<Mode>(queued.length ? "recall" : "trace");
  const [letterDeck, setLetterDeck] = useState(() => WRITE_LETTERS);
  const [vowelDeck, setVowelDeck] = useState(() => VOWELS);
  const [i, setI] = useState(0);
  const [right, setRight] = useState(0);
  const [padKey, setPadKey] = useState(0);

  useEffect(() => {
    const q = alefByKeys(queue);
    const qLetters = q
      .filter((x) => x.kind === "letter")
      .map((x) => WRITE_LETTERS.find((l) => l.id === x.id))
      .filter((x): x is HebrewLetter => Boolean(x));
    const qVowels = q
      .filter((x) => x.kind === "vowel")
      .map((x) => VOWELS.find((v) => v.id === x.id))
      .filter((x): x is HebrewVowel => Boolean(x));
    setLetterDeck(
      qLetters.length
        ? qLetters
        : pickAlefRound(alefLetters(), cards, focus, 12)
            .map((x) => WRITE_LETTERS.find((l) => l.id === x.id))
            .filter((x): x is HebrewLetter => Boolean(x)),
    );
    setVowelDeck(
      qVowels.length
        ? qVowels
        : pickAlefRound(alefVowels(), cards, focus, 10)
            .map((x) => VOWELS.find((v) => v.id === x.id))
            .filter((x): x is HebrewVowel => Boolean(x)),
    );
    if (qVowels.length && !qLetters.length) setKind("vowel");
    else if (qLetters.length && !qVowels.length) setKind("letter");
    if (q.length) setMode("recall");
    setI(0);
    setRight(0);
    setPadKey((n) => n + 1);
  }, [queue]);

  const deckLen = kind === "letter" ? letterDeck.length : vowelDeck.length;
  const letter = kind === "letter" ? letterDeck[i] : undefined;
  const vowel = kind === "vowel" ? vowelDeck[i] : undefined;
  const done = i >= deckLen;

  function resetPad() {
    setPadKey((n) => n + 1);
  }

  function switchKind(next: Kind) {
    setKind(next);
    setI(0);
    setRight(0);
    resetPad();
  }

  function newRound() {
    setAlefQueue([]);
    setLetterDeck(
      pickAlefRound(alefLetters(), useStudy.getState().cards, focus, 12)
        .map((x) => WRITE_LETTERS.find((l) => l.id === x.id))
        .filter((x): x is HebrewLetter => Boolean(x)),
    );
    setVowelDeck(
      pickAlefRound(alefVowels(), useStudy.getState().cards, focus, 10)
        .map((x) => VOWELS.find((v) => v.id === x.id))
        .filter((x): x is HebrewVowel => Boolean(x)),
    );
    setI(0);
    setRight(0);
    resetPad();
  }

  function pickLetter(c: HebrewLetter) {
    const idx = letterDeck.findIndex((d) => d.id === c.id);
    if (idx >= 0) setI(idx);
    else {
      setLetterDeck((deck) => {
        if (!deck.length) return [c];
        const next = [...deck];
        next[Math.min(i, next.length - 1)] = c;
        return next;
      });
    }
    resetPad();
  }

  function pickVowel(v: HebrewVowel) {
    const idx = vowelDeck.findIndex((d) => d.id === v.id);
    if (idx >= 0) setI(idx);
    else {
      setVowelDeck((deck) => {
        if (!deck.length) return [v];
        const next = [...deck];
        next[Math.min(i, next.length - 1)] = v;
        return next;
      });
    }
    resetPad();
  }

  function next(ok: boolean) {
    const key = letter ? alefKey("letter", letter.id) : vowel ? alefKey("vowel", vowel.id) : null;
    if (key) rate(key, ok ? "good" : "again");
    if (ok) setRight((n) => n + 1);
    if (i + 1 >= deckLen) {
      setI(deckLen);
      return;
    }
    setI((n) => n + 1);
    resetPad();
  }

  if (done) {
    return (
      <div className="mt-5 rounded-[var(--radius-xl)] bg-card p-8 text-center shadow-[var(--shadow-border)]">
        <p className="font-display text-3xl font-bold text-ink">
          {right} / {deckLen}
        </p>
        <p className="mt-2 text-sm text-muted">{kind === "letter" ? "Letter" : "Vowel"} round complete.</p>
        <Button className="mt-4" onClick={newRound}>
          New round
        </Button>
      </div>
    );
  }

  const glyph = letter?.letter ?? vowel?.mark ?? "";
  const name = letter?.name ?? vowel?.name ?? "";
  const sound = letter?.sound ?? vowel?.sound ?? "";

  return (
    <div className="mt-5">
      <div className="flex gap-2">
        <KindBtn on={kind === "letter"} onClick={() => switchKind("letter")} label="Letters" />
        <KindBtn on={kind === "vowel"} onClick={() => switchKind("vowel")} label="Vowels" />
      </div>
      {queue.length > 0 && (
        <p className="mt-2 text-sm font-medium text-primary">Serving closed-book misses first.</p>
      )}
      <div className="mt-2 flex gap-2">
        <KindBtn
          on={mode === "trace"}
          onClick={() => {
            setMode("trace");
            resetPad();
          }}
          label="Trace"
        />
        <KindBtn
          on={mode === "recall"}
          onClick={() => {
            setMode("recall");
            resetPad();
          }}
          label="From name"
        />
      </div>

      <p className="mt-3 text-sm tabular-nums text-muted">
        {i + 1} / {deckLen} · {right} correct
      </p>

      <div className="mt-3 rounded-[var(--radius-xl)] bg-card px-5 py-6 text-center shadow-[var(--shadow-border)]">
        {mode === "recall" ? (
          <>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              Write this {kind === "vowel" ? "vowel on ב" : "letter"}
            </p>
            <p className="mt-1 font-display text-3xl font-bold text-ink">{name}</p>
            <p className="mt-1 text-sm text-muted">{sound}</p>
          </>
        ) : (
          <>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Trace {name}</p>
            <p className="he-word mt-2 text-6xl">{glyph}</p>
            <p className="mt-1 text-sm text-muted">{sound}</p>
          </>
        )}
      </div>

      <GlyphInk
        key={`${kind}-${i}-${padKey}`}
        expected={glyph}
        mode={kind}
        trace={mode === "trace"}
        ghost={glyph}
        onPass={(ok) => next(ok)}
      />

      {kind === "letter" ? (
        <LetterGrid current={letter} onPick={pickLetter} />
      ) : (
        <VowelGrid current={vowel} onPick={pickVowel} />
      )}
    </div>
  );
}

function KindBtn({ on, onClick, label }: { on: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "min-h-11 flex-1 rounded-[var(--radius-md)] px-3 text-sm font-semibold",
        on ? "bg-ink text-parchment" : "bg-card text-muted shadow-[var(--shadow-border)]",
      )}
    >
      {label}
    </button>
  );
}

function LetterGrid({
  current,
  onPick,
}: {
  current?: HebrewLetter;
  onPick: (c: HebrewLetter) => void;
}) {
  return (
    <>
      <ul dir="rtl" className="mt-4 grid grid-cols-6 gap-2 sm:grid-cols-8">
        {WRITE_LETTERS.map((c) => (
          <li key={c.id}>
            <button
              type="button"
              onClick={() => onPick(c)}
              className={cn(
                "flex size-12 w-full items-center justify-center rounded-[var(--radius-md)] he-word text-2xl",
                current?.id === c.id ? "bg-ink text-parchment" : "bg-card shadow-[var(--shadow-border)]",
              )}
              title={c.name}
            >
              {c.letter}
            </button>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-center text-xs text-muted">Tap any letter to practice it. Finals are in the last row.</p>
    </>
  );
}

function VowelGrid({
  current,
  onPick,
}: {
  current?: HebrewVowel;
  onPick: (v: HebrewVowel) => void;
}) {
  return (
    <ul className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
      {VOWELS.map((v) => (
        <li key={v.id}>
          <button
            type="button"
            onClick={() => onPick(v)}
            className={cn(
              "flex min-h-14 w-full flex-col items-center justify-center rounded-[var(--radius-md)] px-1",
              current?.id === v.id ? "bg-ink text-parchment" : "bg-card text-ink shadow-[var(--shadow-border)]",
            )}
            title={v.name}
          >
            <span className="he-word text-2xl">{v.mark}</span>
            <span className={cn("text-[10px] font-medium", current?.id === v.id ? "text-parchment/80" : "text-muted")}>
              {v.name}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
