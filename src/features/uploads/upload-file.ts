import { createClient } from "@/lib/supabase/client";
import { getSupabaseEnv } from "@/lib/supabase/env";
import type { UploadCategory } from "@/features/uploads/utils";
import type { Material } from "@/types/database";
import {
  buildStoragePath,
  categoryToMaterialType,
  materialTitle,
  isAllowedMimeType,
  resolveMimeType,
  UPLOADS_BUCKET,
} from "@/features/uploads/utils";
import {
  removeStorageObject,
  uploadToStorageWithProgress,
} from "@/features/uploads/storage-upload";

export type UploadFileResult =
  | { ok: true; materialId: string; storagePath: string }
  | { ok: false; error: string };

export async function uploadMaterialFile(params: {
  file: File;
  category: UploadCategory;
  onProgress: (percent: number) => void;
}): Promise<UploadFileResult> {
  const { url, anonKey } = getSupabaseEnv();
  if (!url || !anonKey) {
    return { ok: false, error: "Supabase is not configured." };
  }

  const supabase = createClient();
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session?.user) {
    return { ok: false, error: "You must be signed in to upload files." };
  }

  const mimeType = resolveMimeType(params.file);
  if (!mimeType || !isAllowedMimeType(mimeType)) {
    return {
      ok: false,
      error: "Unsupported file type. Use JPG, PNG, WebP, HEIC, or PDF.",
    };
  }

  const materialId = crypto.randomUUID();
  const storagePath = buildStoragePath(
    session.user.id,
    materialId,
    params.file.name,
  );

  params.onProgress(0);

  try {
    await uploadToStorageWithProgress({
      supabaseUrl: url,
      anonKey,
      accessToken: session.access_token,
      path: storagePath,
      file: params.file,
      mimeType,
      onProgress: params.onProgress,
    });
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Upload failed.",
    };
  }

  const row: Material = {
    id: materialId,
    user_id: session.user.id,
    title: materialTitle(params.file.name),
    material_type: categoryToMaterialType(params.category, mimeType),
    mime_type: mimeType,
    file_size_bytes: params.file.size,
    storage_bucket: UPLOADS_BUCKET,
    storage_path: storagePath,
    processing_status: "uploaded",
    page_count: null,
    extracted_text: null,
    error_message: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { error: insertError } = await supabase
    .from("materials")
    .insert(row as never);

  if (insertError) {
    await removeStorageObject({
      supabaseUrl: url,
      anonKey,
      accessToken: session.access_token,
      path: storagePath,
    }).catch(() => undefined);

    return { ok: false, error: insertError.message };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("uploads_this_month")
    .eq("id", session.user.id)
    .maybeSingle();

  const currentCount =
    (profile as { uploads_this_month?: number } | null)?.uploads_this_month ??
    0;

  await supabase
    .from("profiles")
    .update({ uploads_this_month: currentCount + 1 } as never)
    .eq("id", session.user.id);

  return { ok: true, materialId, storagePath };
}
