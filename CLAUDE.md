# Portfolio Project — Session Handoff

**Owner:** Malav Gajera
**Purpose of this doc:** full context transfer so a new Claude Code session can pick up
without re-deriving anything. Read this first, then ask what to work on.

**Last session ended:** Sept 9, 2026, at a clean stopping point. Last shipped
commit is `7b0b3de`; the substantive work is `4fb6bec` — the dead-letter blog post
rewritten to match the architecture it links to (§4a), plus the same corrections
applied to `src/data/portfolio.ts`. Verified live on content, not status codes.

**Start here next session:** post 2's two open defects — the 1/N cross-AZ error
and the six unverified AWS prices (§5). Both are live right now.

**Read before claiming anything shipped:** §6a. A successful `git push` does not
mean deployed; the Vercel Git integration was silently disconnected for three
months and a 200 response proved nothing.

---

## 1. What this project is

A personal portfolio site whose single job is to convert a recruiter or hiring manager
into an interview, for **new-grad backend / cloud / infrastructure roles starting
January 2027**. Every decision below was made against that goal — not against general
"nice website" criteria.

### Live surfaces

| Surface | URL | State |
|---|---|---|
| Portfolio (canonical) | https://malavgajera.is-a.dev | Live |
| Vercel default | https://portfolio-pearl-two-32.vercel.app | Live |
| Blog index | https://malavgajera.is-a.dev/blog | Live |
| GitHub profile | https://github.com/malav-250 | Live |
| Custom domain | https://malavgajera.com | **NXDOMAIN — not live** |

**`malavgajera.com` does not resolve.** As of Sept 9, 2026, both A and NS queries
against Google's public resolver (8.8.8.8) return `Non-existent domain`. An
NXDOMAIN on the NS record means the domain isn't delegated at all — expired, or
never fully configured. This doc previously described it as "also live"; that was
wrong. Don't cite it as a live surface until DNS is fixed. `is-a.dev` resolves
correctly to `cname.vercel-dns.com`.

Canonical URLs, sitemap, and Open Graph tags all point at **`is-a.dev`**. Keep it that
way unless deliberately migrating — mixing canonical hosts will hurt the SEO work
already done.

### Repos

| Repo | Role |
|---|---|
| `github.com/malav-250/portfolio` | This site |
| `github.com/malav-250/malav-250` | GitHub profile README repo (also hosts `resume.pdf`) |
| `github.com/malav-250/distributed-task-queue` | Featured project |
| `github.com/malav-250/cloud-tf-aws-infra` | Cloud infra — Terraform |
| `github.com/malav-250/cloud-webapp` | Cloud infra — app |
| `github.com/malav-250/cloud-serverless` | Cloud infra — serverless |
| `github.com/malav-250/transportation-platform` | Vehicle rental project |

Local working copy: `C:\Users\malav\Downloads\portfolio`
(The Claude Code project directory registered as `C--Users-malav-Downloads-Port`.)

---

## 2. Stack and architecture

- **Next.js (App Router)** with **TypeScript**. Mostly static-generated — but
  **the site is NOT purely static.** See §2a: there is a Postgres-backed
  analytics layer with six dynamic API routes and an `/admin` dashboard.
- **Tailwind CSS** — no `@tailwindcss/typography`; prose styling is hand-rolled CSS to
  keep the bundle small. Don't add the plugin without a reason.
- **Framer Motion** for scroll and entrance animation
- **Mermaid** for architecture diagrams — **dynamically imported on case-study routes
  only** (~500 KB). The home page must never pull it in.
- **react-markdown + rehype-highlight + remark-gfm** for blog rendering, also
  dynamically imported. `/blog/[slug]` route bundle is ~92.5 kB.
- **Vercel** for hosting and deploys

### Routes

