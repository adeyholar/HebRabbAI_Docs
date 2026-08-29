import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/panel";
import {
  CONSONANTS,
  QUIZ_KINDS,
  VOWEL_GROUPS,
  VOWELS,
  WRITE_LETTERS,
  type HebrewLetter,
  type HebrewVowel,
  type QuizKind,
} from "@/lib/alphabet";
import { alefByKeys, alefKey } from "@/lib/alef";
import { shuffle } from "@/lib/vocab";
import { cn } from "@/lib/cn";
import { GradeBanner } from "@/components/grade-banner";
import { GlyphInk } from "@/components/glyph-ink";
import { LetterWrite } from "@/components/letter-write";
import { HandTrain } from "@/components/hand-train";
import { ClosedBook } from "@/components/closed-book";
import { playGrade } from "@/lib/sfx";
import { useStudy } from "@/lib/store";

export const Route = createFileRoute("/alphabet")({ component: AlphabetPage });

function AlphabetPage() {
  const [tab, setTab] = useState<"letters" | "vowels" | "write" | "hand" | "drill" | "exam">("letters");
  const [active, setActive] = useState<HebrewLetter>(CONSONANTS[0]);

  return (
    <>
      <Panel>
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink">Alef-bet</h1>
        <p className="mt-1 text-sm text-muted">
          Consonants right to left, a closed-book exam from memory, and practice that follows what you miss. Train your
          handwriting so Write grades your hand, not only the printed chart. Syllable cuts live under Game → Syllables.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {(["letters", "vowels", "write", "hand", "drill", "exam"] as const).map((t) => (
            <Button key={t} size="sm" variant={tab === t ? "primary" : "outline"} onClick={() => setTab(t)}>
              {t === "letters"
                ? "Letters"
                : t === "vowels"
                  ? "Vowels"
                  : t === "write"
                    ? "Write"
                    : t === "hand"
                      ? "My hand"
                      : t === "drill"
                        ? "Quiz"
                        : "Exam"}
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
          <ul dir="rtl" className="mt-4 grid grid-cols-6 gap-2 sm:grid-cols-8">
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
                        {v.kind !== "shewa" && (
                          <span className="text-sm font-normal text-muted">· {v.vowelClass}-class</span>
                        )}
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

      {tab === "write" && <LetterWrite />}

      {tab === "hand" && <HandTrain />}

      {tab === "drill" && <FoundationQuiz />}

      {tab === "exam" && <ClosedBook onPractice={(next) => setTab(next)} />}
    </>
  );
}

function FoundationQuiz() {
  const queue = useStudy((s) => s.alefQueue);
  const rate = useStudy((s) => s.rate);
  const [kind, setKind] = useState<QuizKind>("vowel-name");
  const [seed, setSeed] = useState(0);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [right, setRight] = useState(0);
  const [missedId, setMissedId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [inkKey, setInkKey] = useState(0);

  const isScribble = kind === "letter-scribble" || kind === "vowel-scribble";
  const isLetter = kind.startsWith("letter") || kind === "translit-letter";
  const letterDeck = useMemo(() => {
    const q = alefByKeys(queue)
      .filter((x) => x.kind === "letter")
      .map((x) => WRITE_LETTERS.find((l) => l.id === x.id))
      .filter((x): x is HebrewLetter => Boolean(x));
    if (q.length && isLetter) return q;
    return shuffle(kind === "letter-scribble" ? WRITE_LETTERS : CONSONANTS);
  }, [seed, kind, queue, isLetter]);
  const vowelDeck = useMemo(() => {
    const q = alefByKeys(queue)
      .filter((x) => x.kind === "vowel")
      .map((x) => VOWELS.find((v) => v.id === x.id))
      .filter((x): x is HebrewVowel => Boolean(x));
    if (q.length && !isLetter) return q;
    return shuffle(VOWELS);
  }, [seed, kind, queue, isLetter]);
  const total = isLetter ? letterDeck.length : vowelDeck.length;

  useEffect(() => {
    setI(0);
    setPicked(null);
    setRight(0);
    setMissedId(null);
    setInkKey((n) => n + 1);
    setReady(true);
  }, [seed, kind]);

  const letter = letterDeck[i];
  const vowel = vowelDeck[i];
  const done = isLetter ? i >= letterDeck.length : i >= vowelDeck.length;

  const prompt = isLetter ? letter : vowel;
  const options = useMemo(() => {
    if (isScribble) return [];
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
  }, [kind, letter, vowel, isLetter, isScribble]);

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
    if (kind === "letter-scribble" && letter) {
      return (
        <>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Scribble this letter</p>
          <p className="mt-2 font-display text-3xl font-bold text-ink">{letter.name}</p>
          <p className="mt-1 text-sm text-muted">{letter.sound}</p>
        </>
      );
    }
    if (kind === "vowel-scribble" && vowel) {
      return (
        <>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Scribble this vowel on ב</p>
          <p className="mt-2 font-display text-3xl font-bold text-ink">{vowel.name}</p>
          <p className="mt-1 text-sm text-muted">{vowel.sound}</p>
        </>
      );
    }
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
    return <p className="mt-8 text-sm text-muted">Dealing a round…</p>;
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
      {queue.length > 0 && (
        <p className="mt-2 text-sm font-medium text-primary">Serving closed-book misses first.</p>
      )}
      <p className="mt-4 text-sm font-medium tabular-nums text-ink">
        {i + 1} / {total} · {right} correct
      </p>
      <div className="mt-3 rounded-[var(--radius-xl)] bg-card py-10 text-center shadow-[var(--shadow-border)]">
        {promptNode()}
        {kind === "vowel-name" && vowel && (
          <p className="mt-2 text-sm text-muted">{vowel.kind} · {vowel.vowelClass}-class</p>
        )}
      </div>
      {isScribble && prompt && (
        <GlyphInk
          key={`${kind}-${i}-${inkKey}`}
          expected={"letter" in prompt ? prompt.letter : prompt.mark}
          mode={kind === "vowel-scribble" ? "vowel" : "letter"}
          allowSample={false}
          onPass={(ok) => {
            const key = isLetter && letter ? alefKey("letter", letter.id) : vowel ? alefKey("vowel", vowel.id) : null;
            if (key) rate(key, ok ? "good" : "again");
            if (ok) setRight((r) => r + 1);
            setI((n) => n + 1);
            setInkKey((n) => n + 1);
          }}
        />
      )}
      {!isScribble && (
        <>
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
                    playGrade(true);
                    const key = isLetter && letter ? alefKey("letter", letter.id) : vowel ? alefKey("vowel", vowel.id) : null;
                    if (key) rate(key, "easy");
                    return;
                  }
                  if (!missedId) {
                    setMissedId(id);
                    playGrade(false);
                    return;
                  }
                  setPicked(id);
                  playGrade(false);
                  const key = isLetter && letter ? alefKey("letter", letter.id) : vowel ? alefKey("vowel", vowel.id) : null;
                  if (key) rate(key, "again");
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
        <>
          <GradeBanner className="mt-4" ok={false} />
          <p className="try-flash mt-2 text-center text-lg font-bold uppercase tracking-wide text-danger">
            One more try
          </p>
        </>
      )}
      {picked && (
        <GradeBanner className="mt-4" ok={picked === prompt.id} />
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
        </>
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
