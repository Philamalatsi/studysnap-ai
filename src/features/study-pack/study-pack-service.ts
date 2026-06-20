import "server-only";

import { generateMaterialFlashcards } from "@/features/flashcards/flashcard-service";
import { generateMaterialQuiz } from "@/features/quiz/quiz-service";
import { generateStudySummary } from "@/features/summary/summary-service";
import type { createClient } from "@/lib/supabase/server";

type ServerSupabase = Awaited<ReturnType<typeof createClient>>;

export type StudyPackResult = {
  summary: string | null;
  flashcards: string | null;
  quiz: string | null;
  errors: string[];
};

export async function runStudyPackGeneration(
  materialId: string,
  userId: string,
  supabase: ServerSupabase,
): Promise<StudyPackResult> {
  const results: StudyPackResult = {
    summary: null,
    flashcards: null,
    quiz: null,
    errors: [],
  };

  const summary = await generateStudySummary(materialId, userId, supabase);
  if (summary.ok) {
    results.summary = summary.alreadyExists ? "exists" : "generated";
  } else {
    results.errors.push(`Summary: ${summary.error}`);
  }

  const flashcards = await generateMaterialFlashcards(
    materialId,
    userId,
    supabase,
  );
  if (flashcards.ok) {
    results.flashcards = flashcards.alreadyExists ? "exists" : "generated";
  } else if (flashcards.code !== "IN_PROGRESS") {
    results.errors.push(`Flashcards: ${flashcards.error}`);
  }

  const quiz = await generateMaterialQuiz(materialId, userId, supabase);
  if (quiz.ok) {
    results.quiz = quiz.alreadyExists ? "exists" : "generated";
  } else if (quiz.code !== "IN_PROGRESS") {
    results.errors.push(`Quiz: ${quiz.error}`);
  }

  return results;
}