```
/                       Home — hero, projects, skills, contact          (static)
/projects/[slug]        Case studies — 8 prerendered paths              (SSG)
/blog                   Blog index                                      (static)
/blog/[slug]            Blog posts (2 live)                             (SSG)
/admin                  Analytics dashboard — secret-gated              (static shell)
/api/track              Session init — creates visitor + session rows   (dynamic)
/api/page-view          Records/dedupes a page view                     (dynamic)
/api/event              Records an allowlisted event                    (dynamic)
/api/session-end        Finalizes a session                             (dynamic)
/api/track-duration     Updates dwell time + scroll depth               (dynamic)
/api/admin/stats        Aggregated stats, ADMIN_SECRET-gated            (dynamic)
/resume.pdf             Resume download
/robots.txt             Static
/sitemap.xml            Auto-generated from data files
```

`/projects/[slug]` prerenders **8** paths, not the 3 named below. `npm run build`
reports "3 shown + [+5 more paths]"; the three with written case-study content are
`distributed-task-queue`, `voice-agent`, `cloud-native-app`.

### 2a. The analytics layer (previously undocumented)

Discovered Sept 9, 2026 by reading `npm run build` output — it was not in this doc
and had been forgotten. It is real, deployed, and collecting.

| Path | Role |
|---|---|
| `src/app/admin/page.tsx` | Client dashboard. Reads `?secret=` → localStorage. |
| `src/app/api/*/route.ts` | Six route handlers, all `runtime = "nodejs"`, `dynamic = "force-dynamic"`. |
| `src/lib/analytics-service.ts` | All SQL. Parameterized (`$1..$n`) throughout. |
| `src/lib/db.ts` | Lazy singleton `pg` Pool. |
| `src/lib/validators.ts` | Zod schemas for every route payload. |
| `src/lib/ipinfo.ts` | IPinfo enrichment; has an "Ethical scope" comment. |
| `src/lib/getClientIp.ts` | Reads `x-forwarded-for`. Safe on Vercel — the platform overwrites it and does not forward external IPs, so it is not client-spoofable. |
| `src/lib/rateLimit.ts` | Upstash REST or in-memory fallback. |
| `migrations/001_init.sql` | Schema: `visitors`, `sessions`, `page_views`, `events`. |

**What it collects, per visitor, indefinitely:** raw IP (indexed), city, region,
country, **`org`** (the IPinfo organization — i.e. the visitor's employer or
network operator), plus per-path dwell time, max scroll %, referrer, session
duration, bounce, and resume/project/contact clicks. The dashboard displays IP,
org and location per session.

**Privacy work is PARKED and OUTSTANDING.** There is no `/privacy` route, no
consent notice, and no retention policy. A raw IP is personal data under GDPR and
the `org` enrichment makes it more identifying, not less. If asked in an
interview whether the site collects visitor data, the honest answer today is
"yes — your IP and your employer, with no notice." Planned: truncate or hash the
IP, 90-day retention, publish `/privacy`. Also outstanding: delete the probe row
created during testing on Sept 9, 2026 (`sessionId f3fc3b97-b0c4-44f5-8efc-020a9ff9a06c`,
`visitorId 0b9db8f1-e087-4e26-aef0-1f5507e9f50a`).

