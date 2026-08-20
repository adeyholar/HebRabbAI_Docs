import { useEffect, useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { BookOpen, House, Languages, Layers, ListChecks, PenLine } from "lucide-react";
import { cn } from "@/lib/cn";
import { snapshotOf, useStudy } from "@/lib/store";
import { loadProgress, saveProgress } from "@/lib/progress";
import { RedirectToSignIn, UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { BrandLockup } from "@/components/brand-lockup";

const NAV = [
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
  const userId = user?.id ?? null;
  const [progressReady, setProgressReady] = useState(false);

  useEffect(() => {
    if (isLogin || !userId) {
      setProgressReady(false);
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
    return <div className="min-h-dvh text-fg">{children}</div>;
  }

  if (isPending || (user && !progressReady)) {
    return <ShellSkeleton />;
  }

  if (!user) return <RedirectToSignIn />;

  return (
    <div className="min-h-dvh text-fg">
      <header className="sticky top-0 z-20 border-b border-border bg-card">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between gap-3 px-4">
          <BrandLockup linked />
          <div className="account-chip min-w-0 shrink">
            <UserButton />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 pb-28 pt-6 sm:pb-24">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-card pb-[env(safe-area-inset-bottom)]">
        <ul className="mx-auto grid max-w-3xl grid-cols-6">
          {NAV.map((item) => {
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
