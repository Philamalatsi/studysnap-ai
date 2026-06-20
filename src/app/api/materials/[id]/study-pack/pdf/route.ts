import { NextResponse } from "next/server";
import { buildStudyPackPdf } from "@/features/study-pack/study-pack-pdf";
import { createClient } from "@/lib/supabase/server";
import {
  getMaterialById,
  getStudyOutputForMaterial,
} from "@/lib/supabase/queries";

export const runtime = "nodejs";

function safeFilename(title: string) {
  return title
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80) || "study-pack";
}

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

  const [material, summaryOutput, flashcardsOutput, quizOutput] =
    await Promise.all([
      getMaterialById(user.id, id),
      getStudyOutputForMaterial(user.id, id, "summary"),
      getStudyOutputForMaterial(user.id, id, "flashcards"),
      getStudyOutputForMaterial(user.id, id, "quiz"),
    ]);

  if (!material) {
    return NextResponse.json({ error: "Material not found." }, { status: 404 });
  }

  const ready =
    summaryOutput?.status === "ready" &&
    flashcardsOutput?.status === "ready" &&
    quizOutput?.status === "ready";

  if (!ready) {
    return NextResponse.json(
      { error: "Study pack is not ready yet. Wait for processing to finish." },
      { status: 422 },
    );
  }

  const pdfBytes = await buildStudyPackPdf({
    materialTitle: material.title,
    summaryOutput,
    flashcardsOutput,
    quizOutput,
  });

  const filename = `${safeFilename(material.title)}-study-pack.pdf`;

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-cache",
    },
  });
}
