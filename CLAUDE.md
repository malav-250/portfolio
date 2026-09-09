# Portfolio Project — Session Handoff

**Owner:** Malav Gajera
**Purpose of this doc:** full context transfer so a new Claude Code session can pick up
without re-deriving anything. Read this first, then ask what to work on.

**Last session ended:** Sept 9, 2026, mid-work, on a spend limit — not at a natural
stopping point. Last shipped commit was `f703076` (resume sync). Nothing is broken;
production is healthy.

---

## 1. What this project is

A personal portfolio site whose single job is to convert a recruiter or hiring manager
into an interview, for **new-grad backend / cloud / infrastructure roles starting
January 2027**. Every decision below was made against that goal — not against general
"nice website" criteria.

### Live surfaces

| Surface | URL |
|---|---|
| Portfolio (canonical) | https://malavgajera.is-a.dev |
| Custom domain (also live) | https://malavgajera.com |
| Vercel default | https://portfolio-pearl-two-32.vercel.app |
| Blog index | https://malavgajera.is-a.dev/blog |
| GitHub profile | https://github.com/malav-250 |

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

- **Next.js (App Router)** with **TypeScript**, static-generated (`output: SSG`)
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
/                       Home — hero, projects, skills, contact
/projects/[slug]        Case studies (3 live)
/blog                   Blog index
/blog/[slug]            Blog posts (2 live)
/resume.pdf             Resume download
/sitemap.xml            Auto-generated from data files
```

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

1. **"Designing dead-letter routing for a distributed task queue"** — May 14, 2026,
   ~2,400 words. Celery retry failure modes, RabbitMQ DLX topology, `acks_late` +
   `reject_on_worker_lost`, Redis `SET NX` idempotency (3% duplicate rate → 0 under
   load), Prometheus alert rule, DLQ inspector and replay script, what does *not*
   belong in a DLQ.
2. **"The cost of three AZs"** — June 8, 2026, ~1,900 words. 2-AZ vs 3-AZ AWS line
   items, the shared-NAT-vs-per-AZ trap, ~$138/mo vs ~$187/mo comparison, when each is
   the right call, hidden costs.
   *Flagged for verification:* the $0.045/hr NAT Gateway price is US-East-1 as of
   mid-2025. Confirm before citing it again.

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
Read PORTFOLIO_HANDOFF.md. The portfolio is at
C:\Users\malav\Downloads\portfolio, live at malavgajera.is-a.dev.

Everything through Phase 9 is shipped. I want to work on the blog —
[state what you want]. Confirm the repo is clean and on main first.
```

Sanity checks before any new work:

```bash
git -C "C:\Users\malav\Downloads\portfolio" status
git -C "C:\Users\malav\Downloads\portfolio" log --oneline -5   # expect f703076 at top
npm run build                                                   # expect clean, all pages prerendered
```

---

## Recent commit history

| Commit | What |
|---|---|
| `f703076` | Resume PDF synced to portfolio + GitHub profile repo (161,508 bytes both) |
| `13cd431` | Blog post #2 + headshot reverted and files removed |
| `7b61c9f` | Case study pages — `/projects/[slug]`, Mermaid diagrams, modal deleted |
| `5d3ef4a` | Blog system — `/blog`, `/blog/[slug]`, first post, profile README refresh |
