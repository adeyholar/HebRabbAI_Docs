import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { InkPad, type InkPadHandle } from "@/components/ink-pad";
import { GradeBanner } from "@/components/grade-banner";
import { checkGlyphInk } from "@/lib/check-glyph";
import { playGrade } from "@/lib/sfx";
import { writeChecksLeft } from "@/lib/write-cap";
import { type HandMatch } from "@/lib/hebrew";
import { cn } from "@/lib/cn";
import { writingHint } from "@/lib/letter-models";

type Result = { match: HandMatch; read: string; note?: string; counted?: boolean };

type Props = {
  expected: string;
  mode: "letter" | "vowel";
  ghost?: string;
  trace?: boolean;
  allowSample?: boolean;
  onPass: (ok: boolean) => void;
};

export function GlyphInk({ expected, mode, ghost, trace = false, allowSample = true, onPass }: Props) {
  const pad = useRef<InkPadHandle>(null);
  const [empty, setEmpty] = useState(true);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [tries, setTries] = useState(0);
  const [left, setLeft] = useState(writeChecksLeft);
  const [sample, setSample] = useState(allowSample && trace);
  const sampleGlyph = ghost || expected;
  const showSample = allowSample && sample;
  const hint = writingHint(expected);

  const locked = result
    ? result.match === "exact" || result.match === "close" || (tries >= 2 && result.counted !== false && result.match !== "empty")
    : false;
  const ok = result ? result.match === "exact" || result.match === "close" : false;

  function clear() {
    pad.current?.clear();
    setEmpty(true);
    setResult(null);
    setTries(0);
  }

  async function check() {
    if (empty || busy || result) return;
    pad.current?.commit();
    const image = pad.current?.toImage();
    const strokes = pad.current?.getStrokes() ?? [];
    if (!image && !strokes.length) return;
    setBusy(true);
    const next = await checkGlyphInk(image || "data:image/png;base64,", expected, mode, strokes, {
      trace,
      height: pad.current?.getHeight() ?? 0,
    });
    setLeft(writeChecksLeft());
    if (next.counted !== false) setTries((n) => n + 1);
    setResult(next);
    playGrade(next.match === "exact" || next.match === "close");
    setBusy(false);
  }

  function selfGrade(pass: boolean) {
    setResult({ match: pass ? "exact" : "wrong", read: expected, counted: true });
    setTries((n) => n + 1);
    playGrade(pass);
  }

  return (
    <div>
      <div className="relative mt-3 overflow-hidden rounded-[var(--radius-xl)] bg-card shadow-[var(--shadow-border)]">
        <InkPad
          ref={pad}
          disabled={locked || busy}
          guides={mode === "letter"}
          model={mode === "letter" ? sampleGlyph : null}
          showModel={mode === "letter" && showSample}
          onChange={setEmpty}
          className="relative z-10 h-56 shadow-none"
        />
      </div>
      {allowSample && (
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={() => setSample((v) => !v)}
            className={cn(
              "min-h-11 flex-1 rounded-[var(--radius-md)] px-3 text-sm font-medium shadow-[var(--shadow-border)]",
              sample ? "bg-ink text-parchment" : "bg-card text-ink",
            )}
          >
            {sample ? "Expected on" : "Show expected"}
          </button>
        </div>
      )}
      <p className="mt-1 text-center text-xs text-muted">
        {hint} {left} checks left today
      </p>
      <div className="mt-2 flex gap-2">
        <Button type="button" variant="outline" className="flex-1" onClick={() => pad.current?.undo()} disabled={locked || busy}>
          Undo
        </Button>
        <Button type="button" variant="outline" className="flex-1" onClick={clear} disabled={busy}>
          Clear
        </Button>
      </div>
      {result && result.match !== "empty" && (
        <div className="mt-3">
          <GradeBanner ok={ok} />
          <p className="mt-2 text-center text-sm text-muted">
            {result.note
              ? result.note
              : ok
                ? `Read as ${result.read || expected}`
                : `Not that ${mode}. Target: ${expected}${result.read ? ` · I read ${result.read}` : ""}`}
          </p>
        </div>
      )}
      {result && result.match === "empty" && (
        <div className="mt-3">
          <p className="text-center text-sm text-muted">{result.note}</p>
          <div className="mt-3 flex gap-2">
            <Button className="flex-1" onClick={() => selfGrade(true)}>
              Count as correct
            </Button>
            <Button className="flex-1" variant="outline" onClick={() => selfGrade(false)}>
              I missed it
            </Button>
          </div>
        </div>
      )}
      {!result && (
        <Button className="mt-3 w-full" onClick={() => void check()} disabled={empty || busy}>
          {busy ? "Checking…" : "Check writing"}
        </Button>
      )}
      {result && !locked && (
        <Button className="mt-3 w-full" variant="outline" onClick={clear}>
          Try again
        </Button>
      )}
      {locked && (
        <Button className="mt-3 w-full" onClick={() => onPass(ok)}>
          Next
        </Button>
      )}
    </div>
  );
}
