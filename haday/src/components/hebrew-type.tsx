import { cn } from "@/lib/cn";
import { liveMatch } from "@/lib/hebrew";

const LETTERS = ["א", "ב", "ג", "ד", "ה", "ו", "ז", "ח", "ט", "י", "כ", "ל", "מ", "נ", "ס", "ע", "פ", "צ", "ק", "ר", "ש", "ת"];

type Props = {
  value: string;
  onChange: (next: string) => void;
  target: string;
  disabled?: boolean;
};

export function HebrewType({ value, onChange, target, disabled }: Props) {
  const live = liveMatch(target, value);
  const hint =
    live === "empty" ? "Type or tap letters — vowels optional."
    : live === "exact" ? "Correct."
    : live === "prefix" ? "Keep going — that prefix is right."
    : "Not yet — check a letter.";

  return (
    <div>
      <input
        dir="rtl"
        lang="he"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        placeholder="כתוב כאן"
        autoCapitalize="off"
        autoCorrect="off"
        autoComplete="off"
        spellCheck={false}
        className={cn(
          "h-14 w-full rounded-[var(--radius-md)] border border-border bg-parchment px-4 text-center font-hebrew text-3xl text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          live === "exact" && "ring-2 ring-good",
          live === "off" && value && "ring-2 ring-danger",
        )}
      />
      <p
        className={cn(
          "mt-2 text-center text-sm font-medium",
          live === "exact" && "text-good",
          live === "off" && "text-danger",
          (live === "empty" || live === "prefix") && "text-muted",
        )}
      >
        {hint}
      </p>
      <div className="mt-3 grid grid-cols-6 gap-1.5" dir="rtl">
        {LETTERS.map((ch) => (
          <button
            key={ch}
            type="button"
            disabled={disabled}
            onClick={() => onChange(value + ch)}
            className="min-h-11 rounded-[var(--radius-sm)] bg-card font-hebrew text-xl font-semibold text-ink shadow-[var(--shadow-border)] disabled:opacity-40"
          >
            {ch}
          </button>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-2 gap-1.5">
        <button
          type="button"
          disabled={disabled || !value}
          onClick={() => onChange(value.slice(0, -1))}
          className="min-h-11 rounded-[var(--radius-sm)] bg-card text-sm font-medium text-ink shadow-[var(--shadow-border)] disabled:opacity-40"
        >
          Backspace
        </button>
        <button
          type="button"
          disabled={disabled || !value}
          onClick={() => onChange("")}
          className="min-h-11 rounded-[var(--radius-sm)] bg-card text-sm font-medium text-ink shadow-[var(--shadow-border)] disabled:opacity-40"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
