import { findHitRange } from "@/lib/hebrew";
import { verseFor } from "@/lib/verses";
import type { VocabItem } from "@/lib/vocab";

export function VerseCard({ item, showEnglish = true }: { item: VocabItem; showEnglish?: boolean }) {
  const verse = item?.id ? verseFor(item.id) : undefined;
  if (!verse?.he) return null;
  const range = findHitRange(verse.he, verse.hit ?? "");

  return (
    <figure className="mt-4 rounded-[var(--radius-lg)] bg-surface/80 px-4 py-3 text-start shadow-[var(--shadow-border)]">
      <figcaption className="text-xs font-semibold uppercase tracking-wide text-muted">
        In the Tanakh · {verse.ref}
      </figcaption>
      {!showEnglish && (
        <p className="mt-1 text-xs font-normal text-muted">Hebrew only — tap the card to reveal English.</p>
      )}
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
      {showEnglish && <p className="mt-2 text-sm text-muted">{verse.en}</p>}
    </figure>
  );
}
