import { Flame, Flag, Footprints, Medal, Mountain, Star, Trophy } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/cn";
import { GAME_CHAPTER_MAX, chapterRecord, type GameSnapshot } from "@/lib/game";
import { BADGES, badgeMeta, ladderRung } from "@/lib/rewards";
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

export function RewardsBar() {
  const game = useStudy((s) => s.game);
  const streak = useStudy((s) => s.streak);
  const rung = ladderRung(game);
  const earned = new Set(game.badges);
  const shown = BADGES.filter((b) => earned.has(b.id)).slice(-4);

  return (
    <div className="rounded-[var(--radius-xl)] bg-card p-5 shadow-[var(--shadow-border)]">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="font-display text-xl font-bold text-ink">Ladder</h2>
        <Link to="/rewards" className="text-sm font-medium text-primary">
          All rewards
        </Link>
      </div>
      <p className="mt-1 text-sm text-muted">
        Rung {rung.current} of {rung.total}
        {rung.cleared ? ` · ${rung.cleared} chapter${rung.cleared === 1 ? "" : "s"} cleared` : ""}
        {game.winStreak > 1 ? ` · ${game.winStreak} stage win streak` : ""}
      </p>
      <LadderStrip game={game} />
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="inline-flex min-h-11 items-center gap-1.5 rounded-[var(--radius-md)] bg-surface px-3 text-sm font-semibold text-ink">
          <Flame className="size-4 text-primary" />
          {streak}d
        </span>
        {shown.map((b) => {
          const Icon = ICONS[b.id];
          return (
            <span
              key={b.id}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-[var(--radius-md)] bg-surface px-3 text-sm font-medium text-ink"
              title={b.hint}
            >
              <Icon className="size-4 text-primary" />
              {b.title}
            </span>
          );
        })}
      </div>
    </div>
  );
}

export function LadderStrip({ game }: { game: GameSnapshot }) {
  return (
    <ol className="mt-3 grid grid-cols-10 gap-1 sm:grid-cols-[repeat(19,minmax(0,1fr))]">
      {Array.from({ length: GAME_CHAPTER_MAX }, (_, i) => i + 1).map((n) => {
        const rec = chapterRecord(game, n);
        const unlocked = n <= Math.max(game.unlockedChapter, 1);
        return (
          <li key={n}>
            <span
              className={cn(
                "flex h-8 items-center justify-center rounded-[var(--radius-sm)] text-xs font-semibold tabular-nums",
                rec.cleared && "bg-primary text-primary-foreground",
                unlocked && !rec.cleared && "bg-surface text-ink shadow-[var(--shadow-border)]",
                !unlocked && "bg-surface/70 text-muted",
              )}
              aria-label={`Chapter ${n}${rec.cleared ? " cleared" : unlocked ? " open" : " locked"}`}
            >
              {n}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export function NewBadges({ ids }: { ids: string[] }) {
  if (!ids.length) return null;
  return (
    <ul className="mt-4 space-y-1">
      {ids.map((id) => {
        const meta = badgeMeta(id);
        if (!meta) return null;
        const Icon = ICONS[id as keyof typeof ICONS] ?? Medal;
        return (
          <li key={id} className="flex items-center justify-center gap-2 text-sm font-medium text-good">
            <Icon className="size-4" />
            Reward: {meta.title}
          </li>
        );
      })}
    </ul>
  );
}
