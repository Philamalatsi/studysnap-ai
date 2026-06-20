import "server-only";

import { getOpenAIClient } from "@/lib/ai/openai";
import type { createClient } from "@/lib/supabase/server";
import type { StudyOutput } from "@/types/database";
import {
  parseOpenAiFlashcardsJson,
  type FlashcardsContent,
} from "@/features/flashcards/types";

const FLASHCARD_MODEL = "gpt-4o-mini";
const MAX_INPUT_CHARS = 80_000;
const TARGET_CARD_COUNT = 12;

type ServerSupabase = Awaited<ReturnType<typeof createClient>>;

export type GenerateFlashcardsResult =
  | { ok: true; output: StudyOutput; alreadyExists?: boolean }
  | { ok: false; error: string; code?: "ALREADY_EXISTS" | "IN_PROGRESS" };

async function getExistingFlashcards(
  supabase: ServerSupabase,
  materialId: string,
  userId: string,
): Promise<StudyOutput | null> {
  const { data } = await supabase
    .from("study_outputs")
    .select("*")
    .eq("material_id", materialId)
    .eq("user_id", userId)
    .eq("output_type", "flashcards")
    .maybeSingle();

  return (data as StudyOutput | null) ?? null;
}

async function callOpenAIForFlashcards(
  materialTitle: string,
  extractedText: string,
): Promise<FlashcardsContent> {
  const openai = getOpenAIClient();
  const text =
    extractedText.length > MAX_INPUT_CHARS
      ? `${extractedText.slice(0, MAX_INPUT_CHARS)}\n\n[Text truncated for length…]`
      : extractedText;

  const completion = await openai.chat.completions.create({
    model: FLASHCARD_MODEL,
    temperature: 0.4,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You create study flashcards for students. Return ONLY valid JSON with this exact shape:
{"flashcards":[{"question":"...","answer":"..."}]}
Rules:
- Generate ${TARGET_CARD_COUNT} to ${TARGET_CARD_COUNT + 3} cards when the source has enough content; fewer only if the source is very short.
- Each question should be specific and test one fact or concept.
- Each answer should be concise (1-3 sentences max).
- Use only information from the source text. Do not invent facts.
- No markdown, no extra keys, no commentary outside JSON.`,
      },
      {
        role: "user",
        content: `Title: ${materialTitle}\n\nSource text:\n${text}`,
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content?.trim();
  if (!raw) {
    throw new Error("OpenAI returned empty flashcard data.");
  }

  const flashcards = parseOpenAiFlashcardsJson(raw);

  return {
    flashcards,
    model: FLASHCARD_MODEL,
    generated_at: new Date().toISOString(),
    count: flashcards.length,
  };
}

export async function generateMaterialFlashcards(
  materialId: string,
  userId: string,
  supabase: ServerSupabase,
): Promise<GenerateFlashcardsResult> {
  const { data: material, error: materialError } = await supabase
    .from("materials")
    .select("id, title, extracted_text, processing_status")
    .eq("id", materialId)
    .eq("user_id", userId)
    .single();

  if (materialError || !material) {
    return { ok: false, error: "Material not found." };
  }

  const row = material as {
    title: string;
    extracted_text: string | null;
    processing_status: string;
  };

  if (row.processing_status !== "extracted" || !row.extracted_text?.trim()) {
    return {
      ok: false,
      error:
        "Text extraction must finish before generating flashcards. Wait for OCR to complete.",
    };
  }

  const existing = await getExistingFlashcards(supabase, materialId, userId);

  if (existing?.status === "ready" && existing.content) {
    return { ok: true, output: existing, alreadyExists: true };
  }

  if (existing?.status === "generating") {
    return {
      ok: false,
      error: "Flashcard generation is already in progress.",
      code: "IN_PROGRESS",
    };
  }

  let outputId = existing?.id;

  if (existing) {
    const { error: updateError } = await supabase
      .from("study_outputs")
      .update({
        status: "generating",
        error_message: null,
      } as never)
      .eq("id", existing.id)
      .eq("user_id", userId);

    if (updateError) {
      return { ok: false, error: updateError.message };
    }
  } else {
    const { data: inserted, error: insertError } = await supabase
      .from("study_outputs")
      .insert({
        user_id: userId,
        material_id: materialId,
        output_type: "flashcards",
        status: "pending",
        title: `${row.title} — Flashcards`,
      } as never)
      .select("*")
      .single();

    if (insertError || !inserted) {
      if (insertError?.code === "23505") {
        const again = await getExistingFlashcards(supabase, materialId, userId);
        if (again?.status === "ready") {
          return { ok: true, output: again, alreadyExists: true };
        }
        return {
          ok: false,
          error: "Flashcards already exist for this material.",
          code: "ALREADY_EXISTS",
        };
      }
      return {
        ok: false,
        error: insertError?.message ?? "Could not create flashcards record.",
      };
    }

    outputId = (inserted as StudyOutput).id;

    await supabase
      .from("study_outputs")
      .update({ status: "generating" } as never)
      .eq("id", outputId)
      .eq("user_id", userId);
  }

  try {
    const content = await callOpenAIForFlashcards(
      row.title,
      row.extracted_text,
    );

    const { data: updated, error: readyError } = await supabase
      .from("study_outputs")
      .update({
        status: "ready",
        content,
        error_message: null,
        title: `${row.title} — Flashcards (${content.count} cards)`,
      } as never)
      .eq("id", outputId!)
      .eq("user_id", userId)
      .select("*")
      .single();

    if (readyError || !updated) {
      throw new Error(readyError?.message ?? "Failed to save flashcards.");
    }

    return { ok: true, output: updated as StudyOutput };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Flashcard generation failed.";

    await supabase
      .from("study_outputs")
      .update({
        status: "failed",
        error_message: message,
      } as never)
      .eq("id", outputId!)
      .eq("user_id", userId);

    return { ok: false, error: message };
  }
}
