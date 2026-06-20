"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ExtractedTextPanel } from "@/components/materials/extracted-text-panel";
import { DownloadStudyPackPdfButton } from "@/components/materials/download-study-pack-pdf-button";
import { GenerateStudyPackButton } from "@/components/materials/generate-study-pack-button";
import { MaterialPreview } from "@/components/materials/material-preview";
import { FlashcardsPanel } from "@/components/materials/flashcards-panel";
import { QuizPanel } from "@/components/materials/quiz-panel";
import { SummaryPanel } from "@/components/materials/summary-panel";
import { getAiDisabledMessage } from "@/lib/ai/display";
import type { Material, StudyOutput } from "@/types/database";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "summary", label: "Summary" },
  { id: "flashcards", label: "Flashcards" },
  { id: "quiz", label: "Quiz" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function MaterialDetailTabs({
  material,
  signedUrl,
  summaryOutput,
  flashcardsOutput,
  quizOutput,
  openAiConfigured,
}: {
  material: Material;
  signedUrl: string | null;
  summaryOutput: StudyOutput | null;
  flashcardsOutput: StudyOutput | null;
  quizOutput: StudyOutput | null;
  openAiConfigured: boolean;
}) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  const hasExtractedText =
    material.processing_status === "extracted" &&
    Boolean(material.extracted_text?.trim());

  const allOutputsReady =
    summaryOutput?.status === "ready" &&
    flashcardsOutput?.status === "ready" &&
    quizOutput?.status === "ready";

  const outputBusy =
    summaryOutput?.status === "pending" ||
    summaryOutput?.status === "generating" ||
    flashcardsOutput?.status === "pending" ||
    flashcardsOutput?.status === "generating" ||
    quizOutput?.status === "pending" ||
    quizOutput?.status === "generating";

  const isProcessing =
    material.processing_status === "uploaded" ||
    material.processing_status === "extracting" ||
    outputBusy;

  const canGenerateAll =
    openAiConfigured && hasExtractedText && !allOutputsReady && !isProcessing;

  return (
    <div className="space-y-4">
      {hasExtractedText && (
        <div className="flex flex-col gap-3 rounded-xl border border-brand-100 bg-brand-50/40 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              {isProcessing
                ? "Creating your study pack…"
                : allOutputsReady
                  ? "Your study pack is ready"
                  : "Automatic study pack"}
            </p>
            <p className="text-sm text-muted">
              {isProcessing
                ? "Extracting text, then generating summary, flashcards, and quiz. This can take a minute."
                : allOutputsReady
                  ? "Summary, flashcards, and quiz are ready. Download everything as a PDF."
                  : "Summary, flashcards, and quiz are generated automatically after upload."}
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-2">
            {allOutputsReady && (
              <DownloadStudyPackPdfButton
                materialId={material.id}
                materialTitle={material.title}
              />
            )}
            {!allOutputsReady && (
              <GenerateStudyPackButton
                materialId={material.id}
                disabled={!canGenerateAll}
                disabledReason={
                  !openAiConfigured
                    ? getAiDisabledMessage(false)
                    : isProcessing
                      ? "Processing in progress…"
                      : allOutputsReady
                        ? "All study tools already exist."
                        : undefined
                }
              />
            )}
          </div>
        </div>
      )}

      {!hasExtractedText &&
        (material.processing_status === "uploaded" ||
          material.processing_status === "extracting") && (
          <div className="rounded-xl border border-brand-100 bg-brand-50/40 px-4 py-3">
            <p className="text-sm font-medium text-foreground">
              Processing your file…
            </p>
            <p className="mt-1 text-sm text-muted">
              Extracting text, then generating summary, flashcards, and quiz
              automatically.
            </p>
          </div>
        )}

      <div className="-mx-1 overflow-x-auto pb-1">
        <div className="flex min-w-max gap-1 rounded-lg border border-border bg-white p-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "shrink-0 rounded-md px-4 py-2 text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "bg-brand-600 text-white shadow-sm"
                  : "text-muted hover:bg-slate-50 hover:text-foreground",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "overview" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <MaterialPreview material={material} signedUrl={signedUrl} />
          <ExtractedTextPanel material={material} />
        </div>
      )}

      {activeTab === "summary" && (
        <SummaryPanel
          material={material}
          summaryOutput={summaryOutput}
          openAiConfigured={openAiConfigured}
        />
      )}

      {activeTab === "flashcards" && (
        <FlashcardsPanel
          material={material}
          flashcardsOutput={flashcardsOutput}
          openAiConfigured={openAiConfigured}
        />
      )}

      {activeTab === "quiz" && (
        <QuizPanel
          material={material}
          quizOutput={quizOutput}
          openAiConfigured={openAiConfigured}
        />
      )}
    </div>
  );
}
