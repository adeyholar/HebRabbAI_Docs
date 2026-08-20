import type { VocabItem } from "./vocab";
import type { FocusMode } from "./store";
import { queueForFocus } from "./store";
import type { Rating } from "./srs";

export type DrillRound = {
  items: VocabItem[];
  pos: number;
  done: string[];
};

export function buildRound(
  pool: VocabItem[],
  cards: Parameters<typeof queueForFocus>[1],
  focus: FocusMode,
  limit = 18,
): VocabItem[] {
  if (!pool.length) return [];
  const first = queueForFocus(pool, cards, focus, limit);
  const seen = new Set(first.map((item) => item.id));
  const rest = pool.filter((item) => !seen.has(item.id));
  return [...first, ...rest].slice(0, Math.min(limit, pool.length));
}

export function nextOpen(from: number, items: VocabItem[], done: ReadonlySet<string>): number {
  if (!items.length) return -1;
  if (done.size >= items.length) return -1;
  for (let step = 1; step <= items.length; step++) {
    const j = (from + step) % items.length;
    const item = items[j];
    if (item && !done.has(item.id)) return j;
  }
  return -1;
}

export function applyDrillGrade(round: DrillRound, rating: Rating): DrillRound {
  const doneSet = new Set(round.done);
  let pos = round.pos;
  let cur = round.items[pos];
  if (!cur || doneSet.has(cur.id)) {
    pos = nextOpen(pos < 0 ? 0 : pos, round.items, doneSet);
    if (pos < 0) return { ...round, pos: -1 };
    cur = round.items[pos];
  }
  if (!cur) return { ...round, pos: -1 };
  if (rating === "again") {
    const next = nextOpen(pos, round.items, doneSet);
    return { ...round, pos: next < 0 ? pos : next };
  }
  doneSet.add(cur.id);
  const next = nextOpen(pos, round.items, doneSet);
  return { items: round.items, pos: next, done: [...doneSet] };
}

export function isRoundFinished(round: DrillRound): boolean {
  if (!round.items.length) return true;
  return round.done.length >= round.items.length || round.pos < 0;
}

export function currentItem(round: DrillRound): VocabItem | undefined {
  if (isRoundFinished(round)) return undefined;
  const at = round.items[round.pos];
  if (at && !round.done.includes(at.id)) return at;
  const idx = nextOpen(round.pos < 0 ? 0 : round.pos, round.items, new Set(round.done));
  if (idx < 0) return undefined;
  return round.items[idx];
}
