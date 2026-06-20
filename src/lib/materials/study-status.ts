import type { ProcessingStatus } from "@/types/database";

export type MaterialStudyStatus = {
  readyOutputs: number;
  isGenerating: boolean;
};

const STUDY_OUTPUT_COUNT = 3;

export function formatMaterialStudyStatus(
  status: ProcessingStatus,
  study?: MaterialStudyStatus | null,
): string {
  if (status === "failed") {
    return "Something went wrong";
  }
  if (status === "uploaded") {
    return "Waiting to start";
  }
  if (status === "extracting") {
    return "Processing your file…";
  }

  const ready = study?.readyOutputs ?? 0;
  const generating = study?.isGenerating ?? false;

  if (ready >= STUDY_OUTPUT_COUNT) {
    return "Ready to use";
  }
  if (generating) {
    return "Creating study pack…";
  }
  if (ready > 0) {
    return "Almost ready";
  }

  return "Preparing study pack…";
}

export function isMaterialReadyToUse(
  status: ProcessingStatus,
  study?: MaterialStudyStatus | null,
): boolean {
  return (
    status === "extracted" &&
    (study?.readyOutputs ?? 0) >= STUDY_OUTPUT_COUNT
  );
}
