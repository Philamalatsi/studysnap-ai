"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { ChevronDown, ChevronRight, FolderOpen } from "lucide-react";
import { MaterialListRow } from "@/components/materials/material-list-row";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { groupMaterialsByFolder } from "@/lib/materials/folders";
import type { MaterialStudyStatusMap } from "@/lib/supabase/queries";
import type { Material, MaterialFolder } from "@/types/database";

function MaterialFolderSection({
  name,
  count,
  defaultOpen = true,
  children,
}: {
  name: string;
  count: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const listId = useId();
  const toggle = () => setOpen((prev) => !prev);
  const headerClassName =
    "flex w-full items-center gap-2 border-b border-border/60 bg-slate-50/80 px-6 py-3 text-left transition-colors hover:bg-slate-100/80";
  const countLabel = `${count} file${count !== 1 ? "s" : ""}`;

  const headerContent = (
    <>
      <FolderOpen className="h-4 w-4 shrink-0 text-brand-600" />
      <h3 className="text-sm font-semibold text-foreground">{name}</h3>
      <span className="text-xs text-muted">{countLabel}</span>
    </>
  );

  return (
    <section>
      {open ? (
        <button
          type="button"
          onClick={toggle}
          className={headerClassName}
          aria-expanded="true"
          aria-controls={listId}
        >
          <ChevronDown className="h-4 w-4 shrink-0 text-muted" />
          {headerContent}
        </button>
      ) : (
        <button
          type="button"
          onClick={toggle}
          className={headerClassName}
          aria-expanded="false"
          aria-controls={listId}
        >
          <ChevronRight className="h-4 w-4 shrink-0 text-muted" />
          {headerContent}
        </button>
      )}
      {open ? (
        <ul id={listId} className="divide-y divide-border">
          {children}
        </ul>
      ) : null}
    </section>
  );
}

export function MaterialsList({
  materials,
  folders,
  studyStatusByMaterialId = {},
}: {
  materials: Material[];
  folders: MaterialFolder[];
  studyStatusByMaterialId?: MaterialStudyStatusMap;
}) {
  if (materials.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center py-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-600">
            <FolderOpen className="h-6 w-6" />
          </div>
          <h3 className="mt-4 font-semibold">No materials yet</h3>
          <p className="mt-2 max-w-sm text-sm text-muted">
            Upload JPG, PNG, WebP, HEIC, or PDF files and organize them into
            folders.
          </p>
          <Link href="/dashboard/upload" className="mt-4">
            <Button>Upload your first file</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const groups = groupMaterialsByFolder(materials, folders);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between border-b border-border py-4">
        <div>
          <h2 className="text-lg font-semibold">Your materials</h2>
          <p className="text-sm text-muted">
            {materials.length} file{materials.length !== 1 ? "s" : ""} in{" "}
            {groups.length} folder{groups.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/dashboard/upload">
          <Button size="sm" variant="outline">
            Add more
          </Button>
        </Link>
      </CardHeader>
      <div className="divide-y divide-border">
        {groups.map((group) => (
          <MaterialFolderSection
            key={group.id ?? "unsorted"}
            name={group.name}
            count={group.materials.length}
          >
            {group.materials.map((material) => (
              <MaterialListRow
                key={material.id}
                material={material}
                studyStatus={studyStatusByMaterialId[material.id]}
              />
            ))}
          </MaterialFolderSection>
        ))}
      </div>
    </Card>
  );
}
