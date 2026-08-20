import { COURSE_WEEKS } from "@/lib/vocab";
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
          "h-11 w-full min-h-11 rounded-[var(--radius-md)] bg-card px-3 text-sm shadow-[var(--shadow-border)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        )}
      >
        {COURSE_WEEKS.map((w) => (
          <option key={w.week} value={w.week}>
            {w.label} — {w.hint}
          </option>
        ))}
      </select>
    </label>
  );
}
