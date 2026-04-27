"use client";

import { useEffect, useState } from "react";
import type { AdminStats } from "@/types/analytics";

// Minimal admin dashboard.
// Auth: pass ?secret=YOUR_ADMIN_SECRET in the URL the first time. The page
// stores the secret in localStorage and reuses it for subsequent calls.

const SECRET_KEY = "admin:secret";

export default function AdminPage() {
  const [secret, setSecret] = useState<string | null>(null);
  const [data, setData] = useState<AdminStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Hydrate secret from URL or localStorage on mount.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get("secret");
    const stored = localStorage.getItem(SECRET_KEY);
    const candidate = fromUrl ?? stored;
    if (fromUrl) {
      localStorage.setItem(SECRET_KEY, fromUrl);
      // Clean the URL so the secret isn't visible in tab title / history.
      window.history.replaceState({}, "", "/admin");
    }
    setSecret(candidate);
  }, []);

  useEffect(() => {
    if (!secret) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/admin/stats?secret=${encodeURIComponent(secret)}`,
          { cache: "no-store" }
        );
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error || `HTTP ${res.status}`);
        }
        if (!cancelled) setData(json.data as AdminStats);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [secret]);

  if (!secret) {
    return (
      <main className="min-h-screen bg-background text-text-primary p-8 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
        <p className="text-text-secondary">
          Append <code className="px-1 py-0.5 rounded bg-surface-light text-accent">?secret=YOUR_ADMIN_SECRET</code> to the URL.
        </p>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background text-text-primary p-8 max-w-6xl mx-auto">
        <p className="text-text-secondary">Loading…</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-background text-text-primary p-8 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
        <p className="text-red-400 mb-4">Error: {error}</p>
        <button
          onClick={() => {
            localStorage.removeItem(SECRET_KEY);
            setSecret(null);
          }}
          className="text-sm px-3 py-1.5 rounded border border-border hover:border-accent/50 hover:text-accent transition"
        >
          Clear stored secret
        </button>
      </main>
    );
  }

  if (!data) return null;

  return (
    <main className="min-h-screen bg-background text-text-primary p-6 sm:p-10 max-w-6xl mx-auto">
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">Visitor Analytics</h1>
        <p className="text-text-muted text-sm mt-1">
          Internal dashboard — refreshed on load.
        </p>
      </header>

      {/* Top-level KPIs */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <Stat label="Total Visitors" value={data.totalVisitors} />
        <Stat label="Total Sessions" value={data.totalSessions} />
        <Stat label="Resume clicks (7d)" value={data.resumeClicks.last7Days} />
        <Stat label="Resume clicks (30d)" value={data.resumeClicks.last30Days} />
      </section>

      {/* Unique visitors by day */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-3">Unique visitors — last 14 days</h2>
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="grid grid-cols-[1fr_auto] gap-4 px-4 py-2 bg-surface-light text-xs uppercase tracking-wider text-text-muted">
            <span>Date</span>
            <span>Count</span>
          </div>
          {data.uniqueVisitorsByDay.length === 0 ? (
            <p className="px-4 py-3 text-sm text-text-muted">No data yet.</p>
          ) : (
            data.uniqueVisitorsByDay.map((row) => (
              <div
                key={row.date}
                className="grid grid-cols-[1fr_auto] gap-4 px-4 py-2 border-t border-border text-sm"
              >
                <span className="text-text-secondary">{row.date}</span>
                <span className="font-mono">{row.count}</span>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Top pages */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-3">Top pages</h2>
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="grid grid-cols-[1fr_80px_120px] gap-4 px-4 py-2 bg-surface-light text-xs uppercase tracking-wider text-text-muted">
            <span>Path</span>
            <span className="text-right">Views</span>
            <span className="text-right">Avg time (s)</span>
          </div>
          {data.topPages.length === 0 ? (
            <p className="px-4 py-3 text-sm text-text-muted">No data yet.</p>
          ) : (
            data.topPages.map((row) => (
              <div
                key={row.path}
                className="grid grid-cols-[1fr_80px_120px] gap-4 px-4 py-2 border-t border-border text-sm"
              >
                <span className="font-mono text-xs text-text-secondary truncate">{row.path}</span>
                <span className="text-right">{row.views}</span>
                <span className="text-right text-text-muted">
                  {row.avg_time_spent ?? "—"}
                </span>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Recent sessions */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Recent sessions</h2>
        <div className="rounded-lg border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-light text-xs uppercase tracking-wider text-text-muted">
              <tr>
                <th className="text-left px-4 py-2">Started</th>
                <th className="text-left px-4 py-2">Org</th>
                <th className="text-left px-4 py-2">Location</th>
                <th className="text-left px-4 py-2">IP</th>
                <th className="text-right px-4 py-2">Pages</th>
                <th className="text-right px-4 py-2">Duration</th>
                <th className="text-right px-4 py-2">Bounce</th>
              </tr>
            </thead>
            <tbody>
              {data.recentSessions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-3 text-text-muted">
                    No sessions yet.
                  </td>
                </tr>
              ) : (
                data.recentSessions.map((s) => (
                  <tr key={s.session_id} className="border-t border-border">
                    <td className="px-4 py-2 text-xs text-text-secondary whitespace-nowrap">
                      {formatDate(s.started_at)}
                    </td>
                    <td className="px-4 py-2 truncate max-w-[200px]">
                      {s.org ?? <span className="text-text-muted">—</span>}
                    </td>
                    <td className="px-4 py-2 text-text-secondary whitespace-nowrap">
                      {[s.city, s.country].filter(Boolean).join(", ") || "—"}
                    </td>
                    <td className="px-4 py-2 font-mono text-xs text-text-muted">
                      {s.ip}
                    </td>
                    <td className="px-4 py-2 text-right">{s.page_count}</td>
                    <td className="px-4 py-2 text-right text-text-secondary">
                      {s.duration_seconds != null ? `${s.duration_seconds}s` : "—"}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {s.is_bounce ? (
                        <span className="text-amber-400 text-xs">bounce</span>
                      ) : (
                        <span className="text-emerald-400 text-xs">engaged</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border p-4 bg-surface-light/40">
      <p className="text-[11px] uppercase tracking-wider text-text-muted">
        {label}
      </p>
      <p className="text-2xl font-bold mt-1 font-mono">{value}</p>
    </div>
  );
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return (
      d.toLocaleDateString(undefined, { month: "short", day: "numeric" }) +
      " " +
      d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
    );
  } catch {
    return iso;
  }
}
