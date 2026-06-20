import type {
  MaterialType,
  OutputStatus,
  ProcessingStatus,
} from "@/types/database";

export function formatMaterialType(type: MaterialType): string {
  const labels: Record<MaterialType, string> = {
    image: "Image",
    pdf: "PDF",
    screenshot: "Screenshot",
    handwritten: "Handwritten",
  };
  return labels[type];
}

export function formatProcessingStatus(status: ProcessingStatus): string {
  const labels: Record<ProcessingStatus, string> = {
    uploaded: "Queued",
    extracting: "Extracting…",
    extracted: "Text ready",
    failed: "Failed",
  };
  return labels[status];
}

export function formatMaterialDate(iso: string): string {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export function formatOutputStatus(status: OutputStatus): string {
  const labels: Record<OutputStatus, string> = {
    pending: "Pending",
    generating: "Generating…",
    ready: "Ready",
    failed: "Failed",
  };
  return labels[status];
}

export function mimeTypeLabel(mimeType: string): string {
  if (mimeType === "application/pdf") return "PDF";
  if (mimeType.startsWith("image/")) {
    return mimeType.replace("image/", "").toUpperCase();
  }
  return mimeType;
}
