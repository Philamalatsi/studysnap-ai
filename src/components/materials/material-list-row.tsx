"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { MaterialThumbnail } from "@/components/materials/material-thumbnail";
import { RetryExtractionButton } from "@/components/materials/retry-extraction-button";
import {
  formatMaterialDate,
  formatMaterialType,
  formatProcessingStatus,
  mimeTypeLabel,
} from "@/lib/materials/display";
import { formatFileSize } from "@/lib/utils";
import type { Material } from "@/types/database";

function statusVariant(
  status: Material["processing_status"],
): "default" | "brand" | "success" | "warning" | "muted" {
  switch (status) {
    case "uploaded":
      return "brand";
    case "extracted":
      return "success";
    case "extracting":
      return "warning";
    case "failed":
      return "default";
    default:
      return "muted";
  }
}

export function MaterialListRow({ material }: { material: Material }) {
  const needsExtraction =
    material.processing_status === "uploaded" ||
    material.processing_status === "failed";

  return (
    <li className="flex items-start gap-4 px-6 py-4 transition-colors hover:bg-slate-50/80">
      <Link
        href={`/dashboard/materials/${material.id}`}
        className="flex h-14 w-14 shrink-0 overflow-hidden rounded-lg"
      >
        <MaterialThumbnail material={material} className="h-14 w-14" />
      </Link>
      <div className="min-w-0 flex-1">
        <Link
          href={`/dashboard/materials/${material.id}`}
          className="block truncate font-medium text-foreground hover:text-brand-700"
        >
          {material.title}
        </Link>
        <p className="mt-0.5 text-xs text-muted">
          {formatMaterialType(material.material_type)} ·{" "}
          {mimeTypeLabel(material.mime_type)} ·{" "}
          {formatFileSize(material.file_size_bytes)} ·{" "}
          {formatMaterialDate(material.created_at)}
        </p>
        {material.processing_status === "failed" && material.error_message && (
          <p className="mt-1 truncate text-xs text-red-600">
            {material.error_message}
          </p>
        )}
        {needsExtraction && (
          <div className="mt-2">
            <RetryExtractionButton
              materialId={material.id}
              label={
                material.processing_status === "uploaded"
                  ? "Start processing"
                  : "Retry processing"
              }
            />
          </div>
        )}
      </div>
      <Badge variant={statusVariant(material.processing_status)}>
        {formatProcessingStatus(material.processing_status)}
      </Badge>
    </li>
  );
}
