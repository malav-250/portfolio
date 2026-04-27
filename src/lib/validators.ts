import { z } from "zod";

// All client-submitted payloads are validated through these schemas.
// Reject anything that doesn't match the shape — surface generic errors
// to the client (no Zod issue text leaks).

export const ALLOWED_EVENT_TYPES = [
  "resume_click",
  "project_click",
  "contact_click",
] as const;
export type AllowedEventType = (typeof ALLOWED_EVENT_TYPES)[number];

const uuid = z.string().uuid();
const path = z.string().min(1).max(500);

export const trackInputSchema = z.object({}).passthrough().optional();

export const pageViewSchema = z.object({
  sessionId: uuid,
  path,
  referrer: z.string().max(1000).optional(),
});

export const trackDurationSchema = z.object({
  sessionId: uuid,
  path,
  // Cap at 24h — anything more is almost certainly a bug or abuse.
  timeSpentSeconds: z.number().int().min(0).max(86_400),
  maxScrollPct: z.number().int().min(0).max(100),
});

export const eventSchema = z.object({
  sessionId: uuid,
  eventType: z.enum(ALLOWED_EVENT_TYPES),
  // Open-ended JSON metadata; we trust it because eventType is allowlisted
  // and Postgres stores it as JSONB. Cap depth/size at the route layer if needed.
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const sessionEndSchema = z.object({
  sessionId: uuid,
  durationSeconds: z.number().int().min(0).max(86_400),
});

export type PageViewInput = z.infer<typeof pageViewSchema>;
export type TrackDurationInput = z.infer<typeof trackDurationSchema>;
export type EventInput = z.infer<typeof eventSchema>;
export type SessionEndInput = z.infer<typeof sessionEndSchema>;
