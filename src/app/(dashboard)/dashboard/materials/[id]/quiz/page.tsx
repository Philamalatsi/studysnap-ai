import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { QuizPlayer } from "@/components/quiz/quiz-player";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { parseQuizContent } from "@/features/quiz/types";
import { createClient } from "@/lib/supabase/server";
import {
  getMaterialById,
  getStudyOutputForMaterial,
} from "@/lib/supabase/queries";

export const metadata = {
  title: "Take quiz",
};

export default async function QuizPlayPage({
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

  const [material, quizOutput] = await Promise.all([
    getMaterialById(user.id, id),
    getStudyOutputForMaterial(user.id, id, "quiz"),
  ]);

  if (!material) notFound();

  const parsed = quizOutput ? parseQuizContent(quizOutput.content) : null;

  if (!parsed || quizOutput?.status !== "ready") {
    return (
      <>
        <DashboardHeader title="Take quiz" />
        <div className="space-y-4 p-6">
          <Link
            href={`/dashboard/materials/${id}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to material
          </Link>
          <p className="text-sm text-muted">
            Generate a quiz on the material page before taking it.
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <DashboardHeader title="Take quiz" description={material.title} />
      <div className="space-y-6 p-6">
        <Link
          href={`/dashboard/materials/${id}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to material
        </Link>
        <QuizPlayer
          materialId={material.id}
          questions={parsed.questions}
          materialTitle={material.title}
        />
      </div>
    </>
  );
}
