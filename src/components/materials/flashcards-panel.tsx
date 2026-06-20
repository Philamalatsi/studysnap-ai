"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Play } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAiDisabledMessage } from "@/lib/ai/display";
import { formatOutputStatus } from "@/lib/materials/display";
import { parseFlashcardsContent } from "@/features/flashcards/types";
import { GenerateFlashcardsButton } from "@/components/materials/generate-flashcards-button";
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

export function FlashcardsPanel({
  material,
  flashcardsOutput,
  openAiConfigured,
}: {
  material: Material;
  flashcardsOutput: StudyOutput | null;
  openAiConfigured: boolean;
}) {
  const router = useRouter();
  const hasExtractedText =
    material.processing_status === "extracted" &&
    Boolean(material.extracted_text?.trim());

  const parsed = flashcardsOutput
    ? parseFlashcardsContent(flashcardsOutput.content)
    : null;

  useEffect(() => {
    if (
      flashcardsOutput?.status !== "generating" &&
      flashcardsOutput?.status !== "pending"
    ) {
      return;
    }
    const interval = setInterval(() => router.refresh(), 4000);
    return () => clearInterval(interval);
  }, [flashcardsOutput?.status, router]);

  const canGenerate =
    openAiConfigured &&
    hasExtractedText &&
    flashcardsOutput?.status !== "ready" &&
    flashcardsOutput?.status !== "generating";

  let disabledReason: string | undefined;
  if (!openAiConfigured) {
    disabledReason = getAiDisabledMessage(false);
  } else if (!hasExtractedText) {
    disabledReason = "Complete text extraction before generating flashcards.";
  } else if (flashcardsOutput?.status === "ready") {
    disabledReason = "Flashcards already exist for this material.";
  } else if (flashcardsOutput?.status === "generating") {
    disabledReason = "Flashcard generation in progress…";
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 border-b border-border py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">Flashcards</h2>
          {flashcardsOutput && (
            <Badge variant={outputStatusVariant(flashcardsOutput.status)}>
              {formatOutputStatus(flashcardsOutput.status)}
            </Badge>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {flashcardsOutput?.status === "ready" && parsed && (
            <Link href={`/dashboard/materials/${material.id}/flashcards`}>
              <Button>
                <Play className="h-4 w-4" />
                Study flashcards
              </Button>
            </Link>
          )}
          {flashcardsOutput?.status !== "ready" && (
            <GenerateFlashcardsButton
              materialId={material.id}
              disabled={!canGenerate}
              disabledReason={disabledReason}
            />
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-4">
        {!flashcardsOutput && (
          <StudyOutputEmptyState
            title="Flashcard deck"
            description="Generate question-and-answer flashcards from your extracted text, then study them in flip-card mode."
            preview={
              <div className="rounded-lg border border-border bg-white p-3 text-sm">
                <p className="font-medium text-foreground">Q: What is a vector?</p>
                <p className="mt-1 text-muted">A: A quantity with magnitude and direction.</p>
              </div>
            }
          />
        )}

        {flashcardsOutput?.status === "generating" && (
          <p className="text-sm text-muted">
            Creating flashcards with OpenAI…
          </p>
        )}

        {flashcardsOutput?.status === "failed" && (
          <div className="space-y-3">
            <p className="text-sm text-red-600">
              {flashcardsOutput.error_message ??
                "Flashcard generation failed."}
            </p>
            <GenerateFlashcardsButton
              materialId={material.id}
              disabled={!openAiConfigured || !hasExtractedText}
              disabledReason={disabledReason}
              label="Retry flashcards"
            />
          </div>
        )}

        {flashcardsOutput?.status === "ready" && parsed && (
          <div className="space-y-4">
            <p className="text-sm text-muted">
              {parsed.count} cards ready · study in flip-card mode in your browser
            </p>
            <ul className="max-h-64 space-y-2 overflow-y-auto rounded-lg border border-border bg-slate-50 p-3 text-sm">
              {parsed.flashcards.slice(0, 5).map((card, i) => (
                <li key={i} className="border-b border-border/60 pb-2 last:border-0">
                  <span className="font-medium text-foreground">Q: </span>
                  {card.question}
                </li>
              ))}
              {parsed.flashcards.length > 5 && (
                <li className="text-muted">
                  +{parsed.flashcards.length - 5} more cards…
                </li>
              )}
            </ul>
          </div>
        )}

        {flashcardsOutput?.status === "ready" && !parsed && (
          <p className="text-sm text-muted">
            Flashcards are empty. Try generating again.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
