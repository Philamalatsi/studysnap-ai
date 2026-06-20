import { NextResponse } from "next/server";
import { processMaterialExtraction } from "@/features/materials/extraction-service";
import { runStudyPackGeneration } from "@/features/study-pack/study-pack-service";
import { isOpenAIConfigured } from "@/lib/ai/openai";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

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
}
