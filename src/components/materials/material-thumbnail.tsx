import { isImageMime } from "@/lib/ocr/mime";
import {
  Camera,
  FileText,
  ImageIcon,
  PenLine,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Material, MaterialType } from "@/types/database";

const typeIcons: Record<MaterialType, typeof FileText> = {
  image: Camera,
  pdf: FileText,
  screenshot: ImageIcon,
  handwritten: PenLine,
};

export function MaterialThumbnail({
  material,
  className,
}: {
  material: Pick<Material, "id" | "mime_type" | "material_type">;
  className?: string;
}) {
  if (isImageMime(material.mime_type)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={`/api/materials/${material.id}/preview`}
        alt=""
        className={cn(
          "h-full w-full rounded-lg border border-border object-cover",
          className,
        )}
        loading="lazy"
      />
    );
  }

  const Icon = typeIcons[material.material_type] ?? FileText;
  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center rounded-lg bg-brand-50 text-brand-600",
        className,
      )}
    >
      <Icon className="h-5 w-5" aria-hidden />
    </div>
  );
}
