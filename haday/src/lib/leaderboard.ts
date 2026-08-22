import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";
import { hydrateGame } from "@/lib/game";
import { scoreboard } from "@/lib/rewards";

export type BoardRow = {
  rank: number;
  name: string;
  points: number;
  level: number;
  streak: number;
  honor: string;
  honorShort: string;
  you: boolean;
};

function publicName(raw: string | null | undefined): string {
  const name = (raw ?? "").trim();
  if (!name) return "Classmate";
  const parts = name.split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[1].charAt(0).toUpperCase()}.`;
}

export const listLeaderboard = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<BoardRow[]> => {
    const sql = await getSql();
    const rows = await sql<{
      id: string;
      name: string;
      streak: number | null;
      game: string | null;
      points: number | null;
      level: number | null;
    }>`
      select
        u.id,
        u.name,
        p.streak,
        p.game,
        p.points,
        p.level
      from "user" u
      left join study_progress p on p.user_id = u.id
      order by u."createdAt" asc
    `;

    const scored = rows.map((r) => {
      let points = Number(r.points) || 0;
      let level = Number(r.level) || 1;
      let honor = "Hearer of the Word";
      let honorShort = "Hearer";
      const streak = Number(r.streak) || 0;
      if (r.game) {
        try {
          const board = scoreboard(hydrateGame(JSON.parse(r.game) as unknown), streak);
          points = board.points;
          level = board.level;
          honor = board.honor.title;
          honorShort = board.honor.short;
        } catch {
          /* keep cached */
        }
      }
      return {
        id: r.id,
        name: publicName(r.name),
        points,
        level,
        streak,
        honor,
        honorShort,
      };
    });

    scored.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.level !== a.level) return b.level - a.level;
      if (b.streak !== a.streak) return b.streak - a.streak;
      return a.name.localeCompare(b.name);
    });

    let lastPoints = -1;
    let lastRank = 0;
    return scored.map((row, i) => {
      const rank = row.points === lastPoints ? lastRank : i + 1;
      lastPoints = row.points;
      lastRank = rank;
      return {
        rank,
        name: row.name,
        points: row.points,
        level: row.level,
        streak: row.streak,
        honor: row.honor,
        honorShort: row.honorShort,
        you: row.id === context.userId,
      };
    });
  });
