import { NextResponse } from "next/server";
import sharp from "sharp";
import { isImageMime } from "@/lib/ocr/mime";
import { createClient } from "@/lib/supabase/server";
import { getMaterialById } from "@/lib/supabase/queries";

export const runtime = "nodejs";

export async function GET(
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

  const material = await getMaterialById(user.id, id);
  if (!material) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!isImageMime(material.mime_type)) {
    return NextResponse.json(
      { error: "Preview only available for images." },
      { status: 400 },
    );
  }

  const { data, error } = await supabase.storage
    .from(material.storage_bucket)
    .download(material.storage_path);

  if (error || !data) {
    return NextResponse.json({ error: "Could not load file." }, { status: 404 });
  }

  const buffer = Buffer.from(await data.arrayBuffer());
  const oriented = await sharp(buffer).rotate().jpeg({ quality: 85 }).toBuffer();

  return new NextResponse(new Uint8Array(oriented), {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "private, max-age=3600",
    },
  });
}
