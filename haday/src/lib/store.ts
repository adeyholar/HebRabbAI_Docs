import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ALL_GAME_WEEK, shuffle, type VocabItem } from "./vocab";
import {
  applyRating,
  hydrateCard,
  isMastered,
  isWeak,
  startOfDay,
  weaknessScore,
  type CardState,
  type Rating,
} from "./srs";
import {
  applyStageResult,
  defaultGame,
  hydrateGame,
  type GameSnapshot,
  type GameStageId,
} from "./game";
import { stampRewards } from "./rewards";

type ProgressMap = Record<string, CardState>;
export type FocusMode = "due" | "weak";

export type StudySnapshot = {
  cards: ProgressMap;
  week: number;
  direction: "he-en" | "en-he";
  focus: FocusMode;
  streak: number;
  lastStudyDay: number;
  sessions: number;
  game: GameSnapshot;
};

type StudyState = StudySnapshot & {
  ownerId: string | null;
  rate: (id: string, rating: Rating) => void;
  setWeek: (week: number) => void;
  setDirection: (d: "he-en" | "en-he") => void;
  setFocus: (focus: FocusMode) => void;
  completeGameStage: (
    chapter: number,
    stage: GameStageId,
    result: { stars: number; score: number; firstTryRate: number },
  ) => void;
  hydrateRemote: (snap: StudySnapshot, ownerId: string) => void;
  reset: () => void;
};

function bumpStreak(lastStudyDay: number, streak: number, now: number) {
  const today = startOfDay(now);
  const yesterday = today - 86_400_000;
  if (lastStudyDay === today) return { streak, lastStudyDay };
  if (lastStudyDay === yesterday) return { streak: streak + 1, lastStudyDay: today };
  return { streak: 1, lastStudyDay: today };
}

export const useStudy = create<StudyState>()(
  persist(
    (set, get) => ({
      cards: {},
      week: ALL_GAME_WEEK,
      direction: "he-en",
      focus: "due",
      streak: 0,
      lastStudyDay: 0,
      sessions: 0,
      game: defaultGame(),
      ownerId: null,
      rate: (id, rating) => {
        const now = Date.now();
        const prev = hydrateCard(get().cards[id], now);
        const next = applyRating(prev, rating, now);
        const streakInfo = bumpStreak(get().lastStudyDay, get().streak, now);
        const game = stampRewards(get().game, streakInfo.streak);
        set({
          cards: { ...get().cards, [id]: next },
          ...streakInfo,
          game,
          sessions: get().lastStudyDay === startOfDay(now) ? get().sessions : get().sessions + 1,
        });
      },
      setWeek: (week) => set({ week }),
      setDirection: (direction) => set({ direction }),
      setFocus: (focus) => set({ focus }),
      completeGameStage: (chapter, stage, result) => {
        const now = Date.now();
        const streakInfo = bumpStreak(get().lastStudyDay, get().streak, now);
        const game = stampRewards(applyStageResult(get().game, chapter, stage, result), streakInfo.streak);
        set({
          game,
          ...streakInfo,
          sessions: get().lastStudyDay === startOfDay(now) ? get().sessions : get().sessions + 1,
        });
      },
      hydrateRemote: (snap, ownerId) =>
        set({
          cards: snap.cards,
          week: snap.week,
          direction: snap.direction,
          focus: snap.focus,
          streak: snap.streak,
          lastStudyDay: snap.lastStudyDay,
          sessions: snap.sessions,
          game: stampRewards(hydrateGame(snap.game), snap.streak),
          ownerId,
        }),
      reset: () =>
        set({
          cards: {},
          streak: 0,
          lastStudyDay: 0,
          sessions: 0,
          focus: "due",
          game: defaultGame(),
        }),
    }),
    {
      name: "davar-study-v1",
      skipHydration: true,
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<StudyState>;
        const cards: ProgressMap = {};
        if (p.cards && typeof p.cards === "object") {
          for (const [id, card] of Object.entries(p.cards)) {
            cards[id] = hydrateCard(card);
          }
        }
        return {
          ...current,
          ...p,
          cards: Object.keys(cards).length ? cards : current.cards,
          game: stampRewards(hydrateGame(p.game), Number(p.streak) || 0),
        };
      },
    },
  ),
);

export function snapshotOf(state: StudySnapshot): StudySnapshot {
  return {
    cards: state.cards,
    week: state.week,
    direction: state.direction,
    focus: state.focus,
    streak: state.streak,
    lastStudyDay: state.lastStudyDay,
    sessions: state.sessions,
    game: stampRewards(hydrateGame(state.game), state.streak),
  };
}

