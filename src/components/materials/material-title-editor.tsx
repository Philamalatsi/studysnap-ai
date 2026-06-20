"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, Loader2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function MaterialTitleEditor({
  materialId,
  initialTitle,
  variant = "heading",
}: {
  materialId: string;
  initialTitle: string;
  variant?: "heading" | "inline";
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const [draft, setDraft] = useState(initialTitle);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    const trimmed = draft.trim();
    if (!trimmed || trimmed === title) {
      setEditing(false);
      return;
    }
    setPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/materials/${materialId}/title`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: trimmed }),
      });
      const body = (await res.json()) as { error?: string; title?: string };
      if (!res.ok) {
        setError(body.error ?? "Could not rename.");
        return;
      }
      setTitle(body.title ?? trimmed);
      setEditing(false);
      router.refresh();
    } catch {
      setError("Could not save title.");
    } finally {
      setPending(false);
    }
  }

  if (editing) {
    return (
      <div
        className={cn(
          "flex flex-wrap items-center gap-2",
          variant === "inline" && "w-full",
        )}
        onClick={(e) => e.preventDefault()}
      >
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className={variant === "inline" ? "h-8 text-sm" : "max-w-md"}
          disabled={pending}
          aria-label="Material title"
        />
        <Button size="sm" disabled={pending} onClick={save}>
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4" />
          )}
          Save
        </Button>
        <Button
          size="sm"
          variant="ghost"
          disabled={pending}
          onClick={() => {
            setDraft(title);
            setEditing(false);
            setError(null);
          }}
        >
          Cancel
        </Button>
        {error && <p className="w-full text-xs text-red-600">{error}</p>}
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <div className="flex min-w-0 items-center gap-1.5">
        <span className="truncate font-medium text-foreground">{title}</span>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            setEditing(true);
          }}
          className="shrink-0 rounded-lg p-1 text-muted hover:bg-slate-100 hover:text-foreground"
          aria-label="Rename material"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-2xl font-semibold tracking-tight">{title}</span>
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="rounded-lg p-1.5 text-muted hover:bg-slate-100 hover:text-foreground"
        aria-label="Rename material"
      >
        <Pencil className="h-4 w-4" />
      </button>
    </div>
  );
}
