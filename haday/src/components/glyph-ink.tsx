import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { InkPad, type InkPadHandle } from "@/components/ink-pad";
import { GradeBanner } from "@/components/grade-banner";
import { checkGlyphInk } from "@/lib/check-glyph";
import { playGrade } from "@/lib/sfx";
import { writeChecksLeft } from "@/lib/write-cap";
import { type HandMatch } from "@/lib/hebrew";
import { cn } from "@/lib/cn";

type Result = { match: HandMatch; read: string; note?: string; counted?: boolean };

type Props = {
  expected: string;
  mode: "letter" | "vowel";
  ghost?: string;
  onPass: (ok: boolean) => void;
};

export function GlyphInk({ expected, mode, ghost, onPass }: Props) {
  const pad = useRef<InkPadHandle>(null);
  const [empty, setEmpty] = useState(true);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [tries, setTries] = useState(0);
  const [left, setLeft] = useState(writeChecksLeft);

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
    const image = pad.current?.toImage();
    if (!image) return;
    setBusy(true);
    const next = await checkGlyphInk(image, expected, mode, pad.current?.getStrokes());
    setLeft(writeChecksLeft());
    if (next.counted !== false) setTries((n) => n + 1);
    setResult(next);
    playGrade(next.match === "exact" || next.match === "close");
    setBusy(false);
  }

  return (
    <div>
      <div className="relative mt-3 overflow-hidden rounded-[var(--radius-xl)] bg-card shadow-[var(--shadow-border)]">
        {ghost && (
          <p className="pointer-events-none absolute inset-0 z-0 grid place-items-center select-none he-word text-[7.5rem] leading-none text-ink/15">
            {ghost}
          </p>
        )}
        <InkPad
          ref={pad}
          disabled={locked || busy}
          onChange={setEmpty}
          className={cn("relative z-10 h-56 shadow-none", ghost && "bg-transparent")}
        />
      </div>
      <p className="mt-1 text-center text-xs text-muted">{left} checks left today</p>
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
        <p className="mt-3 text-center text-sm text-muted">{result.note}</p>
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
