// Domain types for visitor analytics. These mirror the Postgres schema
// but expose ISO timestamp strings (the pg client returns Date objects;
// the API layer serializes them to ISO 8601).

export interface Visitor {
  id: string;
  ip: string;
  city: string | null;
  region: string | null;
  country: string | null;
  org: string | null;
  created_at: string;
}

export interface Session {
  id: string;
  visitor_id: string;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
  is_bounce: boolean;
}

export interface PageView {
  id: string;
  session_id: string;
  path: string;
  referrer: string | null;
  time_spent_seconds: number | null;
  max_scroll_pct: number | null;
  viewed_at: string;
}

export interface Event {
  id: string;
  session_id: string;
  event_type: string;
  metadata: Record<string, unknown> | null;
  occurred_at: string;
}

// IP enrichment result from IPinfo (or stub when token absent)
export interface IpEnrichment {
  ip: string;
  city?: string | null;
  region?: string | null;
  country?: string | null;
  org?: string | null;
}

// Admin dashboard payload shapes
export interface SessionRow {
  session_id: string;
  ip: string;
  org: string | null;
  country: string | null;
  city: string | null;
  duration_seconds: number | null;
  is_bounce: boolean;
  page_count: number;
  started_at: string;
}

export interface TopPage {
  path: string;
  views: number;
  avg_time_spent: number | null;
}

export interface ResumeClickStats {
  last7Days: number;
  last30Days: number;
}

export interface UniqueVisitorsByDay {
  date: string;
  count: number;
}

export interface AdminStats {
  recentSessions: SessionRow[];
  topPages: TopPage[];
  resumeClicks: ResumeClickStats;
  uniqueVisitorsByDay: UniqueVisitorsByDay[];
  totalVisitors: number;
  totalSessions: number;
}

// API response envelopes
export interface ApiSuccess<T = Record<string, unknown>> {
  success: true;
  data?: T;
  [key: string]: unknown;
}

export interface ApiError {
  success: false;
  error: string;
}

export type ApiResponse<T = Record<string, unknown>> = ApiSuccess<T> | ApiError;
