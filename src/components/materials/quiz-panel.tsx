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
import { parseQuizContent } from "@/features/quiz/types";
import { GenerateQuizButton } from "@/components/materials/generate-quiz-button";
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

export function QuizPanel({
  material,
  quizOutput,
  openAiConfigured,
}: {
  material: Material;
  quizOutput: StudyOutput | null;
  openAiConfigured: boolean;
}) {
  const router = useRouter();
  const hasExtractedText =
    material.processing_status === "extracted" &&
    Boolean(material.extracted_text?.trim());

  const parsed = quizOutput ? parseQuizContent(quizOutput.content) : null;

  useEffect(() => {
    if (
      quizOutput?.status !== "generating" &&
      quizOutput?.status !== "pending"
    ) {
      return;
    }
    const interval = setInterval(() => router.refresh(), 4000);
    return () => clearInterval(interval);
  }, [quizOutput?.status, router]);

  const canGenerate =
    openAiConfigured &&
    hasExtractedText &&
    quizOutput?.status !== "ready" &&
    quizOutput?.status !== "generating";

  let disabledReason: string | undefined;
  if (!openAiConfigured) {
    disabledReason = getAiDisabledMessage(false);
  } else if (!hasExtractedText) {
    disabledReason = "Complete text extraction before generating a quiz.";
  } else if (quizOutput?.status === "ready") {
    disabledReason = "Quiz already exists for this material.";
  } else if (quizOutput?.status === "generating") {
    disabledReason = "Quiz generation in progress…";
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 border-b border-border py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">Quiz</h2>
          {quizOutput && (
            <Badge variant={outputStatusVariant(quizOutput.status)}>
              {formatOutputStatus(quizOutput.status)}
            </Badge>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {quizOutput?.status === "ready" && parsed && (
            <Link href={`/dashboard/materials/${material.id}/quiz`}>
              <Button>
                <Play className="h-4 w-4" />
                Take quiz
              </Button>
            </Link>
          )}
          {quizOutput?.status !== "ready" && (
            <GenerateQuizButton
              materialId={material.id}
              disabled={!canGenerate}
              disabledReason={disabledReason}
            />
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-4">
        {!quizOutput && (
          <StudyOutputEmptyState
            title="Practice quiz"
            description="Generate multiple-choice questions with explanations from your extracted text, then take the quiz in the app."
            preview={
              <div className="space-y-2 text-sm">
                <p className="font-medium text-foreground">
                  Which quantity is a vector?
                </p>
                <p className="text-muted">A) Speed · B) Velocity ✓ · C) Mass · D) Time</p>
                <p className="text-xs italic">+ explanation after each answer</p>
              </div>
            }
          />
        )}

        {quizOutput?.status === "generating" && (
          <p className="text-sm text-muted">Creating quiz with OpenAI…</p>
        )}

        {quizOutput?.status === "failed" && (
          <div className="space-y-3">
            <p className="text-sm text-red-600">
              {quizOutput.error_message ?? "Quiz generation failed."}
            </p>
            <GenerateQuizButton
              materialId={material.id}
              disabled={!openAiConfigured || !hasExtractedText}
              disabledReason={disabledReason}
              label="Retry quiz"
            />
          </div>
        )}

        {quizOutput?.status === "ready" && parsed && (
          <div className="space-y-4">
            <p className="text-sm text-muted">
              {parsed.count} questions ready · take the quiz in your browser — no download needed
            </p>
            <ul className="max-h-64 space-y-2 overflow-y-auto rounded-lg border border-border bg-slate-50 p-3 text-sm">
              {parsed.questions.slice(0, 3).map((q, i) => (
                <li
                  key={i}
                  className="border-b border-border/60 pb-2 last:border-0"
                >
                  <span className="font-medium text-foreground">Q{i + 1}: </span>
                  {q.question}
                </li>
              ))}
              {parsed.questions.length > 3 && (
                <li className="text-muted">
                  +{parsed.questions.length - 3} more questions…
                </li>
              )}
            </ul>
          </div>
        )}

        {quizOutput?.status === "ready" && !parsed && (
          <p className="text-sm text-muted">
            Quiz is empty. Try generating again.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
