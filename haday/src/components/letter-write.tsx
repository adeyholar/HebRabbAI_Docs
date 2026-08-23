import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GlyphInk } from "@/components/glyph-ink";
import { VOWELS, WRITE_LETTERS, type HebrewLetter, type HebrewVowel } from "@/lib/alphabet";
import { shuffle } from "@/lib/vocab";
import { cn } from "@/lib/cn";

type Kind = "letter" | "vowel";
type Mode = "trace" | "recall";

export function LetterWrite() {
  const [kind, setKind] = useState<Kind>("letter");
  const [mode, setMode] = useState<Mode>("trace");
  const [letterDeck, setLetterDeck] = useState(() => shuffle(WRITE_LETTERS));
  const [vowelDeck, setVowelDeck] = useState(() => shuffle(VOWELS));
  const [i, setI] = useState(0);
  const [right, setRight] = useState(0);
  const [padKey, setPadKey] = useState(0);

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
    if (kind === "letter") setLetterDeck(shuffle(WRITE_LETTERS));
    else setVowelDeck(shuffle(VOWELS));
    setI(0);
    setRight(0);
    resetPad();
  }

  function next(ok: boolean) {
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
        ghost={mode === "trace" ? glyph : undefined}
        onPass={(ok) => next(ok)}
      />

      {kind === "letter" ? (
        <LetterGrid
          current={letter}
          deck={letterDeck}
          onPick={(idx) => {
            setI(idx);
            resetPad();
          }}
        />
      ) : (
        <VowelGrid
          current={vowel}
          deck={vowelDeck}
          onPick={(idx) => {
            setI(idx);
            resetPad();
          }}
        />
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
  deck,
  onPick,
}: {
  current?: HebrewLetter;
  deck: HebrewLetter[];
  onPick: (i: number) => void;
}) {
  return (
    <>
      <ul dir="rtl" className="mt-4 grid grid-cols-6 gap-2 sm:grid-cols-8">
        {WRITE_LETTERS.map((c) => {
          const idx = deck.findIndex((d) => d.id === c.id);
          return (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => onPick(idx < 0 ? 0 : idx)}
                className={cn(
                  "flex size-12 w-full items-center justify-center rounded-[var(--radius-md)] he-word text-2xl",
                  current?.id === c.id ? "bg-ink text-parchment" : "bg-card shadow-[var(--shadow-border)]",
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
    </>
  );
}

function VowelGrid({
  current,
  deck,
  onPick,
}: {
  current?: HebrewVowel;
  deck: HebrewVowel[];
  onPick: (i: number) => void;
}) {
  return (
    <ul className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
      {VOWELS.map((v) => {
        const idx = deck.findIndex((d) => d.id === v.id);
        return (
          <li key={v.id}>
            <button
              type="button"
              onClick={() => onPick(idx < 0 ? 0 : idx)}
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
        );
      })}
    </ul>
  );
}
