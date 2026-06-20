import { NextResponse } from "next/server";
import type { StudyMode } from "@/features/study-progress/types";
import { createClient } from "@/lib/supabase/server";

const MODES: StudyMode[] = ["summary", "flashcards", "quiz"];

function isStudyMode(value: string): value is StudyMode {
  return MODES.includes(value as StudyMode);
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id: materialId } = await context.params;
  const mode = new URL(request.url).searchParams.get("mode") ?? "";

  if (!isStudyMode(mode)) {
    return NextResponse.json({ error: "Invalid study mode." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("study_progress")
    .select("progress")
    .eq("material_id", materialId)
    .eq("user_id", user.id)
    .eq("study_mode", mode)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const row = data as { progress?: Record<string, unknown> } | null;
  return NextResponse.json({
    progress: row?.progress ?? null,
  });
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id: materialId } = await context.params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { mode?: string; progress?: Record<string, unknown> };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body.mode || !isStudyMode(body.mode)) {
    return NextResponse.json({ error: "Invalid study mode." }, { status: 400 });
  }

  if (!body.progress || typeof body.progress !== "object") {
    return NextResponse.json({ error: "Progress object required." }, { status: 400 });
  }

  const { data: material } = await supabase
    .from("materials")
    .select("id")
    .eq("id", materialId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!material) {
    return NextResponse.json({ error: "Material not found." }, { status: 404 });
  }

  const { error } = await supabase.from("study_progress").upsert(
    {
      user_id: user.id,
      material_id: materialId,
      study_mode: body.mode,
      progress: body.progress,
    } as never,
    { onConflict: "user_id,material_id,study_mode" },
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id: materialId } = await context.params;

  let body: { mode?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body.mode || !isStudyMode(body.mode)) {
    return NextResponse.json({ error: "Invalid study mode." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabase
    .from("study_progress")
    .delete()
    .eq("material_id", materialId)
    .eq("user_id", user.id)
    .eq("study_mode", body.mode);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
