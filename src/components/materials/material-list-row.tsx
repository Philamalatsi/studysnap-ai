"use client";

import Link from "next/link";
import { useState } from "react";
import { Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { MaterialDeleteButton } from "@/components/materials/material-delete-button";
import { MaterialEditDialog } from "@/components/materials/material-edit-dialog";
import { MaterialThumbnail } from "@/components/materials/material-thumbnail";
import { RetryExtractionButton } from "@/components/materials/retry-extraction-button";
import { FormattedDate } from "@/components/ui/formatted-date";
import {
  formatMaterialType,
  mimeTypeLabel,
} from "@/lib/materials/display";
import {
  formatMaterialStudyStatus,
  isMaterialReadyToUse,
  type MaterialStudyStatus,
} from "@/lib/materials/study-status";
import { isStaleExtraction } from "@/lib/materials/processing";
import { formatFileSize } from "@/lib/utils";
import type { Material } from "@/types/database";

function statusVariant(
  material: Material,
  study?: MaterialStudyStatus,
): "default" | "brand" | "success" | "warning" | "muted" {
  if (material.processing_status === "failed") return "default";
  if (isMaterialReadyToUse(material.processing_status, study)) return "success";
  if (
    material.processing_status === "extracting" ||
    study?.isGenerating
  ) {
    return "warning";
  }
  if (material.processing_status === "uploaded") return "brand";
  return "muted";
}

export function MaterialListRow({
  material,
  studyStatus,
}: {
  material: Material;
  studyStatus?: MaterialStudyStatus;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const extractionStale =
    material.processing_status === "extracting" &&
    isStaleExtraction(material.processing_status, material.updated_at);
  const needsExtraction =
    material.processing_status === "uploaded" ||
    material.processing_status === "failed" ||
    extractionStale;

  return (
    <>
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
          <Link
            href={`/dashboard/materials/${material.id}`}
            className="mt-0.5 block text-xs text-muted hover:text-brand-700"
          >
            {formatMaterialType(material.material_type)} ·{" "}
            {mimeTypeLabel(material.mime_type)} ·{" "}
            {formatFileSize(material.file_size_bytes)} ·{" "}
            <FormattedDate iso={material.created_at} />
          </Link>
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
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => setEditOpen(true)}
            className="rounded-lg p-2 text-muted hover:bg-slate-100 hover:text-foreground"
            aria-label={`Edit ${material.title}`}
            title="Edit name and folder"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <MaterialDeleteButton
            materialId={material.id}
            materialTitle={material.title}
          />
          <Badge
            variant={statusVariant(material, studyStatus)}
            className="ml-1 whitespace-nowrap"
          >
            {formatMaterialStudyStatus(material.processing_status, studyStatus)}
          </Badge>
        </div>
      </li>

      <MaterialEditDialog
        materialId={material.id}
        initialTitle={material.title}
        initialFolderId={material.folder_id}
        open={editOpen}
        onClose={() => setEditOpen(false)}
      />
    </>
  );
}
