import { createFileRoute, Link } from "@tanstack/react-router";
import { Compass, Library } from "lucide-react";
import { Panel } from "@/components/panel";

export const Route = createFileRoute("/guide")({ component: GuidePage });

function GuidePage() {
  return (
    <>
      <Panel className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">HaDay · Hebraic Mentor</p>
        <h1 className="mt-1 font-display text-4xl font-bold tracking-tight text-ink">How to use HaDay</h1>
        <p className="mt-3 max-w-prose text-muted">
          HaDay drills first-year Biblical Hebrew vocabulary from{" "}
          <em>Basics of Biblical Hebrew</em> (3rd ed.). Sign in so your game path and study
          scores stay with your account.
        </p>
      </Panel>

      <Panel className="mb-3">
        <h2 className="font-display text-2xl font-bold text-ink">Two modes</h2>
        <ul className="mt-3 space-y-3 text-sm text-muted">
          <li>
            <Link to="/game" className="inline-flex items-center gap-1.5 font-semibold text-primary">
              <Compass className="size-4" />
              Game mode
            </Link>
            <span className="text-ink"> — </span>
            one path through chapters 1–19. Stages unlock in order. Use Continue.
          </li>
          <li>
            <Link to="/" hash="study-mode" className="inline-flex items-center gap-1.5 font-semibold text-primary">
              <Library className="size-4" />
              Study mode
            </Link>
            <span className="text-ink"> — </span>
            pick a course week or a Game chapter — same BBH 3rd-ed. lemmas as Game — then Drill, Write, Quiz, or Lex.
            Closed-book Exam is from memory; misses lead the next Write and Quiz rounds.
          </li>
        </ul>
      </Panel>

      <Panel className="mb-3">
        <h2 className="font-display text-2xl font-bold text-ink">Game stages</h2>
        <p className="mt-2 text-sm text-muted">Clear all four to unlock the next chapter. Chapter 1 starts open.</p>
        <ol className="mt-3 space-y-2 text-sm">
          <Stage n="1" name="Recognize" body="Hebrew on the card. Pick the English gloss." />
          <Stage n="2" name="Gloss" body="Read the Hebrew. Type the English meaning." />
          <Stage
            n="3"
            name="Spell · lenient"
            body="Type the Hebrew with vowels. A Tanakh verse is shown — tap the card for English."
          />
          <Stage
            n="4"
            name="Spell · strict"
            body="Same typing, but the verse is hidden so you cannot copy from it."
          />
        </ol>
      </Panel>

      <Panel className="mb-3">
        <h2 className="font-display text-2xl font-bold text-ink">Typing Hebrew</h2>
        <p className="mt-2 text-sm text-muted">Use the on-screen pad. Keys show the letter only — no English names.</p>
        <ol className="mt-3 list-decimal space-y-2 ps-5 text-sm text-ink">
          <li>Tap a consonant, then the vowel that sits on it.</li>
          <li>
            Shin and sin are separate keys: <span className="he-word text-xl">שׁ</span> and{" "}
            <span className="he-word text-xl">שׂ</span>.
          </li>
          <li>
            Dagesh is the dotted-circle key <span className="he-word text-xl">◌ּ</span> — tap it after the letter.
          </li>
          <li>
            Final forms <span className="he-word text-xl">ך ם ן ף ץ</span> must be used at the end of a word.
            A regular letter there is marked wrong.
          </li>
          <li>
            Shureq is its own key <span className="he-word text-xl">וּ</span>. Qibbuts{" "}
            <span className="he-word text-xl">◌ֻ</span> counts as the same vowel.
          </li>
        </ol>
      </Panel>

      <Panel className="mb-3">
        <h2 className="font-display text-2xl font-bold text-ink">What counts as correct</h2>
        <ul className="mt-3 list-disc space-y-2 ps-5 text-sm text-ink">
          <li>Every consonant needs its own vowel — even on lenient.</li>
          <li>
            Patah <span className="he-word text-xl">◌ַ</span> is not qamets{" "}
            <span className="he-word text-xl">◌ָ</span>. Tsere{" "}
            <span className="he-word text-xl">◌ֵ</span> is not hireq{" "}
            <span className="he-word text-xl">◌ִ</span>.
          </li>
          <li>
            Some cards accept a listed alternate (plene/defective, a feminine form, or a known
            pointing of a name).
          </li>
          <li>
            If consonants are right but pointing is off, you will see:{" "}
            <span className="italic text-muted">Consonants are right — check vowels, dagesh, and dots.</span>
          </li>
        </ul>
      </Panel>

      <Panel className="mb-3">
        <h2 className="font-display text-2xl font-bold text-ink">Study toolbox</h2>
        <dl className="mt-3 space-y-3 text-sm">
          <Tool name="Drill" to="/drill" body="Flip cards. Grade yourself. SRS brings weak words back." />
          <Tool name="Write" to="/write" body="Type or hand-write the Hebrew. Memorize mode hides the lemma first." />
          <Tool name="Quiz" to="/quiz" body="Multiple choice or type the English gloss." />
          <Tool name="Lex" to="/browse" body="Browse the week’s lemmas with verses." />
          <Tool name="Alef" to="/alphabet" body="Letters, vowel charts, and quizzes — including shewa and shureq." />
        </dl>
        <p className="mt-4 text-sm text-muted">
          On Home, pick a course week before you drill. Weak cards can be focused from the Needs work list.
        </p>
      </Panel>

      <Panel className="mb-3">
        <h2 className="font-display text-2xl font-bold text-ink">Rewards</h2>
        <ul className="mt-3 list-disc space-y-2 ps-5 text-sm text-ink">
          <li>Daily flame: study or play at least once a calendar day. Miss a day and it resets to 1.</li>
          <li>Win streak: consecutive game stages you clear. A poor replay can break it.</li>
          <li>Ladder: each BBH chapter is a rung. Clear all four stages to climb. 19 is the summit.</li>
          <li>Honor rank: Hearer → Catechumen → … → Masorete. It sits beside your name and on the class board. Clear a chapter to rise.</li>
        </ul>
        <p className="mt-3 text-sm">
          <Link to="/rewards" className="font-semibold text-primary">
            See your rewards
          </Link>
        </p>
      </Panel>

      <Panel>
        <h2 className="font-display text-2xl font-bold text-ink">Sound and save</h2>
        <ul className="mt-3 list-disc space-y-2 ps-5 text-sm text-ink">
          <li>The speaker in the header turns correct / incorrect sounds on or off.</li>
          <li>Progress saves to your signed-in account and survives a refresh.</li>
        </ul>
        <p className="mt-4 text-sm">
          <Link to="/game" className="font-semibold text-primary">
            Start Game mode
          </Link>
          <span className="text-muted"> · </span>
          <Link to="/" className="font-semibold text-primary">
            Back home
          </Link>
        </p>
      </Panel>
    </>
  );
}

function Stage({ n, name, body }: { n: string; name: string; body: string }) {
  return (
    <li className="rounded-[var(--radius-md)] bg-surface/80 px-3 py-2.5">
      <p className="font-semibold text-ink">
        <span className="tabular-nums text-primary">{n}.</span> {name}
      </p>
      <p className="mt-0.5 text-muted">{body}</p>
    </li>
  );
}

function Tool({ name, to, body }: { name: string; to: "/drill" | "/write" | "/quiz" | "/browse" | "/alphabet"; body: string }) {
  return (
    <div>
      <dt>
        <Link to={to} className="font-semibold text-primary">
          {name}
        </Link>
      </dt>
      <dd className="text-muted">{body}</dd>
    </div>
  );
}
