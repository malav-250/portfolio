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
    title: "Designing dead-letter routing for a distributed task queue",
    subtitle:
      "Why naive retries silently drop messages, and the RabbitMQ patterns that keep them visible.",
    excerpt:
      "The default Celery retry behavior eats failures alive. Here's how I designed a dead-letter routing layer that turns every silent drop into an observable, replayable signal.",
    publishedAt: "2026-05-14",
    readingTime: "9 min read",
    tags: ["Backend", "Distributed Systems", "Celery", "RabbitMQ"],
    content: `## The failure mode nobody talks about

Most tutorials for Celery + RabbitMQ stop at "use \`retry\` on the task decorator and you're good." That gets you through a demo. It does not survive production.

Here's what actually happens once real traffic hits an unmodified Celery worker pool:

1. A downstream API gets slow.
2. Workers wait on the slow call. Concurrency drops.
3. The queue fills up.
4. Celery's default \`max_retries=3\` exhausts, and the task **silently disappears** — Celery logs a warning and moves on.
5. Nobody notices until a customer asks why their image never got processed.

Step 4 is the killer. Celery's default behavior after exhausted retries is to log the failure at \`WARNING\` and acknowledge the message. The broker considers it handled. The task is gone. There's no record in your database, no row in a "failed jobs" table, no alert.

This is the problem dead-letter routing solves. Properly designed, it converts every "I gave up on this message" event into a row in a queue you can inspect, alert on, and replay.

## What "dead letter" actually means

In RabbitMQ, a **dead letter** is a message that has been rejected by a consumer, has expired, or has overflowed a queue length limit. By default, dead letters are dropped silently. But RabbitMQ has a per-queue setting called the **Dead Letter Exchange** (DLX): when a message dies on this queue, route it to that exchange instead of dropping it.

The pattern is:

\`\`\`
main_queue ──(DLX)──▶ dlx_exchange ──▶ dead_letter_queue
\`\`\`

The dead-letter queue (DLQ) is just a normal queue. You can:
- **Read from it** to inspect what failed and why.
- **Set up alerts** on its length so on-call gets paged when it grows.
- **Replay** messages back to the main queue once the upstream issue is fixed.

It's the queueing equivalent of a "failed_jobs" database table — but cheaper, observable, and operationally first-class.

## A concrete RabbitMQ setup

Here's the topology I shipped. Two exchanges, two queues, all declared in code at startup:

\`\`\`python
# rabbitmq/topology.py
import pika

def declare_topology(channel: pika.adapters.blocking_connection.BlockingChannel) -> None:
    # 1. The main exchange where producers publish.
    channel.exchange_declare(
        exchange="jobs",
        exchange_type="direct",
        durable=True,
    )

    # 2. The dead-letter exchange. Failed messages get routed here.
    channel.exchange_declare(
        exchange="jobs.dlx",
        exchange_type="direct",
        durable=True,
    )

    # 3. The main queue. Note the x-dead-letter-exchange argument:
    #    when a message is rejected (basic.nack with requeue=False)
    #    or its TTL expires, it gets routed to the DLX.
    channel.queue_declare(
        queue="jobs.main",
        durable=True,
        arguments={
            "x-dead-letter-exchange": "jobs.dlx",
            "x-dead-letter-routing-key": "jobs.failed",
        },
    )
    channel.queue_bind(queue="jobs.main", exchange="jobs", routing_key="jobs")

    # 4. The DLQ — just a normal queue bound to the DLX.
    channel.queue_declare(queue="jobs.dlq", durable=True)
    channel.queue_bind(
        queue="jobs.dlq",
        exchange="jobs.dlx",
        routing_key="jobs.failed",
    )
\`\`\`

That's the whole infrastructure piece. Two exchanges, two queues, four lines of \`arguments\` config.

## What Celery has to do

Celery doesn't know about RabbitMQ's DLX out of the box. You have to **not requeue** on terminal failure — otherwise the message goes back to the main queue, loops forever, and never hits the DLX.

\`\`\`python
# tasks.py
from celery import Task, shared_task
from celery.exceptions import MaxRetriesExceededError

class DeadLetterAware(Task):
    autoretry_for = (TransientError,)
    retry_backoff = True          # exponential: 1s, 2s, 4s, ...
    retry_backoff_max = 60        # cap at 60s
    retry_jitter = True           # randomize to avoid thundering herd
    max_retries = 3
    acks_late = True              # critical: ack only after success
    reject_on_worker_lost = True  # so a worker crash doesn't ack the message

@shared_task(base=DeadLetterAware, bind=True)
def transform_image(self, image_id: str, idempotency_key: str) -> None:
    if seen_recently(idempotency_key):
        return  # already processed; safely skip
    mark_seen(idempotency_key)
    try:
        do_the_work(image_id)
    except TransientError:
        raise  # autoretry will catch this
    except PermanentError:
        # Don't retry. Reject without requeue → RabbitMQ routes to DLX.
        self.update_state(state="DEAD_LETTERED")
        raise Reject(requeue=False)
\`\`\`

Two settings that matter more than the rest:

- **\`acks_late = True\`**. By default, Celery acks the message *before* the task runs. If the worker dies mid-task, the message is gone. With \`acks_late\`, the ack happens only on success; a worker crash leaves the message in the broker for another worker to pick up.
- **\`reject_on_worker_lost = True\`**. If a worker is killed (OOM, SIGKILL), the unacked message stays in the broker. Combined with \`acks_late\`, this means SIGKILL doesn't drop work.

## The idempotency layer

\`acks_late\` introduces a new problem: if a task finishes its side effects but the worker dies before acking, the message will be re-delivered. The same job runs twice.

For some jobs that's fine (set a row to \`status=processed\` — idempotent by construction). For others it's catastrophic (charge a credit card twice).

The fix is an idempotency key, checked in Redis with a TTL longer than the longest retry window:

\`\`\`python
# idempotency.py
import redis

r = redis.Redis()
KEY_TTL_SECONDS = 24 * 60 * 60  # 24 hours

def seen_recently(key: str) -> bool:
    """Return True if this idempotency key has already been processed.
    Uses SET NX (atomic 'set if not exists') to avoid race conditions
    between two workers grabbing the same message simultaneously."""
    return r.set(
        name=f"idem:{key}",
        value="1",
        nx=True,           # only set if not exists
        ex=KEY_TTL_SECONDS,
    ) is None

def mark_seen(key: str) -> None:
    r.set(f"idem:{key}", "1", ex=KEY_TTL_SECONDS)
\`\`\`

The producer generates the idempotency key (usually \`uuid4()\` per intended-action, not per-message). The same intended action repeated by retries shares a key; legit-different actions get different keys.

Under load this measurably eliminates duplicate execution. I tested by killing worker processes with \`kill -9\` mid-task in a tight loop while a producer hammered the queue. Without idempotency keys: ~3% of jobs ran twice. With keys: zero duplicates across 10K messages.

## What the DLQ buys you operationally

Once dead-lettered messages are showing up in \`jobs.dlq\`, you can build the operational layer:

**Alerting.** Prometheus scrapes the queue length:

\`\`\`yaml
# alerts.yaml
groups:
  - name: task_queue
    rules:
      - alert: DeadLetterQueueGrowing
        expr: rabbitmq_queue_messages{queue="jobs.dlq"} > 50
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "DLQ has {{ $value }} stuck messages"
\`\`\`

**Inspection.** A simple admin script that consumes from the DLQ without acking, prints the payload + the \`x-death\` header (which RabbitMQ adds automatically — tells you which queue, when, and why):

\`\`\`python
# scripts/inspect_dlq.py
def inspect_dlq(channel, n=10):
    for _ in range(n):
        method, props, body = channel.basic_get("jobs.dlq", auto_ack=False)
        if not method:
            break
        x_death = props.headers.get("x-death", []) if props.headers else []
        print({
            "delivery_tag": method.delivery_tag,
            "body": body.decode(),
            "failed_at": x_death[0].get("time") if x_death else None,
            "retry_count": x_death[0].get("count") if x_death else 0,
            "reason": x_death[0].get("reason") if x_death else "unknown",
        })
        channel.basic_nack(method.delivery_tag, requeue=True)  # leave in DLQ
\`\`\`

**Replay.** When the upstream issue is fixed, a "replay" script re-publishes DLQ messages back to the main exchange:

\`\`\`python
def replay_dlq(channel, max_messages=100):
    for _ in range(max_messages):
        method, props, body = channel.basic_get("jobs.dlq", auto_ack=False)
        if not method:
            break
        channel.basic_publish(
            exchange="jobs",
            routing_key="jobs",
            body=body,
            properties=props,  # preserves idempotency key — no duplicate runs
        )
        channel.basic_ack(method.delivery_tag)
\`\`\`

Because the idempotency layer survives replays, you can safely replay the entire DLQ during incident recovery. Already-processed jobs will be no-ops.

## What does NOT go in the DLQ

The temptation is to send everything to the DLQ. Don't.

- **Poison messages** (malformed JSON, schema-incompatible payload) — these will *never* succeed. Sending them to the DLQ pollutes it and creates false alert noise. Better: reject them at the producer with a 4xx, or route to a separate \`poison\` queue that doesn't trigger alerts.
- **Expected-rare failures** (e.g. a webhook target returned 404). If it's an end-state, not a transient, write it to a dedicated outcome table instead.
- **Anything where retry is meaningless** (the user cancelled the operation, the entity was deleted while the job was queued). Drop these explicitly with structured logging.

The rule of thumb: the DLQ is for *jobs that should have succeeded but didn't*. If retrying it later wouldn't help, it doesn't belong there.

## Observability is the whole point

A DLQ that nobody monitors is the same as no DLQ. The full observability stack I deployed:

- **Queue length metric** scraped every 15s, alerted on threshold.
- **Per-task success/failure counter** as a Prometheus counter, broken down by task name and outcome.
- **\`x-death\` header inspection** stored in structured logs (one log line per dead-lettered message) with a correlation ID that ties back to the original request.
- **Grafana dashboard panel** for DLQ size over time, retry counts, and per-task failure rates.

When recruiters ask "what does observability mean to you," I point at this dashboard. It's a real working surface, not a slide.

## Takeaways

The interesting design decisions here are:

1. **Don't requeue on terminal failure.** Use \`Reject(requeue=False)\` so RabbitMQ routes to the DLX.
2. **\`acks_late\` + \`reject_on_worker_lost\`** survives crashes without dropping work.
3. **Idempotency keys are non-negotiable** once you have \`acks_late\` — re-delivery becomes a normal failure mode.
4. **The DLQ is an interface to operations**, not a graveyard. Build alerting and replay tooling around it from day one.
5. **Be selective.** Poison messages and end-state failures don't belong in the DLQ.

This is the kind of architecture that doesn't show up on a system-design whiteboard but does show up in every Slack post-mortem at companies that ship reliably. It's worth the four hours to set up properly.

---

*The full implementation lives in [malav-250/distributed-task-queue](https://github.com/malav-250/distributed-task-queue). The architecture diagram and decision log are on the [case study page](/projects/distributed-task-queue).*`,
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
| db.t3.micro single-AZ | $0.017/hr × 730 = $12.41/mo |
| db.t3.micro Multi-AZ | 2× = **$24.82/mo** |

