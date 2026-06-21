"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function RetryExtractionButton({
  materialId,
  label = "Retry processing",
}: {
  materialId: string;
  label?: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRetry() {
    setPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/materials/${materialId}/process`, {
        method: "POST",
        credentials: "include",
      });
      let body: { error?: string } = {};
      try {
        body = (await res.json()) as { error?: string };
      } catch {
        body = {};
      }
      if (!res.ok) {
        setError(
          body.error ??
            (res.status === 500
              ? "Server error during processing. Check Vercel logs for details."
              : "Processing failed."),
        );
      } else {
        router.refresh();
      }
    } catch {
      setError("Could not reach the processing service.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <Button
        variant="outline"
        size="sm"
        disabled={pending}
        onClick={handleRetry}
      >
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <RefreshCw className="h-4 w-4" />
        )}
        {pending ? "Processing…" : label}
      </Button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
