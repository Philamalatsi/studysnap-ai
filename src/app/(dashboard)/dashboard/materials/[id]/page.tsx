import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { MaterialDetailHeader } from "@/components/materials/material-detail-header";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { MaterialDetailTabs } from "@/components/materials/material-detail-tabs";
import { MaterialProcessingRunner } from "@/components/materials/material-processing-runner";
import { RetryExtractionButton } from "@/components/materials/retry-extraction-button";
import { FormattedDate } from "@/components/ui/formatted-date";
import { isOpenAIConfigured } from "@/lib/ai/openai";
import {
  formatMaterialType,
  mimeTypeLabel,
} from "@/lib/materials/display";
import { isStaleExtraction } from "@/lib/materials/processing";
import { getMaterialSignedUrl } from "@/lib/materials/storage";
import type { MaterialStudyStatus } from "@/lib/materials/study-status";
import { formatFileSize } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import {
  getMaterialById,
  getStudyOutputForMaterial,
} from "@/lib/supabase/queries";
import type { StudyOutput } from "@/types/database";

export const metadata = {
  title: "Material",
};

function buildStudyStatus(
  outputs: (StudyOutput | null)[],
): MaterialStudyStatus {
  let readyOutputs = 0;
  let isGenerating = false;
  for (const output of outputs) {
    if (output?.status === "ready") readyOutputs += 1;
    if (output?.status === "generating" || output?.status === "pending") {
      isGenerating = true;
    }
  }
  return { readyOutputs, isGenerating };
}

export default async function MaterialDetailPage({
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

  const [material, summaryOutput, flashcardsOutput, quizOutput] =
    await Promise.all([
      getMaterialById(user.id, id),
      getStudyOutputForMaterial(user.id, id, "summary"),
      getStudyOutputForMaterial(user.id, id, "flashcards"),
      getStudyOutputForMaterial(user.id, id, "quiz"),
    ]);

  if (!material) notFound();

  let signedUrl: string | null = null;
  try {
    signedUrl = await getMaterialSignedUrl(
      material.storage_bucket,
      material.storage_path,
      user.id,
    );
  } catch {
    signedUrl = null;
  }

  const extractionStale = isStaleExtraction(
    material.processing_status,
    material.updated_at,
  );

  const showRetry =
    material.processing_status === "failed" ||
    material.processing_status === "uploaded" ||
    extractionStale;

  const hasExtractedText =
    material.processing_status === "extracted" &&
    Boolean(material.extracted_text?.trim());

  const studyStatus = buildStudyStatus([
    summaryOutput,
    flashcardsOutput,
    quizOutput,
  ]);

  return (
    <>
      <MaterialProcessingRunner
        materialId={material.id}
        status={material.processing_status}
        updatedAt={material.updated_at}
        hasExtractedText={hasExtractedText}
        openAiConfigured={isOpenAIConfigured()}
        summaryOutput={summaryOutput}
        flashcardsOutput={flashcardsOutput}
        quizOutput={quizOutput}
      />
      <DashboardHeader
        title="Material details"
        description={`${formatMaterialType(material.material_type)} · ${mimeTypeLabel(material.mime_type)} · ${formatFileSize(material.file_size_bytes)}`}
      />

      <MaterialDetailHeader material={material} studyStatus={studyStatus}>
        {showRetry && (
          <RetryExtractionButton
            materialId={material.id}
            label={
              material.processing_status === "uploaded"
                ? "Start processing"
                : material.processing_status === "extracting"
                  ? "Retry extraction"
                  : "Retry processing"
            }
          />
        )}
      </MaterialDetailHeader>

      <div className="space-y-4 p-6 pt-2">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>

        <p className="text-sm text-muted">
          Uploaded <FormattedDate iso={material.created_at} />
          {material.page_count != null && material.page_count > 0 && (
            <> · {material.page_count} page{material.page_count !== 1 ? "s" : ""}</>
          )}
        </p>

        <MaterialDetailTabs
          material={material}
          extractionStale={extractionStale}
          signedUrl={signedUrl}
          summaryOutput={summaryOutput}
          flashcardsOutput={flashcardsOutput}
          quizOutput={quizOutput}
          openAiConfigured={isOpenAIConfigured()}
        />
      </div>
    </>
  );
}
