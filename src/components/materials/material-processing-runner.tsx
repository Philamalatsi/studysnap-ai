"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { ProcessingStatus, StudyOutput } from "@/types/database";

function isOutputBusy(output: StudyOutput | null) {
  return output?.status === "pending" || output?.status === "generating";
}

export function MaterialProcessingRunner({
  materialId,
  status,
  hasExtractedText,
  openAiConfigured,
  summaryOutput,
  flashcardsOutput,
  quizOutput,
}: {
  materialId: string;
  status: ProcessingStatus;
  hasExtractedText: boolean;
  openAiConfigured: boolean;
  summaryOutput: StudyOutput | null;
  flashcardsOutput: StudyOutput | null;
  quizOutput: StudyOutput | null;
}) {
  const router = useRouter();
  const inFlight = useRef(false);

  const outputs = [summaryOutput, flashcardsOutput, quizOutput];
  const outputBusy = outputs.some(isOutputBusy);
  const allReady = outputs.every((o) => o?.status === "ready");

  const shouldPoll =
    status === "uploaded" ||
    status === "extracting" ||
    outputBusy;

  const shouldRunProcess =
    status === "uploaded" ||
    (status === "extracted" &&
      hasExtractedText &&
      openAiConfigured &&
      !allReady &&
      !outputBusy);

  useEffect(() => {
    if (!shouldRunProcess || inFlight.current) return;

    inFlight.current = true;
    void fetch(`/api/materials/${materialId}/process`, {
      method: "POST",
      credentials: "include",
    })
      .finally(() => {
        inFlight.current = false;
        router.refresh();
      });
  }, [materialId, shouldRunProcess, router]);

  useEffect(() => {
    if (!shouldPoll) return;
    const interval = setInterval(() => router.refresh(), 4000);
    return () => clearInterval(interval);
  }, [shouldPoll, router]);

  return null;
}
