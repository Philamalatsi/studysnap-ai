"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MaterialDeleteButton({
  materialId,
  materialTitle,
  onDeleted,
}: {
  materialId: string;
  materialTitle: string;
  onDeleted?: () => void;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/materials/${materialId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const body = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(body.error ?? "Could not delete file.");
        return;
      }
      setConfirming(false);
      if (onDeleted) {
        onDeleted();
      } else {
        router.refresh();
      }
    } catch {
      setError("Could not delete file.");
    } finally {
      setPending(false);
    }
  }

  if (confirming) {
    return (
      <div className="flex flex-col items-end gap-1">
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="danger"
            className="h-8 px-2 text-xs"
            disabled={pending}
            onClick={() => void handleDelete()}
          >
            {pending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              "Delete"
            )}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 px-2 text-xs"
            disabled={pending}
            onClick={() => {
              setConfirming(false);
              setError(null);
            }}
          >
            Cancel
          </Button>
        </div>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="rounded-lg p-2 text-muted hover:bg-red-50 hover:text-red-600"
      aria-label={`Delete ${materialTitle}`}
      title="Delete file"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
