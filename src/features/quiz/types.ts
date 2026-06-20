import { z } from "zod";

export type QuizQuestion = {
  question: string;
  choices: [string, string, string, string];
  correct_index: number;
  explanation: string;
};

export type QuizContent = {
  questions: QuizQuestion[];
  model: string;
  generated_at: string;
  count: number;
};

const quizQuestionSchema = z.object({
  question: z.string().min(1),
  choices: z.array(z.string().min(1)).length(4),
  correct_index: z.number().int().min(0).max(3),
  explanation: z.string().min(1),
});

const openAiQuizSchema = z.object({
  questions: z.array(quizQuestionSchema).min(1).max(20),
});

export function parseQuizContent(
  content: Record<string, unknown> | null,
): QuizContent | null {
  if (!content || !Array.isArray(content.questions)) return null;

  const questions: QuizQuestion[] = [];
  for (const item of content.questions) {
    const parsed = quizQuestionSchema.safeParse(item);
    if (parsed.success) {
      questions.push({
        ...parsed.data,
        choices: parsed.data.choices as [string, string, string, string],
      });
    }
  }

  if (questions.length === 0) return null;

  return {
    questions,
    model: typeof content.model === "string" ? content.model : "unknown",
    generated_at:
      typeof content.generated_at === "string"
        ? content.generated_at
        : new Date().toISOString(),
    count: typeof content.count === "number" ? content.count : questions.length,
  };
}

export function parseOpenAiQuizJson(raw: string): QuizQuestion[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("OpenAI returned invalid JSON for quiz.");
  }

  const result = openAiQuizSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error("Quiz JSON did not match the expected format.");
  }

  return result.data.questions.map((q) => ({
    ...q,
    choices: q.choices as [string, string, string, string],
  }));
}
