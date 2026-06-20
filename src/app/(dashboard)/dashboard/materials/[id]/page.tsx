import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { MaterialTitleEditor } from "@/components/materials/material-title-editor";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { MaterialDetailTabs } from "@/components/materials/material-detail-tabs";
import { MaterialProcessingRunner } from "@/components/materials/material-processing-runner";
import { RetryExtractionButton } from "@/components/materials/retry-extraction-button";
import { Badge } from "@/components/ui/badge";
import { isOpenAIConfigured } from "@/lib/ai/openai";
import {
  formatMaterialDate,
  formatMaterialType,
  formatProcessingStatus,
  mimeTypeLabel,
} from "@/lib/materials/display";
import { getMaterialSignedUrl } from "@/lib/materials/storage";
import { formatFileSize } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import {
  getMaterialById,
  getStudyOutputForMaterial,
} from "@/lib/supabase/queries";
import type { ProcessingStatus } from "@/types/database";

export const metadata = {
  title: "Material",
};

function statusVariant(
  status: ProcessingStatus,
): "default" | "brand" | "success" | "warning" | "muted" {
  switch (status) {
    case "uploaded":
      return "brand";
    case "extracting":
      return "warning";
    case "extracted":
      return "success";
    case "failed":
      return "default";
    default:
      return "muted";
  }
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

  const showRetry =
    material.processing_status === "failed" ||
    material.processing_status === "uploaded";

  const hasExtractedText =
    material.processing_status === "extracted" &&
    Boolean(material.extracted_text?.trim());

  return (
    <>
      <MaterialProcessingRunner
        materialId={material.id}
        status={material.processing_status}
        hasExtractedText={hasExtractedText}
        openAiConfigured={isOpenAIConfigured()}
        summaryOutput={summaryOutput}
        flashcardsOutput={flashcardsOutput}
        quizOutput={quizOutput}
      />
      <DashboardHeader
        title="Material details"
        description={`${formatMaterialType(material.material_type)} · ${mimeTypeLabel(material.mime_type)} · ${formatFileSize(material.file_size_bytes)}`}
        action={
          <div className="flex items-center gap-2">
            {showRetry && (
              <RetryExtractionButton
                materialId={material.id}
                label={
                  material.processing_status === "uploaded"
                    ? "Start processing"
                    : "Retry processing"
                }
              />
            )}
            <Badge variant={statusVariant(material.processing_status)}>
              {formatProcessingStatus(material.processing_status)}
            </Badge>
          </div>
        }
      />

      <div className="space-y-4 px-6 pt-2">
        <MaterialTitleEditor
          materialId={material.id}
          initialTitle={material.title}
        />
      </div>

      <div className="space-y-4 p-6 pt-2">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>

        <p className="text-sm text-muted">
          Uploaded {formatMaterialDate(material.created_at)}
          {material.page_count != null && material.page_count > 0 && (
            <> · {material.page_count} page{material.page_count !== 1 ? "s" : ""}</>
          )}
        </p>

        <MaterialDetailTabs
          material={material}
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
