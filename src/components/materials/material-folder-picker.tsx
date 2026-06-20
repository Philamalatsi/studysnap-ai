"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FolderInput, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UNCATEGORIZED_FOLDER_LABEL } from "@/lib/materials/folders";
import { cn } from "@/lib/utils";
import type { MaterialFolder } from "@/types/database";

const NEW_FOLDER_VALUE = "__new__";

export function MaterialFolderPicker({
  materialId,
  initialFolderId,
  variant = "default",
}: {
  materialId: string;
  initialFolderId: string | null;
  variant?: "default" | "inline";
}) {
  const router = useRouter();
  const [folders, setFolders] = useState<MaterialFolder[]>([]);
  const [folderId, setFolderId] = useState<string | null>(initialFolderId);
  const [selectValue, setSelectValue] = useState(
    initialFolderId ?? "",
  );
  const [newFolderName, setNewFolderName] = useState("");
  const [loadingFolders, setLoadingFolders] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetch("/api/folders", { credentials: "include" })
      .then((res) => res.json())
      .then((body: { folders?: MaterialFolder[] }) => {
        setFolders(body.folders ?? []);
      })
      .catch(() => setError("Could not load folders."))
      .finally(() => setLoadingFolders(false));
  }, []);

  const folderLabel =
    folderId === null
      ? UNCATEGORIZED_FOLDER_LABEL
      : (folders.find((f) => f.id === folderId)?.name ?? "Folder");

  async function moveToFolder(targetFolderId: string | null) {
    if (targetFolderId === folderId) return true;

    setPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/materials/${materialId}/folder`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderId: targetFolderId }),
      });
      const body = (await res.json()) as {
        error?: string;
        folderId?: string | null;
      };
      if (!res.ok) {
        setError(body.error ?? "Could not move material.");
        setSelectValue(folderId ?? "");
        return false;
      }
      setFolderId(body.folderId ?? null);
      setSelectValue(body.folderId ?? "");
      router.refresh();
      return true;
    } catch {
      setError("Could not move material.");
      setSelectValue(folderId ?? "");
      return false;
    } finally {
      setPending(false);
    }
  }

  async function createAndMove() {
    const name = newFolderName.trim();
    if (!name) {
      setError("Enter a folder name.");
      return;
    }

    setPending(true);
    setError(null);
    try {
      const createRes = await fetch("/api/folders", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const createBody = (await createRes.json()) as {
        error?: string;
        folder?: MaterialFolder;
      };
      if (!createRes.ok || !createBody.folder) {
        setError(createBody.error ?? "Could not create folder.");
        return;
      }

      setFolders((prev) =>
        [...prev, createBody.folder!].sort((a, b) =>
          a.name.localeCompare(b.name),
        ),
      );
      setNewFolderName("");
      await moveToFolder(createBody.folder.id);
    } catch {
      setError("Could not create folder.");
    } finally {
      setPending(false);
    }
  }

  function handleSelectChange(value: string) {
    setSelectValue(value);
    setError(null);

    if (value === NEW_FOLDER_VALUE) {
      return;
    }

    void moveToFolder(value || null);
  }

  if (variant === "inline") {
    return (
      <div className="mt-1.5 flex flex-wrap items-center gap-2">
        <FolderInput className="h-3.5 w-3.5 shrink-0 text-muted" />
        <span className="text-xs text-muted">Folder:</span>
        {loadingFolders ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-muted" />
        ) : (
          <select
            className={cn(
              "h-7 max-w-[180px] rounded-md border border-border bg-white px-2 text-xs",
              pending && "opacity-60",
            )}
            value={selectValue}
            disabled={pending}
            onChange={(e) => handleSelectChange(e.target.value)}
            aria-label="Move to folder"
          >
            <option value="">{UNCATEGORIZED_FOLDER_LABEL}</option>
            {folders.map((folder) => (
              <option key={folder.id} value={folder.id}>
                {folder.name}
              </option>
            ))}
            <option value={NEW_FOLDER_VALUE}>+ New folder</option>
          </select>
        )}
        {selectValue === NEW_FOLDER_VALUE && (
          <>
            <Input
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="h-7 max-w-[160px] text-xs"
              placeholder="Folder name"
              disabled={pending}
            />
            <Button
              size="sm"
              className="h-7 px-2 text-xs"
              disabled={pending}
              onClick={() => void createAndMove()}
            >
              {pending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                "Create & move"
              )}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-xs"
              disabled={pending}
              onClick={() => {
                setSelectValue(folderId ?? "");
                setNewFolderName("");
                setError(null);
              }}
            >
              Cancel
            </Button>
          </>
        )}
        {error && <p className="w-full text-xs text-red-600">{error}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">Folder</label>
      <div className="flex flex-wrap items-center gap-2">
        {loadingFolders ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted" />
        ) : (
          <select
            className={cn(
              "rounded-lg border border-border bg-white px-3 py-2 text-sm",
              pending && "opacity-60",
            )}
            value={selectValue}
            disabled={pending}
            onChange={(e) => handleSelectChange(e.target.value)}
            aria-label="Move to folder"
          >
            <option value="">{UNCATEGORIZED_FOLDER_LABEL}</option>
            {folders.map((folder) => (
              <option key={folder.id} value={folder.id}>
                {folder.name}
              </option>
            ))}
            <option value={NEW_FOLDER_VALUE}>+ Create new folder</option>
          </select>
        )}
        {selectValue === NEW_FOLDER_VALUE && (
          <>
            <Input
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="max-w-xs"
              placeholder="New folder name"
              disabled={pending}
            />
            <Button size="sm" disabled={pending} onClick={() => void createAndMove()}>
              {pending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Create & move"
              )}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={pending}
              onClick={() => {
                setSelectValue(folderId ?? "");
                setNewFolderName("");
                setError(null);
              }}
            >
              Cancel
            </Button>
          </>
        )}
      </div>
      {!loadingFolders && selectValue !== NEW_FOLDER_VALUE && (
        <p className="text-sm text-muted">Currently in {folderLabel}</p>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