- **2 AZ:** $24.82/mo
- **3 AZ:** $24.82/mo
- Difference: **$0**

(If you want database failover across three AZs you reach for Aurora, where Multi-AZ is more nuanced. Out of scope here.)

### Cross-AZ data transfer

Inter-AZ traffic isn't free. The ALB routes requests to whichever AZ has a healthy instance, which means roughly 1/N of your traffic crosses an AZ boundary going in, and 1/N goes back out.

| Item | Cost |
|---|---|
| Inter-AZ traffic | $0.01/GB inbound + $0.01/GB outbound |

For a portfolio-scale app pushing ~50GB/month between AZs:

- **2 AZ:** ~$1/mo
- **3 AZ:** ~$2/mo
- Difference: **+$1/mo**

Negligible for hobby traffic. Not negligible if you're moving terabytes — but if you're moving terabytes, your conversation is no longer "2 vs 3 AZs."

## The bill

Putting it all together:

| Line item | 2 AZ | 3 AZ |
|---|---|---|
| EC2 instances | $30.36 | $45.54 |
| ALB | $16.43 | $16.43 |
| NAT Gateways (one per AZ) | $65.70 | $98.55 |
| RDS Multi-AZ (db.t3.micro) | $24.82 | $24.82 |
| Cross-AZ data transfer | $1 | $2 |
| **Total** | **~$138** | **~$187** |
| **Difference** | — | **+$49/mo (+35%)** |

