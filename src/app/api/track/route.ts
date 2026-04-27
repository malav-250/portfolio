import { NextResponse, type NextRequest } from "next/server";
import { rateLimit } from "@/lib/rateLimit";
import { enrichIp } from "@/lib/ipinfo";
import { upsertVisitorByIp, createSession } from "@/lib/analytics-service";
import { getClientIp } from "@/lib/getClientIp";

// Initializes a session. Called on first page load.
//
// Steps:
//   1. Resolve client IP from forwarding headers
//   2. Rate-limit (10 req/min per IP) to deter abuse
//   3. Enrich IP with city/country/org via IPinfo (best-effort)
//   4. Upsert visitor (deduped per day)
//   5. Create session row
//   6. Return { sessionId, visitorId } for the client to persist

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);

    const rl = await rateLimit(`track:${ip}`, 10, 60_000);
    if (!rl.ok) {
      return NextResponse.json(
        { success: false, error: "rate_limited" },
        { status: 429 }
      );
    }

    const enriched = await enrichIp(ip);
    const visitorId = await upsertVisitorByIp(
      ip,
      enriched.city ?? null,
      enriched.region ?? null,
      enriched.country ?? null,
      enriched.org ?? null
    );
    const sessionId = await createSession(visitorId);

    return NextResponse.json({ success: true, sessionId, visitorId });
  } catch (err) {
    console.error("[/api/track]", err);
    return NextResponse.json(
      { success: false, error: "internal_error" },
      { status: 500 }
    );
  }
}
