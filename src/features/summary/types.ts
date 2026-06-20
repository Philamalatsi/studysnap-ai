export type SummaryContent = {
  summary: string;
  model: string;
  generated_at: string;
};

export function parseSummaryContent(
  content: Record<string, unknown> | null,
): SummaryContent | null {
  if (!content || typeof content.summary !== "string") return null;
  return {
    summary: content.summary,
    model: typeof content.model === "string" ? content.model : "unknown",
    generated_at:
      typeof content.generated_at === "string"
        ? content.generated_at
        : new Date().toISOString(),
  };
}
