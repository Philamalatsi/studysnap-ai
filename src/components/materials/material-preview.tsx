import { FileText } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { isImageMime, isPdfMime } from "@/lib/ocr/mime";
import type { Material } from "@/types/database";

export function MaterialPreview({
  material,
  signedUrl,
}: {
  material: Material;
  signedUrl: string | null;
}) {
  const imagePreviewSrc = isImageMime(material.mime_type)
    ? `/api/materials/${material.id}/preview`
    : null;

  return (
    <Card>
      <CardHeader className="border-b border-border py-4">
        <h2 className="text-lg font-semibold">File preview</h2>
      </CardHeader>
      <CardContent className="p-4">
        {!signedUrl && !imagePreviewSrc ? (
          <p className="text-sm text-muted">Preview unavailable.</p>
        ) : imagePreviewSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imagePreviewSrc}
            alt={material.title}
            className="mx-auto max-h-[480px] w-full rounded-lg border border-border object-contain"
          />
        ) : isPdfMime(material.mime_type) && signedUrl ? (
          <iframe
            src={signedUrl}
            title={material.title}
            className="h-[520px] w-full rounded-lg border border-border"
          />
        ) : (
          <div className="flex flex-col items-center py-12 text-muted">
            <FileText className="h-10 w-10" />
            <p className="mt-2 text-sm">Preview not supported for this type.</p>
            {signedUrl && (
              <a
                href={signedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 text-sm font-medium text-brand-600 hover:underline"
              >
                Open file
              </a>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
