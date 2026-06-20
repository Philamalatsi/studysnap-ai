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

  let body: { title?: string };
  try {
    body = (await request.json()) as { title?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const title = body.title?.trim();
  if (!title || title.length > 200) {
    return NextResponse.json(
      { error: "Title must be between 1 and 200 characters." },
      { status: 422 },
    );
  }

  const { data, error } = await supabase
    .from("materials")
    .update({ title } as never)
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id, title")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Material not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, title: (data as { title: string }).title });
}
