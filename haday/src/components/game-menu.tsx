import { useNavigate, useRouterState } from "@tanstack/react-router";

const OPTIONS = [
  { value: "/game", match: (p: string) => p === "/game" || /^\/game\/\d+/.test(p), label: "BBH vocabulary" },
  { value: "/game/alefbet", match: (p: string) => p.startsWith("/game/alefbet"), label: "Aleph-bet mastery" },
  { value: "/game/syllables", match: (p: string) => p.startsWith("/game/syllables"), label: "Syllables" },
  { value: "/game/nouns", match: (p: string) => p.startsWith("/game/nouns"), label: "Nouns" },
  { value: "/challenge", match: (p: string) => p.startsWith("/challenge"), label: "Ultimate Challenge" },
] as const;

export function GameMenu() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const current = OPTIONS.find((o) => o.match(pathname))?.value ?? "/game";

  return (
    <label className="block">
      <span className="block font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">Game</span>
      <select
        className="mt-3 min-h-12 w-full rounded-[var(--radius-md)] bg-card px-3 text-base font-semibold text-ink shadow-[var(--shadow-border)]"
        value={current}
        onChange={(e) => {
          const to = e.target.value;
          if (to === "/game") void navigate({ to: "/game" });
          else if (to === "/game/alefbet") void navigate({ to: "/game/alefbet" });
          else if (to === "/game/syllables") void navigate({ to: "/game/syllables" });
          else if (to === "/game/nouns") void navigate({ to: "/game/nouns" });
          else if (to === "/challenge") void navigate({ to: "/challenge" });
        }}
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
