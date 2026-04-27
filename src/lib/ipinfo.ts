import type { IpEnrichment } from "@/types/analytics";

// ─── Ethical scope ───────────────────────────────────────────────────
// This module enriches an IP address with city/region/country/organization
// data via the IPinfo API. We DO NOT attempt to identify individuals.
// Org-level data tells us "a recruiter from Stripe visited" without revealing
// which person — that's the level of fidelity we want and no more.
// We never fingerprint, never cross-reference, and never share enriched data.
// Private IPs (RFC 1918 / loopback) are skipped entirely.

const IPINFO_BASE = "https://ipinfo.io";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24h
const FETCH_TIMEOUT_MS = 3000;

// Per-instance LRU-ish cache. Sufficient for serverless warm starts.
// On cold starts the cache is empty; that's fine — IPinfo's free tier is
// generous and we only call once per (IP, day) anyway because the visitor
// upsert dedupes on the database side.
const cache = new Map<string, { data: IpEnrichment; expires: number }>();

/**
 * Enrich a public IP with geolocation + organization metadata.
 * Always returns a value — falls back to bare IP on any error or for private IPs.
 */
export async function enrichIp(ip: string): Promise<IpEnrichment> {
  const cached = cache.get(ip);
  if (cached && cached.expires > Date.now()) {
    return cached.data;
  }

  if (isPrivateIp(ip)) {
    return { ip, country: "LOCAL" };
  }

  const token = process.env.IPINFO_TOKEN;

  try {
    const url = token
      ? `${IPINFO_BASE}/${encodeURIComponent(ip)}?token=${encodeURIComponent(token)}`
      : `${IPINFO_BASE}/${encodeURIComponent(ip)}/json`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`IPinfo HTTP ${res.status}`);
    }

    const raw = (await res.json()) as Record<string, unknown>;
    const enriched: IpEnrichment = {
      ip,
      city: typeof raw.city === "string" ? raw.city : null,
      region: typeof raw.region === "string" ? raw.region : null,
      country: typeof raw.country === "string" ? raw.country : null,
      org: typeof raw.org === "string" ? raw.org : null,
    };

    cache.set(ip, { data: enriched, expires: Date.now() + CACHE_TTL_MS });
    return enriched;
  } catch (err) {
    // Non-fatal — log and degrade gracefully.
    console.warn("[ipinfo] enrichment failed:", err instanceof Error ? err.message : err);
    return { ip };
  }
}

function isPrivateIp(ip: string): boolean {
  if (!ip || ip === "127.0.0.1" || ip === "::1" || ip === "localhost") return true;
  // RFC 1918 private ranges
  if (ip.startsWith("10.")) return true;
  if (ip.startsWith("192.168.")) return true;
  if (/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(ip)) return true;
  // RFC 4193 unique local addresses (IPv6)
  if (ip.toLowerCase().startsWith("fc") || ip.toLowerCase().startsWith("fd")) return true;
  // Link-local
  if (ip.startsWith("169.254.")) return true;
  return false;
}
