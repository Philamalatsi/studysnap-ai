import { NextResponse } from "next/server";
import { assertStoragePathOwned } from "@/lib/supabase/assert-storage-path";
import { createClient } from "@/lib/supabase/server";

export async function DELETE(
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

  const { data: material, error: fetchError } = await supabase
    .from("materials")
    .select("id, storage_bucket, storage_path")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (fetchError || !material) {
    return NextResponse.json({ error: "Material not found." }, { status: 404 });
  }

  const row = material as {
    id: string;
    storage_bucket: string;
    storage_path: string;
  };

  try {
    assertStoragePathOwned(row.storage_path, user.id);
  } catch {
    return NextResponse.json({ error: "Invalid storage path." }, { status: 403 });
  }

  const { error: storageError } = await supabase.storage
    .from(row.storage_bucket)
    .remove([row.storage_path]);

  if (storageError) {
    return NextResponse.json(
      { error: storageError.message ?? "Could not delete file." },
      { status: 500 },
    );
  }

  const { error: deleteError } = await supabase
    .from("materials")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (deleteError) {
    return NextResponse.json(
      { error: deleteError.message ?? "Could not delete material." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
