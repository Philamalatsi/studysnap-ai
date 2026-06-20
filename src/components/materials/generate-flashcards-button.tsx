"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Layers, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function GenerateFlashcardsButton({
  materialId,
  disabled,
  disabledReason,
  label = "Generate flashcards",
}: {
  materialId: string;
  disabled?: boolean;
  disabledReason?: string;
  label?: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/materials/${materialId}/flashcards`, {
        method: "POST",
        credentials: "include",
      });
      const body = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(body.error ?? "Could not generate flashcards.");
      } else {
        router.refresh();
      }
    } catch {
      setError("Could not reach the server.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <Button disabled={disabled || pending} onClick={handleGenerate}>
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Layers className="h-4 w-4" />
        )}
        {pending ? "Generating…" : label}
      </Button>
      {disabled && disabledReason && (
        <p className="text-xs text-muted">{disabledReason}</p>
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
