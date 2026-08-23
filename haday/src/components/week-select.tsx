import { ALL_GAME_WEEK, COURSE_WEEKS, GAME_CHAPTER_TITLES, weekForGameChapter } from "@/lib/vocab";
import { useStudy } from "@/lib/store";
import { cn } from "@/lib/cn";

export function WeekSelect() {
  const week = useStudy((s) => s.week);
  const setWeek = useStudy((s) => s.setWeek);

  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted">
        Study set
      </span>
      <select
        value={week}
        onChange={(e) => setWeek(Number(e.target.value))}
        className={cn(
          "h-11 w-full min-h-11 rounded-[var(--radius-md)] border border-border bg-parchment px-3 text-sm text-ink",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        )}
      >
        <optgroup label="Course weeks">
          {COURSE_WEEKS.map((w) => (
            <option key={w.week} value={w.week}>
              {w.label} — {w.hint}
            </option>
          ))}
        </optgroup>
        <optgroup label="Game chapters (BBH 3rd ed.)">
          <option value={ALL_GAME_WEEK}>All Game — corrected Ch. 2–19</option>
          {Array.from({ length: 19 }, (_, i) => i + 1).map((ch) => (
            <option key={ch} value={weekForGameChapter(ch)}>
              Chapter {ch} — {GAME_CHAPTER_TITLES[ch]}
            </option>
          ))}
        </optgroup>
      </select>
    </label>
  );
}
