import type { ProcessingStatus } from "@/types/database";

/** Allow retry if extraction has not updated within this window (server timeout is 300s). */
export const STALE_EXTRACTION_MS = 2 * 60 * 1000;

export function isStaleExtraction(
  status: ProcessingStatus,
  updatedAt: string,
  now = Date.now(),
): boolean {
  if (status !== "extracting") return false;
  return now - new Date(updatedAt).getTime() > STALE_EXTRACTION_MS;
}
