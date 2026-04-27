import { NextResponse, type NextRequest } from "next/server";
import { trackDurationSchema } from "@/lib/validators";
import { updatePageDuration } from "@/lib/analytics-service";

// Updates time spent + max scroll depth for a page view.
// Called via navigator.sendBeacon on visibilitychange/beforeunload.
//
// Beacon payloads arrive with content-type text/plain or application/json
// depending on the Blob the client used. We read raw text and JSON.parse it
// so either content-type works.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const text = await req.text();
    const body = text ? safeJsonParse(text) : {};
    const parsed = trackDurationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "invalid_input" },
        { status: 400 }
      );
    }

    await updatePageDuration(
      parsed.data.sessionId,
      parsed.data.path,
      parsed.data.timeSpentSeconds,
      parsed.data.maxScrollPct
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[/api/track-duration]", err);
    return NextResponse.json(
      { success: false, error: "internal_error" },
      { status: 500 }
    );
  }
}

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}
