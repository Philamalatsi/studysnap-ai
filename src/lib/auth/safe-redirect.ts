/** Allow only same-origin relative paths (prevents open redirects). */
export function safeRedirectPath(
  path: string | null | undefined,
  fallback = "/dashboard",
): string {
  if (!path || typeof path !== "string") return fallback;

  const trimmed = path.trim();
  if (
    !trimmed.startsWith("/") ||
    trimmed.startsWith("//") ||
    trimmed.includes("://") ||
    trimmed.includes("\\")
  ) {
    return fallback;
  }

  return trimmed;
}
