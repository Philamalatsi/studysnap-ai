"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { StudyMode, StudyProgressPayload } from "@/features/study-progress/types";

export function useStudyProgress<T extends StudyProgressPayload>(
  materialId: string,
  mode: StudyMode,
  defaultValue: T,
) {
  const [progress, setProgress] = useState<T>(defaultValue);
  const [loaded, setLoaded] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const defaultRef = useRef(defaultValue);

  useEffect(() => {
    defaultRef.current = defaultValue;
  }, [defaultValue]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(
          `/api/materials/${materialId}/progress?mode=${mode}`,
          { credentials: "include" },
        );
        if (!res.ok) {
          if (!cancelled) setLoaded(true);
          return;
        }
        const body = (await res.json()) as { progress?: Record<string, unknown> };
        if (!cancelled && body.progress) {
          setProgress({ ...defaultRef.current, ...body.progress } as T);
        }
      } catch {
        // keep defaults
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [materialId, mode]);

  const persist = useCallback(
    (next: T) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        void fetch(`/api/materials/${materialId}/progress`, {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mode, progress: next }),
        });
      }, 400);
    },
    [materialId, mode],
  );

  const updateProgress = useCallback(
    (patch: Partial<T> | ((prev: T) => T)) => {
      setProgress((prev) => {
        const next =
          typeof patch === "function"
            ? patch(prev)
            : ({ ...prev, ...patch } as T);
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const clearProgress = useCallback(async () => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setProgress(defaultRef.current);
    await fetch(`/api/materials/${materialId}/progress`, {
      method: "DELETE",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode }),
    });
  }, [materialId, mode]);

  return { progress, updateProgress, clearProgress, loaded };
}
