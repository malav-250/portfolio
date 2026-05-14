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
];
