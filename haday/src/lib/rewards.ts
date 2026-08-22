import { GAME_CHAPTER_MAX, GAME_STAGES, chapterRecord, type GameSnapshot } from "@/lib/game";

export const BADGES = [
  { id: "first-win", title: "First win", hint: "Clear your first game stage" },
  { id: "win-3", title: "Win streak", hint: "Clear 3 stages in a row" },
  { id: "win-7", title: "Hot streak", hint: "Clear 7 stages in a row" },
  { id: "first-chapter", title: "Level 1", hint: "Clear chapter 1" },
  { id: "rung-5", title: "Rung 5", hint: "Clear through chapter 5" },
  { id: "rung-11", title: "Halfway", hint: "Clear through chapter 11" },
  { id: "summit", title: "Summit", hint: "Clear all 19 chapters" },
  { id: "streak-3", title: "3-day flame", hint: "Show up 3 days in a row" },
  { id: "streak-7", title: "Week flame", hint: "Show up 7 days in a row" },
  { id: "streak-14", title: "Fortnight", hint: "Show up 14 days in a row" },
  { id: "perfect", title: "Three stars", hint: "Score three stars on a stage" },
] as const;

export type BadgeId = (typeof BADGES)[number]["id"];

export function badgeMeta(id: string) {
  return BADGES.find((b) => b.id === id);
}

export function chaptersCleared(game: GameSnapshot): number {
  let n = 0;
  for (let c = 1; c <= GAME_CHAPTER_MAX; c++) {
    if (chapterRecord(game, c).cleared) n += 1;
  }
  return n;
}

export function stagesCleared(game: GameSnapshot): number {
  let n = 0;
  for (let c = 1; c <= GAME_CHAPTER_MAX; c++) {
    const rec = chapterRecord(game, c);
    for (const s of GAME_STAGES) if (rec.stages[s.id].cleared) n += 1;
  }
  return n;
}

export function hasThreeStar(game: GameSnapshot): boolean {
  for (let c = 1; c <= GAME_CHAPTER_MAX; c++) {
    const rec = chapterRecord(game, c);
    for (const s of GAME_STAGES) if (rec.stages[s.id].stars >= 3) return true;
  }
  return false;
}

export function evaluateBadges(game: GameSnapshot, dailyStreak: number): BadgeId[] {
  const ch = chaptersCleared(game);
  const stages = stagesCleared(game);
  const out: BadgeId[] = [];
  if (stages >= 1) out.push("first-win");
  if (game.bestWinStreak >= 3 || game.winStreak >= 3) out.push("win-3");
  if (game.bestWinStreak >= 7 || game.winStreak >= 7) out.push("win-7");
  if (ch >= 1) out.push("first-chapter");
  if (ch >= 5) out.push("rung-5");
  if (ch >= 11) out.push("rung-11");
  if (ch >= GAME_CHAPTER_MAX) out.push("summit");
  if (dailyStreak >= 3) out.push("streak-3");
  if (dailyStreak >= 7) out.push("streak-7");
  if (dailyStreak >= 14) out.push("streak-14");
  if (hasThreeStar(game)) out.push("perfect");
  return out;
}

export function ladderRung(game: GameSnapshot): { current: number; cleared: number; total: number } {
  const cleared = chaptersCleared(game);
  let current = 1;
  for (let c = 1; c <= GAME_CHAPTER_MAX; c++) {
    if (!chapterRecord(game, c).cleared) {
      current = c;
      break;
    }
    current = Math.min(GAME_CHAPTER_MAX, c + 1);
  }
  return { current, cleared, total: GAME_CHAPTER_MAX };
}

export function stampRewards(game: GameSnapshot, dailyStreak: number): GameSnapshot {
  const next = evaluateBadges(game, dailyStreak);
  const prev = new Set(game.badges);
  const justEarned = next.filter((id) => !prev.has(id));
  return { ...game, badges: next, justEarned };
}
