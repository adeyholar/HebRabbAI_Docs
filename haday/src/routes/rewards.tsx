import { createFileRoute, Link } from "@tanstack/react-router";
import { Flame, Flag, Footprints, Medal, Mountain, Star, Trophy } from "lucide-react";
import { Panel } from "@/components/panel";
import { LadderStrip } from "@/components/rewards-bar";
import { BADGES, scoreboard } from "@/lib/rewards";
import { useStudy } from "@/lib/store";

const ICONS = {
  "first-win": Flag,
  "win-3": Trophy,
  "win-7": Trophy,
  "first-chapter": Medal,
  "rung-5": Footprints,
  "rung-11": Flag,
  summit: Mountain,
  "streak-3": Flame,
  "streak-7": Flame,
  "streak-14": Flame,
  perfect: Star,
} as const;

export const Route = createFileRoute("/rewards")({ component: RewardsPage });

function RewardsPage() {
  const game = useStudy((s) => s.game);
  const streak = useStudy((s) => s.streak);
  const board = scoreboard(game, streak);
  const earned = new Set(game.badges);

  return (
    <>
      <Panel className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">HaDay · Rewards</p>
        <h1 className="mt-1 font-display text-4xl font-bold tracking-tight text-ink">Climb the ladder</h1>
        <p className="mt-3 max-w-prose text-muted">
          Daily streak for showing up. Win streak for clearing stages. Each BBH chapter is a rung — 19 to the summit.
        </p>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-[var(--radius-md)] bg-surface px-3 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Level</p>
            <p className="mt-1 font-display text-3xl font-bold tabular-nums text-ink">{board.level}</p>
            <p className="mt-0.5 truncate text-xs text-muted">{board.title}</p>
          </div>
          <div className="rounded-[var(--radius-md)] bg-surface px-3 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Points</p>
            <p className="mt-1 font-display text-3xl font-bold tabular-nums text-ink">{board.points.toLocaleString()}</p>
            <p className="mt-0.5 truncate text-xs text-muted">{board.stars} stars</p>
          </div>
          <div className="rounded-[var(--radius-md)] bg-surface px-3 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Path</p>
            <p className="mt-1 font-display text-3xl font-bold tabular-nums text-ink">{board.overallPct}%</p>
            <p className="mt-0.5 truncate text-xs text-muted">{board.cleared}/{board.total} chapters</p>
          </div>
        </div>
        <p className="mt-3 text-sm text-muted">{board.next}</p>
        <LadderStrip game={game} />
      </Panel>

      <ul className="grid gap-2 sm:grid-cols-2">
        {BADGES.map((b) => {
          const got = earned.has(b.id);
          const Icon = ICONS[b.id];
          return (
            <li
              key={b.id}
              className={`rounded-[var(--radius-lg)] p-4 shadow-[var(--shadow-border)] ${
                got ? "bg-card" : "bg-surface"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`size-5 ${got ? "text-primary" : "text-muted"}`} />
                <div>
                  <p className={`font-semibold ${got ? "text-ink" : "text-muted"}`}>{b.title}</p>
                  <p className="text-sm text-muted">{got ? "Earned" : b.hint}</p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <p className="mt-6 text-sm">
        <Link to="/game" className="font-semibold text-primary">
          Back to the map
        </Link>
      </p>
    </>
  );
}