For a one-developer portfolio app, that's $588/year for one extra zone of resilience.
For a 10× larger startup workload, multiply all line items proportionally — the difference scales close to linearly until the numbers get big enough that you reach for Reserved Instances or Savings Plans, which work in either configuration.

## When 2 AZs is the right call

Don't assume more is better. Two AZs is genuinely the right answer when:

- You're cost-constrained and not running production traffic
- Your customers are willing to tolerate degraded capacity during the rare AZ outage (a few hours per year)
- You can absorb the failure with auto-scaling — if AZ-a goes down, the ASG can spin up extra instances in AZ-b to cover the load (assuming there's capacity available, which is itself not guaranteed during a regional event)
- You're running a stateful workload where adding a third AZ creates more coordination overhead than it's worth

If you're a solo founder or a student project, **start with 2 AZs**. Spend the saved $49/month on a domain, a logging service, or genuinely useful Cloudflare features. Move to 3 AZs when your uptime SLA actually demands it.

## When 3 AZs is the right call

The pattern flips when you have any of:

- **A real SLA** (99.9% or higher) — math: an AZ failure consumes a significant slice of your annual error budget on 2-AZ; 3 AZs gives you headroom
- **Stateful systems with quorum requirements** — etcd, ZooKeeper, Kafka, Cassandra — 3 AZs is the minimum for losing one zone without losing quorum
- **Compliance-heavy workloads** (HIPAA, FedRAMP, PCI) — auditors specifically look for multi-AZ topology
- **Stateless app tiers where the cost difference is < 5% of your total bill** — if you're already paying $5k/month for RDS, the extra $35 for a third NAT Gateway is not the conversation

## The hidden costs nobody mentions

If you're building this from scratch, three more invisible costs to budget for:

1. **CloudWatch logs and metrics** scale with the number of instances. Tripling app instances doesn't triple log costs if you're already at the free tier, but it does push you over the line sooner. Budget another $5-15/month at small scale.
2. **VPC endpoints** (for S3, DynamoDB, etc.) are billed per AZ. If you've enabled gateway endpoints (free) you're fine. If you've enabled interface endpoints ($7/month per endpoint per AZ), each AZ counts separately.
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
- **Two AZs is honest engineering** for small workloads, students, and personal projects. Three AZs is honest engineering for anything with a real SLA.

The right answer is whichever one you can defend with numbers. Either is fine; the wrong move is paying for three AZs and shipping the topology of one.

---

*The 3-AZ topology I built lives in [malav-250/cloud-tf-aws-infra](https://github.com/malav-250/cloud-tf-aws-infra) and is described in the [case study](/projects/cloud-native-app). Previous post: [Designing dead-letter routing for a distributed task queue](/blog/dead-letter-routing).*`,
  },
];
