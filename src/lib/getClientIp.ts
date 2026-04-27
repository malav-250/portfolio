import type { NextRequest } from "next/server";

/**
 * Extract the originating client IP from a Next.js request.
 * Vercel sets `x-forwarded-for` (first hop = client). We trim and pick the
 * first entry — anything after that is the chain of proxies.
 */
export function getClientIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = req.headers.get("x-real-ip");
  if (real) return real;
  return "127.0.0.1";
}
