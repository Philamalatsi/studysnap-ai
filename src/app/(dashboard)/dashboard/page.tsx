import Link from "next/link";
import { FileUp, Sparkles } from "lucide-react";
import { MaterialsList } from "@/components/materials/materials-list";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FREE_UPLOAD_LIMIT } from "@/lib/constants";
import {
  getMaterialCountByUserId,
  getMaterialsByUserId,
  getProfileByUserId,
  getStudyOutputBreakdownByUserId,
} from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [profile, materials, materialCount, outputBreakdown] =
    await Promise.all([
      getProfileByUserId(user.id),
      getMaterialsByUserId(user.id),
      getMaterialCountByUserId(user.id),
      getStudyOutputBreakdownByUserId(user.id),
    ]);

  const extractedCount = materials.filter(
    (m) => m.processing_status === "extracted",
  ).length;

  const displayName =
    profile?.full_name ?? user.email?.split("@")[0] ?? "Student";
  const uploadsUsed = profile?.uploads_this_month ?? 0;
  const uploadsRemaining = Math.max(0, FREE_UPLOAD_LIMIT - uploadsUsed);

  return (
    <>
      <DashboardHeader
        title={`Hello, ${displayName}`}
        description="Your study hub — upload and manage your materials."
        action={
          <Link href="/dashboard/upload">
            <Button>
              <FileUp className="h-4 w-4" />
              Upload
            </Button>
          </Link>
        }
      />

      <div className="space-y-6 p-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent>
              <p className="text-sm text-muted">Uploads this month</p>
              <p className="mt-1 text-2xl font-semibold">
                {uploadsUsed}
                <span className="text-base font-normal text-muted">
                  {" "}
                  / {FREE_UPLOAD_LIMIT}
                </span>
              </p>
              <p className="mt-1 text-xs text-muted">
                {uploadsRemaining} remaining on free plan
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <p className="text-sm text-muted">Materials</p>
              <p className="mt-1 text-2xl font-semibold">{materialCount}</p>
              <p className="mt-1 text-xs text-muted">
                {materialCount === 0
                  ? "Upload to add your first"
                  : "Stored in Supabase Storage"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <p className="text-sm text-muted">Study outputs</p>
              <p className="mt-1 text-2xl font-semibold">
                {outputBreakdown.total}
              </p>
              <p className="mt-1 text-xs text-muted">
                {outputBreakdown.total === 0
                  ? extractedCount > 0
                    ? "Open a material to generate summaries, flashcards, or quizzes"
                    : "Available after text extraction"
                  : `${outputBreakdown.summary} summaries · ${outputBreakdown.flashcards} flashcard decks · ${outputBreakdown.quiz} quizzes`}
              </p>
            </CardContent>
          </Card>
        </div>

        <MaterialsList materials={materials} />

        {materialCount > 0 && outputBreakdown.total === 0 && extractedCount > 0 && (
          <Card className="border-brand-200 bg-brand-50/50">
            <CardContent className="flex flex-col gap-3 py-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-600">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">AI study tools are ready</h3>
                  <p className="mt-1 text-sm text-muted">
                    Open a material with text ready, then use the Summary,
                    Flashcards, or Quiz tabs to generate study content.
                  </p>
                </div>
              </div>
              <Link href={`/dashboard/materials/${materials.find((m) => m.processing_status === "extracted")?.id ?? materials[0].id}`}>
                <Button variant="outline" size="sm">
                  Open material
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
