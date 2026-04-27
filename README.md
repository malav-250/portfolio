# Malav Gajera — Portfolio

Personal portfolio at [malavgajera.com](https://malavgajera.com).

Built with Next.js 15 (App Router), React 19, Tailwind v4, and Framer Motion.

This repo also ships a **custom visitor analytics system** built into the same Next.js app — see [`docs/analytics.md`](#visitor-analytics-system) below.

---

## Visitor Analytics System

A self-hosted, privacy-respecting analytics layer that captures session-level behavior on the portfolio without using third-party trackers. Implemented entirely as Next.js Route Handlers backed by Postgres, with optional Redis-backed rate limiting.

### Architecture

```
                    ┌────────────────────┐
                    │  Browser (Next.js) │
                    │  AnalyticsProvider │
                    └─────────┬──────────┘
                              │
                              │ POST /api/track       (init)
                              │ POST /api/page-view   (per route)
                              │ POST /api/event       (clicks)
                              │ Beacon /api/track-duration
                              │ Beacon /api/session-end
                              ▼
                    ┌────────────────────┐         ┌─────────────┐
                    │  Next.js Route     │ ───────▶│   IPinfo    │
                    │  Handlers          │ enrich  │   (HTTPS)   │
                    │  (Node runtime)    │         └─────────────┘
                    └─────────┬──────────┘
                              │ parameterized SQL
                              ▼
                    ┌────────────────────┐         ┌─────────────┐
                    │  PostgreSQL        │         │ Upstash     │
                    │  visitors          │         │ Redis (opt) │
                    │  sessions          │◀────────│ rate-limit  │
                    │  page_views        │         └─────────────┘
                    │  events            │
                    └────────────────────┘
```

### System flow

1. **Page load** → `AnalyticsProvider` mounts → `POST /api/track`
2. Server reads `x-forwarded-for`, calls IPinfo (cached 24h, with timeout), upserts a `visitors` row deduped per day, opens a `sessions` row, returns `{ sessionId, visitorId }`.
3. Client stores `sessionId` in `sessionStorage`.
4. **Every route change** → `POST /api/page-view` (server dedupes on `(session, path)`).
5. **Scroll** → `requestAnimationFrame`-throttled max-scroll-pct tracker (in-memory ref).
6. **Event clicks** (resume, project card, contact) → `trackEvent()` → `POST /api/event` (allowlisted `eventType`).
7. **Tab hidden / pagehide** → `navigator.sendBeacon` flushes:
   - `POST /api/track-duration` (final time + scroll for current page)
   - `POST /api/session-end` (total session duration → server computes bounce flag)

### Privacy posture

- Org-level inference via IPinfo only — no individual identification, no fingerprinting, no cross-site trackers.
- `events.metadata` is application-controlled; we never log free-form user input.
- Private IPs (RFC 1918, link-local, IPv6 ULA) are short-circuited and never sent to IPinfo.
- All routes are server-only; the IPinfo token never reaches the browser.

### Local setup

```bash
# 1. Install
npm install

# 2. Copy env template and fill in values
cp .env.example .env.local

# 3. Run the migration against your Postgres
psql "$DATABASE_URL" -f migrations/001_init.sql

# 4. Dev server
npm run dev
```

Visit `http://localhost:3000` — the network tab should show `track` → `page-view` → `track-duration`.

Visit `http://localhost:3000/admin?secret=YOUR_ADMIN_SECRET` for the dashboard.

### Vercel deployment

1. Provision a Postgres instance ([Neon](https://neon.tech) is the easiest free option). Run the migration.
2. (Optional) Provision an [Upstash Redis](https://upstash.com) free tier for production rate limiting.
3. Add env vars in Vercel project settings:
   - `DATABASE_URL` (use the **pooled** connection string, e.g. `?pgbouncer=true`)
   - `ADMIN_SECRET`
   - `IPINFO_TOKEN` (optional but recommended)
   - `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` (optional)
4. `git push` → Vercel auto-deploys.

### Limitations

- **Geolocation accuracy** is city-level at best — IPinfo's free tier is reliable for country/region but city/ASN can be stale.
- **Org detection** depends on whoever owns the IP block. Corporate VPNs and residential ISPs often mask the real visitor's company.
- **No cross-device tracking.** Each device gets its own visitor record. Intentional — anything more would require persistent identifiers.
- **In-memory rate limiting** on Vercel is best-effort. Different cold-start containers don't share counters; configure Upstash for strict limits.
- **Bounce heuristic** is naive (1 page view + <10s). Adjust `endSession()` if you want a different signal.

### Design decisions

- **`sendBeacon` over `fetch`** — survives page unload/navigation; the browser owns the lifecycle. Falls back to `fetch({ keepalive: true })` if unsupported.
- **Session via `sessionStorage`, not cookies** — no PII, no consent banner overhead, scoped per tab. The trade-off: closing the tab ends the session, which is what we want for "session" semantics anyway.
- **`pg` over Prisma** — no schema generation step, no client bloat, fits the small number of well-defined queries here.
- **REST API for Upstash** — avoids pulling in the SDK; one HTTP call per request is fine at this volume.
- **Allowlisted event types via Zod enum** — every event ends up in a typed bucket for analytics queries.

---

## Tech stack

- **Frontend:** Next.js 15, React 19, Tailwind v4, Framer Motion 11
- **Backend:** Next.js Route Handlers (Node runtime), Postgres via `pg`
- **Validation:** Zod
- **Hosting:** Vercel + custom Postgres + (optional) Upstash Redis

## Scripts

```bash
npm run dev     # local dev
npm run build   # production build
npm start       # serve production build locally
npm run lint    # eslint
```

## Project structure

```
src/
├── app/
│   ├── admin/page.tsx              # Admin dashboard (client)
│   ├── api/
│   │   ├── track/route.ts          # POST — init session
│   │   ├── page-view/route.ts      # POST — record page view
│   │   ├── track-duration/route.ts # POST — beacon: time + scroll
│   │   ├── event/route.ts          # POST — discrete events
│   │   ├── session-end/route.ts    # POST — beacon: finalize session
│   │   └── admin/stats/route.ts    # GET  — aggregations (auth-gated)
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── AnalyticsProvider.tsx       # Behavioral (renders nothing)
│   ├── Hero.tsx, Projects.tsx, …   # Portfolio sections
├── hooks/
│   └── useAnalytics.ts             # Hook + exportable `trackEvent`
├── lib/
│   ├── db.ts                       # pg Pool singleton
│   ├── ipinfo.ts                   # IP enrichment (cached)
│   ├── rateLimit.ts                # Upstash + in-memory fallback
│   ├── validators.ts               # Zod schemas
│   ├── analytics-service.ts        # All DB queries
│   └── getClientIp.ts              # x-forwarded-for parsing
├── types/
│   └── analytics.ts                # All shared types
└── data/
    └── portfolio.ts                # Site content
migrations/
└── 001_init.sql                    # Run once against your Postgres
```
