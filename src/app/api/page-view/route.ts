import { NextResponse, type NextRequest } from "next/server";
import { pageViewSchema } from "@/lib/validators";
import { upsertPageView } from "@/lib/analytics-service";

// Records (or dedupes) a page view for a session.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = pageViewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "invalid_input" },
        { status: 400 }
      );
    }

    const id = await upsertPageView(
      parsed.data.sessionId,
      parsed.data.path,
      parsed.data.referrer ?? null
    );

    return NextResponse.json({ success: true, pageViewId: id });
  } catch (err) {
    console.error("[/api/page-view]", err);
    return NextResponse.json(
      { success: false, error: "internal_error" },
      { status: 500 }
    );
  }
}
