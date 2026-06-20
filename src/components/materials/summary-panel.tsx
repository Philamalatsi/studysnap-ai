"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAiDisabledMessage } from "@/lib/ai/display";
import { formatOutputStatus } from "@/lib/materials/display";
import { parseSummaryContent } from "@/features/summary/types";
import { parseSummaryProgress } from "@/features/study-progress/types";
import { useStudyProgress } from "@/features/study-progress/use-study-progress";
import { GenerateSummaryButton } from "@/components/materials/generate-summary-button";
import { StudyOutputEmptyState } from "@/components/materials/study-output-empty-state";
import type { Material, StudyOutput } from "@/types/database";

function outputStatusVariant(
  status: StudyOutput["status"],
): "default" | "brand" | "success" | "warning" | "muted" {
  switch (status) {
    case "ready":
      return "success";
    case "generating":
      return "warning";
    case "failed":
      return "default";
    case "pending":
      return "brand";
    default:
      return "muted";
  }
}

export function SummaryPanel({
  material,
  summaryOutput,
  openAiConfigured,
}: {
  material: Material;
  summaryOutput: StudyOutput | null;
  openAiConfigured: boolean;
}) {
  const router = useRouter();
  const hasExtractedText =
    material.processing_status === "extracted" &&
    Boolean(material.extracted_text?.trim());

  const parsed = summaryOutput
    ? parseSummaryContent(summaryOutput.content)
    : null;

  const defaultProgress = { scrollTop: 0 };
  const { progress, updateProgress, loaded } = useStudyProgress(
    material.id,
    "summary",
    defaultProgress,
  );
  const scrollRef = useRef<HTMLDivElement>(null);
  const restoredScroll = useRef(false);

  const savedScroll = parseSummaryProgress(
    progress as unknown as Record<string, unknown>,
  );

  useEffect(() => {
    if (!loaded || !parsed || restoredScroll.current || !scrollRef.current) {
      return;
    }
    if (savedScroll.scrollTop > 0) {
      scrollRef.current.scrollTop = savedScroll.scrollTop;
    }
    restoredScroll.current = true;
  }, [loaded, parsed, savedScroll.scrollTop]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !parsed) return;

    function onScroll() {
      updateProgress({ scrollTop: el!.scrollTop });
    }

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [parsed, updateProgress]);

  useEffect(() => {
    if (summaryOutput?.status !== "generating" && summaryOutput?.status !== "pending") {
      return;
    }
    const interval = setInterval(() => router.refresh(), 4000);
    return () => clearInterval(interval);
  }, [summaryOutput?.status, router]);

  const canGenerate =
    openAiConfigured &&
    hasExtractedText &&
    summaryOutput?.status !== "ready" &&
    summaryOutput?.status !== "generating";

  let disabledReason: string | undefined;
  if (!openAiConfigured) {
    disabledReason = getAiDisabledMessage(false);
  } else if (!hasExtractedText) {
    disabledReason = "Complete text extraction before generating a summary.";
  } else if (summaryOutput?.status === "ready") {
    disabledReason = "A summary already exists for this material.";
  } else if (summaryOutput?.status === "generating") {
    disabledReason = "Summary generation in progress…";
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 border-b border-border py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">Study summary</h2>
          {summaryOutput && (
            <Badge variant={outputStatusVariant(summaryOutput.status)}>
              {formatOutputStatus(summaryOutput.status)}
            </Badge>
          )}
        </div>
        {summaryOutput?.status !== "ready" && (
          <GenerateSummaryButton
            materialId={material.id}
            disabled={!canGenerate}
            disabledReason={disabledReason}
          />
        )}
      </CardHeader>
      <CardContent className="space-y-4 p-4">
        {!summaryOutput && (
          <StudyOutputEmptyState
            title="AI study summary"
            description='Click "Generate summary" to create a concise study guide from your extracted text.'
            preview={
              <ul className="list-inside list-disc space-y-1">
                <li>Key concepts in bullet points</li>
                <li>Definitions and formulas highlighted</li>
                <li>Exam-ready recap of your upload</li>
              </ul>
            }
          />
        )}

        {summaryOutput?.status === "generating" && (
          <p className="text-sm text-muted">
            OpenAI is generating your summary. This usually takes a few
            seconds…
          </p>
        )}

        {summaryOutput?.status === "failed" && (
          <div className="space-y-3">
            <p className="text-sm text-red-600">
              {summaryOutput.error_message ?? "Summary generation failed."}
            </p>
            <GenerateSummaryButton
              materialId={material.id}
              disabled={!openAiConfigured || !hasExtractedText}
              disabledReason={disabledReason}
            />
          </div>
        )}

        {summaryOutput?.status === "ready" && parsed && (
          <article className="prose prose-sm max-w-none text-foreground">
            {loaded && savedScroll.scrollTop > 0 && (
              <p className="mb-3 rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-sm text-brand-800">
                Resumed where you left off reading.
              </p>
            )}
            <div
              ref={scrollRef}
              className="max-h-[min(70vh,520px)] overflow-y-auto whitespace-pre-wrap rounded-lg bg-slate-50 p-4 text-sm leading-relaxed"
            >
              {parsed.summary}
            </div>
            <p className="mt-3 text-xs text-muted">
              Model: {parsed.model} · Generated{" "}
              {new Date(parsed.generated_at).toLocaleString()}
            </p>
          </article>
        )}

        {summaryOutput?.status === "ready" && !parsed && (
          <p className="text-sm text-muted">Summary is empty. Try generating again.</p>
        )}
      </CardContent>
    </Card>
  );
}