Env vars (see `.env.example`): `DATABASE_URL` and `ADMIN_SECRET` required;
`IPINFO_TOKEN`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` optional.
Without `DATABASE_URL`, `/api/track` returns 500 in local dev — expected, and
itself a parked item (it should degrade rather than hard-fail).

### Key files

| Path | Contains |
|---|---|
| `src/data/blog.ts` | All blog posts. **Adding a post = appending one object here.** |
| `src/components/Hero.tsx` | Hero section — text-only, no headshot (deliberate, see §4) |
| `src/components/Projects.tsx` | Project cards; navigate to `/projects/[slug]` |
| `src/components/CaseStudyView.tsx` | Case study page template |

Case study slugs: `distributed-task-queue`, `voice-agent`, `cloud-native-app`.

### Case study page structure

Each follows a fixed five-section template — reuse it for any new one:

```
Hero (title, subtitle, tech chips, read time)
01 — PROBLEM        What was actually hard
02 — ARCHITECTURE   Mermaid diagram + caption
03 — DECISIONS      4–5 named trade-offs, interview-defensible
04 — OUTCOMES       Real results, no fluff
05 — NEXT           Honest gaps (K8s, OTel, Kafka)
Contact CTA
```

---

## 3. Ground-truth facts — do not contradict these

These were inconsistent across the site early on and cost real credibility. They are now
correct everywhere (portfolio, GitHub README, resume, LinkedIn). **Any new content must
match:**

- Graduating **December 2026** (MS Computer Software Engineering, Northeastern)
- Available **January 2027, full-time only** — *not* seeking summer internships
- Crewasis role is titled **"Software Engineer Co-op"** — never "Intern"
- The distributed training project is called **"Distributed Training"** everywhere,
  including in GitHub repo naming
- No published papers. The lung-sound work is framed as research + implementation
  he carried out, not as a publication

### Standing rule — greppability

**Any claim in a blog post or portfolio copy that references the distributed task
queue must be greppable in `malav-250/distributed-task-queue` before it ships.**
If a function, setting, header, or mechanism is named, it must be findable in that
repo. Cite file and line when proposing the copy.

This rule exists because it was violated at scale. See §4a.

Corollary: the same standard applies to any stated fact — prices, versions, model
names, library APIs. Verify against a primary source in-session and provide the
link. If it can't be verified, cut it rather than soften it.

---

## 4. Decisions already made — don't relitigate

Each of these was a deliberate call. Reversing one needs a reason, not a default.

- **No headshot in the hero.** Two photos were tried (LinkedIn shoot and a seaside
  crop), previewed locally, and rejected. The image files were deleted from `public/`
  and the `Image` import removed from `Hero.tsx`. Hero is text-only.
- **Project modal deleted.** The old `ProjectModal` component is gone. Cards now
  navigate to real case-study URLs — better SEO, shareable, deep-linkable.
- **Four projects removed** as filler: Healthcare MVC, Quora Duplicate Detection,
  Lung Sound Detection, Vehicle Collision Avoidance (V2X).
- **AI Voice Agent promoted to Featured**, above Vehicle Rental.
- **Skills taxonomy fixed:** TypeScript replaces JavaScript; Next.js moved out of
  "Backend Frameworks"; a Tools row added (Cursor / Claude Code / Git / Postman);
  OpenTelemetry sits next to Prometheus.
- **AI Doc Compliance** reformatted — the "$200" prize mention and Streamlit framing
  were dropped.
- **Blog post dates are spaced on purpose.** May 14 and June 8, 2026 — roughly monthly.
  This reads as a habit rather than a pre-application sprint. Keep future posts on
  that cadence; don't backdate three posts at once.

---

## 4a. The dead-letter post rewrite — Sept 9, 2026 (`4fb6bec`)

Post #1 was rewritten because **its architecture did not match the repo it linked
to.** This is the most important lesson in this document.

The original, "Designing dead-letter routing for a distributed task queue,"
described a **RabbitMQ Dead Letter Exchange** design: `x-dead-letter-exchange`
queue arguments, `x-death` header inspection, `pika` topology declaration, and
`basic_get`/`basic_nack` inspect-and-replay scripts. The repo implements none of
that. It dead-letters at the **application layer**: Celery's `on_failure` hook
classifies the exception, writes `DEAD_LETTERED` to Postgres, increments
`jobs_dead_lettered_total`, and forwards to a dedicated `dlq` Celery queue.
`pika` is not even a dependency.

Every code block in the original was fabricated. `declare_topology`,
`inspect_dlq`, `replay_dlq`, `seen_recently`, `mark_seen`, `transform_image`,
`DeadLetterAware`, `x-dead-letter-exchange`, `x-death` — all zero grep hits
against the repo the footer pointed readers to.

**Why this mattered more than a bug:** a reader who followed the link found a
different system. That reads as aspirational, not as a typo, and it's a far more
expensive failure than a code defect.

The idempotency snippet was also actively wrong. It marked the job as seen
*before* doing the work, so a mid-task crash would make the redelivery skip as
"already processed" — silent loss, in a post whose entire thesis was against
silent loss. The real code writes `COMPLETED` in `on_success`, **after** the task
body returns, and `before_start` gates only on `COMPLETED`, so a crash leaves
`RUNNING` and the job re-runs. Duplicated, not dropped — the correct direction.

Now titled **"Dead-lettering without a Dead Letter Exchange"**, built around the
real decision (broker-level vs application-level) with the cost named: DLX keeps
working when the application or its database is down, and this design does not.
**Slug stayed `dead-letter-routing`** so the live URL, sitemap entry, and post 2's
inbound link all survived.

Same defect class corrected in `src/data/portfolio.ts`: the "explicit dead-letter
exchange in RabbitMQ" claim, "native DLQ exchanges" as a reason for choosing
RabbitMQ, "Redis SETNX gates duplicate enqueues" (idempotency is Postgres-enforced
via `uq_jobs_idempotency_key`; the Redis service's return value is discarded at
`job_service.py:78`), the Mermaid node attributing idempotency to Redis, both
"100% duplicate elimination" claims, both "sub-50ms" latency claims (removed, not
replaced — no percentile, no benchmark, and the two copies contradicted each
other), and "zero message loss."

### The 3% duplicate-rate figure — CUT, may be restorable

The original claimed "~3% of jobs ran twice" without idempotency keys. **Cut
entirely** rather than reworded, because the control condition could not be
verified — the original attributed it to a mechanism (`seen_recently`/`mark_seen`)
that doesn't exist in the repo, so what was actually toggled is unknown.

The surviving claim is "zero duplicate executions across 10K jobs" under induced
`kill -9`, which is what was measured.

**Malav may restore the 3% figure if he can reconstruct what he actually toggled
and how he counted.** Don't reintroduce it, or any substitute number, without that.

### Honest limits the post now carries — keep them

These are load-bearing, not hedging. Don't let a future edit remove them:

- No mutual exclusion on `RUNNING` — `before_start` gates only on `COMPLETED`, so
  a redelivery during a live run executes concurrently. No lock is held.
- `on_success` commits in its own session, so the work→marker window persists.
- At-least-once with a narrow residual window, **not** exactly-once.
- `HighDLQDepth` alerts on `jobs_dead_lettered_total > 10`, but that's a *counter*
  — it only goes up, so the alert fires forever once eleven jobs have ever
  dead-lettered. It measures cumulative dead-letters, not current backlog. A real
  flaw in the shipped code, and a genuine ergonomic cost of moving the DLQ out of
  the broker (DLX would have given a `rabbitmq_queue_messages` gauge for free).

### Résumé bullet — corrected wording

The old bullet claimed "reducing duplicate job execution by 100%," which asserts
exactly-once. Replaced with:

> Designed the reliability layer of a distributed task queue — sliding-window
> rate limiting, Redis circuit breakers, and Postgres-enforced idempotency with
> completion-gated retries — holding zero duplicate executions across 10K jobs
> under induced worker crashes.

"Redis circuit breakers" was verified line by line against
`src/services/circuit_breaker.py`: genuine three-state breaker, all state in
Redis, failure-ratio threshold over a sliding window with a `min_calls` floor.
Two flaws not to claim out loud: the `# Allow one probe` comment is wrong (every
request after cooldown expiry passes, so probes are unbounded), and
`hgetall`→`hset` transitions are non-atomic.

