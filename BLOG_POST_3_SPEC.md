# Blog Post #3 — Spec

## Topic

**Architectural hallucination: when the code is real and the description isn't**

Slug suggestion: `architectural-hallucination`

## The thesis

> Every verification layer we have checks code against code. Nothing checks
> claims against code. I shipped a blog post describing an architecture I hadn't
> built, linked to the repo that contradicted it, and it sat live for four
> months.

Not a confession piece. An incident report with a root cause and a fix.

## Why this topic and not another

The published work on AI code hallucination is overwhelmingly about **packages
and APIs that don't exist** — the USENIX Security 2025 study found 19.7% of
recommended packages across 576,000 samples were fabricated. That category is
well studied and well covered.

This is a different category and it's barely written about:

- The code was real
- The code ran, passed CI, and shipped
- The *prose describing it* named a different architecture
- Nothing in any pipeline checks prose against code

That's the gap. One documented case beats another survey.

## The material — all of it real, all of it mine

**What happened.** A blog post on my own site explained RabbitMQ's Dead Letter
Exchange as my design: `x-dead-letter-exchange` queue arguments, `x-death`
headers, a `basic_get` inspection loop, a `pika`-based topology declaration.

My repo does none of that. It does application-level dead-lettering: a Celery
`on_failure` hook classifies the exception, writes `status = DEAD_LETTERED` to
Postgres, increments a counter, and forwards to a dedicated queue. No DLX
anywhere.

**The detection method** — the part that makes this a post rather than an
anecdote. One rule: *every identifier in a claim must be greppable in the
artifact the claim describes.* Applied to the post, the result was:

| Referenced in the post | Hits in the repo |
|---|---|
| `pika` | 0 — repo is Celery + kombu |
| `declare_topology` | 0 |
| `x-dead-letter-exchange` | 0 |
| `x-death` | 0 |
| `inspect_dlq`, `replay_dlq` | 0 |
| `seen_recently`, `mark_seen` | 0 |

Six greps, roughly thirty seconds, four months late.

**The second instance, which proves it's a pattern not an accident.** The same
audit on the second post found unverified AWS pricing and an inverted ratio —
cross-zone traffic is (N−1)/N of requests, not 1/N. Both posts failed the same
way: *specific technical claims produced without the artifact open.* Post one
was written without the repo cloned. Post two without the price list to hand.

**The third instance, which is the one that mattered most.** The same fabricated
mechanism had propagated to my portfolio case study and my resume — three
artifacts, all drifting the same direction, toward claiming more.

## Why nothing caught it

This is the analytical core. Work through each layer and why it structurally
cannot catch this:

- **Type checkers and linters** catch hallucinated *methods*. Mine were in prose.
- **Tests** verify code against code. No test asserts on a paragraph.
- **CI** builds the site. The site built fine.
- **AI review** is the trap — the same model that hallucinated during generation
  approves the same hallucination during review, because it shares the
  assumption. Independence is the requirement, not intelligence.
- **Human review** — I read the post. It was plausible and internally coherent,
  which is exactly the failure mode. Plausible text doesn't look broken the way
  broken code looks broken.

## Structure

```
Hook       The grep that returned zero, and what it was checking
01         What the post claimed vs what the repo does
02         Why this isn't the hallucination everyone writes about
           (packages don't exist; my code did — different category)
03         Why every verification layer missed it, layer by layer
04         The rule: greppability, and what it costs to run
05         The second instance — same failure, different artifact class
           (prices, arithmetic), and the sourced-figures rule
06         The uncomfortable part — resume and portfolio had drifted too,
           and why "written without the artifact open" is the real root cause
07         What this doesn't solve
```

## Section 07 is mandatory and must be genuine

The rule catches fabricated *identifiers*. It does not catch:

- A correct identifier used to describe behavior it doesn't have
- Prose that is true of the code but misleading about scale or context
- Claims about things with no artifact to grep (uptime, latency, "we saw X")
- Anything in a system I can't read

Be specific about the boundary. That section is what separates this from a
listicle about AI risk.

## Voice and constraints

- Match the other two posts. Read them first.
- Not a confession, not an AI thinkpiece. An incident report: what happened,
  why nothing caught it, what I run now.
- No "in today's AI-driven landscape." No emoji. No listicle framing.
- The tone toward the tool is neutral. Not "AI bad," not "AI great." The
  interesting claim is structural: fluent text about an artifact is unverified
  by default, and we have no habit for checking it.
- Every claim about my own repo must be greppable. Applying the post's own rule
  to the post is non-negotiable.

## External facts — verify before publishing

These came from secondary reporting and must be checked against the primary
source in-session, with the link included:

- USENIX Security 2025 package hallucination study — sample count, percentage
- New Relic 2026 State of AI Coding Report — the 78% and 62% figures
- Any hallucination-rate figure cited

If a figure can't be traced to its primary source, cut it. The post is about
verification. Publishing an unverified number in it would be terminal.

## Cross-links

- Link to the corrected dead-letter post — it is the artifact under discussion
- Link to the three-AZs post for the second instance
- Link to the repo

## Date

Roughly three months after June 8, 2026, matching the established cadence.
