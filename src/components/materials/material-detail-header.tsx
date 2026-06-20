"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MaterialDeleteButton } from "@/components/materials/material-delete-button";
import { MaterialEditDialog } from "@/components/materials/material-edit-dialog";
import {
  formatMaterialStudyStatus,
  isMaterialReadyToUse,
  type MaterialStudyStatus,
} from "@/lib/materials/study-status";
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

export function MaterialDetailHeader({
  material,
  studyStatus,
  children,
}: {
  material: Material;
  studyStatus?: MaterialStudyStatus;
  children?: React.ReactNode;
}) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);

  return (
    <>
      <div className="space-y-4 px-6 pt-2">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">
            {material.title}
          </h1>
          <div className="flex items-center gap-1">
            {children}
            <Button
              size="sm"
              variant="outline"
              onClick={() => setEditOpen(true)}
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
            <MaterialDeleteButton
              materialId={material.id}
              materialTitle={material.title}
              onDeleted={() => router.push("/dashboard")}
            />
            <Badge
              variant={statusVariant(material, studyStatus)}
              className="ml-1 whitespace-nowrap"
            >
              {formatMaterialStudyStatus(material.processing_status, studyStatus)}
            </Badge>
          </div>
        </div>
      </div>

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
