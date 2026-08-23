import { useEffect, useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { BookOpen, CircleHelp, Compass, Crown, House, Languages, Layers, ListChecks, Map, Medal, PenLine, Trophy, Users } from "lucide-react";
import { cn } from "@/lib/cn";
import { snapshotOf, useStudy } from "@/lib/store";
import { loadProgress, saveProgress } from "@/lib/progress";
import { RedirectToSignIn, UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { BrandLockup } from "@/components/brand-lockup";
import { SfxToggle } from "@/components/sfx-toggle";
import { continueTarget } from "@/lib/game";
import { getAdminStatus } from "@/lib/admin";
import { scoreboard } from "@/lib/rewards";
import { HonorBadge, CrownBadge } from "@/components/honor-badge";
import { VisitorBeacon } from "@/components/visitor-beacon";

const STUDY_NAV = [
  { to: "/", label: "Home", icon: House },
  { to: "/drill", label: "Drill", icon: Layers },
  { to: "/write", label: "Write", icon: PenLine },
  { to: "/quiz", label: "Quiz", icon: ListChecks },
  { to: "/browse", label: "Lex", icon: BookOpen },
  { to: "/alphabet", label: "Alef", icon: Languages },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, isPending } = useCurrentUserState();
  const isLogin = pathname === "/login";
  const isGame = pathname.startsWith("/game");
  const userId = user?.id ?? null;
  const [progressReady, setProgressReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const game = useStudy((s) => s.game);
  const streak = useStudy((s) => s.streak);
  const board = scoreboard(game, streak);
  const honor = board.honor;
  const cont = continueTarget(game);

  useEffect(() => {
    if (isLogin || !userId) {
      setProgressReady(false);
      setIsAdmin(false);
      return;
    }
    let cancelled = false;
    let unsub: (() => void) | undefined;
    let timer: number | undefined;

    (async () => {
      let remote: Awaited<ReturnType<typeof loadProgress>> | undefined;
      try {
        remote = await loadProgress();
      } catch {
        remote = undefined;
      }
      if (cancelled) return;

      if (remote) {
        useStudy.getState().hydrateRemote(remote, userId);
      } else if (remote === undefined) {
        await useStudy.persist.rehydrate();
        if (cancelled) return;
        if (useStudy.getState().ownerId !== userId) {
          useStudy.getState().reset();
          useStudy.setState({ ownerId: userId, cards: {}, streak: 0, lastStudyDay: 0, sessions: 0 });
        }
      } else {
        useStudy.getState().reset();
        useStudy.setState({ ownerId: userId, cards: {}, streak: 0, lastStudyDay: 0, sessions: 0 });
        void saveProgress({ data: snapshotOf(useStudy.getState()) }).catch(() => {});
      }

      if (cancelled) return;
      setProgressReady(true);

      void getAdminStatus()
        .then((s) => {
          if (!cancelled) setIsAdmin(s.admin);
        })
        .catch(() => {
          if (!cancelled) setIsAdmin(false);
        });

      unsub = useStudy.subscribe((state) => {
        if (state.ownerId !== userId) return;
        window.clearTimeout(timer);
        timer = window.setTimeout(() => {
          void saveProgress({ data: snapshotOf(state) }).catch(() => {});
        }, 700);
      });
    })();

    return () => {
      cancelled = true;
      unsub?.();
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [isLogin, userId]);

  if (isLogin) {
    return (
      <div className="min-h-dvh text-fg">
        <VisitorBeacon />
        {children}
      </div>
    );
  }

  if (isPending || (user && !progressReady)) {
    return (
      <>
        <VisitorBeacon />
        <ShellSkeleton />
      </>
    );
  }

  if (!user) {
    return (
      <>
        <VisitorBeacon />
        <RedirectToSignIn />
      </>
    );
  }

  return (
    <div className="min-h-dvh text-fg">
      <VisitorBeacon />
      <header className="sticky top-0 z-20 border-b border-border bg-card">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between gap-3 px-4">
          <BrandLockup linked />
          <div className="flex min-w-0 items-center gap-2">
            {isGame ? (
              <Link to="/" className="hidden min-h-11 items-center text-xs font-semibold uppercase tracking-wide text-muted sm:flex">
                Study
              </Link>
            ) : (
              <Link to="/game" className="hidden min-h-11 items-center text-xs font-semibold uppercase tracking-wide text-primary sm:flex">
                Game
              </Link>
            )}
            <Link
              to="/guide"
              aria-label="User guide"
              className={cn(
                "flex size-11 items-center justify-center rounded-[var(--radius-md)]",
                pathname === "/guide" ? "text-primary" : "text-muted",
              )}
            >
              <CircleHelp className="size-5" strokeWidth={pathname === "/guide" ? 2.2 : 1.8} />
            </Link>
            <Link
              to="/challenge"
              aria-label="Ultimate Challenge"
              className={cn(
                "flex size-11 items-center justify-center rounded-[var(--radius-md)]",
                pathname === "/challenge" ? "text-primary" : "text-muted",
              )}
            >
              <Crown className="size-5" strokeWidth={pathname === "/challenge" ? 2.2 : 1.8} />
            </Link>
            <Link
              to="/rewards"
              aria-label="Rewards"
              className={cn(
                "flex size-11 items-center justify-center rounded-[var(--radius-md)]",
                pathname === "/rewards" ? "text-primary" : "text-muted",
              )}
            >
              <Trophy className="size-5" strokeWidth={pathname === "/rewards" ? 2.2 : 1.8} />
            </Link>
            <Link
              to="/leaderboard"
              aria-label="Class leaderboard"
              className={cn(
                "flex size-11 items-center justify-center rounded-[var(--radius-md)]",
                pathname === "/leaderboard" ? "text-primary" : "text-muted",
              )}
            >
              <Medal className="size-5" strokeWidth={pathname === "/leaderboard" ? 2.2 : 1.8} />
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                aria-label="Class roster"
                className={cn(
                  "flex size-11 items-center justify-center rounded-[var(--radius-md)]",
                  pathname === "/admin" ? "text-primary" : "text-muted",
                )}
              >
                <Users className="size-5" strokeWidth={pathname === "/admin" ? 2.2 : 1.8} />
              </Link>
            )}
            <SfxToggle />
            <HonorBadge honor={honor} compact className="hidden max-w-[7.5rem] sm:inline-flex" />
            {board.crown ? <CrownBadge compact className="hidden sm:inline-flex" /> : null}
            <div className="account-chip min-w-0 shrink">
              <UserButton />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 pb-28 pt-6 sm:pb-24">{children}</main>

      {isGame ? (
        <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-card pb-[env(safe-area-inset-bottom)]">
          <ul className="mx-auto grid max-w-3xl grid-cols-3">
            <li>
              <Link
                to="/"
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs font-medium",
                  pathname === "/" ? "text-primary" : "text-muted",
                )}
              >
                <House className="size-5" strokeWidth={pathname === "/" ? 2.2 : 1.8} />
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/game"
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs font-medium",
                  pathname === "/game" || pathname === "/game/" ? "text-primary" : "text-muted",
                )}
              >
                <Map className="size-5" strokeWidth={pathname === "/game" || pathname === "/game/" ? 2.2 : 1.8} />
                Map
              </Link>
            </li>
            <li>
              <Link
                to="/game/$chapter/$stage"
                params={{ chapter: String(cont.chapter), stage: cont.stage }}
                className="flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs font-medium text-primary"
              >
                <Compass className="size-5" strokeWidth={2.2} />
                Continue
              </Link>
            </li>
          </ul>
        </nav>
      ) : (
        <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-card pb-[env(safe-area-inset-bottom)]">
          <ul className="mx-auto grid max-w-3xl grid-cols-6">
            {STUDY_NAV.map((item) => {
              const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
              const Icon = item.icon;
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className={cn(
                      "flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs font-medium",
                      active ? "text-primary" : "text-muted",
                    )}
                  >
                    <Icon className="size-5" strokeWidth={active ? 2.2 : 1.8} />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </div>
  );
}

function ShellSkeleton() {
  return (
    <div className="min-h-dvh text-fg">
      <header className="sticky top-0 z-20 border-b border-border bg-card">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <BrandLockup />
          <div className="h-8 w-8 animate-pulse rounded-full bg-surface" />
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl px-4 pt-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">HaDay · Hebraic Mentor</p>
        <div className="mt-3 h-10 w-2/3 animate-pulse rounded-[var(--radius-md)] bg-surface/80" />
        <div className="mt-3 h-16 animate-pulse rounded-[var(--radius-lg)] bg-surface/80" />
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div className="h-20 animate-pulse rounded-[var(--radius-lg)] bg-surface/80" />
          <div className="h-20 animate-pulse rounded-[var(--radius-lg)] bg-surface/80" />
          <div className="h-20 animate-pulse rounded-[var(--radius-lg)] bg-surface/80" />
          <div className="h-20 animate-pulse rounded-[var(--radius-lg)] bg-surface/80" />
        </div>
      </main>
    </div>
  );
}
