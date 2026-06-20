"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Camera,
  CheckCircle2,
  FileText,
  ImageIcon,
  Loader2,
  PenLine,
  Upload,
  X,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  ACCEPTED_UPLOAD_TYPES,
  MAX_UPLOAD_SIZE_BYTES,
} from "@/lib/constants";
import { cn, formatFileSize } from "@/lib/utils";
import { triggerMaterialExtraction } from "@/features/materials/trigger-extraction";
import { uploadMaterialFile } from "@/features/uploads/upload-file";
import type { UploadCategory } from "@/features/uploads/utils";
import {
  inferCategoryFromFile,
  isAllowedMimeType,
  materialTitle,
  resolveMimeType,
} from "@/features/uploads/utils";
import type { MaterialFolder } from "@/types/database";

export type { UploadCategory };

type UploadStatus =
  | "queued"
  | "uploading"
  | "success"
  | "error";

export interface QueuedFile {
  id: string;
  file: File;
  category: UploadCategory;
  displayTitle: string;
  folderId: string | null;
  newFolderName: string;
  status: UploadStatus;
  progress: number;
  error?: string;
}

const NEW_FOLDER_VALUE = "__new__";

const CATEGORIES: {
  id: UploadCategory;
  label: string;
  description: string;
  icon: typeof ImageIcon;
}[] = [
  {
    id: "textbook",
    label: "Textbook photo",
    description: "Pages from textbooks or workbooks",
    icon: Camera,
  },
  {
    id: "handwritten",
    label: "Handwritten notes",
    description: "Notebook pages and lecture notes",
    icon: PenLine,
  },
  {
    id: "screenshot",
    label: "Screenshot",
    description: "Slides, apps, or online resources",
    icon: ImageIcon,
  },
  {
    id: "pdf",
    label: "PDF document",
    description: "Digital readings and assignments",
    icon: FileText,
  },
];

function isAcceptedFile(file: File): boolean {
  const mime = resolveMimeType(file);
  return Boolean(mime && isAllowedMimeType(mime));
}

