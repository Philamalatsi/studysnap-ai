import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { FlashcardStudy } from "@/components/flashcards/flashcard-study";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { parseFlashcardsContent } from "@/features/flashcards/types";
import { createClient } from "@/lib/supabase/server";
import {
  getMaterialById,
  getStudyOutputForMaterial,
} from "@/lib/supabase/queries";

export const metadata = {
  title: "Study flashcards",
};

export default async function FlashcardStudyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [material, flashcardsOutput] = await Promise.all([
    getMaterialById(user.id, id),
    getStudyOutputForMaterial(user.id, id, "flashcards"),
  ]);

  if (!material) notFound();

  const parsed = flashcardsOutput
    ? parseFlashcardsContent(flashcardsOutput.content)
    : null;

  if (!parsed || flashcardsOutput?.status !== "ready") {
    return (
      <>
        <DashboardHeader title="Study flashcards" />
        <div className="space-y-4 p-6">
          <Link
            href={`/dashboard/materials/${id}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to material
          </Link>
          <p className="text-sm text-muted">
            Generate flashcards on the material page before studying.
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <DashboardHeader
        title="Study flashcards"
        description={material.title}
      />
      <div className="space-y-6 p-6">
        <Link
          href={`/dashboard/materials/${id}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to material
        </Link>
        <FlashcardStudy
          materialId={material.id}
          cards={parsed.flashcards}
          materialTitle={material.title}
        />
      </div>
    </>
  );
}
