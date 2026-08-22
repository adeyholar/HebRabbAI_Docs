import { createFileRoute, Link } from "@tanstack/react-router";
import { Compass, Library } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WeekSelect } from "@/components/week-select";
import { FocusToggle } from "@/components/focus-toggle";
import { Panel } from "@/components/panel";
import { GameContinue } from "@/components/game-continue";
import { RewardsBar } from "@/components/rewards-bar";
import { COURSE_WEEKS, VOCAB, itemsForWeek } from "@/lib/vocab";
import { statsFor, useStudy, weakestOf } from "@/lib/store";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { continueLabel } from "@/lib/game";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const user = useCurrentUser();
  const week = useStudy((s) => s.week);
  const cards = useStudy((s) => s.cards);
  const streak = useStudy((s) => s.streak);
  const game = useStudy((s) => s.game);
  const setFocus = useStudy((s) => s.setFocus);
  const reset = useStudy((s) => s.reset);
  const items = itemsForWeek(week);
  const s = statsFor(items, cards);
  const all = statsFor(VOCAB, cards);
  const meta = COURSE_WEEKS.find((w) => w.week === week)!;
  const pct = s.total ? Math.round((s.mastered / s.total) * 100) : 0;
  const weakList = weakestOf(items, cards, 5);
  const firstName = user?.displayName?.split(" ")[0];

  return (
    <>
      <Panel className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">HaDay · Hebraic Mentor</p>
        <h1 className="mt-1 font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          {firstName ? `${firstName}, learn the words that open the text.` : "Learn the words that open the text."}
        </h1>
        <p className="mt-3 max-w-prose text-muted">
          Game mode is a gated chapter path. Study mode is the free toolbox — drill, write, quiz, lex, alef.{" "}
          <Link to="/guide" className="font-semibold text-primary">
            How to use HaDay
          </Link>
        </p>
      </Panel>

      <div className="grid gap-3 sm:grid-cols-2">
        <Link
          to="/game"
          className="rounded-[var(--radius-xl)] bg-primary p-5 text-primary-foreground shadow-[var(--shadow-border)]"
        >
          <Compass className="size-6" />
          <p className="mt-3 font-display text-3xl font-bold">Game mode</p>
          <p className="mt-1 text-sm text-primary-foreground/80">Chapter = level. Four stages. One Continue.</p>
        </Link>
        <a
          href="#study-mode"
          className="rounded-[var(--radius-xl)] bg-card p-5 text-ink shadow-[var(--shadow-border)]"
        >
          <Library className="size-6 text-primary" />
          <p className="mt-3 font-display text-3xl font-bold">Study mode</p>
          <p className="mt-1 text-sm text-muted">Drill, write, quiz, lex, and alef — as they are.</p>
        </a>
      </div>

      <div className="mt-3">
        <GameContinue />
        <p className="sr-only">{continueLabel(game)}</p>
      </div>

      <div className="mt-3">
        <RewardsBar />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="Due" value={s.due} />
        <Stat label="Weak" value={s.weak} />
        <Stat label="Mastered" value={`${s.mastered}/${s.total}`} />
        <Stat label="Streak" value={`${streak}d`} />
      </div>

      <div id="study-mode" className="scroll-mt-20">
      {weakList.length > 0 && (
        <section className="mt-4 rounded-[var(--radius-xl)] bg-card p-5 shadow-[var(--shadow-border)]">
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="font-display text-xl font-semibold">Needs work</h2>
            <button
              type="button"
              className="text-sm font-medium text-primary"
              onClick={() => setFocus("weak")}
            >
              Focus these
            </button>
          </div>
          <ul className="mt-3 divide-y divide-border">
            {weakList.map((item) => {
              const c = cards[item.id];
              const misses = c?.misses ?? 0;
              return (
                <li key={item.id} className="flex items-center justify-between gap-3 py-2">
                  <div className="min-w-0">
                    <p className="he-word text-xl leading-tight">{item.hebrew}</p>
                    <p className="truncate text-sm text-muted">{item.gloss}</p>
                  </div>
                  <span className="shrink-0 text-xs tabular-nums text-danger">
                    {misses} miss{misses === 1 ? "" : "es"}
                  </span>
                </li>
              );
            })}
          </ul>
          <div className="mt-3 flex gap-2">
            <Link to="/drill" className="flex-1">
              <Button className="w-full" size="sm" onClick={() => setFocus("weak")}>
                Drill weak
              </Button>
            </Link>
            <Link to="/write" search={{ mode: "memorize" }} className="flex-1">
              <Button className="w-full" size="sm" variant="outline" onClick={() => setFocus("weak")}>
                Memorize weak
              </Button>
            </Link>
          </div>
        </section>
      )}

      <div className="mt-4 rounded-[var(--radius-xl)] bg-card p-5 shadow-[var(--shadow-border)]">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-primary">Study toolbox</p>
        <WeekSelect />
        <FocusToggle />
        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <span className="text-muted">{meta.hint}</span>
            <span className="tabular-nums text-fg">{pct}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-surface">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-[var(--motion-fast)]"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
        <div className="mt-5 flex flex-col gap-2">
          <Link to="/drill" className="flex-1">
            <Button className="w-full" size="lg">
              Study due cards
            </Button>
          </Link>
          <div className="grid grid-cols-2 gap-2">
            <Link to="/write" search={{ mode: "write" }}>
              <Button className="w-full" variant="outline" size="lg">
                Write
              </Button>
            </Link>
            <Link to="/write" search={{ mode: "memorize" }}>
              <Button className="w-full" variant="outline" size="lg">
                Memorize + Write
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <section className="mt-8">
        <Panel>
          <h2 className="font-display text-xl font-bold text-ink">Course map</h2>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {COURSE_WEEKS.map((w) => {
            const st = statsFor(itemsForWeek(w.week), cards);
            const active = w.week === week;
            return (
              <li key={w.week}>
                <button
                  type="button"
                  onClick={() => useStudy.getState().setWeek(w.week)}
                  className={`w-full rounded-[var(--radius-lg)] p-4 text-left shadow-[var(--shadow-border)] ${
                    active ? "bg-primary text-primary-foreground" : "bg-surface"
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-sm font-semibold">
                      {w.label}
                      {(w.week === 7 || w.week === 15) && (
                        <span className={`ms-2 text-xs font-medium uppercase tracking-wide ${active ? "text-primary-foreground/70" : "text-primary"}`}>
                          {w.week === 7 ? "Midterm" : "Final"}
                        </span>
                      )}
                    </span>
                    <span className={`text-xs tabular-nums ${active ? "text-primary-foreground/80" : "text-muted"}`}>
                      {st.mastered}/{st.total}
                      {st.weak ? ` · ${st.weak} weak` : ""}
                    </span>
                  </div>
                  <p className={`mt-1 text-sm ${active ? "text-primary-foreground/80" : "text-muted"}`}>{w.hint}</p>
                </button>
              </li>
            );
          })}
          </ul>
        </Panel>
      </section>

      <Panel className="mt-8">
        <p className="text-xs text-muted">
          Full lexicon {VOCAB.length} lemmas · {all.mastered} mastered · {all.weak} weak overall. High-frequency Biblical
          Hebrew with standard dictionary glosses — a study companion, not a reprint of any textbook list. Progress is
          saved to this account.
        </p>
        <button
          type="button"
          className="mt-3 min-h-11 text-xs font-medium text-muted underline-offset-2 hover:underline"
          onClick={() => {
            if (confirm("Reset all progress on this account?")) reset();
          }}
        >
          Reset account progress
        </button>
      </Panel>
      </div>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[var(--radius-lg)] bg-card px-3 py-3 shadow-[var(--shadow-border)]">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-0.5 font-sans text-2xl font-bold tabular-nums text-ink">{value}</p>
    </div>
  );
}
