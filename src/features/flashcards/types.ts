import { z } from "zod";

export type Flashcard = {
  question: string;
  answer: string;
};

export type FlashcardsContent = {
  flashcards: Flashcard[];
  model: string;
  generated_at: string;
  count: number;
};

const flashcardSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
});

const openAiFlashcardsSchema = z.object({
  flashcards: z.array(flashcardSchema).min(1).max(30),
});

export function parseFlashcardsContent(
  content: Record<string, unknown> | null,
): FlashcardsContent | null {
  if (!content || !Array.isArray(content.flashcards)) return null;

  const cards: Flashcard[] = [];
  for (const item of content.flashcards) {
    const parsed = flashcardSchema.safeParse(item);
    if (parsed.success) cards.push(parsed.data);
  }

  if (cards.length === 0) return null;

  return {
    flashcards: cards,
    model: typeof content.model === "string" ? content.model : "unknown",
    generated_at:
      typeof content.generated_at === "string"
        ? content.generated_at
        : new Date().toISOString(),
    count: typeof content.count === "number" ? content.count : cards.length,
  };
}

export function parseOpenAiFlashcardsJson(raw: string): Flashcard[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("OpenAI returned invalid JSON for flashcards.");
  }

  const result = openAiFlashcardsSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error("Flashcard JSON did not match the expected format.");
  }

  return result.data.flashcards;
}
