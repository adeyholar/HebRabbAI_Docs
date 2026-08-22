import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Panel } from "@/components/panel";
import { getAdminStatus, listRoster, type RosterPerson } from "@/lib/admin";

export const Route = createFileRoute("/admin")({ component: AdminPage });

function fmt(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function AdminPage() {
  const [admin, setAdmin] = useState<boolean | null>(null);
  const [people, setPeople] = useState<RosterPerson[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const status = await getAdminStatus();
        if (cancelled) return;
        setAdmin(status.admin);
        if (!status.admin) return;
        const rows = await listRoster();
        if (cancelled) return;
        setPeople(rows);
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
