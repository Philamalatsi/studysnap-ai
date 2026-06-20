"use client";

import { FileDown, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function DownloadStudyPackPdfButton({
  materialId,
  materialTitle,
  disabled,
}: {
  materialId: string;
  materialTitle: string;
  disabled?: boolean;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDownload() {
    setPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/materials/${materialId}/study-pack/pdf`, {
        credentials: "include",
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        setError(body?.error ?? "Could not download PDF.");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${materialTitle.replace(/[^\w\s-]/g, "").trim() || "study-pack"}-study-pack.pdf`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Could not download PDF.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <Button
        variant="secondary"
        size="sm"
        disabled={disabled || pending}
        onClick={handleDownload}
      >
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FileDown className="h-4 w-4" />
        )}
        {pending ? "Preparing PDF…" : "Download study pack (PDF)"}
      </Button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
