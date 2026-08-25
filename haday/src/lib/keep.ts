import { isMastered, isWeak, startOfDay, type CardState } from "@/lib/srs";
import { shuffle, bbhVocab, type VocabItem } from "@/lib/vocab";

export type KeepFace = "he-en" | "en-he";
export type KeepWhy = "due" | "weak" | "cool";

export type KeepCard = VocabItem & { face: KeepFace; why: KeepWhy };

const DAY = 86_400_000;

export function keepStats(cards: Record<string, CardState>, now = Date.now()) {
  const pool = bbhVocab();
  let seen = 0;
  let due = 0;
  let weak = 0;
  let mastered = 0;
  let cooling = 0;
  for (const item of pool) {
    const c = cards[item.id];
    if (!c || c.hits + c.misses === 0) continue;
    seen += 1;
    if (c.due <= now) due += 1;
    if (isWeak(c)) weak += 1;
    if (isMastered(c)) {
      mastered += 1;
      if (c.last > 0 && now - c.last >= 3 * DAY) cooling += 1;
    }
  }
  return { seen, due, weak, mastered, cooling, waiting: due + cooling + weak };
}

export function pickKeepRound(
  cards: Record<string, CardState>,
  limit = 12,
  now = Date.now(),
): KeepCard[] {
  const pool = bbhVocab();
  const seen = pool.filter((item) => {
    const c = cards[item.id];
    return Boolean(c && c.hits + c.misses > 0);
  });
  if (!seen.length) return [];

  const weak: VocabItem[] = [];
  const due: VocabItem[] = [];
  const cool: VocabItem[] = [];
  const rest: VocabItem[] = [];

  for (const item of seen) {
    const c = cards[item.id];
    if (!c) continue;
    if (isWeak(c)) weak.push(item);
    else if (c.due <= now) due.push(item);
    else if (isMastered(c)) cool.push(item);
    else rest.push(item);
  }

  weak.sort((a, b) => (cards[a.id]?.misses ?? 0) - (cards[b.id]?.misses ?? 0)).reverse();
  due.sort((a, b) => (cards[a.id]?.due ?? 0) - (cards[b.id]?.due ?? 0));
  cool.sort((a, b) => (cards[a.id]?.last ?? 0) - (cards[b.id]?.last ?? 0));

  const n = Math.min(limit, seen.length);
  const takeWeak = Math.min(weak.length, Math.max(3, Math.ceil(n * 0.35)));
  const takeDue = Math.min(due.length, Math.max(2, Math.ceil(n * 0.25)));
  const takeCool = Math.min(cool.length, Math.max(4, n - takeWeak - takeDue));

  const picked: Array<{ item: VocabItem; why: KeepWhy }> = [];
  const used = new Set<string>();
  function add(list: VocabItem[], why: KeepWhy, count: number) {
    for (const item of list) {
      if (picked.length >= n) return;
      if (used.has(item.id)) continue;
      if (count <= 0) return;
      used.add(item.id);
      picked.push({ item, why });
      count -= 1;
    }
  }
  add(weak, "weak", takeWeak);
  add(due, "due", takeDue);
  add(cool, "cool", takeCool);
  add(shuffle([...rest, ...due, ...weak, ...cool]), "due", n - picked.length);

  return shuffle(picked).map(({ item, why }, i) => ({
    ...item,
    why,
    face: i % 2 === 0 ? "he-en" : "en-he",
  }));
}

export function keepDoneToday(lastKeepDay: number, now = Date.now()): boolean {
  return lastKeepDay === startOfDay(now) && lastKeepDay > 0;
}
