import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";
import { hydrateCard, type CardState } from "@/lib/srs";
import { hydrateGame, type GameSnapshot } from "@/lib/game";

export type ProgressPayload = {
  cards: Record<string, CardState>;
  week: number;
  direction: "he-en" | "en-he";
  focus: "due" | "weak";
  streak: number;
  lastStudyDay: number;
  sessions: number;
  game: GameSnapshot;
};

type ProgressRow = {
  cards: string;
  week: number;
  direction: string;
  focus: string;
  streak: number;
  last_study_day: number;
  sessions: number;
  game: string | null;
};

export const loadProgress = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<ProgressPayload | null> => {
    const sql = await getSql();
    const rows = await sql<ProgressRow>`
      select cards, week, direction, focus, streak, last_study_day, sessions, game
      from study_progress
      where user_id = ${context.userId}
    `;
    const row = rows[0];
    if (!row) return null;
    return parseRow(row);
  });

export const saveProgress = createServerFn({ method: "POST" })
  .validator((input: ProgressPayload) => input)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const cards = JSON.stringify(data.cards ?? {});
    const week = Number.isFinite(data.week) ? data.week : 1;
    const direction = data.direction === "en-he" ? "en-he" : "he-en";
    const focus = data.focus === "weak" ? "weak" : "due";
    const streak = Number.isFinite(data.streak) ? data.streak : 0;
    const lastStudyDay = Number.isFinite(data.lastStudyDay) ? data.lastStudyDay : 0;
    const sessions = Number.isFinite(data.sessions) ? data.sessions : 0;
    const game = JSON.stringify(hydrateGame(data.game));
    await sql`
      insert into study_progress (
        user_id, cards, week, direction, focus, streak, last_study_day, sessions, game, updated_at
      ) values (
        ${context.userId}, ${cards}, ${week}, ${direction}, ${focus},
        ${streak}, ${lastStudyDay}, ${sessions}, ${game}, now()
      )
      on conflict (user_id) do update set
        cards = excluded.cards,
        week = excluded.week,
        direction = excluded.direction,
        focus = excluded.focus,
        streak = excluded.streak,
        last_study_day = excluded.last_study_day,
        sessions = excluded.sessions,
        game = excluded.game,
        updated_at = now()
    `;
    return { ok: true as const };
  });

function parseRow(row: ProgressRow): ProgressPayload {
  let parsed: Record<string, Partial<CardState>> = {};
  try {
    const raw = JSON.parse(row.cards || "{}") as unknown;
    if (raw && typeof raw === "object") parsed = raw as Record<string, Partial<CardState>>;
  } catch {
    parsed = {};
  }
  const cards: Record<string, CardState> = {};
  for (const [id, card] of Object.entries(parsed)) {
    cards[id] = hydrateCard(card);
  }
  let gameRaw: unknown = {};
  try {
    gameRaw = JSON.parse(row.game || "{}") as unknown;
  } catch {
    gameRaw = {};
  }
  return {
    cards,
    week: Number(row.week) || 1,
    direction: row.direction === "en-he" ? "en-he" : "he-en",
    focus: row.focus === "weak" ? "weak" : "due",
    streak: Number(row.streak) || 0,
    lastStudyDay: Number(row.last_study_day) || 0,
    sessions: Number(row.sessions) || 0,
    game: hydrateGame(gameRaw),
  };
}
