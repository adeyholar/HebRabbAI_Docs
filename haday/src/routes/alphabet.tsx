import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/panel";
import {
  CONSONANTS,
  QUIZ_KINDS,
  VOWEL_GROUPS,
  VOWELS,
  type HebrewLetter,
  type HebrewVowel,
  type QuizKind,
} from "@/lib/alphabet";
import { shuffle } from "@/lib/vocab";
import { cn } from "@/lib/cn";

export const Route = createFileRoute("/alphabet")({ component: AlphabetPage });

function AlphabetPage() {
  const [tab, setTab] = useState<"letters" | "vowels" | "drill">("vowels");
  const [active, setActive] = useState<HebrewLetter>(CONSONANTS[0]);

  return (
    <>
      <Panel>
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink">Alef-bet</h1>
        <p className="mt-1 text-sm text-muted">
          Week 1 foundation: consonants, transliteration, and the full vowel charts — long, short, reduced, and vowel
          letters.
        </p>
        <div className="mt-4 flex gap-2">
          {(["letters", "vowels", "drill"] as const).map((t) => (
            <Button key={t} size="sm" variant={tab === t ? "primary" : "outline"} onClick={() => setTab(t)}>
              {t === "letters" ? "Letters" : t === "vowels" ? "Vowels" : "Quiz"}
            </Button>
          ))}
        </div>
      </Panel>

      {tab === "letters" && (
        <>
          <div className="mt-5 rounded-[var(--radius-xl)] bg-card px-5 py-8 text-center shadow-[var(--shadow-border)]">
            <p className="he-word text-7xl">{active.letter}</p>
            {active.final && <p className="mt-2 text-sm text-muted">Final form {active.final}</p>}
            <p className="mt-3 font-display text-2xl font-bold text-ink">{active.name}</p>
            <p className="text-sm text-muted">{active.sound}</p>
            <p className="mt-1 font-mono text-lg text-ink">{active.translit}</p>
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
        <div className="mt-5 space-y-4">
          {VOWEL_GROUPS.map((g) => (
            <section key={g.id} className="rounded-[var(--radius-xl)] bg-card p-4 shadow-[var(--shadow-border)]">
              <h2 className="font-display text-xl font-bold text-ink">{g.title}</h2>
              <p className="mt-1 text-sm text-muted">{g.blurb}</p>
              <ul className="mt-3 divide-y divide-border">
                {VOWELS.filter((v) => v.kind === g.id).map((v) => (
                  <li key={v.id} className="flex items-center gap-4 py-2.5">
                    <span className="he-word w-16 text-center text-3xl">{v.mark}</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-ink">
                        {v.name}{" "}
                        <span className="text-sm font-normal text-muted">
                          · {v.vowelClass}-class
                        </span>
                      </p>
                      <p className="text-sm text-muted">{v.sound}</p>
                      {v.note && <p className="mt-0.5 text-xs text-muted">{v.note}</p>}
                    </div>
                    <span className="shrink-0 font-mono text-lg text-ink">{v.translit}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      {tab === "drill" && <FoundationQuiz />}
    </>
  );
}

function FoundationQuiz() {
  const [kind, setKind] = useState<QuizKind>("vowel-name");
  const [seed, setSeed] = useState(0);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [right, setRight] = useState(0);
  const [missedId, setMissedId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const letterDeck = useMemo(() => shuffle(CONSONANTS).slice(0, 12), [seed, kind]);
  const vowelDeck = useMemo(() => shuffle(VOWELS).slice(0, 12), [seed, kind]);
  const isLetter = kind.startsWith("letter") || kind === "translit-letter";
  const total = 12;

  useEffect(() => {
    setI(0);
    setPicked(null);
    setRight(0);
    setMissedId(null);
    setReady(true);
  }, [seed, kind]);

  const letter = letterDeck[i];
  const vowel = vowelDeck[i];
  const done = isLetter ? i >= letterDeck.length : i >= vowelDeck.length;

  const prompt = isLetter ? letter : vowel;
  const options = useMemo(() => {
    if (isLetter) {
      if (!letter) return [];
      const others = shuffle(CONSONANTS.filter((c) => c.id !== letter.id)).slice(0, 3);
      return shuffle([letter, ...others]);
    }
    if (!vowel) return [];
    const seen = new Set<string>([vowelLabel(kind, vowel)]);
    const others: HebrewVowel[] = [];
    for (const v of shuffle(VOWELS.filter((x) => x.id !== vowel.id))) {
      const lab = vowelLabel(kind, v);
      if (seen.has(lab)) continue;
      seen.add(lab);
      others.push(v);
      if (others.length === 3) break;
    }
    return shuffle([vowel, ...others]);
  }, [kind, letter, vowel, isLetter]);

  function optionLabel(item: HebrewLetter | HebrewVowel): string {
    if ("letter" in item) {
      if (kind === "letter-name") return item.name;
      if (kind === "letter-translit") return item.translit;
      return item.letter;
    }
    if (kind === "vowel-sound") return item.sound;
    if (kind === "vowel-translit") return `${item.translit}  (${item.name})`;
    return item.name;
  }

  function promptNode() {
    if (isLetter && letter) {
      if (kind === "translit-letter") {
        return <p className="font-mono text-5xl font-bold text-ink">{letter.translit}</p>;
      }
      return <p className="he-word text-7xl">{letter.letter}</p>;
    }
    if (vowel) return <p className="he-word text-7xl">{vowel.mark}</p>;
    return null;
  }

  if (!ready) {
    return <p className="mt-8 text-sm text-muted">Shuffling a round…</p>;
  }

  if (done || !prompt) {
    return (
      <div className="mt-5">
        <QuizPicker kind={kind} onKind={(k) => { setKind(k); setSeed((s) => s + 1); }} />
        <div className="mt-4 rounded-[var(--radius-xl)] bg-card p-8 text-center shadow-[var(--shadow-border)]">
          <p className="font-display text-3xl font-bold text-ink">
            {right} / {total}
          </p>
          <Button className="mt-4" onClick={() => setSeed((s) => s + 1)}>
            New round
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-5">
      <QuizPicker kind={kind} onKind={(k) => { setKind(k); setSeed((s) => s + 1); }} />
      <p className="mt-4 text-sm font-medium tabular-nums text-ink">
        {i + 1} / {total} · {right} correct
      </p>
      <div className="mt-3 rounded-[var(--radius-xl)] bg-card py-10 text-center shadow-[var(--shadow-border)]">
        {promptNode()}
        {kind === "vowel-name" && vowel && (
          <p className="mt-2 text-sm text-muted">{vowel.kind} · {vowel.vowelClass}-class</p>
        )}
      </div>
      <ul className="mt-4 grid grid-cols-2 gap-2">
        {options.map((o) => {
          const id = o.id;
          const show = picked !== null;
          const correct = id === prompt.id;
          return (
            <li key={id}>
              <button
                type="button"
                disabled={picked !== null || missedId === id}
                onClick={() => {
                  if (id === prompt.id) {
                    setPicked(id);
                    setRight((r) => r + 1);
                    return;
                  }
                  if (!missedId) {
                    setMissedId(id);
                    return;
                  }
                  setPicked(id);
                }}
                className={cn(
                  "w-full min-h-12 rounded-[var(--radius-md)] px-3 py-3 text-sm font-medium shadow-[var(--shadow-border)]",
                  !show && missedId !== id && "bg-card",
                  missedId === id && !show && "bg-danger text-parchment",
                  show && correct && "bg-good text-parchment",
                  show && picked === id && !correct && "bg-danger text-parchment",
                  show && picked !== id && !correct && missedId !== id && "bg-card text-muted",
                  show && missedId === id && "bg-danger text-parchment",
                )}
              >
                {kind === "translit-letter" && "letter" in o ? (
                  <span className="he-word text-2xl">{o.letter}</span>
                ) : (
                  optionLabel(o)
                )}
              </button>
            </li>
          );
        })}
      </ul>
      {missedId && !picked && (
        <p className="try-flash mt-4 text-center text-xl font-bold uppercase tracking-wide text-danger sm:text-2xl">
          One more try
        </p>
      )}
      {picked && (
        <Button
          className="mt-4 w-full"
          onClick={() => {
            setPicked(null);
            setMissedId(null);
            setI((n) => n + 1);
          }}
        >
          Next
        </Button>
      )}
    </div>
  );
}

function vowelLabel(kind: QuizKind, item: HebrewVowel): string {
  if (kind === "vowel-sound") return item.sound;
  if (kind === "vowel-translit") return item.translit;
  return item.name;
}

function QuizPicker({ kind, onKind }: { kind: QuizKind; onKind: (k: QuizKind) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {QUIZ_KINDS.map((k) => (
        <button
          key={k.id}
          type="button"
          onClick={() => onKind(k.id)}
          className={cn(
            "min-h-11 rounded-[var(--radius-md)] px-3 py-2 text-left shadow-[var(--shadow-border)]",
            kind === k.id ? "bg-ink text-parchment" : "bg-card",
          )}
        >
          <span className="block text-sm font-medium">{k.label}</span>
          <span className={cn("block text-xs", kind === k.id ? "text-parchment/70" : "text-muted")}>{k.hint}</span>
        </button>
      ))}
    </div>
  );
}
