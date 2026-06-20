export function getAiDisabledMessage(openAiConfigured: boolean): string | undefined {
  if (openAiConfigured) return undefined;
  if (process.env.NODE_ENV === "development") {
    return "Add OPENAI_API_KEY to .env.local to enable AI features.";
  }
  return "AI study tools are temporarily unavailable. Please try again later.";
}
