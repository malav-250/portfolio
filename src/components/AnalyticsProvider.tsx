"use client";

import { useAnalytics } from "@/hooks/useAnalytics";

/**
 * Behavioral component — renders nothing.
 * Wraps the app so the useAnalytics hook runs once at the root and
 * tracks every route change for the lifetime of the tab.
 */
export default function AnalyticsProvider() {
  useAnalytics();
  return null;
}
