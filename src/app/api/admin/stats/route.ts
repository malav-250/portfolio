import { NextResponse, type NextRequest } from "next/server";
import {
  getRecentSessions,
  getResumeClickStats,
  getTopPages,
  getTotals,
  getUniqueVisitorsByDay,
} from "@/lib/analytics-service";

// Aggregated stats for the admin dashboard.
// Auth: ADMIN_SECRET passed via `?secret=...` query param OR `admin_secret` cookie.
// This is intentionally light — a single-author admin page doesn't need full auth.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorize(req: NextRequest): boolean {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return false;

  const queryToken = req.nextUrl.searchParams.get("secret");
  const cookieToken = req.cookies.get("admin_secret")?.value;

  return queryToken === secret || cookieToken === secret;
}

export async function GET(req: NextRequest) {
  if (!authorize(req)) {
    return NextResponse.json(
      { success: false, error: "unauthorized" },
      { status: 401 }
    );
  }

  try {
    // Parallelize independent queries to minimize total latency.
    const [
      recentSessions,
      topPages,
      resumeClicks,
      uniqueVisitorsByDay,
      totals,
    ] = await Promise.all([
      getRecentSessions(50),
      getTopPages(10),
      getResumeClickStats(),
      getUniqueVisitorsByDay(14),
      getTotals(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        recentSessions,
        topPages,
        resumeClicks,
        uniqueVisitorsByDay,
        totalVisitors: totals.totalVisitors,
        totalSessions: totals.totalSessions,
      },
    });
  } catch (err) {
    console.error("[/api/admin/stats]", err);
    return NextResponse.json(
      { success: false, error: "internal_error" },
      { status: 500 }
    );
  }
}
