import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatProcessingStatus } from "@/lib/materials/display";
import type { Material } from "@/types/database";

export function ExtractedTextPanel({ material }: { material: Material }) {
  const { processing_status } = material;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between border-b border-border py-4">
        <h2 className="text-lg font-semibold">Extracted text</h2>
        <Badge
          variant={
            processing_status === "extracted"
              ? "success"
              : processing_status === "extracting"
                ? "warning"
                : processing_status === "failed"
                  ? "default"
                  : "brand"
          }
        >
          {formatProcessingStatus(processing_status)}
        </Badge>
      </CardHeader>
      <CardContent className="p-4">
        {processing_status === "uploaded" && (
          <p className="text-sm text-muted">
            Text extraction will start shortly…
          </p>
        )}
        {processing_status === "extracting" && (
          <p className="text-sm text-muted">
            Extracting text from your file. This may take a minute for large
            PDFs or photos.
          </p>
        )}
        {processing_status === "failed" && (
          <div className="space-y-2">
            <p className="text-sm text-red-600">
              {material.error_message ?? "Extraction failed."}
            </p>
            <p className="text-xs text-muted">
              Use “Retry extraction” above to try again.
            </p>
          </div>
        )}
        {processing_status === "extracted" && material.extracted_text && (
          <pre className="max-h-[480px] overflow-auto whitespace-pre-wrap rounded-lg bg-slate-50 p-4 text-sm leading-relaxed text-foreground">
            {material.extracted_text}
          </pre>
        )}
        {processing_status === "extracted" && !material.extracted_text && (
          <p className="text-sm text-muted">No text was found in this file.</p>
        )}
      </CardContent>
    </Card>
  );
}
