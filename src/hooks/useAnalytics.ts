"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import type { AllowedEventType } from "@/lib/validators";

const SESSION_KEY = "analytics:sessionId";

// ─── Public utility (importable from any client component) ──────────
//
// trackEvent fires off a discrete user action (resume_click, project_click,
// contact_click) without any awaits — never delays the UI. Safe to call
// from onClick handlers anywhere on the page.

export function trackEvent(
  eventType: AllowedEventType,
  metadata?: Record<string, unknown>
): void {
  if (typeof window === "undefined") return;
  const sessionId = window.sessionStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    // No session yet — likely tracking initialization is still in flight.
    // We deliberately drop the event rather than block the click.
    return;
  }

  const payload = JSON.stringify({ sessionId, eventType, metadata });

  // Prefer sendBeacon for clicks that may unload the page (resume PDF opens
  // in a new tab so usually safe, but keepalive fetch covers both).
  if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
    const blob = new Blob([payload], { type: "application/json" });
    if (navigator.sendBeacon("/api/event", blob)) return;
  }

  // Fire-and-forget fetch fallback. `keepalive` lets it survive page unload.
  void fetch("/api/event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
    keepalive: true,
  }).catch(() => {});
}

// ─── Hook used by AnalyticsProvider ─────────────────────────────────
//
// Behavior:
//   • On first mount: POST /api/track to create a session, store the
//     returned sessionId in sessionStorage.
//   • On every route change: POST /api/page-view (deduped server-side)
//     and reset the per-page time + scroll trackers.
//   • On scroll: cheaply update the max scroll depth for the current
//     path (rAF-throttled — never schedules more than one frame's work).
//   • On visibilitychange→hidden / beforeunload: send the final
//     duration + scroll depth + session-end via sendBeacon.

export function useAnalytics(): void {
  const pathname = usePathname();
  const initRef = useRef(false);
  const pathRef = useRef<string | null>(null);
  const enterTimeRef = useRef<number>(0);
  const sessionStartRef = useRef<number>(0);
  const maxScrollRef = useRef<number>(0);

  // ── Init session on first mount ──
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    if (typeof window === "undefined") return;

    sessionStartRef.current = performance.now();

    const existing = window.sessionStorage.getItem(SESSION_KEY);
    if (existing) {
      // Reuse session for SPA navigation within the same tab.
      return;
    }

    // Fire-and-forget — never await this in the render path.
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
      keepalive: true,
    })
      .then((r) => r.json())
      .then((data: { success?: boolean; sessionId?: string }) => {
        if (data?.success && data.sessionId) {
          window.sessionStorage.setItem(SESSION_KEY, data.sessionId);
        }
      })
      .catch(() => {
        // Silent — analytics must never break the site.
      });
  }, []);

  // ── Helper: send accumulated duration for a path via beacon ──
  const flushDuration = useCallback((forPath: string) => {
    if (typeof window === "undefined") return;
    const sessionId = window.sessionStorage.getItem(SESSION_KEY);
    if (!sessionId) return;

    const timeSpentSeconds = Math.max(
      0,
      Math.round((performance.now() - enterTimeRef.current) / 1000)
    );
    const maxScrollPct = Math.min(
      100,
      Math.max(0, Math.round(maxScrollRef.current))
    );

    const payload = JSON.stringify({
      sessionId,
      path: forPath,
      timeSpentSeconds,
      maxScrollPct,
    });

    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      const blob = new Blob([payload], { type: "application/json" });
      if (navigator.sendBeacon("/api/track-duration", blob)) return;
    }
    void fetch("/api/track-duration", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => {});
  }, []);

  // ── Track route changes ──
  useEffect(() => {
    if (!pathname || typeof window === "undefined") return;

    // If this is a route transition (not the first paint), flush prev page.
    if (pathRef.current && pathRef.current !== pathname) {
      flushDuration(pathRef.current);
    }

    pathRef.current = pathname;
    enterTimeRef.current = performance.now();
    maxScrollRef.current = 0;

    // POST /api/page-view, retrying briefly until sessionId is available.
    let cancelled = false;
    let attempts = 0;
    const recordView = () => {
      if (cancelled) return;
      const sessionId = window.sessionStorage.getItem(SESSION_KEY);
      if (!sessionId) {
        if (attempts++ < 25) setTimeout(recordView, 150);
        return;
      }
      void fetch("/api/page-view", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          path: pathname,
          referrer: document.referrer || undefined,
        }),
        keepalive: true,
      }).catch(() => {});
    };
    recordView();

    return () => {
      cancelled = true;
    };
  }, [pathname, flushDuration]);

  // ── Scroll tracking with rAF throttling ──
  useEffect(() => {
    if (typeof window === "undefined") return;
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const scrollTop =
          window.scrollY ?? document.documentElement.scrollTop ?? 0;
        const docHeight =
          (document.documentElement.scrollHeight || 0) - window.innerHeight;
        if (docHeight > 0) {
          const pct = (scrollTop / docHeight) * 100;
          if (pct > maxScrollRef.current) maxScrollRef.current = pct;
        }
        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Finalize on tab hidden / unload ──
  useEffect(() => {
    if (typeof window === "undefined") return;

    const finalize = () => {
      if (document.visibilityState !== "hidden") return;
      const sessionId = window.sessionStorage.getItem(SESSION_KEY);
      if (!sessionId) return;

      // Flush current page's accumulated duration.
      if (pathRef.current) flushDuration(pathRef.current);

      // Send total session duration so bounce can be computed server-side.
      const sessionDuration = Math.max(
        0,
        Math.round((performance.now() - sessionStartRef.current) / 1000)
      );
      const payload = JSON.stringify({
        sessionId,
        durationSeconds: sessionDuration,
      });

      if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
        const blob = new Blob([payload], { type: "application/json" });
        navigator.sendBeacon("/api/session-end", blob);
        return;
      }
      void fetch("/api/session-end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    };

    document.addEventListener("visibilitychange", finalize);
    // pagehide is more reliable than beforeunload on mobile Safari.
    window.addEventListener("pagehide", finalize);

    return () => {
      document.removeEventListener("visibilitychange", finalize);
      window.removeEventListener("pagehide", finalize);
    };
  }, [flushDuration]);
}