export function statsFor(items: VocabItem[], cards: ProgressMap, now = Date.now()) {
  let due = 0;
  let mastered = 0;
  let seen = 0;
  let weak = 0;
  for (const item of items) {
    const c = cards[item.id];
    if (!c) {
      due += 1;
      continue;
    }
    seen += 1;
    if (c.due <= now) due += 1;
    if (isMastered(c)) mastered += 1;
    if (isWeak(c)) weak += 1;
  }
  return { due, mastered, seen, weak, total: items.length };
}

function byWeakness(cards: ProgressMap) {
  return (a: VocabItem, b: VocabItem) => weaknessScore(cards[b.id]) - weaknessScore(cards[a.id]);
}

export function dueQueue(items: VocabItem[], cards: ProgressMap, limit = 15, now = Date.now()) {
  const unseen: VocabItem[] = [];
  const due: VocabItem[] = [];
  for (const item of items) {
    const c = cards[item.id];
    if (!c) unseen.push(item);
    else if (c.due <= now) due.push(item);
  }
  due.sort((a, b) => {
    const weak = byWeakness(cards)(a, b);
    if (weak !== 0) return weak;
    return (cards[a.id].due ?? 0) - (cards[b.id].due ?? 0);
  });
  return [...due, ...shuffle(unseen)].slice(0, limit);
}

/** Missed / lapsing cards first, even if not due yet. */
export function weakQueue(items: VocabItem[], cards: ProgressMap, limit = 18) {
  return items
    .filter((item) => isWeak(cards[item.id]))
    .sort(byWeakness(cards))
    .slice(0, limit);
}

/** Random round: shuffle within weak / due / the rest, then deal `limit` cards. */
export function pickStudyRound(
  pool: VocabItem[],
  cards: ProgressMap,
  focus: FocusMode,
  limit = 18,
  now = Date.now(),
): VocabItem[] {
  if (!pool.length) return [];
  const n = Math.min(limit, pool.length);
  const weak = shuffle(pool.filter((item) => isWeak(cards[item.id])));
  if (focus === "weak" && weak.length) {
    if (weak.length >= n) return weak.slice(0, n);
    const rest = shuffle(pool.filter((item) => !weak.some((w) => w.id === item.id)));
    return shuffle([...weak, ...rest].slice(0, n));
  }
  const weakIds = new Set(weak.map((item) => item.id));
  const due = shuffle(
    pool.filter((item) => {
      if (weakIds.has(item.id)) return false;
      const c = cards[item.id];
      return !c || c.due <= now;
    }),
  );
  const dueIds = new Set(due.map((item) => item.id));
  const rest = shuffle(pool.filter((item) => !weakIds.has(item.id) && !dueIds.has(item.id)));
  return shuffle([...weak, ...due, ...rest].slice(0, n));
}

/** Adaptive: weak cards float to the front of whatever is due. */
export function studyQueue(items: VocabItem[], cards: ProgressMap, limit = 18, now = Date.now()) {
  const weak = weakQueue(items, cards, limit);
  const due = dueQueue(items, cards, limit, now);
  const seen = new Set<string>();
  const out: VocabItem[] = [];
  for (const item of [...weak, ...due]) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    out.push(item);
    if (out.length >= limit) break;
  }
  return out;
}

export function queueForFocus(
  items: VocabItem[],
  cards: ProgressMap,
  focus: FocusMode,
  limit = 18,
  now = Date.now(),
) {
  return pickStudyRound(items, cards, focus, limit, now);
}

export function weakestOf(items: VocabItem[], cards: ProgressMap, n = 5) {
  return weakQueue(items, cards, n);
}

export function weightedQuizDeck(items: VocabItem[], cards: ProgressMap, n = 12): VocabItem[] {
  const bag = items.map((item) => ({ item, w: 0.35 + weaknessScore(cards[item.id]) }));
  const out: VocabItem[] = [];
  while (out.length < Math.min(n, bag.length)) {
    const total = bag.reduce((s, x) => s + x.w, 0);
    let r = Math.random() * total;
    let idx = 0;
    for (; idx < bag.length; idx++) {
      r -= bag[idx].w;
      if (r <= 0) break;
    }
    idx = Math.min(idx, bag.length - 1);
    out.push(bag[idx].item);
    bag.splice(idx, 1);
  }
  return out;
}
