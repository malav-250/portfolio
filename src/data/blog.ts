export interface BlogPost {
  slug: string;
  title: string;
  subtitle?: string;
  excerpt: string;
  publishedAt: string; // ISO date (yyyy-mm-dd)
  readingTime: string;
  tags: string[];
  // Markdown content. Supports GFM (tables, strikethrough) and code blocks
  // with language fences for syntax highlighting via rehype-highlight.
  content: string;
}

export const blogPosts: BlogPost[] = [
  {
    slug: "dead-letter-routing",
    title: "Dead-lettering without a Dead Letter Exchange",
    subtitle:
      "RabbitMQ will route failed messages for you at the broker level. I chose not to let it — here's what that bought, and what it cost.",
    excerpt:
      "RabbitMQ has a built-in mechanism for failed messages: point a queue at a Dead Letter Exchange and the broker routes them for you. I built the dead-letter path in my application instead. That made my DLQ a SQL table and my replay an HTTP call — and gave up the one thing the broker does that my application can't.",
    publishedAt: "2026-05-14",
    readingTime: "9 min read",
    tags: ["Backend", "Distributed Systems", "Celery", "RabbitMQ", "Postgres"],
    content: `## The decision

Every Celery + RabbitMQ walkthrough that gets as far as failure handling arrives at the same place: RabbitMQ's **Dead Letter Exchange**. Set \`x-dead-letter-exchange\` on a queue, and when a message is rejected without requeue — or expires, or overflows a length limit — the broker routes it to an exchange of your choosing instead of dropping it. It's a good mechanism. It's well documented, it's battle-tested, and it keeps working whether or not your consumers are healthy.

I had that option and I didn't take it.

In the task queue I built, a job that exhausts its retries doesn't get dead-lettered by RabbitMQ. It gets dead-lettered by my application: a Celery failure hook classifies the exception, writes a terminal state to Postgres, increments a counter, and forwards a summary to a dedicated queue. RabbitMQ never learns that anything went wrong.

This post is about why, what that bought, and — the part that matters more — what it cost. The broker-level design has one real advantage I gave up, and it isn't small.

## What the two designs actually are

**Broker-level (DLX).** The queue carries an argument. On terminal rejection, RabbitMQ moves the message to the dead-letter exchange and stamps an \`x-death\` header with the reason, the originating queue, and a count. Your DLQ *is* a RabbitMQ queue. To see what's in it, you consume from it. To replay, you republish.

**Application-level.** The working queues carry no dead-letter argument at all. The worker's failure hook decides instead. My job table already had a \`status\` column and a lifecycle:

\`\`\`python
# src/domain/enums.py
class JobStatus(StrEnum):
    PENDING = "pending"
    QUEUED = "queued"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    DEAD_LETTERED = "dead_lettered"
\`\`\`

Dead-lettering, in this design, is a state transition. The DLQ isn't a queue holding messages; it's a \`WHERE status = 'dead_lettered'\` predicate over rows I was already writing.

That reframing is the whole decision. Everything below follows from it.

## The topology, and what's conspicuously absent

\`\`\`python
# src/worker/celery_app.py
default_exchange = Exchange("tasks", type="direct")
dlq_exchange = Exchange("dlq", type="direct")

celery_app.conf.task_queues = (
    Queue("critical", default_exchange, routing_key="critical",
          queue_arguments={"x-max-priority": 10}),
    Queue("default", default_exchange, routing_key="default",
          queue_arguments={"x-max-priority": 10}),
    Queue("bulk", default_exchange, routing_key="bulk",
          queue_arguments={"x-max-priority": 10}),
    Queue("dlq", dlq_exchange, routing_key="dlq"),
)
\`\`\`

Four queues: three priority tiers and a \`dlq\`. Note what isn't there. No \`x-dead-letter-exchange\`, no \`x-dead-letter-routing-key\` on any working queue. The \`dlq\` queue exists, but **nothing in the broker routes to it.** My application does.

The two settings that make any of this matter:

\`\`\`python
# src/worker/celery_app.py
celery_app.conf.task_acks_late = True
celery_app.conf.task_reject_on_worker_lost = True
celery_app.conf.worker_prefetch_multiplier = 1  # Fair dispatch
\`\`\`

\`task_acks_late\` moves the broker acknowledgement to *after* the task returns rather than before it starts, so a worker that dies mid-task leaves the message unacknowledged and it gets redelivered. \`task_reject_on_worker_lost\` means a SIGKILL doesn't count as a clean ack. Together they buy at-least-once delivery, which is the foundation everything else rests on. They also create the duplicate-execution problem I'll get to.

## Failure classification lives next to the domain

The first thing application-level dead-lettering bought: the decision about whether a failure is terminal gets made in Python, next to the code that knows what the failure means.

\`\`\`python
# src/worker/tasks/base.py
class TransientError(Exception):
    """Retriable error (network issues, upstream 5xx, timeouts)."""
    pass


class PermanentError(Exception):
    """Non-retriable error (validation failures, 4xx from upstream)."""
    pass
\`\`\`

That taxonomy drives the retry policy declaratively:

\`\`\`python
class BaseTask(celery.Task):
    autoretry_for = (TransientError,)
    retry_backoff = True
    retry_backoff_max = settings.retry_backoff_max
    retry_jitter = True
    max_retries = settings.default_max_retries
\`\`\`

And the failure hook decides terminality:

\`\`\`python
def on_failure(self, exc, task_id, args, kwargs, einfo):
    job_id = kwargs.get("job_id")
    # ...
    with SyncSessionFactory() as session:
        job = session.get(Job, uuid.UUID(job_id))
        # ...
        if isinstance(exc, PermanentError) or job.retry_count >= job.max_retries:
            # Move to DLQ
            job.status = JobStatus.DEAD_LETTERED.value
            session.add(JobLog(
                job_id=job.id, event="dead_lettered",
                detail={"error": str(exc)[:500], "retries_exhausted": job.retry_count},
            ))
            jobs_dead_lettered_total.labels(job_type=job.job_type).inc()

            # Publish to DLQ for monitoring
            from src.worker.celery_app import celery_app
            celery_app.send_task(
                "src.worker.tasks.base.handle_dead_letter",
                kwargs={"job_id": job_id, "error": str(exc)[:500]},
                queue="dlq",
            )
        else:
            job.status = JobStatus.FAILED.value
            # ...
        session.commit()
\`\`\`

Two conditions dead-letter a job: a \`PermanentError\`, or exhausted retries. With DLX the classification still lives in your code — you're the one calling \`basic_reject\` — but the *consequence* lives in broker configuration, split across a queue argument and an exchange binding. When someone asks "what happens to a job that fails validation," I answer by pointing at one function. In the DLX version I'd point at a function, plus a topology declaration, plus whatever set the queue arguments at deploy time.

That's not a dramatic win. It's a small one that repeats every time somebody new reads the code.

## The DLQ is a SQL table

This is the one that changed how I operate the system.

With DLX, inspecting the dead-letter queue means consuming from it. You pull messages, look at them, and put them back — and putting them back is fiddly, because a consumed-but-unacked message isn't visible to other consumers, and an acked one is gone. Filtering is worse. RabbitMQ queues are FIFO, not indexed. "Show me every dead-lettered image job from the last hour" is not a question a queue answers; it's a script that drains, filters in memory, and republishes what it didn't want.

Because my terminal state is a row, that question is a query. The repository takes a status filter, and the API exposes it:

\`\`\`python
# src/api/routers/jobs.py
@router.get("", response_model=PaginatedJobsResponse)
async def list_jobs(
    client_id: str | None = Query(None),
    status: str | None = Query(None),
    job_type: str | None = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    service: JobService = Depends(get_job_service),
):
\`\`\`

So the DLQ is a URL:

\`\`\`
GET /api/v1/jobs?status=dead_lettered&job_type=image_processing&page=1
\`\`\`

Paginated, filterable, ordered newest-first, with a total count — and inspecting it can't mutate it. On top of that, every state transition writes a \`JobLog\` row, so a dead-lettered job isn't just a payload and a reason. It's a payload, a reason, and an ordered history: created, started, retried, retried, dead_lettered. An \`x-death\` header gives you a count and a timestamp. A log table gives you the sequence.

## Replay is an HTTP call, not a republish loop

Same argument, different verb. Broker-level replay means consuming from the DLQ and republishing to the original exchange, and you own the correctness of that loop — right routing key, preserved headers, no lost messages if the script dies halfway through.

Because the job is a row, replay is a state transition plus a fresh dispatch:

\`\`\`python
# src/services/job_service.py
async def retry_job(self, job_id: uuid.UUID) -> Job | None:
    """Manually retry a dead-lettered job."""
    job = await self.repo.get_by_id(job_id)
    if not job or job.status != JobStatus.DEAD_LETTERED.value:
        return None

    job.retry_count = 0
    job.error_message = None

    from src.worker.celery_app import dispatch_job

    queue = PRIORITY_QUEUE_MAP.get(job.priority, "default")
    celery_task_id = dispatch_job(
        job_id=str(job.id), job_type=job.job_type,
        payload=job.payload, queue=queue, priority=job.priority,
    )
    await self.repo.update_status(
        job.id, JobStatus.QUEUED, celery_task_id=celery_task_id
    )
\`\`\`

Exposed as \`POST /api/v1/jobs/{job_id}/retry\`, which refuses anything not already dead-lettered:

\`\`\`python
# src/api/routers/jobs.py
@router.post("/{job_id}/retry", response_model=JobResponse)
async def retry_job(job_id: uuid.UUID, service: JobService = Depends(get_job_service)):
    job = await service.retry_job(job_id)
    if not job:
        raise HTTPException(
            status_code=404,
            detail="Job not found or not in dead_lettered status",
        )
\`\`\`

Retrying one job is one call. Retrying a hundred is a loop over a query result — and it's the same query you just used to decide which hundred.

There's a trade-off nested inside this one. Replay re-dispatches through \`dispatch_job\`, which mints a **new** Celery task ID against the same job row. That's the behavior I want: the job's identity is the row, not the message, so its history survives across replays. But it also means the original message is genuinely gone from the broker by then. There is no broker-side copy to fall back on if my Postgres write was wrong.

## What I gave up

Here is the honest cost, and it's the strongest case for the design I didn't pick.

**DLX works when my application doesn't.** RabbitMQ's dead-lettering is executed by the broker. It does not care whether my worker code is correct, whether Postgres is reachable, or whether my process is running at all. Message rejected or expired, broker routes it. That's a durability guarantee living outside my code.

Mine isn't. Every path to \`dead_lettered\` runs through \`on_failure\`, in my worker, which opens a Postgres session to record the outcome:

\`\`\`python
with SyncSessionFactory() as session:
    job = session.get(Job, uuid.UUID(job_id))
    if not job:
        return
\`\`\`

If that write fails — pool exhausted, database failing over, network partition — the job does not get marked dead-lettered. The exception surfaces inside a Celery failure handler and the job is left in whatever state it held, usually \`running\`. It isn't lost: \`acks_late\` means RabbitMQ still holds the message unacknowledged, so it gets redelivered. But my system's own record of the failure is missing, \`jobs_dead_lettered_total\` never increments, and the alert that should have fired doesn't. I traded a broker guarantee for an application guarantee, and my application has strictly more ways to fail than the broker does.

There's a second, quieter cost. With DLX the dead-letter path is declarative — it lives in the queue definition, visible to anyone who inspects the broker. Mine is imperative and only visible by reading Python. An operator who knows RabbitMQ but not my codebase can debug a DLX setup from the management UI. They cannot debug mine.

If I were running this somewhere a database outage and a message flood could plausibly coincide, I'd reach for DLX — or for both, with the broker as backstop and the application as the queryable index. For this workload, a SQL-queryable DLQ was worth more than a durability edge case. That's a judgment about my failure modes, not a general claim that one design wins.

## Duplicate execution, and the gate that stops it

\`acks_late\` is what makes the dead-letter path reliable. It's also what creates the next problem. If a worker finishes a job's side effects and dies before acknowledging, RabbitMQ redelivers. The same job runs twice.

The naive fix — mark the job as seen *before* doing the work — is worse than the disease. Mark it, crash mid-task, and the redelivery sees the mark and skips. The job silently never completes. That converts at-least-once delivery into at-most-once **with silent loss**, which is precisely the failure dead-lettering exists to prevent.

So the commit point has to come *after* the work, and the gate has to check for completion rather than attendance:

\`\`\`python
def before_start(self, task_id, args, kwargs):
    job_id = kwargs.get("job_id")
    # ...
    with SyncSessionFactory() as session:
        job = session.get(Job, uuid.UUID(job_id))
        # ...
        # Idempotency: skip if already completed
        if job.status == JobStatus.COMPLETED.value:
            logger.info("job_already_completed", job_id=job_id)
            raise celery.exceptions.Ignore()

        job.status = JobStatus.RUNNING.value
        job.started_at = datetime.now(timezone.utc)
        # ...
        session.commit()
\`\`\`

\`before_start\` runs ahead of the task body and skips only if the job is already \`completed\`. Anything else — \`queued\`, \`running\`, \`failed\` — falls through and executes. The terminal write happens in \`on_success\`, which Celery calls after the body returns:

\`\`\`python
def on_success(self, retval, task_id, args, kwargs):
    job_id = kwargs.get("job_id")
    # ...
    with SyncSessionFactory() as session:
        job = session.get(Job, uuid.UUID(job_id))
        # ...
        job.status = JobStatus.COMPLETED.value
        job.result = retval if isinstance(retval, dict) else {"result": str(retval)}
        job.completed_at = now
        # ...
        session.commit()
\`\`\`

Two states doing two different jobs. \`running\` is a **claim**: it records that someone started, and it deliberately does not block a retry. \`completed\` is a **commitment**: written only after the work is done, and the only state that suppresses re-execution. A worker killed mid-task leaves \`running\`, the message is redelivered, the gate lets it through, the job runs again. Duplicated, not dropped — and for this system that's the correct direction to err.

A separate mechanism handles a different problem one layer up: duplicate *submissions*. Clients may send an idempotency key, and the job table constrains it:

\`\`\`python
# src/domain/models.py
__table_args__ = (
    UniqueConstraint("idempotency_key", name="uq_jobs_idempotency_key"),
    # ...
)
\`\`\`

\`\`\`python
# src/services/job_service.py — inside create_job
if idempotency_key:
    existing_job = await self.repo.get_by_idempotency_key(idempotency_key)
    if existing_job:
        logger.info("idempotency_hit", key=idempotency_key, job_id=str(existing_job.id))
        return existing_job, False
\`\`\`

Which is why the create endpoint returns \`201\` for a new job and \`200\` for an idempotent duplicate — the caller can tell which happened. Worth being clear that this is a different guarantee from the execution gate: it deduplicates submissions, not runs.

## What the test shows, and what it doesn't

I measured this by killing workers with \`kill -9\` in a tight loop while a producer saturated the queue: zero duplicate executions across 10K jobs.

I want to be precise about what that establishes, because it's a duplicate-counting harness and there are two things it cannot see.

**It cannot detect a dropped job.** A harness that counts how many jobs ran more than once reads a job that ran *zero* times as a success. "Zero duplicates" and "nothing was lost" are different claims, and this test supports only the first. Confirming the second means counting completions against submissions, which I haven't done. Given the design — the gate skips only on \`completed\`, so an incomplete job stays eligible — I expect no loss. Expecting is not measuring.

**It cannot close the window it was built to narrow.** The gate shrinks the duplicate-execution window from "the whole task duration" to "the interval between the task body returning and \`on_success\` committing \`completed\`." That interval is short. It is not zero. A worker killed inside it leaves \`running\`, the message is redelivered, and the job runs a second time with its side effects already applied once. This is at-least-once execution with a narrow window, not exactly-once, and no amount of tightening makes it exactly-once. That would require the side effect and the marker to commit in the same transaction — and \`on_success\` opens its own session, separate from whatever the task body did.

Two further limits, stated rather than left to be found:

- **There is no mutual exclusion on \`running\`.** The gate skips only on \`completed\`, so if a redelivery arrives while a worker is still alive and processing, the second worker sees \`running\`, falls through, and executes concurrently. Nothing holds a lock. That's a deliberate bias toward at-least-once, but "two workers never process the same job simultaneously" is not a guarantee this system makes.
- **\`on_failure\` writes in its own session too**, so the dead-letter record carries the same commit-window exposure as the completion record.

## What does *not* get dead-lettered

The temptation with any dead-letter mechanism is to send everything to it. Then the DLQ becomes a landfill, the alert becomes noise, and you stop looking. The line I drew lives in one branch:

\`\`\`python
if isinstance(exc, PermanentError) or job.retry_count >= job.max_retries:
    job.status = JobStatus.DEAD_LETTERED.value
    # ...
else:
    job.status = JobStatus.FAILED.value
\`\`\`

Two states for two different meanings, and the distinction is the whole discipline:

- **\`failed\` means "this attempt didn't work and another one is coming."** A \`TransientError\` — upstream 5xx, a timeout, a connection reset — lands here. It's a waypoint, not a destination. Celery's \`autoretry_for\` will pick it up, \`on_retry\` will bump the retry count, and the job goes around again. Alerting on \`failed\` would page you for every blip on a flaky upstream.
- **\`dead_lettered\` means "no future attempt will help."** Only two things reach it: a \`PermanentError\`, or a job that has genuinely run out of retries. Both are terminal. Both deserve a human.

That gives me a rule of thumb I can apply without thinking: **the dead-letter state is for jobs that should have succeeded and didn't.** If retrying it later might work, it's \`failed\` and the retry machinery owns it. If retrying it later is *meaningless*, it doesn't belong in either state — it belongs in an outcome record.

That last category is the one worth being explicit about, because it's where DLQs usually rot:

- **Malformed payloads.** A job whose payload can't be deserialized will never succeed, no matter how many times you replay it. Raising \`PermanentError\` does keep it out of the retry loop — correct — but it still lands in \`dead_lettered\` alongside genuine incidents, and replaying it is guaranteed to fail again. My schema layer rejects bad shapes at submission with a 4xx, before a job row exists, which is the right place for it. What survives validation and still fails to deserialize is a bug in my code, not an operational event.
- **Failures that are the correct answer.** A webhook target that returns a durable 404 hasn't malfunctioned; it has told you something true. That's an outcome to record against the job, not an incident to page on.
- **Work that stopped mattering.** The user cancelled, or the entity was deleted while the job sat in the queue. Retrying is meaningless and dead-lettering is misleading. Drop it explicitly, with a structured log line saying why.

The cost of getting this wrong isn't a broken system — everything still runs. The cost is that \`HighDLQDepth\` fires for a reason nobody needs to act on, and three weeks later it's a rule people mute. An alert you've muted is worse than an alert you never wrote, because you think you have coverage.

## The observability that makes it operable

A dead-letter path nobody watches is the same as no dead-letter path. Because dead-lettering is application code here, the metrics come from the same place as the decision:

\`\`\`python
# src/infra/prometheus.py
job_retries_total = Counter(
    "job_retries_total", "Total job retries", ["job_type"],
)

jobs_dead_lettered_total = Counter(
    "jobs_dead_lettered_total", "Total jobs moved to DLQ", ["job_type"],
)
\`\`\`

\`on_failure\` increments the dead-letter counter on its terminal branch and \`on_retry\` increments the retry counter, so both are written by the code that made the call rather than inferred from broker state. The alerts sit on those series:

\`\`\`yaml
# monitoring/alerting_rules.yml
- alert: HighDLQDepth
  expr: jobs_dead_lettered_total > 10
  for: 5m
  labels:
    severity: critical

- alert: HighRetryRate
  expr: rate(job_retries_total[5m]) > 1
  for: 10m
  labels:
    severity: warning
\`\`\`

And a real flaw in what I shipped, worth naming because it's a direct consequence of the design choice: \`jobs_dead_lettered_total\` is a **counter**, so it only goes up. \`HighDLQDepth\` firing on \`jobs_dead_lettered_total > 10\` triggers once the process has ever dead-lettered eleven jobs and then stays firing forever. It measures cumulative dead-letters since worker start, not current backlog — which is not what the alert name promises. With DLX I'd have had \`rabbitmq_queue_messages\` for free, and that's a gauge that goes down when you drain. Getting an honest depth signal here means either a rate window over the counter or a periodic \`count(*) WHERE status = 'dead_lettered'\`. Losing a free gauge is a genuine ergonomic cost of moving the DLQ out of the broker, and it's still on my list.

The dedicated \`dlq\` queue does get used — not by RabbitMQ, but by \`on_failure\` forwarding a summary to a handler that owns notification:

\`\`\`python
# src/worker/callbacks.py
@celery_app.task(name="src.worker.tasks.base.handle_dead_letter", queue="dlq")
def handle_dead_letter(*, job_id: str, error: str) -> dict:
    """Process a dead-lettered job. This task runs on the DLQ and handles
    alerting, logging, and optional notification delivery."""
    logger.error("dead_letter_received", job_id=job_id, error=error)
    # ...
\`\`\`

## Takeaways

1. **Dead-lettering is a decision about where terminal state lives**, not a feature you switch on. Broker or application — pick deliberately.
2. **If your jobs are already rows, your DLQ is already a table.** Filtering, pagination, and audit history come free instead of being built on top of a FIFO queue.
3. **The broker's advantage is that it works when you don't.** DLX executes outside your code. Application-level dead-lettering inherits every failure mode your application has, its database included.
4. **The commit point goes after the work.** Marking a job before doing it converts crash recovery into silent loss.
5. **Distinguish the claim from the commitment.** \`running\` must not suppress a retry; only \`completed\` may.
6. **Be selective about what reaches the terminal state.** \`failed\` is a waypoint; \`dead_lettered\` is a destination. Conflating them turns your alert into noise, and a muted alert is worse than no alert.
7. **Name your residual window.** \`acks_late\` plus a post-work marker gets you at-least-once with a short duplicate window — not exactly-once. Say so before someone asks.

The version of this post I didn't write is the one explaining \`x-dead-letter-exchange\`. That post exists, many times over, and it describes a fine pattern. This one is about the fork: the broker offered to handle my failures, and I said no on purpose, for reasons I can defend and at a cost I can name.

---

*The implementation is in [malav-250/distributed-task-queue](https://github.com/malav-250/distributed-task-queue) — failure hooks in \`src/worker/tasks/base.py\`, queue topology in \`src/worker/celery_app.py\`, replay path in \`src/services/job_service.py\`. Architecture and decision log on the [case study page](/projects/distributed-task-queue).*`,
  },
  {
    slug: "cost-of-three-azs",
    title: "The cost of three AZs",
    subtitle:
      "What multi-AZ resilience actually costs per month on AWS — and when two zones is the honest right answer.",
    excerpt:
      "Most cloud tutorials spread workloads across two AZs and stop. Three AZs gets you stronger failover but costs measurably more — usually NAT Gateways, not what you'd expect. Here's the real monthly bill, line by line.",
    publishedAt: "2026-06-08",
    readingTime: "8 min read",
    tags: ["Cloud", "AWS", "Cost Engineering", "Infrastructure"],
    content: `## Why this matters

When I was building the [Resilient Cloud Deployment Platform](/projects/cloud-native-app), I made an architectural decision early on: deploy across **three** availability zones, not two. The reasoning is in the case study (capacity preservation under AZ failure: 67% vs 50%). What I didn't include there is the money side.

"Three AZs is more resilient" is the easy headline. The honest version is: three AZs is more resilient **and costs about 35% more per month for a small workload**. Whether that markup is worth it depends on what you're protecting against. This post is the actual cost teardown — line by line, with real AWS pricing — so you can make the call for your own system.

## The decision frame

There are three configurations worth comparing for a typical FastAPI/Spring Boot app behind an ALB:

1. **Single AZ** — one EC2, no resilience. Fine for personal projects. Won't survive a routine AWS maintenance event. Excluded from this comparison.
2. **Two AZs** — the AWS Well-Architected starter pattern. Loses 50% capacity if an AZ fails.
3. **Three AZs** — loses 33% capacity if an AZ fails. The pattern production teams ship.

I'll model both 2-AZ and 3-AZ for the same workload: a small FastAPI app behind an ALB, with a Multi-AZ RDS, and outbound internet access via NAT Gateways. The instance types are real (small enough to actually use for a portfolio-scale app), and all prices are AWS's published US-East-1 rates.

## The line items

### EC2 instances

The app tier runs an Auto Scaling Group with one EC2 per AZ.

| Instance | Hourly | Monthly (730h) |
|---|---|---|
| t3.small | $0.0208 | **$15.18** |

*All hourly rates in this post are AWS published on-demand rates for us-east-1, verified against the AWS Price List API on 9 September 2026.*

- **2 AZ:** 2 × $15.18 = **$30.36/mo**
- **3 AZ:** 3 × $15.18 = **$45.54/mo**
- Difference: **+$15.18/mo** for the extra zone.

This is the obvious cost. It's also the smallest.

### Application Load Balancer

The ALB is what most people overlook. It's billed per hour **plus** per LCU (Load Balancer Capacity Unit), which measures actual traffic.

| Item | Cost |
|---|---|
| ALB hour | $0.0225/hr × 730 = **$16.43/mo** |
| LCUs | ~$0.008/LCU-hour; ignored at portfolio traffic |

The ALB cost is identical in both setups — one ALB spans all enabled subnets. Adding a third AZ to the ALB is free.

- **2 AZ ALB:** $16.43/mo
- **3 AZ ALB:** $16.43/mo
- Difference: **$0**

### NAT Gateway — the sneaky one

Every app instance in a private subnet needs outbound internet access (for pulling Docker images, calling SendGrid, etc.). That goes through a NAT Gateway. **AWS charges per NAT Gateway** — hourly fee + per-GB data processing.

| Item | Cost |
|---|---|
| NAT Gateway hour | $0.045/hr × 730 = **$32.85/mo per gateway** |
| Data processed | $0.045/GB |

Here's the choice that hits the bill hardest:

**Option A — one shared NAT** (cheap, fragile):
Put one NAT Gateway in AZ-a. Route the private subnets in AZ-b and AZ-c through it. Cost: **$32.85/mo total**.
**Problem:** if AZ-a fails, app instances in AZ-b and AZ-c lose outbound internet. Your "multi-AZ" deployment is no longer resilient — it has a single point of failure in AZ-a.

**Option B — one NAT per AZ** (the right answer):
A NAT Gateway in each AZ, with each private subnet routing through its own AZ's NAT. Real isolation.

- **2 AZ:** 2 × $32.85 = **$65.70/mo**
- **3 AZ:** 3 × $32.85 = **$98.55/mo**
- Difference: **+$32.85/mo** just for the third NAT.

This is the biggest line-item gap between the two configurations. It catches everyone the first time.

### RDS Multi-AZ

RDS Multi-AZ uses **two AZs**: a primary in one, a synchronous standby in another. It doesn't matter how many AZs your app tier uses — RDS Multi-AZ is two AZs regardless.

| Item | Cost |
|---|---|
| db.t3.micro single-AZ | $0.018/hr × 730 = $13.14/mo |
| db.t3.micro Multi-AZ | 2× = **$26.28/mo** |

- **2 AZ:** $26.28/mo
- **3 AZ:** $26.28/mo
- Difference: **$0**

The 2× is not an approximation — AWS lists db.t3.micro Multi-AZ at exactly $0.036/hr against $0.018/hr single-AZ.

(If you want database failover across three AZs you reach for Aurora, where Multi-AZ is more nuanced. Out of scope here.)

### Cross-AZ data transfer

Inter-AZ traffic isn't free, and the fraction of it that crosses a boundary is easy to get backwards. With cross-zone load balancing across N zones, the ALB spreads requests evenly over every registered target — so a request lands on a target in a *different* AZ **(N−1)/N** of the time, not 1/N. At two zones that's 50%. At three it's **67%**, not 33%.

| Item | Cost |
|---|---|
| Inter-AZ traffic | $0.01/GB inbound + $0.01/GB outbound |

Both directions are metered: AWS bills a \`DataTransfer-Regional-Bytes\` line item for the send *and* the receive, so the effective rate is $0.02/GB of cross-zone traffic.

For a portfolio-scale app pushing ~100GB/month from the ALB to its targets:

- **2 AZ:** 100GB × ½ × $0.02 = **~$1.00/mo**
- **3 AZ:** 100GB × ⅔ × $0.02 = **~$1.33/mo**
- Difference: **+$0.33/mo**

Note which way that goes: three zones costs *more* here, not less, because a larger share of traffic crosses a boundary. Getting the ratio backwards inverts the sign of this line item — one reason I now write the fraction out rather than trusting my memory of it.

Negligible for hobby traffic. Not negligible if you're moving terabytes — but if you're moving terabytes, your conversation is no longer "2 vs 3 AZs."

## The bill

Putting it all together:

| Line item | 2 AZ | 3 AZ |
|---|---|---|
| EC2 instances | $30.36 | $45.54 |
| ALB | $16.43 | $16.43 |
| NAT Gateways (one per AZ) | $65.70 | $98.55 |
| RDS Multi-AZ (db.t3.micro) | $26.28 | $26.28 |
| Cross-AZ data transfer | $1.00 | $1.33 |
| **Total** | **~$140** | **~$188** |
| **Difference** | — | **+$48/mo (+35%)** |

*us-east-1, verified 9 September 2026.*

For a one-developer portfolio app, that's about $580/year for one extra zone of resilience.
For a 10× larger startup workload, multiply all line items proportionally — the difference scales close to linearly until the numbers get big enough that you reach for Reserved Instances or Savings Plans, which work in either configuration.

## When 2 AZs is the right call

Don't assume more is better. Two AZs is genuinely the right answer when:

- You're cost-constrained and not running production traffic
- Your customers are willing to tolerate degraded capacity during the rare AZ outage (a few hours per year)
- You can absorb the failure with auto-scaling — if AZ-a goes down, the ASG can spin up extra instances in AZ-b to cover the load (assuming there's capacity available, which is itself not guaranteed during a regional event)
- You're running a stateful workload where adding a third AZ creates more coordination overhead than it's worth

If you're a solo founder or a student project, **start with 2 AZs**. Spend the saved $48/month on a domain, a logging service, or genuinely useful Cloudflare features. Move to 3 AZs when your uptime SLA actually demands it.

## When 3 AZs is the right call

The pattern flips when you have any of:

- **A real SLA** (99.9% or higher) — math: an AZ failure consumes a significant slice of your annual error budget on 2-AZ; 3 AZs gives you headroom
- **Stateful systems with quorum requirements** — etcd, ZooKeeper, Kafka, Cassandra — 3 AZs is the minimum for losing one zone without losing quorum
- **Compliance-heavy workloads** (HIPAA, FedRAMP, PCI) — auditors specifically look for multi-AZ topology
- **Stateless app tiers where the cost difference is < 5% of your total bill** — if you're already paying $5k/month for RDS, the extra $33 for a third NAT Gateway is not the conversation

## The hidden costs nobody mentions

If you're building this from scratch, three more invisible costs to budget for:

1. **CloudWatch logs and metrics** scale with the number of instances. Tripling app instances doesn't triple log costs if you're already at the free tier, but it does push you over the line sooner. Unlike every other figure in this post, I can't give you an AWS rate for this — it depends entirely on your log volume and retention. My own rough allowance at small scale is $5-15/month, which is an estimate from my bills, not a published price. Work it out from your own ingestion.
2. **VPC endpoints** (for S3, DynamoDB, etc.) are billed per AZ. If you've enabled gateway endpoints (free) you're fine. If you've enabled interface endpoints ($0.01/hr, so $7.30/month per endpoint per AZ), each AZ counts separately.
3. **Engineer time during AZ failover testing.** This is the cost nobody puts in their spreadsheet. The first AZ outage you experience teaches you whether your "multi-AZ" topology actually works. Budget half a day per quarter to terminate instances in one AZ and watch what breaks.

## The framing I use now

When I'm designing a new system, I ask three questions in order:

1. **Does this system need to survive an AZ outage at all?** For internal tools used by 10 employees: probably not. For anything customer-facing: yes.
2. **Does it carry state?** If yes, the AZ count is partly chosen by the state system (etcd/ZooKeeper/Kafka want 3). If no, the AZ count is a pure cost-vs-capacity-during-failure trade.
3. **Can the team operate it in production?** Three AZs means three subnets, three NAT gateways, three sets of routes, three of everything. If you don't have someone who has actually debugged a multi-AZ network issue under stress, your three-AZ deployment is more theoretical than real.

## Takeaways

- **The cost difference between 2 and 3 AZs is ~35% per month** for a small workload — driven mostly by NAT Gateways, not EC2 instances.
- **The bill goes up roughly linearly with AZ count**, until you hit RI/Savings Plan territory.
- **One shared NAT Gateway is a single point of failure** — if you're paying for "multi-AZ" but routing all egress through one NAT, you're paying for an illusion. Always one NAT per AZ in production.
- **Cross-zone traffic is (N−1)/N of your requests, not 1/N.** More zones means a *larger* share crosses a boundary. Get it backwards and this line item moves the wrong direction.
- **Date your prices.** AWS rates drift. When I re-verified this post against the AWS Price List API, db.t3.micro had gone from $0.017/hr to $0.018/hr since I first wrote it — which moved the Multi-AZ line from $24.82 to $26.28 and the monthly totals by about a dollar and a half. Not enough to change the conclusion; enough to make the bill wrong. A bill is a snapshot; say when you took it.
- **Two AZs is honest engineering** for small workloads, students, and personal projects. Three AZs is honest engineering for anything with a real SLA.

The right answer is whichever one you can defend with numbers. Either is fine; the wrong move is paying for three AZs and shipping the topology of one.

---

*The 3-AZ topology I built lives in [malav-250/cloud-tf-aws-infra](https://github.com/malav-250/cloud-tf-aws-infra) and is described in the [case study](/projects/cloud-native-app). Previous post: [Dead-lettering without a Dead Letter Exchange](/blog/dead-letter-routing).*`,
  },
];