export function UploadDropzone() {
  const router = useRouter();
  const [category, setCategory] = useState<UploadCategory>("textbook");
  const [folders, setFolders] = useState<MaterialFolder[]>([]);
  const [defaultFolderId, setDefaultFolderId] = useState<string | null>(null);
  const [queue, setQueue] = useState<QueuedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [summary, setSummary] = useState<{
    type: "success" | "error" | "partial";
    message: string;
  } | null>(null);

  const updateItem = useCallback(
    (id: string, patch: Partial<QueuedFile>) => {
      setQueue((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...patch } : item)),
      );
    },
    [],
  );

  useEffect(() => {
    void fetch("/api/folders", { credentials: "include" })
      .then((res) => res.json())
      .then((body: { folders?: MaterialFolder[] }) => {
        setFolders(body.folders ?? []);
      })
      .catch(() => undefined);
  }, []);

  async function resolveFolderForItem(item: QueuedFile): Promise<string | null> {
    if (item.folderId === NEW_FOLDER_VALUE) {
      const name = item.newFolderName.trim();
      if (!name) {
        throw new Error("Enter a name for the new folder.");
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
        throw new Error(body.error ?? "Could not create folder.");
      }
      setFolders((prev) =>
        [...prev, body.folder!].sort((a, b) => a.name.localeCompare(b.name)),
      );
      return body.folder.id;
    }
    return item.folderId;
  }

  const addFiles = useCallback(
    (files: FileList | File[]) => {
      setError(null);
      setSummary(null);
      const next: QueuedFile[] = [];

      for (const file of Array.from(files)) {
        if (!isAcceptedFile(file)) {
          setError(
            "Unsupported file type. Use JPG, PNG, WebP, HEIC, or PDF.",
          );
          continue;
        }
        if (file.size > MAX_UPLOAD_SIZE_BYTES) {
          setError(`"${file.name}" exceeds the 50 MB limit.`);
          continue;
        }
        next.push({
          id: crypto.randomUUID(),
          file,
          category: inferCategoryFromFile(file),
          displayTitle: materialTitle(file.name),
          folderId: defaultFolderId,
          newFolderName: "",
          status: "queued",
          progress: 0,
        });
      }

      if (next.length) {
        setQueue((prev) => [...prev, ...next]);
      }
    },
    [defaultFolderId],
  );

  const onFileInput = useCallback(
    (files: FileList | File[]) => {
      const fileArr = Array.from(files);
      if (fileArr.length === 1) {
        setCategory(inferCategoryFromFile(fileArr[0]!));
      }
      addFiles(files);
    },
    [addFiles],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      if (e.dataTransfer.files.length) onFileInput(e.dataTransfer.files);
    },
    [onFileInput],
  );

  const removeFile = (id: string) => {
    if (isUploading) return;
    setQueue((prev) => prev.filter((f) => f.id !== id));
  };

  const handleUploadAll = async () => {
    const pending = queue.filter((f) => f.status === "queued");
    if (!pending.length || isUploading) return;

    setIsUploading(true);
    setError(null);
    setSummary(null);

    let successCount = 0;
    let failCount = 0;
    let lastMaterialId: string | null = null;

    for (const item of pending) {
      updateItem(item.id, { status: "uploading", progress: 0, error: undefined });

      let folderId: string | null = null;
      try {
        folderId = await resolveFolderForItem(item);
      } catch (err) {
        failCount += 1;
        updateItem(item.id, {
          status: "error",
          error: err instanceof Error ? err.message : "Folder error.",
          progress: 0,
        });
        continue;
      }

      const title = item.displayTitle.trim() || materialTitle(item.file.name);
      if (!title) {
        failCount += 1;
        updateItem(item.id, {
          status: "error",
          error: "Enter a display name for this file.",
          progress: 0,
        });
        continue;
      }

      const result = await uploadMaterialFile({
        file: item.file,
        category: item.category,
        title,
        folderId,
        onProgress: (percent) => updateItem(item.id, { progress: percent }),
      });

      if (result.ok) {
        successCount += 1;
        lastMaterialId = result.materialId;
        updateItem(item.id, { status: "success", progress: 100 });
        triggerMaterialExtraction(result.materialId);
      } else {
        failCount += 1;
        updateItem(item.id, {
          status: "error",
          error: result.error,
          progress: 0,
        });
      }
    }

    setIsUploading(false);
    router.refresh();

    if (failCount === 0) {
      setSummary({
        type: "success",
        message: `Successfully uploaded ${successCount} file${successCount !== 1 ? "s" : ""}. Extracting text and generating your study pack.`,
      });
      if (successCount === 1 && lastMaterialId) {
        router.push(`/dashboard/materials/${lastMaterialId}`);
        return;
      }
    } else if (successCount === 0) {
      setSummary({
        type: "error",
        message: `All ${failCount} upload${failCount !== 1 ? "s" : ""} failed. Check errors below and try again.`,
      });
    } else {
      setSummary({
        type: "partial",
        message: `Uploaded ${successCount} file${successCount !== 1 ? "s" : ""}; ${failCount} failed.`,
      });
    }
  };

  const accept = Object.entries(ACCEPTED_UPLOAD_TYPES)
    .flatMap(([mime, exts]) => [mime, ...exts])
    .join(",");

  const queuedCount = queue.filter((f) => f.status === "queued").length;
  const hasPending = queuedCount > 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-medium text-foreground">
          What are you uploading?
        </h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const selected = category === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                disabled={isUploading}
                onClick={() => setCategory(cat.id)}
                className={cn(
                  "flex flex-col items-start rounded-xl border p-4 text-left transition-all",
                  selected
                    ? "border-brand-500 bg-brand-50 ring-1 ring-brand-500"
                    : "border-border bg-white hover:border-brand-200",
                  isUploading && "cursor-not-allowed opacity-60",
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5",
                    selected ? "text-brand-600" : "text-muted",
                  )}
                />
                <span className="mt-2 text-sm font-medium">{cat.label}</span>
                <span className="mt-0.5 text-xs text-muted">
                  {cat.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={onDrop}
            className={cn(
              "relative flex min-h-[220px] flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors m-4",
              dragActive
                ? "border-brand-500 bg-brand-50"
                : "border-border bg-surface-muted",
              isUploading && "pointer-events-none opacity-60",
            )}
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-brand-600">
              <Upload className="h-7 w-7" />
            </div>
            <p className="mt-4 text-center text-sm font-medium text-foreground">
              Drag and drop files here
            </p>
            <p className="mt-1 text-center text-xs text-muted">
              JPG, PNG, WebP, HEIC, or PDF · Max 50 MB per file
            </p>
            <label className="mt-4 cursor-pointer">
              <span className="sr-only">Choose files</span>
              <input
                type="file"
                multiple
                accept={accept}
                disabled={isUploading}
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) onFileInput(e.target.files);
                  e.target.value = "";
                }}
              />
              <span className="inline-flex h-10 items-center rounded-lg bg-brand-600 px-4 text-sm font-medium text-white hover:bg-brand-700">
                Browse files
              </span>
            </label>
          </div>
        </CardContent>
      </Card>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {summary && (
        <p
          className={cn(
            "rounded-lg px-4 py-3 text-sm",
            summary.type === "success" && "bg-emerald-50 text-emerald-800",
            summary.type === "error" && "bg-red-50 text-red-700",
            summary.type === "partial" && "bg-amber-50 text-amber-900",
          )}
        >
          {summary.message}
        </p>
      )}

      {queue.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">
              Files ({queue.length})
            </h3>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isUploading}
              onClick={() => {
                setQueue([]);
                setSummary(null);
              }}
            >
              Clear all
            </Button>
          </div>
          {hasPending && (
            <div className="rounded-xl border border-border bg-slate-50 px-4 py-3">
              <label className="text-xs font-medium text-muted">
                Default folder for new files
              </label>
              <select
                className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                value={defaultFolderId ?? ""}
                disabled={isUploading}
                onChange={(e) => {
                  const value = e.target.value;
                  setDefaultFolderId(value || null);
                }}
              >
                <option value="">Unsorted</option>
                {folders.map((folder) => (
                  <option key={folder.id} value={folder.id}>
                    {folder.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <ul className="divide-y divide-border rounded-xl border border-border bg-white">
            {queue.map((item) => (
              <li key={item.id} className="px-4 py-3">
                <div className="flex items-start gap-4">
                  <div className="min-w-0 flex-1 space-y-3">
                    <div>
                      <p className="truncate text-xs text-muted">
                        {item.file.name} · {formatFileSize(item.file.size)} ·{" "}
                        {CATEGORIES.find((c) => c.id === item.category)?.label}
                      </p>
                    </div>
                    {item.status === "queued" && !isUploading && (
                      <>
                        <div>
                          <label className="text-xs font-medium text-muted">
                            Display name
                          </label>
                          <Input
                            value={item.displayTitle}
                            onChange={(e) =>
                              updateItem(item.id, {
                                displayTitle: e.target.value,
                              })
                            }
                            className="mt-1 h-9 text-sm"
                            placeholder="Name shown in your library"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted">
                            Save to folder
                          </label>
                          <select
                            className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                            value={item.folderId ?? ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              updateItem(item.id, {
                                folderId: value || null,
                                newFolderName:
                                  value === NEW_FOLDER_VALUE
                                    ? item.newFolderName
                                    : "",
                              });
                            }}
                          >
                            <option value="">Unsorted</option>
                            {folders.map((folder) => (
                              <option key={folder.id} value={folder.id}>
                                {folder.name}
                              </option>
                            ))}
                            <option value={NEW_FOLDER_VALUE}>
                              + Create new folder
                            </option>
                          </select>
                          {item.folderId === NEW_FOLDER_VALUE && (
                            <Input
                              value={item.newFolderName}
                              onChange={(e) =>
                                updateItem(item.id, {
                                  newFolderName: e.target.value,
                                })
                              }
                              className="mt-2 h-9 text-sm"
                              placeholder="New folder name"
                            />
                          )}
                        </div>
                      </>
                    )}
                    {(item.status === "uploading" ||
                      item.status === "success" ||
                      item.status === "error") && (
                      <p className="text-sm font-medium text-foreground">
                        {item.displayTitle}
                      </p>
                    )}
                  </div>
                  {item.status === "uploading" && (
                    <Loader2 className="h-4 w-4 shrink-0 animate-spin text-brand-600" />
                  )}
                  {item.status === "success" && (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                  )}
                  {item.status === "error" && (
                    <XCircle className="h-4 w-4 shrink-0 text-red-600" />
                  )}
                  {item.status === "queued" && !isUploading && (
                    <button
                      type="button"
                      onClick={() => removeFile(item.id)}
                      className="rounded-lg p-1.5 text-muted hover:bg-slate-100 hover:text-foreground"
                      aria-label={`Remove ${item.file.name}`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                {item.status === "uploading" && (
                  <div className="mt-2">
                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-brand-600 transition-all duration-200"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-muted">
                      Uploading… {item.progress}%
                    </p>
                  </div>
                )}
                {item.status === "error" && item.error && (
                  <p className="mt-2 text-xs text-red-600">{item.error}</p>
                )}
                {item.status === "success" && (
                  <p className="mt-2 text-xs text-emerald-700">Upload complete</p>
                )}
              </li>
            ))}
          </ul>
          <Button
            fullWidth
            disabled={!hasPending || isUploading}
            onClick={handleUploadAll}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading…
              </>
            ) : (
              <>
                Upload {queuedCount} file{queuedCount !== 1 ? "s" : ""}
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
