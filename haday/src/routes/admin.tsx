import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Panel } from "@/components/panel";
import { getAdminStatus, listRoster, type RosterPerson } from "@/lib/admin";
import { listVisits, countryLabel, type VisitStats } from "@/lib/visits";

export const Route = createFileRoute("/admin")({ component: AdminPage });

function fmt(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function shortId(id: string): string {
  return id.replace(/-/g, "").slice(0, 6);
}

function AdminPage() {
  const [admin, setAdmin] = useState<boolean | null>(null);
  const [people, setPeople] = useState<RosterPerson[] | null>(null);
  const [visits, setVisits] = useState<VisitStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const status = await getAdminStatus();
        if (cancelled) return;
        setAdmin(status.admin);
        if (!status.admin) return;
        const [rows, traffic] = await Promise.all([listRoster(), listVisits()]);
        if (cancelled) return;
        setPeople(rows);
        setVisits(traffic);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Could not load roster.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <Panel>
        <h1 className="font-display text-3xl font-bold text-ink">Class roster</h1>
        <p className="mt-2 text-sm text-danger">{error}</p>
      </Panel>
    );
  }

  if (admin === false) {
    return (
      <Panel>
        <h1 className="font-display text-3xl font-bold text-ink">Class roster</h1>
        <p className="mt-3 text-sm text-muted">
          This page is only for the course owner. Classmates cannot see who else signed in.
        </p>
        <p className="mt-3 text-sm">
          <Link to="/" className="font-semibold text-primary">
            Back home
          </Link>
        </p>
      </Panel>
    );
  }

  if (admin === null || people === null) {
    return (
      <Panel>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">HaDay · Owner</p>
        <h1 className="mt-1 font-display text-3xl font-bold text-ink">Class roster</h1>
        <p className="mt-3 text-sm text-muted">Loading sign-ins…</p>
      </Panel>
    );
  }

  const anon = visits?.recentAnon ?? [];

  return (
    <>
      <Panel className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">HaDay · Owner</p>
        <h1 className="mt-1 font-display text-4xl font-bold tracking-tight text-ink">Class roster</h1>
        <p className="mt-3 max-w-prose text-sm text-muted">
          {people.length} account{people.length === 1 ? "" : "s"}. Name and email come from sign-in.
          Last login is the most recent session; last study is when they saved progress.
        </p>
      </Panel>

      {visits && (
        <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat label="Unique browsers" value={String(visits.unique)} />
          <Stat label="Did not sign in" value={String(visits.anonymous)} />
          <Stat label="Signed in later" value={String(visits.signedIn)} />
          <Stat label="Page hits" value={String(visits.hits)} />
        </div>
      )}

      <Panel className="mb-4">
        <h2 className="font-display text-2xl font-bold text-ink">Visitors who did not sign in</h2>
        <p className="mt-1 text-sm text-muted">
          Anonymous browsers on the login page or the site. No names or emails — a cookie id only.
          Country is from the first request (Vercel / edge), owner-only.
        </p>
        {(visits?.countries.length ?? 0) > 0 && (
          <ul className="mt-3 flex flex-wrap gap-2">
            {visits!.countries.map((c) => (
              <li
                key={c.code}
                className="rounded-[var(--radius-md)] bg-surface px-2.5 py-1 text-sm text-ink shadow-[var(--shadow-border)]"
              >
                <span className="font-semibold">{countryLabel(c.code) || c.code}</span>
                <span className="ms-1.5 tabular-nums text-muted">{c.n}</span>
              </li>
            ))}
          </ul>
        )}
        {anon.length === 0 ? (
          <p className="mt-3 text-sm text-muted">None yet. New visits to the login page will show here.</p>
        ) : (
          <ul className="mt-3 divide-y divide-border">
            {anon.map((v) => (
              <li key={v.id} className="flex items-baseline justify-between gap-3 py-2.5 text-sm">
                <span className="min-w-0">
                  <span className="font-semibold text-ink">Visitor {shortId(v.id)}</span>
                  <span className="ms-2 text-muted">
                    {countryLabel(v.country) || "country unknown"}
                    {v.device ? ` · ${v.device}` : ""}
                    {` · ${v.lastPath}`}
                    {` · ${v.hits} hit${v.hits === 1 ? "" : "s"}`}
                  </span>
                </span>
                <span className="shrink-0 whitespace-nowrap text-muted">{fmt(v.lastSeen)}</span>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <div className="overflow-x-auto rounded-[var(--radius-xl)] bg-card shadow-[var(--shadow-border)]">
        <table className="w-full min-w-[36rem] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">Signed up</th>
              <th className="px-4 py-3 font-semibold">Last login</th>
              <th className="px-4 py-3 font-semibold">Last study</th>
              <th className="px-4 py-3 font-semibold tabular-nums">Streak</th>
            </tr>
          </thead>
          <tbody>
            {people.map((p) => (
              <tr key={p.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-medium text-ink">{p.name || "—"}</td>
                <td className="px-4 py-3 text-muted">{p.email || "—"}</td>
                <td className="px-4 py-3 whitespace-nowrap text-muted">{fmt(p.signedUp)}</td>
                <td className="px-4 py-3 whitespace-nowrap text-muted">{fmt(p.lastLogin)}</td>
                <td className="px-4 py-3 whitespace-nowrap text-muted">{fmt(p.lastStudy)}</td>
                <td className="px-4 py-3 tabular-nums text-ink">{p.streak}d</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-xl)] bg-card px-4 py-3 shadow-[var(--shadow-border)]">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 font-display text-3xl font-bold tabular-nums text-ink">{value}</p>
    </div>
  );
}
