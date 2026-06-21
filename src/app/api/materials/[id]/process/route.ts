import "@/lib/ocr/ensure-node-ocr-env";
import { NextResponse } from "next/server";
import { processMaterialExtraction } from "@/features/materials/extraction-service";
import { runStudyPackGeneration } from "@/features/study-pack/study-pack-service";
import { isOpenAIConfigured } from "@/lib/ai/openai";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 300;

async function markExtractionFailed(
  materialId: string,
  userId: string,
  message: string,
) {
  const supabase = await createClient();
  await supabase
    .from("materials")
    .update({
      processing_status: "failed",
      error_message: message,
    } as never)
    .eq("id", materialId)
    .eq("user_id", userId)
    .eq("processing_status", "extracting");
}

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await processMaterialExtraction(id, user.id, supabase);

    if (!result.ok) {
      const isNotFound = result.error === "Material not found.";
      const isBusy = result.error === "Extraction already in progress.";
      console.warn("[materials/process] extraction failed", {
        materialId: id,
        userId: user.id,
        error: result.error,
      });
      return NextResponse.json(
        { error: result.error, ok: false },
        { status: isNotFound ? 404 : isBusy ? 409 : 422 },
      );
    }

    let studyPack: Awaited<ReturnType<typeof runStudyPackGeneration>> | null =
      null;

    if (isOpenAIConfigured()) {
      studyPack = await runStudyPackGeneration(id, user.id, supabase);
    }

    return NextResponse.json({
      ok: true,
      pageCount: result.pageCount,
      textLength: result.text.length,
      studyPack,
      aiConfigured: isOpenAIConfigured(),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Processing failed unexpectedly.";
    console.error("[materials/process] unhandled error", {
      materialId: id,
      message,
      stack: error instanceof Error ? error.stack : undefined,
    });

    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await markExtractionFailed(id, user.id, message);
      }
    } catch (cleanupError) {
      console.error("[materials/process] failed to mark extraction failed", {
        materialId: id,
        cleanupError,
      });
    }

    return NextResponse.json({ error: message, ok: false }, { status: 500 });
  }
}
