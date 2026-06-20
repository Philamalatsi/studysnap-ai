"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UNCATEGORIZED_FOLDER_LABEL } from "@/lib/materials/folders";
import type { MaterialFolder } from "@/types/database";

const NEW_FOLDER_VALUE = "__new__";

export function MaterialEditDialog({
  materialId,
  initialTitle,
  initialFolderId,
  open,
  onClose,
}: {
  materialId: string;
  initialTitle: string;
  initialFolderId: string | null;
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [selectValue, setSelectValue] = useState(initialFolderId ?? "");
  const [newFolderName, setNewFolderName] = useState("");
  const [folders, setFolders] = useState<MaterialFolder[]>([]);
  const [loadingFolders, setLoadingFolders] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setTitle(initialTitle);
    setSelectValue(initialFolderId ?? "");
    setNewFolderName("");
    setError(null);
  }, [open, initialTitle, initialFolderId]);

  useEffect(() => {
    if (!open) return;
    setLoadingFolders(true);
    void fetch("/api/folders", { credentials: "include" })
      .then((res) => res.json())
      .then((body: { folders?: MaterialFolder[] }) => {
        setFolders(body.folders ?? []);
      })
      .catch(() => setError("Could not load folders."))
      .finally(() => setLoadingFolders(false));
  }, [open]);

  if (!open) return null;

  async function resolveFolderId(): Promise<string | null | undefined> {
    if (selectValue === NEW_FOLDER_VALUE) {
      const name = newFolderName.trim();
      if (!name) {
        setError("Enter a folder name.");
        return undefined;
      }
      const res = await fetch("/api/folders", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const body = (await res.json()) as {
        error?: string;
        folder?: MaterialFolder;
      };
      if (!res.ok || !body.folder) {
        setError(body.error ?? "Could not create folder.");
        return undefined;
      }
      return body.folder.id;
    }
    return selectValue || null;
  }

  async function handleSave() {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError("Enter a name for this file.");
      return;
    }

    setPending(true);
    setError(null);

    try {
      const targetFolderId = await resolveFolderId();
      if (targetFolderId === undefined) {
        setPending(false);
        return;
      }

      const titleChanged = trimmedTitle !== initialTitle;
      const folderChanged = targetFolderId !== initialFolderId;

      if (titleChanged) {
        const titleRes = await fetch(`/api/materials/${materialId}/title`, {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: trimmedTitle }),
        });
        const titleBody = (await titleRes.json()) as { error?: string };
        if (!titleRes.ok) {
          setError(titleBody.error ?? "Could not update name.");
          return;
        }
      }

      if (folderChanged) {
        const folderRes = await fetch(`/api/materials/${materialId}/folder`, {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ folderId: targetFolderId }),
        });
        const folderBody = (await folderRes.json()) as { error?: string };
        if (!folderRes.ok) {
          setError(folderBody.error ?? "Could not update folder.");
          return;
        }
      }

      onClose();
      router.refresh();
    } catch {
      setError("Could not save changes.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="material-edit-title"
    >
      <div className="w-full max-w-md rounded-xl border border-border bg-white shadow-lg">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 id="material-edit-title" className="text-lg font-semibold">
            Edit material
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="rounded-lg p-1.5 text-muted hover:bg-slate-100 hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 px-5 py-4">
          <div>
            <label className="text-sm font-medium text-foreground">
              File name
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1.5"
              disabled={pending}
              placeholder="Name shown in your library"
            />
          </div>

          <div>
            <label
              htmlFor="material-edit-folder"
              className="text-sm font-medium text-foreground"
            >
              Folder
            </label>
            {loadingFolders ? (
              <div className="mt-1.5 flex items-center gap-2 text-sm text-muted">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading folders…
              </div>
            ) : (
              <>
                <select
                  id="material-edit-folder"
                  className="mt-1.5 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                  value={selectValue}
                  disabled={pending}
                  aria-label="Folder"
                  onChange={(e) => {
                    setSelectValue(e.target.value);
                    setError(null);
                  }}
                >
                  <option value="">{UNCATEGORIZED_FOLDER_LABEL}</option>
                  {folders.map((folder) => (
                    <option key={folder.id} value={folder.id}>
                      {folder.name}
                    </option>
                  ))}
                  <option value={NEW_FOLDER_VALUE}>+ Create new folder</option>
                </select>
                {selectValue === NEW_FOLDER_VALUE && (
                  <Input
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    className="mt-2"
                    placeholder="New folder name"
                    disabled={pending}
                  />
                )}
              </>
            )}
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <div className="flex justify-end gap-2 border-t border-border px-5 py-4">
          <Button variant="ghost" disabled={pending} onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={pending} onClick={() => void handleSave()}>
            {pending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              "Save changes"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
