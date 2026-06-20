import "server-only";

import { getOpenAIClient } from "@/lib/ai/openai";
import type { createClient } from "@/lib/supabase/server";
import type { StudyOutput } from "@/types/database";
import type { SummaryContent } from "@/features/summary/types";

const SUMMARY_MODEL = "gpt-4o-mini";
const MAX_INPUT_CHARS = 80_000;

type ServerSupabase = Awaited<ReturnType<typeof createClient>>;

export type GenerateSummaryResult =
  | { ok: true; output: StudyOutput; alreadyExists?: boolean }
  | { ok: false; error: string; code?: "ALREADY_EXISTS" | "IN_PROGRESS" };

async function getExistingSummary(
  supabase: ServerSupabase,
  materialId: string,
  userId: string,
): Promise<StudyOutput | null> {
  const { data } = await supabase
    .from("study_outputs")
    .select("*")
    .eq("material_id", materialId)
    .eq("user_id", userId)
    .eq("output_type", "summary")
    .maybeSingle();

  return (data as StudyOutput | null) ?? null;
}

async function callOpenAIForSummary(
  materialTitle: string,
  extractedText: string,
): Promise<SummaryContent> {
  const openai = getOpenAIClient();
  const text =
    extractedText.length > MAX_INPUT_CHARS
      ? `${extractedText.slice(0, MAX_INPUT_CHARS)}\n\n[Text truncated for length…]`
      : extractedText;

  const completion = await openai.chat.completions.create({
    model: SUMMARY_MODEL,
    temperature: 0.3,
    messages: [
      {
        role: "system",
        content: `You are a study assistant for students. Create a clear, concise study summary from the provided material.
Use short sections with bullet points where helpful.
Focus on key concepts, definitions, and exam-relevant facts.
Do not invent information that is not in the source text.
Keep the summary under 600 words.`,
      },
      {
        role: "user",
        content: `Title: ${materialTitle}\n\nSource text:\n${text}`,
      },
    ],
  });

  const summary = completion.choices[0]?.message?.content?.trim();
  if (!summary) {
    throw new Error("OpenAI returned an empty summary.");
  }

  return {
    summary,
    model: SUMMARY_MODEL,
    generated_at: new Date().toISOString(),
  };
}

export async function generateStudySummary(
  materialId: string,
  userId: string,
  supabase: ServerSupabase,
): Promise<GenerateSummaryResult> {
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
        "Text extraction must finish before generating a summary. Wait for OCR to complete.",
    };
  }

  const existing = await getExistingSummary(supabase, materialId, userId);

  if (existing?.status === "ready" && existing.content) {
    return { ok: true, output: existing, alreadyExists: true };
  }

  if (existing?.status === "generating") {
    return {
      ok: false,
      error: "Summary generation is already in progress.",
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
        output_type: "summary",
        status: "pending",
        title: `${row.title} — Summary`,
      } as never)
      .select("*")
      .single();

    if (insertError || !inserted) {
      if (insertError?.code === "23505") {
        const again = await getExistingSummary(supabase, materialId, userId);
        if (again?.status === "ready") {
          return { ok: true, output: again, alreadyExists: true };
        }
        return {
          ok: false,
          error: "Summary already exists for this material.",
          code: "ALREADY_EXISTS",
        };
      }
      return { ok: false, error: insertError?.message ?? "Could not create summary record." };
    }

    outputId = (inserted as StudyOutput).id;

    await supabase
      .from("study_outputs")
      .update({ status: "generating" } as never)
      .eq("id", outputId)
      .eq("user_id", userId);
  }

  try {
    const content = await callOpenAIForSummary(row.title, row.extracted_text);

    const { data: updated, error: readyError } = await supabase
      .from("study_outputs")
      .update({
        status: "ready",
        content,
        error_message: null,
        title: `${row.title} — Summary`,
      } as never)
      .eq("id", outputId!)
      .eq("user_id", userId)
      .select("*")
      .single();

    if (readyError || !updated) {
      throw new Error(readyError?.message ?? "Failed to save summary.");
    }

    return { ok: true, output: updated as StudyOutput };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Summary generation failed.";

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
