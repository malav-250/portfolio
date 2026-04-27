import { NextResponse, type NextRequest } from "next/server";
import { eventSchema } from "@/lib/validators";
import { recordEvent } from "@/lib/analytics-service";

// Records a discrete user action (resume_click, project_click, contact_click).
// `eventType` is allowlisted via Zod enum — anything else is rejected.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const text = await req.text();
    const body = text ? safeJsonParse(text) : {};
    const parsed = eventSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "invalid_input" },
        { status: 400 }
      );
    }

    await recordEvent(
      parsed.data.sessionId,
      parsed.data.eventType,
      parsed.data.metadata ?? null
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[/api/event]", err);
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
