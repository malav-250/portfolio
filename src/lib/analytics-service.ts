import { query } from "./db";
import type {
  ResumeClickStats,
  SessionRow,
  TopPage,
  UniqueVisitorsByDay,
} from "@/types/analytics";

// All DB access for the analytics system lives here.
// Routes call these functions; never raw SQL inside route handlers.

// ─── Visitors ────────────────────────────────────────────────────

/**
 * Find or create a visitor for `ip`. Dedupes within the same calendar day:
 * the same IP visiting twice today reuses the existing visitor row.
 */
export async function upsertVisitorByIp(
  ip: string,
  city: string | null,
  region: string | null,
  country: string | null,
  org: string | null
): Promise<string> {
  const existing = await query<{ id: string }>(
    `SELECT id FROM visitors
     WHERE ip = $1 AND created_at::date = CURRENT_DATE
     ORDER BY created_at DESC
     LIMIT 1`,
    [ip]
  );
  if (existing.length > 0) return existing[0].id;

  const inserted = await query<{ id: string }>(
    `INSERT INTO visitors (ip, city, region, country, org)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id`,
    [ip, city, region, country, org]
  );
  return inserted[0].id;
}

// ─── Sessions ────────────────────────────────────────────────────

export async function createSession(visitorId: string): Promise<string> {
  const rows = await query<{ id: string }>(
    `INSERT INTO sessions (visitor_id) VALUES ($1) RETURNING id`,
    [visitorId]
  );
  return rows[0].id;
}

/**
 * Finalize a session. Bounce = 1 page view AND duration < 10s.
 */
export async function endSession(
  sessionId: string,
  durationSeconds: number
): Promise<void> {
  await query(
    `UPDATE sessions
     SET ended_at = NOW(),
         duration_seconds = GREATEST(COALESCE(duration_seconds, 0), $2),
         is_bounce = (
           (SELECT COUNT(*) FROM page_views WHERE session_id = $1) <= 1
           AND $2 < 10
         )
     WHERE id = $1`,
    [sessionId, durationSeconds]
  );
}

// ─── Page views ──────────────────────────────────────────────────

/**
 * Insert a page view, or return the existing row if this session already
 * recorded this path (e.g. rapid SPA route bounces).
 */
export async function upsertPageView(
  sessionId: string,
  path: string,
  referrer: string | null
): Promise<string> {
  const existing = await query<{ id: string }>(
    `SELECT id FROM page_views
     WHERE session_id = $1 AND path = $2
     ORDER BY viewed_at DESC
     LIMIT 1`,
    [sessionId, path]
  );
  if (existing.length > 0) return existing[0].id;

  const inserted = await query<{ id: string }>(
    `INSERT INTO page_views (session_id, path, referrer)
     VALUES ($1, $2, $3)
     RETURNING id`,
    [sessionId, path, referrer]
  );
  return inserted[0].id;
}

/**
 * Update time spent + max scroll for a session/path. Uses GREATEST so late-
 * arriving beacon updates can only ever increase the recorded values
 * (avoids regressions from out-of-order requests).
 */
export async function updatePageDuration(
  sessionId: string,
  path: string,
  timeSpentSeconds: number,
  maxScrollPct: number
): Promise<void> {
  await query(
    `UPDATE page_views
     SET time_spent_seconds = GREATEST(COALESCE(time_spent_seconds, 0), $3),
         max_scroll_pct = GREATEST(COALESCE(max_scroll_pct, 0), $4)
     WHERE id = (
       SELECT id FROM page_views
       WHERE session_id = $1 AND path = $2
       ORDER BY viewed_at DESC
       LIMIT 1
     )`,
    [sessionId, path, timeSpentSeconds, maxScrollPct]
  );
}

// ─── Events ──────────────────────────────────────────────────────

export async function recordEvent(
  sessionId: string,
  eventType: string,
  metadata: Record<string, unknown> | null
): Promise<void> {
  await query(
    `INSERT INTO events (session_id, event_type, metadata)
     VALUES ($1, $2, $3::jsonb)`,
    [sessionId, eventType, metadata ? JSON.stringify(metadata) : null]
  );
}

// ─── Admin aggregations ──────────────────────────────────────────

export async function getRecentSessions(limit = 50): Promise<SessionRow[]> {
  const rows = await query<SessionRow>(
    `SELECT
       s.id            AS session_id,
       v.ip            AS ip,
       v.org           AS org,
       v.country       AS country,
       v.city          AS city,
       s.duration_seconds,
       s.is_bounce,
       (SELECT COUNT(*)::int FROM page_views pv WHERE pv.session_id = s.id) AS page_count,
       s.started_at::text AS started_at
     FROM sessions s
     JOIN visitors v ON v.id = s.visitor_id
     ORDER BY s.started_at DESC
     LIMIT $1`,
    [limit]
  );
  return rows;
}

export async function getTopPages(limit = 10): Promise<TopPage[]> {
  const rows = await query<TopPage>(
    `SELECT
       path,
       COUNT(*)::int AS views,
       AVG(NULLIF(time_spent_seconds, 0))::int AS avg_time_spent
     FROM page_views
     GROUP BY path
     ORDER BY views DESC
     LIMIT $1`,
    [limit]
  );
  return rows;
}

export async function getResumeClickStats(): Promise<ResumeClickStats> {
  // Single conditional-aggregation pass — avoids the reserved keyword "window"
  // and is faster than UNION ALL + GROUP BY.
  const rows = await query<{ last_7: number; last_30: number }>(
    `SELECT
       COUNT(*) FILTER (WHERE occurred_at >= NOW() - INTERVAL '7 days')::int  AS last_7,
       COUNT(*) FILTER (WHERE occurred_at >= NOW() - INTERVAL '30 days')::int AS last_30
     FROM events
     WHERE event_type = 'resume_click'`
  );
  return {
    last7Days: rows[0]?.last_7 ?? 0,
    last30Days: rows[0]?.last_30 ?? 0,
  };
}

export async function getUniqueVisitorsByDay(
  days = 14
): Promise<UniqueVisitorsByDay[]> {
  // Multiplying INTERVAL '1 day' by an integer is the cleanest way to
  // build a parameterized interval — no string concat, no cast gymnastics.
  const rows = await query<UniqueVisitorsByDay>(
    `SELECT
       to_char(date_trunc('day', created_at), 'YYYY-MM-DD') AS date,
       COUNT(DISTINCT id)::int AS count
     FROM visitors
     WHERE created_at >= NOW() - (INTERVAL '1 day' * $1::int)
     GROUP BY 1
     ORDER BY 1 ASC`,
    [days]
  );
  return rows;
}

export async function getTotals(): Promise<{
  totalVisitors: number;
  totalSessions: number;
}> {
  const rows = await query<{ total_visitors: number; total_sessions: number }>(
    `SELECT
       (SELECT COUNT(*)::int FROM visitors) AS total_visitors,
       (SELECT COUNT(*)::int FROM sessions) AS total_sessions`
  );
  return {
    totalVisitors: rows[0]?.total_visitors ?? 0,
    totalSessions: rows[0]?.total_sessions ?? 0,
  };
}