The "sub-50ms" clause was cut and **not replaced**. Malav regenerates
`public/resume.pdf` himself; it must stay byte-identical to the copy in the
profile repo. Note: `resume.pdf` was **not found** in a local clone of
`malav-250/malav-250` on Sept 9, 2026 — verify where it's actually hosted.

---

## 5. Where things stand

### Shipped

| Phase | Work | Status |
|---|---|---|
| 1 | Credibility fixes — dates, co-op title, filler removal, name mismatches | Done |
| 2 | Hero and nav — specific Crewasis pill, GitHub CTA, contact copy with start date | Done |
| 3 | Project reorganization | Done |
| 4 | Skills cleanup | Done |
| 5 | Case studies — `/projects/[slug]` route, 3 written with Mermaid diagrams | Done |
| 6 | Screenshots wired into case studies | Done |
| 8 | GitHub profile README + `/blog` route + first post | Done |
| 9 | SEO — sitemap, robots.txt, OG image, Person JSON-LD, Google Search Console | Done |

### Blog posts live

1. **"Dead-lettering without a Dead Letter Exchange"** — May 14, 2026, ~2,300 words
   of prose (~3,500 with code). Slug `dead-letter-routing`. **Rewritten Sept 9, 2026
   — see §4a for why.** Broker-level vs application-level dead-lettering as an
   explicit decision; the SQL-queryable DLQ; Postgres-driven replay; what was given
   up (DLX works when your app doesn't); the completion gate and why the commit
   point goes after the work; what the test can and cannot show; what does *not*
   get dead-lettered (`failed` as waypoint vs `dead_lettered` as destination); the
   `HighDLQDepth`-on-a-counter flaw. Every code block corresponds to real source.
2. **"The cost of three AZs"** — June 8, 2026, ~1,900 words. 2-AZ vs 3-AZ AWS line
   items, the shared-NAT-vs-per-AZ trap, ~$138/mo vs ~$187/mo comparison, when each is
   the right call, hidden costs.
   **TWO OPEN DEFECTS — next session starts here. Both live.**

   a. **The 1/N cross-AZ error.** The "Cross-AZ data transfer" section says
      "roughly 1/N of your traffic crosses an AZ boundary." It should be
      **(N−1)/N** — with cross-zone balancing over N zones, a request lands on an
      out-of-zone target N−1 times out of N. At N=2 the stated 50% is accidentally
      right; at N=3 the true figure is ~67%, not 33%, so the $1→$2 line item moves
      the wrong direction relative to the model. Immaterial to the ~$138/$187
      totals (which do reconcile, and +35% is correct), but it's checkable
      arithmetic three paragraphs above the summary table.

   b. **Six unverified prices.** None are sourced in-page, in a post whose entire
      credibility is the bill: NAT Gateway hourly ($0.045/hr) and per-GB
      ($0.045/GB), t3.small ($0.0208/hr), ALB hourly ($0.0225/hr), LCU
      (~$0.008/LCU-hr), db.t3.micro ($0.017/hr), inter-AZ transfer ($0.01/GB each
      way). All were US-East-1 as of roughly mid-2025. Verify each against AWS's
      official pricing pages, add an inline region + date-checked note, recompute
      the totals if anything moved, and cut or soften anything unverifiable.

### Open — Phase 7 and beyond

- **Testimonials — blocked on Malav.** Needs three short quotes: Crewasis EM,
  Tatvasoft lead, one Northeastern professor. Nothing to build until quotes exist.
- **Blog post #3** — suggested topic: *"Why I chose RabbitMQ over Kafka and SQS for a
  10K-job queue."* Natural close to a three-post arc on distributed messaging, and the
  trade-offs are already sketched in the Task Queue case study.
- **Live demos** — every project has a `[Code]` button; none have `[Live Demo]`.
  Deploying the Voice Agent and Vehicle Rental frontend (Fly.io / Render) is the
  highest-conversion item left. Full-stack deploys of all seven projects were ruled out
  as costly and prone to going stale.
- **Loom walkthrough** — 90-second demo of the task queue, embedded in its case study.
  Never recorded.

---

## 5a. Parked backlog — tracked, in Malav's stated priority order

Nothing here is started. Post 2's defects (§5, above) come first next session.

| # | Item | Notes |
|---|---|---|
| 1 | **Privacy** | Truncate or hash IP, 90-day retention, publish `/privacy`, delete the Sept 9 probe row. See §2a. |
| 2 | **ADMIN_SECRET out of the query string** | It's logged in Vercel access logs on every `/admin` load. Cookie path is half-built (the route already reads `admin_secret`); needs `HttpOnly; Secure; SameSite=Strict`, a constant-time compare, and a rate limit — `/api/admin/stats` is currently brute-forceable unthrottled. |
| 3 | **Rate limits on four unthrottled write routes** | Only `/api/track` is limited (10/min/IP). `/api/page-view`, `/api/event`, `/api/session-end`, `/api/track-duration` have none. Mint session UUIDs at 10/min, then hammer `page-view` with unbounded distinct `path` values → unbounded row growth. Also cap `event.metadata` size (currently uncapped JSONB). |
| 4 | **`ssl: { rejectUnauthorized: false }`** | `src/lib/db.ts:40`. Looks like it disables cert verification in production, but on `pg` 8.20.0 it is **probably dead code** — see §9. Resolve which branch applies before touching it. |
| 5 | **9 npm audit vulnerabilities** | 3 moderate, 5 high, 1 critical. Own commit — it's a lockfile change. |
| 6 | **`/api/track` hard-fails 500** | Should degrade quietly; it's non-essential tracking. Same fail-soft argument as the Upstash path in `src/lib/rateLimit.ts`. |
| 7 | **README "110+ APIs shipped, 99.9% uptime"** | `malav-250/malav-250` README.md:22. Same unverified-claim class as the ones fixed in §4a. **Where did the uptime number come from?** Answer that before it stays up. |
| 8 | **`portfolio.ts:702` "sub-500ms latency"** | Tatvasoft project. Same class, different project. |
| 9 | **`malavgajera.com` NXDOMAIN** | See §1. Fix DNS or stop listing it. |
| 10 | **Git history authorship** | All 19 pre-`bad2906` commits are authored `gajera.ma@northeastern.edu`, so that history is grey on `malav-250`. Rewrite deliberately, as its own task. `user.email` is already fixed going forward (`78475119+malav-250@users.noreply.github.com`, local and global) — **verify it before any commit.** |

---

## 6. Longer-horizon gaps

From an earlier audit of the profile against 2026 backend hiring. These are development
goals, not website tasks — listed so a new session doesn't re-derive them:

- **Kubernetes** — no signal anywhere. Task queue runs on ECS Fargate. Suggested:
  redeploy to small EKS or k3s, write up why.
- **Kafka** — messaging story is Celery + RabbitMQ only.
- **Applied LLM stack** — has PyTorch/TensorFlow/BERT/HuggingFace (research stack), but
  no RAG over a real corpus, eval harness, prompt versioning, or cost/latency telemetry.
  Assessed as the highest-leverage gap.
- **Open-source contributions** — no merged PRs to recognized projects.
- **AWS Solutions Architect Associate** — not held. (Skip Cloud Practitioner.)

---

## 6a. Deploys — a successful `git push` does NOT mean deployed

**Read this before claiming anything is live.**

On Sept 9, 2026 the rewrite was committed and pushed successfully — remote `main`
confirmed at the new SHA — and then *nothing happened for fifteen minutes*. All
routes returned 200 while serving the old content, identical stale ETags across
every host. Root cause: **the Vercel Git integration had silently disconnected
after Jun 6, 2026 and gone unnoticed for three months.** Malav reconnected it and
pushed an empty trigger commit (`7b0b3de`) to force a build.

Consequences to internalize:

1. **A 200 is not evidence.** Static pages keep serving happily from the old
   deployment. Status codes tell you nothing about whether your change shipped.
2. **`git push` succeeding tells you only that GitHub has the commit.** It says
   nothing about Vercel.
3. **Every "deployed" claim must be backed by fetching the live page and
   asserting on content** — a string that exists only in the new version, and
   ideally a string that exists only in the old one, asserted absent. Report both.
4. A changed `ETag` between before and after is good corroborating evidence. A
   large `Age` header suggests you're looking at a long-lived cached response.

A useful diagnostic worth remembering: during that outage, the suspicion was that
deploys had been broken since June, which would have meant `f703076` (the resume
sync) never shipped. That was **disproved** by checking that live `/resume.pdf` is
161,508 bytes, matching local. Test the hypothesis before reporting it.

### Vercel CLI

**Vercel CLI 59.14.0 is now installed** as a fallback path for inspecting
deployments when the dashboard isn't at hand and the Git integration is in doubt.
Project link lives in `.vercel/project.json` (gitignored):
`projectId prj_6glODkP1QrVMOpykuzb4ta6TJzGu`.

`gh` CLI is still **not** on the PowerShell path. Use plain `git`, and say so
rather than working around it if `gh` is genuinely needed.

### Local toolchain gotchas

- **Node lives at `C:\Program Files\nodejs`** but may not be on a given shell's
  PATH — a session started before installation inherits a stale environment.
  Prepend it explicitly: `$env:Path = "C:\Program Files\nodejs;" + $env:Path`.
- **`next dev` and `next build` share `.next/`.** Running a production build while
  the dev server is live clobbers the dev chunk manifest and produces
  `Cannot find module './vendor-chunks/lucide-react.js'` 500s that look like
  content errors but aren't. Stop the dev server before building.
- **Use `npm ci`, not `npm install`**, when reproducing a known-good build — the
  dependency ranges are all carets and the lockfile is the only thing pinning
  them. npm 11 blocks install scripts by default, so `sharp` and `unrs-resolver`
  don't run theirs; the build doesn't need them.
- A `.claude/launch.json` for the dev server needs `cmd.exe` plus the 8.3 short
  path (`C:\PROGRA~1\nodejs\npm.cmd`) to work around PATH and quoting issues.

---

## 7. How Malav likes to work

Worth honoring — this came up repeatedly:

- **Preview before deploy.** He asks to see changes on `localhost:3000` first, then
  says "deploy" explicitly. Don't push to production unprompted.
- **On approval, ship the whole thing:** build → commit → push → deploy → verify live
  URLs return 200. He expects the verification table.
- **One phase at a time.** He picks a phase, it gets completed and shipped, then he
  picks the next. Don't run ahead into unrequested phases.
- **Straight assessments over encouragement.** He asked directly for what would make a
  recruiter bounce, and acted on all of it.

---

## 8. Suggested opening move for the new session

```
Read CLAUDE.md, then src/data/blog.ts. The portfolio is at
C:\Users\malav\Downloads\portfolio, live at malavgajera.is-a.dev.

Post 2 has two open defects — the 1/N cross-AZ error and six unverified
AWS prices. Fix those first. Confirm the repo is clean and on main.
```

Sanity checks before any new work:

```bash
git -C "C:\Users\malav\Downloads\portfolio" status
git -C "C:\Users\malav\Downloads\portfolio" log --oneline -5
git -C "C:\Users\malav\Downloads\portfolio" config user.email
```

Expect `7b0b3de` at top and `78475119+malav-250@users.noreply.github.com` for the
email — **stop and say so if the email differs**, don't commit. Then, with Node on
PATH (§6a):

```bash
npm ci && npm run build
```

Expect a clean build with 18 pages prerendered.

---

## 9. The `pg` SSL question — analysed Sept 9, 2026, nothing changed

`src/lib/db.ts` passes `connectionString` **and**, in production, `ssl: {
rejectUnauthorized: false }`. Which wins is the opposite of what the code implies.

**The connection string wins.** `pg/lib/connection-parameters.js:59-61`:

```js
// if the config has a connectionString defined, parse IT into the config we use
// this will override other default values with what is stored in connectionString
if (config.connectionString) {
  config = Object.assign({}, config, parse(config.connectionString))
}
```

`Object.assign` gives the later source precedence, so anything `parse()` produces
overwrites what the caller passed. The docs say the same: *"If any of these
options are used then the `ssl` object is replaced and any additional options
provided there will be lost."*

And `pg-connection-string/index.js:77-79` sets `config.ssl = {}` whenever the URL
contains `sslcert`, `sslkey`, `sslrootcert`, **or `sslmode`**. So:

- **If `DATABASE_URL` contains `?sslmode=...`** → parsed `ssl` replaces
  `{ rejectUnauthorized: false }`. For `prefer` / `require` / `verify-ca` /
  `verify-full`, the switch at `:132-152` leaves `ssl = {}` — no
  `rejectUnauthorized` override — so Node's TLS defaults apply: verification and
  hostname checking **ON**. The `db.ts` line is dead code and the connection is
  *more* secure than it looks.
- **If `DATABASE_URL` has no ssl params** → `parse()` returns no `ssl` key,
  `Object.assign` doesn't clobber it, and `{ rejectUnauthorized: false }` applies.
  Verification genuinely **OFF**.

`.env.example` documents `?sslmode=require` for Neon, which suggests the first
branch — but the real value is a Vercel env var and was not inspected.

### What `sslmode=require` silently becomes

On 8.20.0, without `uselibpqcompat`, `require` is an **alias for `verify-full`** —
stricter than libpq, where `require` means encrypt-without-verify. The library
warns about this (`pg-connection-string/index.js:216-223`):

> SECURITY WARNING: The SSL modes 'prefer', 'require', and 'verify-ca' are treated
> as aliases for 'verify-full'. In the next major version (pg-connection-string
> v3.0.0 and pg v9.0.0), these modes will adopt standard libpq semantics, which
> have weaker security guarantees.

**This is a latent security downgrade on a future major bump.** Today
`sslmode=require` verifies fully; under pg 9 it will silently stop verifying. The
fix the library recommends is to write `sslmode=verify-full` explicitly, which
pins current behavior across the upgrade.

**Note there is no `pg` v9 today** — latest published is 8.23.0; this project is
pinned at 8.20.0. The v9 reference comes from that warning, not from a release.

### How to settle which branch is live

Look in Vercel runtime logs for the `SECURITY WARNING` string above. Present →
`DATABASE_URL` carries an `sslmode`, verification is on, `db.ts:40` is inert.
Absent → no `sslmode`, and verification is off for real.

Also worth knowing: outside production `config.ssl` is undefined, so
`connection-parameters.js:85` falls back to `readSSLConfigFromEnvironment()` —
`PGSSLMODE` / `PGSSLROOTCERT` can influence local behavior.

---

## Recent commit history

| Commit | What |
|---|---|
| `7b0b3de` | Empty trigger commit — forced a build after the Vercel Git reconnect |
| `4fb6bec` | Dead-letter post rewritten to match the shipped architecture; portfolio.ts claims corrected; blog date hydration bug fixed (see §4a) |
| `bad2906` | CLAUDE.md tracked; `.gitignore` broadened `.env*.local` → `.env*` with `!.env.example`, and `.context/` ignored |
| `f703076` | Resume PDF synced to portfolio + GitHub profile repo (161,508 bytes both) |
| `13cd431` | Blog post #2 + headshot reverted and files removed |
| `7b61c9f` | Case study pages — `/projects/[slug]`, Mermaid diagrams, modal deleted |
| `5d3ef4a` | Blog system — `/blog`, `/blog/[slug]`, first post, profile README refresh |
