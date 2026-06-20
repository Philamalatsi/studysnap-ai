import { NextResponse } from "next/server";
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

  if (!isOpenAIConfigured()) {
    return NextResponse.json(
      { error: "AI study tools are not configured." },
      { status: 503 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = await runStudyPackGeneration(id, user.id, supabase);

  const anySuccess =
    results.summary !== null ||
    results.flashcards !== null ||
    results.quiz !== null;

  if (!anySuccess && results.errors.length > 0) {
    return NextResponse.json(
      { ok: false, errors: results.errors },
      { status: 422 },
    );
  }

  return NextResponse.json({ ok: true, ...results, errors: results.errors });
}
