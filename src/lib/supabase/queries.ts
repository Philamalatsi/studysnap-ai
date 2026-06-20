import { createClient } from "@/lib/supabase/server";
import type { Material, OutputType, Profile, StudyOutput } from "@/types/database";

export async function getProfileByUserId(
  userId: string,
): Promise<Pick<
  Profile,
  "email" | "full_name" | "plan_tier" | "uploads_this_month"
> | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("email, full_name, plan_tier, uploads_this_month")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    return null;
  }

  return data as Pick<
    Profile,
    "email" | "full_name" | "plan_tier" | "uploads_this_month"
  > | null;
}

export async function getMaterialsByUserId(
  userId: string,
  limit = 50,
): Promise<Material[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("materials")
    .select(
      "id, title, material_type, mime_type, file_size_bytes, processing_status, created_at, storage_path, error_message",
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    return [];
  }

  return data as unknown as Material[];
}

export async function getMaterialById(
  userId: string,
  materialId: string,
): Promise<Material | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("materials")
    .select("*")
    .eq("id", materialId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) return null;
  return data as unknown as Material;
}

export async function getStudyOutputForMaterial(
  userId: string,
  materialId: string,
  outputType: OutputType,
): Promise<StudyOutput | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("study_outputs")
    .select("*")
    .eq("material_id", materialId)
    .eq("user_id", userId)
    .eq("output_type", outputType)
    .maybeSingle();

  if (error || !data) return null;
  return data as StudyOutput;
}

export async function getMaterialCountByUserId(
  userId: string,
): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("materials")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  if (error) return 0;
  return count ?? 0;
}

export async function getStudyOutputCountByUserId(
  userId: string,
  options?: { status?: StudyOutput["status"] },
): Promise<number> {
  const supabase = await createClient();
  let query = supabase
    .from("study_outputs")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  if (options?.status) {
    query = query.eq("status", options.status);
  }

  const { count, error } = await query;
  if (error) return 0;
  return count ?? 0;
}

export type StudyOutputBreakdown = {
  summary: number;
  flashcards: number;
  quiz: number;
  total: number;
};

export async function getStudyOutputBreakdownByUserId(
  userId: string,
): Promise<StudyOutputBreakdown> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("study_outputs")
    .select("output_type")
    .eq("user_id", userId)
    .eq("status", "ready");

  if (error || !data) {
    return { summary: 0, flashcards: 0, quiz: 0, total: 0 };
  }

  const rows = data as { output_type: OutputType }[];
  const summary = rows.filter((r) => r.output_type === "summary").length;
  const flashcards = rows.filter((r) => r.output_type === "flashcards").length;
  const quiz = rows.filter((r) => r.output_type === "quiz").length;

  return {
    summary,
    flashcards,
    quiz,
    total: summary + flashcards + quiz,
  };
}
