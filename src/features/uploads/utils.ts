import { ACCEPTED_MIME_TYPES } from "@/lib/constants";
import type { MaterialType } from "@/types/database";

export type UploadCategory =
  | "textbook"
  | "handwritten"
  | "screenshot"
  | "pdf";

export const UPLOADS_BUCKET = "uploads";

const EXTENSION_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  heic: "image/heic",
  heif: "image/heif",
  pdf: "application/pdf",
};

export function isAllowedMimeType(mimeType: string): boolean {
  return (ACCEPTED_MIME_TYPES as readonly string[]).includes(mimeType);
}

export function categoryToMaterialType(
  category: UploadCategory,
  mimeType: string,
): MaterialType {
  if (mimeType === "application/pdf" || category === "pdf") {
    return "pdf";
  }
  if (category === "handwritten") return "handwritten";
  if (category === "screenshot") return "screenshot";
  return "image";
}

export function resolveMimeType(file: File): string {
  if (file.type) return file.type;
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  return EXTENSION_MIME[ext] ?? "";
}

export function sanitizeFilename(name: string): string {
  const base = name.replace(/[/\\]/g, "").trim() || "upload";
  const sanitized = base.replace(/[^\w.\-() ]+/g, "_").replace(/\s+/g, "_");
  return sanitized.slice(0, 200);
}

export function buildStoragePath(
  userId: string,
  materialId: string,
  filename: string,
): string {
  return `${userId}/${materialId}/${sanitizeFilename(filename)}`;
}

export function materialTitle(filename: string): string {
  const lastDot = filename.lastIndexOf(".");
  if (lastDot <= 0) return filename;
  return filename.slice(0, lastDot);
}

export function inferCategoryFromFile(file: File): UploadCategory {
  const mime = resolveMimeType(file);
  if (mime === "application/pdf") return "pdf";
  const name = file.name.toLowerCase();
  if (name.includes("screenshot") || name.includes("screen_shot")) {
    return "screenshot";
  }
  if (
    name.includes("note") ||
    name.includes("handwrit") ||
    name.includes("hw_")
  ) {
    return "handwritten";
  }
  return "textbook";
}
