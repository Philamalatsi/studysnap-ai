import Link from "next/link";
import { Upload } from "lucide-react";
import { MaterialListRow } from "@/components/materials/material-list-row";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { Material } from "@/types/database";

export function MaterialsList({ materials }: { materials: Material[] }) {
  if (materials.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center py-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-600">
            <Upload className="h-6 w-6" />
          </div>
          <h3 className="mt-4 font-semibold">No materials yet</h3>
          <p className="mt-2 max-w-sm text-sm text-muted">
            Upload JPG, PNG, WebP, HEIC, or PDF files to see them here.
          </p>
          <Link href="/dashboard/upload" className="mt-4">
            <Button>Upload your first file</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between border-b border-border py-4">
        <div>
          <h2 className="text-lg font-semibold">Your materials</h2>
          <p className="text-sm text-muted">
            {materials.length} file{materials.length !== 1 ? "s" : ""} stored
          </p>
        </div>
        <Link href="/dashboard/upload">
          <Button size="sm" variant="outline">
            Add more
          </Button>
        </Link>
      </CardHeader>
      <ul className="divide-y divide-border">
        {materials.map((material) => (
          <MaterialListRow key={material.id} material={material} />
        ))}
      </ul>
    </Card>
  );
}
