import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(
  request: Request,
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

  let body: { folderId?: string | null };
  try {
    body = (await request.json()) as { folderId?: string | null };
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  if (!("folderId" in body)) {
    return NextResponse.json({ error: "folderId is required." }, { status: 422 });
  }

  const folderId = body.folderId ?? null;

  if (folderId) {
    const { data: folder, error: folderError } = await supabase
      .from("material_folders")
      .select("id")
      .eq("id", folderId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (folderError || !folder) {
      return NextResponse.json({ error: "Folder not found." }, { status: 404 });
    }
  }

  const { data, error } = await supabase
    .from("materials")
    .update({ folder_id: folderId } as never)
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id, folder_id")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Material not found." }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    folderId: (data as { folder_id: string | null }).folder_id,
  });
}
