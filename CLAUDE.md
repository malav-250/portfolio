# Portfolio Project — Session Handoff

**Owner:** Malav Gajera
**Purpose of this doc:** full context transfer so a new Claude Code session can pick up
without re-deriving anything. Read this first, then ask what to work on.

**Last session ended:** Sept 18, 2026, at a clean stopping point. Three posts are
live. Posts 1 and 2 were audited and corrected on Sept 9 (§4a, §4b); post 3,
shipped Sept 18, is the write-up of those corrections and the source of the two
standing rules in §3. **§4c explains the shared pattern and is the most useful
thing in this document.** All work verified live on content, not status codes.

**Start here next session:** the **résumé bullets** first (the corrected wording
is in §4a, and post 3's §06 needs a concrete before/after once that lands), then
the **privacy work** — IP truncation or hashing, 90-day retention, a `/privacy`
page, and deleting the Sept 9 probe row (§2a, §5a item 1). Neither is started.

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
/blog/[slug]            Blog posts (3 live)                             (SSG)
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

### Standing rule — sourced figures and verification dates

**Every price, rate, or figure in a post must be traced to a primary source, and
any post carrying prices must state a verification date in the body.** Not a
footnote — in the body, next to the numbers, where a reader comparing them to
their own bill will see it.

- Primary source means AWS's own published data, not a blog or a summary. The
  machine-readable feeds are the best option: the Price List API
  (`https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/<OFFER>/current/<region>/index.json`
  or `index.csv`) and the AWS-hosted feeds the pricing pages render from
  (`https://b0.p.awsstatic.com/pricing/2.0/meteredUnitMaps/...`). Both carry
  publication dates. Rendered pricing pages are second-best — they often show
  only worked examples for one region.
- Region must be stated. us-east-1 unless the post says otherwise.
- If a figure is an estimate rather than a published rate, **label it as one in
  the text.** Post 2's CloudWatch allowance now reads "an estimate from my bills,
  not a published price." One unsourced number wearing the same clothes as seven
  sourced ones is what makes the whole set look invented.
- Recompute every derived total after re-verifying. Show the arithmetic before
  editing, and if a correction changes a conclusion, **say so** rather than
  adjusting numbers until the original conclusion survives.

**The measured decay rate: one of seven AWS prices moved in roughly fourteen
months.** db.t3.micro went $0.017/hr → $0.018/hr between the post being written
and Sept 9, 2026. That is the empirical reason posts carrying prices get dated —
not a stylistic preference. At that rate a "current" bill is wrong within a year,
and a dated snapshot ages honestly while an undated one silently rots.

#### Worked example — the rule catching an error in a spec Malav wrote himself

Drafting post 3 (Sept 18, 2026), the spec cited the USENIX Security 2025 package
hallucination study as *"19.7% of recommended packages across 576,000 samples."*
Going to the paper rather than the secondary summaries showed two problems:

1. **Wrong denominator.** 19.7% is a share of the **2.23 million package
   references** those samples produced, not of the 576,000 code samples. The
   paper: *"These 30 tests generated a total of 2.23 million packages in response
   to our prompts, of which 440,445 (19.7%) were determined to be
   hallucinations, including 205,474 unique non-existent packages."* Most
   secondary coverage flattens this.
2. **The aggregate hides a 4× split.** The paper puts commercial models at
   **5.2%** and open-source at **21.7%**. Quoting 19.7% at a reader who uses a
   commercial assistant overstates their exposure roughly fourfold — accurate,
   sourced, and materially misleading, which is one of the failure modes post 3's
   own §07 names. The post therefore states both figures and uses the split as a
   live example.

Two lessons worth keeping. **The rule catches errors in Malav's own specs, not
just in generated text** — the instruction to verify was itself the thing that
found the mistake. And **secondary summaries are where denominators go to die**:
every number in that spec traced back to real reporting, and the reporting had
dropped the distinction. Go to the paper. If the PDF won't parse through a fetch
tool, download it and inflate the text streams — that is how this one was read.

### Standing rule — a metric ships with its evaluation protocol, or not at all

**No accuracy, score, or benchmark figure appears anywhere on this site without
the evaluation protocol attached in the same sentence or bullet.** Not in a
footnote, not on a detail page while the card shows the bare number. If the
caveat won't fit, cut the number and describe the method instead.

This is the third rule, alongside greppability and sourced figures, and it comes
from the lung-sound work (Sept 18, 2026).

The case: the model reached **~92% on a cycle-level split**, and that number is
optimistic by an unknown margin for two compounding reasons.

1. **ICBHI 2017 has 126 patients.** Splitting at *cycle* level puts the same
   patient in train and test, so the model can learn the patient rather than the
   pathology.
2. **Augmentation was applied to the full dataset before splitting**, so
   augmented copies of a single clip land on both sides.

Either alone leaks; together they make the figure uninterpretable as a
generalisation estimate. A **patient-level split** is the correct protocol for
this dataset.

A prior version of this claim on the site cited 99.72/99.82% accuracy. Those
numbers came from a README that is **not Malav's** — disregard them entirely and
never reintroduce them.

**Also a worked example of why "for reference" figures need checking.** The brief
supplied "~65%" as the state of the art on the ICBHI four-class task with the
official patient-disjoint split. That did not survive verification. Nguyen &
Pernkopf (*Lung Sound Classification Using Co-tuning and Stochastic
Normalization*, arXiv 2108.01991) report, from the paper text: *"the highest
ICBHI average score at 58.29% and 64.74% for the 4-class and 2-class ALSC task,
respectively."* The ~65% is the **two-class** figure; four-class results on the
official 60/40 split sit in the high 50s in that paper's comparison table, and
every 4-class entry above 64% there uses 5-fold CV or an overlapping 80/20 split
rather than the official one. A secondary summary did quote 64.92% for a 4-class
model, untraceable to a paper.

So the site now cites the figure it can source — 58.29%, attributed to Nguyen &
Pernkopf — and does **not** call it "state of the art," because that is a claim
about the whole field and ages badly. Task/split conflation is the specific trap
with benchmark numbers: the same dataset supports several tasks and several
splits, and a number quoted without both is close to meaningless.

### The experience section is structurally outside greppability

**Employment claims have no artifact to grep.** There is no repo behind a co-op.
This is failure mode #3 from post 3 ("claims with no artifact") showing up in
practice, and it means the greppability rule simply does not reach the experience
section.

The standard there is different and Malav set it: **"can I explain where this
number came from," not "can a stranger reproduce it."** He was in the room; if he
profiled the query and watched the number move, he can defend it in an interview,
and that is the real test. So employment metrics are not held to the repo
standard — they are held to the derivation standard.

What that requires in practice: **every number carries its basis in the copy
itself.** A percentile, a measurement tool, or the fact that it was a load test.
"Cut p95 latency ~35% (measured in Django Debug Toolbar)" is defensible; a bare
"35% faster" is not, because the second one gives an interviewer nothing to ask
about and Malav nothing to answer with.

#### Kept metrics and their derivations — Sept 18, 2026

Settled directly with Malav. **Do not re-ask, and do not invent a basis for any
of these.** A future session rewriting this copy should treat this table the way
it treats the grep table in post 3's §01.

| Metric | Derivation | Copy |
|---|---|---|
| Coverage >90% | Coverage of **the modules he wrote**, not the whole repo | "holding test coverage above 90% on the modules I wrote" |
| p95 latency ~35% | **p95**, read from **Django Debug Toolbar** | "Cut p95 latency ~35% (measured in Django Debug Toolbar)" |
| Query volume ~30% | **Query count**, from **pg_stat_statements** | "query volume ~30% (measured with pg_stat_statements)" |
| 100+ concurrent users | A **load-test target**, not observed production traffic | "load-tested to a 100+ concurrent-user target" |
| sub-500ms | **p95**, under **load testing** | "at p95 under 500ms" |
| Query time ~30% (Tatvasoft) | Before/after from PostgreSQL query plans | "Cut query time ~30% … through PostgreSQL indexing and query-plan analysis" |

#### Cut, and why — do not restore without new evidence

| Metric | Why it was cut |
|---|---|
| "6 backend features" | True but self-harming — six over five months invites "only six?" Cut on judgment, not honesty. |
| "40% deployment time" | **No before/after timings existed.** A felt improvement. Per Malav's own instruction, a number that can't be stated honestly gets cut rather than hedged into vagueness. The Docker + GitHub Actions substance stayed; the number went. |
| "5K+ monthly active users" | A property of the product, not of his work, and not clearly his to publish. |
| "Reduced production defects 20%" | The counterfactual isn't available to him over a five-month internship; attribution of the drop to his CI work specifically can't be defended. |
| "sub-500ms" (bare, pre-Sept-18) | Was parked backlog item #8. Resolved by adding the percentile and the load-test basis. |

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

## 4b. Post 2 correction — Sept 9, 2026 (`6b88f74`)

"The cost of three AZs" had two defects, both in the bill the post is built on.

**The cross-AZ ratio was wrong.** The post claimed roughly 1/N of traffic crosses
an AZ boundary. With cross-zone load balancing across N zones the ALB spreads
requests over every registered target, so a request lands out-of-zone **(N−1)/N**
of the time. At N=2 the stated 50% was accidentally correct — which is exactly why
it survived review for four months. At N=3 the real figure is 67%, not 33%. The
published $2 line item didn't follow from the stated model in either direction:
under 1/N, three zones would have been *cheaper* than two, not double. Corrected
to $1.33 vs $1.00, with the model written out.

**One AWS price had moved.** db.t3.micro is $0.018/hr, not $0.017 — so Multi-AZ is
$26.28/mo, not $24.82. AWS lists Multi-AZ at exactly 2× single-AZ, which
independently confirms the post's methodology was sound.

All seven rates re-verified against AWS primary sources on Sept 9, 2026. Six
matched exactly: NAT Gateway hourly and per-GB ($0.045 both), t3.small ($0.0208),
ALB hour ($0.0225), LCU ($0.008), inter-AZ transfer ($0.01/GB, billed **both**
directions per the AWS CUR docs). An eighth figure not on the original list was
also checked and corrected: interface VPC endpoints are $0.01/hr = $7.30/mo, not
"$7."

**The conclusion held.** ~$138/~$187/+$49 became ~$140/~$188/+$48; 35.45% became
34.60%; both round to the ~35% the post claims. Isolating the fixes — ratio alone
34.96%, price alone 35.08% — showed neither was load-bearing. Presenting that
isolation table is what established the conclusion survived, rather than asserting
it.

One verification worth remembering: the data-transfer price list contains
`USE1-DataTransfer-xAZ-In-Bytes` and `xAZ-Out-Bytes` at **$0.00/GB**, which looks
like cross-AZ transfer having become free and would have zeroed the line item.
It hasn't — those are artifacts of the April 2025 billing reorganization that
split VPC-peering traffic into its own product family. $0.01/GB each way stands.
Don't be fooled by it next time.

---

## 4c. Both posts have now been audited — this is the pattern

| Post | Audited | What was wrong |
|---|---|---|
| 1 — dead-letter routing | Sept 9, 2026 (`4fb6bec`) | Fabricated mechanisms. Described a RabbitMQ DLX architecture the linked repo doesn't implement; every code block invented; the idempotency snippet inverted the real design into the exact failure it avoids. |
| 2 — cost of three AZs | Sept 9, 2026 (`6b88f74`) | Unverified arithmetic and prices. Cross-AZ ratio inverted; seven prices with no in-page source; one had drifted. |

**Both were written in sessions where the source of truth wasn't open.** Post 1 was
written without `distributed-task-queue` cloned locally — so plausible-looking
Celery/RabbitMQ code got written from general knowledge instead of from the repo.
Post 2's prices were written without AWS's pricing data in front of the author —
so figures that were roughly right at some past date got stated as current.

Neither failure was carelessness about *writing*. Both were the same structural
mistake: **producing specific technical claims without the artifact open.** The
two standing rules in §3 exist to prevent exactly this, and they are cheap to
follow — clone the repo, or pull the price list, *before* drafting. A session
that can't do that shouldn't be writing the claim.

Practical consequence for future posts: if a post will reference a repo, clone it
into `.context/` first. If it will carry prices, pull the Price List API first.
Cite file and line, or source and date, as you draft — not afterwards.

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
   **Both defects CORRECTED Sept 9, 2026 (`6b88f74`) — see §4b.** Current
   figures: ~$140 (2 AZ) vs ~$188 (3 AZ), +$48/mo (+35%), ~$580/year. Both price
   tables carry "verified 9 September 2026" in the body. Don't refresh these
   numbers without re-running the verification and re-dating them.
3. **"When the code is real and the description isn't"** — Sept 18, 2026, ~2,700
   words of prose. Slug `architectural-hallucination`. Shipped `9fbec7d`.
   **This post is the correction record for posts 1 and 2**, and the source of
   the two standing rules in §3.

   Argument: published work on AI code hallucination is almost entirely about
   packages that don't exist, which **fail closed** — the runtime is the check.
   Post 1 failed the other way. Every component it named was real, the linked
   code was real and working, and the prose described an architecture that
   wasn't built. Nothing executes a blog post, so nothing caught it.

   Section 01 carries the real grep data — 14 identifiers from the pre-rewrite
   post (recovered via `git show 4fb6bec^:src/data/blog.ts`, not from memory),
   each with zero hits in the linked repo. Reproducible any time.
   Section 03 works through why each layer was structurally incapable: type
   checkers see a valid string literal; tests compare code to code; CI built a
   site that was fine; an AI reviewer shares the generating distribution and so
   approves its own hallucination. The load-bearing admission is the last one —
   careful reading checks *coherence*, and the text was coherent. Broken code
   looks broken; a false sentence looks finished.
   Section 07 is deliberately unflattering to the rule and should stay that way.

   **Known soft spot — §06.** It records that the fabricated mechanism had also
   reached the portfolio case study and the résumé, and that all three drifted
   the same direction (toward claiming more) because each was written from the
   previous artifact rather than from the repo. It **asserts that drift without
   showing it**, because the résumé was being revised separately and quoting it
   was out of scope. Every other section has data behind it; this one has only
   an argument. **Once the résumé revision lands, add one concrete before/after
   to §06.** That closes the only gap a skeptical reader can push on.

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
Read CLAUDE.md — §4c first, then §2a. The portfolio is at
C:\Users\malav\Downloads\portfolio, live at malavgajera.is-a.dev.

Both blog posts are audited and clean. Next up is the privacy work on
the analytics layer. Confirm the repo is clean and on main.
```

Sanity checks before any new work:

```bash
git -C "C:\Users\malav\Downloads\portfolio" status
git -C "C:\Users\malav\Downloads\portfolio" log --oneline -5
git -C "C:\Users\malav\Downloads\portfolio" config user.email
```

Expect a clean tree on `main`, and `78475119+malav-250@users.noreply.github.com`
for the email — **stop and say so if the email differs**, don't commit. The most
recent commits are listed at the bottom of this file. Then, with Node on
PATH (§6a):

```bash
npm ci && npm run build
```

Expect a clean build with **19** pages prerendered (18 before post 3 shipped —
the count tracks the number of blog posts, so it grows by one per post).

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
| `9fbec7d` | Post 3 added — "When the code is real and the description isn't"; the correction record for posts 1 and 2 (see §5) |
| `12bac15` | CLAUDE.md — sourced-figures rule, §4b post 2 correction, §4c the shared pattern |
| `6b88f74` | Post 2 corrected — cross-AZ ratio (1/N → (N−1)/N), db.t3.micro price moved, totals refreshed and re-sourced against the AWS Price List API, both tables dated (see §4b) |
| `376fbe6` | Corrected the pg SSL note in CLAUDE.md; added §9 analysis |
| `642f2fe` | CLAUDE.md — analytics layer, greppability rule, deploy verification |
| `7b0b3de` | Empty trigger commit — forced a build after the Vercel Git reconnect |
| `4fb6bec` | Dead-letter post rewritten to match the shipped architecture; portfolio.ts claims corrected; blog date hydration bug fixed (see §4a) |
| `bad2906` | CLAUDE.md tracked; `.gitignore` broadened `.env*.local` → `.env*` with `!.env.example`, and `.context/` ignored |
| `f703076` | Resume PDF synced to portfolio + GitHub profile repo (161,508 bytes both) |
| `13cd431` | Blog post #2 + headshot reverted and files removed |
| `7b61c9f` | Case study pages — `/projects/[slug]`, Mermaid diagrams, modal deleted |
| `5d3ef4a` | Blog system — `/blog`, `/blog/[slug]`, first post, profile README refresh |
