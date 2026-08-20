import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { CONSONANTS, VOWELS, type HebrewLetter } from "@/lib/alphabet";
import { shuffle } from "@/lib/vocab";
import { cn } from "@/lib/cn";

export const Route = createFileRoute("/alphabet")({ component: AlphabetPage });

function AlphabetPage() {
  const [tab, setTab] = useState<"letters" | "vowels" | "drill">("letters");
  const [active, setActive] = useState<HebrewLetter>(CONSONANTS[0]);

  return (
    <>
      <h1 className="font-display text-3xl font-semibold tracking-tight">Alef-bet</h1>
      <p className="mt-1 text-sm text-muted">Week 1 foundation: consonants, final forms, and vowels.</p>
      <div className="mt-4 flex gap-2">
        {(["letters", "vowels", "drill"] as const).map((t) => (
          <Button key={t} size="sm" variant={tab === t ? "primary" : "outline"} onClick={() => setTab(t)}>
            {t === "letters" ? "Letters" : t === "vowels" ? "Vowels" : "Quiz"}
          </Button>
        ))}
      </div>

      {tab === "letters" && (
        <>
          <div className="mt-5 rounded-[var(--radius-xl)] bg-card px-5 py-8 text-center shadow-[var(--shadow-border)]">
            <p className="he-word text-7xl">{active.letter}</p>
            {active.final && <p className="mt-2 text-sm text-muted">Final form {active.final}</p>}
            {active.id === "sin-shin" && (
              <p className="mt-2 text-sm text-muted">
                <span className="he-word text-xl">שׁ</span> Shin (sh) · <span className="he-word text-xl">שׂ</span> Sin (s)
              </p>
            )}
            <p className="mt-3 font-display text-2xl font-semibold">{active.name}</p>
            <p className="text-sm text-muted">{active.sound}</p>
          </div>
          <ul className="mt-4 grid grid-cols-6 gap-2 sm:grid-cols-8">
            {CONSONANTS.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => setActive(c)}
                  className={cn(
                    "flex size-12 w-full items-center justify-center rounded-[var(--radius-md)] he-word text-2xl",
                    active.id === c.id ? "bg-ink text-parchment" : "bg-card shadow-[var(--shadow-border)]",
                  )}
                >
                  {c.letter}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      {tab === "vowels" && (
        <ul className="mt-5 divide-y divide-border overflow-hidden rounded-[var(--radius-lg)] bg-card shadow-[var(--shadow-border)]">
          {VOWELS.map((v) => (
            <li key={v.id} className="flex items-center gap-4 px-4 py-3">
              <span className="he-word w-14 text-center text-3xl">{v.mark}</span>
              <div>
                <p className="font-medium">{v.name}</p>
                <p className="text-sm text-muted">
                  {v.sound} · {v.class}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {tab === "drill" && <LetterQuiz />}
    </>
  );
}

function LetterQuiz() {
  const [seed, setSeed] = useState(0);
  const [deck, setDeck] = useState<HebrewLetter[]>([]);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [right, setRight] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setDeck(shuffle(CONSONANTS).slice(0, 10));
    setI(0);
    setPicked(null);
    setReady(true);
  }, [seed]);

  const item = deck[i];
  const options = useMemo(() => {
    if (!item) return [];
    const others = shuffle(CONSONANTS.filter((c) => c.id !== item.id)).slice(0, 3);
    return shuffle([item, ...others]);
  }, [item]);

  if (!ready || (deck.length > 0 && !item && i === 0)) {
    return <p className="mt-8 text-sm text-muted">Shuffling letters…</p>;
  }

  if (!item) {
    return (
      <div className="mt-8 rounded-[var(--radius-xl)] bg-card p-8 text-center shadow-[var(--shadow-border)]">
        <p className="font-display text-3xl font-semibold">
          {right} / 10
        </p>
        <Button className="mt-4" onClick={() => { setSeed((s) => s + 1); setI(0); setPicked(null); setRight(0); }}>
          Again
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-5">
      <p className="text-sm tabular-nums text-muted">
        {i + 1} / 10 · {right} correct
      </p>
      <div className="mt-3 rounded-[var(--radius-xl)] bg-card py-10 text-center shadow-[var(--shadow-border)]">
        <p className="he-word text-7xl">{item.letter}</p>
      </div>
      <ul className="mt-4 grid grid-cols-2 gap-2">
        {options.map((o) => {
          const show = picked !== null;
          const correct = o.id === item.id;
          return (
            <li key={o.id}>
              <button
                type="button"
                disabled={picked !== null}
                onClick={() => {
                  setPicked(o.id);
                  if (o.id === item.id) setRight((r) => r + 1);
                }}
                className={cn(
                  "w-full min-h-12 rounded-[var(--radius-md)] px-3 py-3 text-sm shadow-[var(--shadow-border)]",
                  !show && "bg-card",
                  show && correct && "bg-good text-parchment",
                  show && picked === o.id && !correct && "bg-danger text-parchment",
                  show && picked !== o.id && !correct && "bg-card text-muted",
                )}
              >
                {o.name}
              </button>
            </li>
          );
        })}
      </ul>
      {picked && (
        <Button
          className="mt-4 w-full"
          onClick={() => {
            setPicked(null);
            setI((n) => n + 1);
          }}
        >
          Next
        </Button>
      )}
    </div>
  );
}
