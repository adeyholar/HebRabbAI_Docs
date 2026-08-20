import { findHitRange } from "@/lib/hebrew";
import { verseFor } from "@/lib/verses";
import type { VocabItem } from "@/lib/vocab";

export function VerseCard({ item }: { item: VocabItem }) {
  const verse = verseFor(item.id);
  if (!verse) return null;
  const range = findHitRange(verse.he, verse.hit);

  return (
    <figure className="mt-4 rounded-[var(--radius-lg)] bg-surface/80 px-4 py-3 text-start shadow-[var(--shadow-border)]">
      <figcaption className="text-xs font-medium uppercase tracking-wide text-muted">In the Tanakh · {verse.ref}</figcaption>
      <p className="he-word mt-2 text-xl leading-relaxed" lang="he">
        {range ? (
          <>
            {verse.he.slice(0, range.start)}
            <mark className="he-hit">{verse.he.slice(range.start, range.end)}</mark>
            {verse.he.slice(range.end)}
          </>
        ) : (
          verse.he
        )}
      </p>
      <p className="mt-2 text-sm text-muted">{verse.en}</p>
    </figure>
  );
}
