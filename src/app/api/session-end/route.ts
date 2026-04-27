import { NextResponse, type NextRequest } from "next/server";
import { sessionEndSchema } from "@/lib/validators";
import { endSession } from "@/lib/analytics-service";

// Finalizes a session. Sent via navigator.sendBeacon on tab hidden/unload.
// `is_bounce` is computed in the DB layer based on page count + duration.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const text = await req.text();
    const body = text ? safeJsonParse(text) : {};
    const parsed = sessionEndSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "invalid_input" },
        { status: 400 }
      );
    }

    await endSession(parsed.data.sessionId, parsed.data.durationSeconds);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[/api/session-end]", err);
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
