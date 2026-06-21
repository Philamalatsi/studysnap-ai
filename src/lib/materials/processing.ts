import type { ProcessingStatus } from "@/types/database";

/** Match Vercel maxDuration (300s) with a small buffer. */
export const STALE_EXTRACTION_MS = 5 * 60 * 1000;

export function isStaleExtraction(
  status: ProcessingStatus,
  updatedAt: string,
  now = Date.now(),
): boolean {
  if (status !== "extracting") return false;
  return now - new Date(updatedAt).getTime() > STALE_EXTRACTION_MS;
}
