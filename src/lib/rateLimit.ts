// Rate limiter with two backends:
//
// 1. Upstash Redis (preferred for production)
//    Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.
//    Uses the REST API directly (no SDK dependency).
//
// 2. In-memory (default fallback)
//    Works locally and on a single warm Vercel container, but is best-effort
//    only — different invocations may hit different containers and bypass
//    each other's counters. For production-grade limiting, configure Upstash.

interface RateLimitResult {
  ok: boolean;
  remaining: number;
}

// Per-process memory bucket. Each entry is an array of recent timestamps.
const memoryBuckets = new Map<string, number[]>();

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

export async function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  if (UPSTASH_URL && UPSTASH_TOKEN) {
    return upstashRateLimit(key, limit, windowMs);
  }
  return memoryRateLimit(key, limit, windowMs);
}

// Sliding window in-memory rate limit.
function memoryRateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const cutoff = now - windowMs;
  const recent = (memoryBuckets.get(key) ?? []).filter((t) => t > cutoff);

  if (recent.length >= limit) {
    memoryBuckets.set(key, recent);
    return { ok: false, remaining: 0 };
  }

  recent.push(now);
  memoryBuckets.set(key, recent);

  // Periodic cleanup to bound memory usage.
  if (memoryBuckets.size > 5000) {
    for (const [k, arr] of memoryBuckets) {
      if (arr.length === 0 || arr[arr.length - 1] < cutoff) {
        memoryBuckets.delete(k);
      }
    }
  }

  return { ok: true, remaining: limit - recent.length };
}

// Fixed-window counter via Upstash REST. Simpler than sliding-window but
// adequate for spam protection on tracking endpoints.
async function upstashRateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  try {
    const incrRes = await fetch(
      `${UPSTASH_URL}/incr/${encodeURIComponent(key)}`,
      { headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` } }
    );
    const incrJson = (await incrRes.json()) as { result?: number };
    const count = Number(incrJson.result ?? 0);

    if (count === 1) {
      // First request in this window — set the expiry.
      await fetch(
        `${UPSTASH_URL}/pexpire/${encodeURIComponent(key)}/${windowMs}`,
        { headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` } }
      );
    }

    if (count > limit) {
      return { ok: false, remaining: 0 };
    }
    return { ok: true, remaining: Math.max(0, limit - count) };
  } catch (err) {
    // Fail open: don't block legitimate traffic if Redis is unavailable.
    console.warn("[rateLimit] Upstash error, failing open:", err);
    return { ok: true, remaining: limit };
  }
}
