import { NextResponse } from "next/server";
import { generateMaterialFlashcards } from "@/features/flashcards/flashcard-service";
import { isOpenAIConfigured } from "@/lib/ai/openai";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  if (!isOpenAIConfigured()) {
    return NextResponse.json(
      {
        error:
          "AI flashcards are not configured. Add OPENAI_API_KEY to .env.local.",
      },
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

  const result = await generateMaterialFlashcards(id, user.id, supabase);

  if (!result.ok) {
    const status =
      result.code === "ALREADY_EXISTS" || result.code === "IN_PROGRESS"
        ? 409
        : 422;
    return NextResponse.json(
      { error: result.error, ok: false, code: result.code },
      { status },
    );
  }

  return NextResponse.json({
    ok: true,
    alreadyExists: result.alreadyExists ?? false,
    outputId: result.output.id,
    status: result.output.status,
  });
}
