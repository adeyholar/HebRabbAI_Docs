import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { listLeaderboard, type BoardRow } from "@/lib/leaderboard";

export function LeaderboardTeaser() {
  const [rows, setRows] = useState<BoardRow[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    listLeaderboard()
      .then((data) => {
        if (!cancelled) setRows(data);
      })
      .catch(() => {
        if (!cancelled) setRows([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!rows || rows.length === 0) return null;

  const you = rows.find((r) => r.you);
  const top = rows.slice(0, 5);
  const youHidden = you && you.rank > 5;

  return (
    <div className="rounded-[var(--radius-xl)] bg-card p-5 shadow-[var(--shadow-border)]">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="font-display text-xl font-bold text-ink">Class board</h2>
        <Link to="/leaderboard" className="text-sm font-medium text-primary">
          Full board
        </Link>
      </div>
      {you && (
        <p className="mt-1 text-sm text-muted">
          You are #{you.rank} of {rows.length}
        </p>
      )}
      <ol className="mt-3 space-y-2">
        {top.map((row) => (
          <li key={`${row.rank}-${row.name}`} className="flex items-baseline justify-between gap-2 text-sm">
            <span className="min-w-0 truncate text-ink">
              <span className="me-2 font-display font-bold tabular-nums text-primary">{row.rank}</span>
              {row.name}
              {row.you ? <span className="ms-1.5 text-xs font-medium uppercase tracking-wide text-primary">You</span> : null}
            </span>
            <span className="shrink-0 tabular-nums text-muted">{row.points.toLocaleString()} pts</span>
          </li>
        ))}
        {youHidden && you && (
          <li className="flex items-baseline justify-between gap-2 border-t border-border pt-2 text-sm">
            <span className="min-w-0 truncate text-ink">
              <span className="me-2 font-display font-bold tabular-nums text-primary">{you.rank}</span>
              {you.name}
              <span className="ms-1.5 text-xs font-medium uppercase tracking-wide text-primary">You</span>
            </span>
            <span className="shrink-0 tabular-nums text-muted">{you.points.toLocaleString()} pts</span>
          </li>
        )}
      </ol>
    </div>
  );
}
