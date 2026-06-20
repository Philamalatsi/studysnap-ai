import "server-only";

import { runOcr } from "@/lib/ocr/ocr-service";
import { suggestTitleFromExtractedText } from "@/lib/materials/title";
import { assertStoragePathOwned } from "@/lib/supabase/assert-storage-path";
import type { createClient } from "@/lib/supabase/server";
import type { Material } from "@/types/database";

type ServerSupabase = Awaited<ReturnType<typeof createClient>>;

export type ExtractionOutcome =
  | { ok: true; text: string; pageCount: number | null }
  | { ok: false; error: string };

async function downloadMaterialFile(
  supabase: ServerSupabase,
  material: Material,
  userId: string,
): Promise<Buffer> {
  assertStoragePathOwned(material.storage_path, userId);

  const { data, error } = await supabase.storage
    .from(material.storage_bucket)
    .download(material.storage_path);

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to download file from storage.");
  }

  const arrayBuffer = await data.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * OCR pipeline using the caller's authenticated Supabase client (RLS enforced).
 */
export async function processMaterialExtraction(
  materialId: string,
  userId: string,
  supabase: ServerSupabase,
): Promise<ExtractionOutcome> {
  const { data: material, error: fetchError } = await supabase
    .from("materials")
    .select("*")
    .eq("id", materialId)
    .eq("user_id", userId)
    .single();

  if (fetchError || !material) {
    return { ok: false, error: "Material not found." };
  }

  const row = material as Material;

  if (row.processing_status === "extracting") {
    return { ok: false, error: "Extraction already in progress." };
  }

  if (row.processing_status === "extracted" && row.extracted_text) {
    return {
      ok: true,
      text: row.extracted_text,
      pageCount: row.page_count,
    };
  }

  await supabase
    .from("materials")
    .update({
      processing_status: "extracting",
      error_message: null,
    } as never)
    .eq("id", materialId)
    .eq("user_id", userId);

  try {
    const buffer = await downloadMaterialFile(supabase, row, userId);
    const { text, pageCount } = await runOcr(buffer, row.mime_type);

    if (!text) {
      throw new Error(
        "No text could be extracted. The file may be blank or too low quality.",
      );
    }

    const suggestedTitle = suggestTitleFromExtractedText(text, row.title);

    await supabase
      .from("materials")
      .update({
        processing_status: "extracted",
        extracted_text: text,
        page_count: pageCount,
        error_message: null,
        ...(suggestedTitle ? { title: suggestedTitle } : {}),
      } as never)
      .eq("id", materialId)
      .eq("user_id", userId);

    return { ok: true, text, pageCount };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Text extraction failed.";

    await supabase
      .from("materials")
      .update({
        processing_status: "failed",
        error_message: message,
      } as never)
      .eq("id", materialId)
      .eq("user_id", userId);

    return { ok: false, error: message };
  }
}
