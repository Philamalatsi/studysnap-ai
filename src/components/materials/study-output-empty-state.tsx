import type { ReactNode } from "react";

export function StudyOutputEmptyState({
  title,
  description,
  preview,
}: {
  title: string;
  description: string;
  preview: ReactNode;
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">{description}</p>
      <div className="rounded-lg border border-dashed border-brand-200 bg-brand-50/30 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-brand-600">
          Preview
        </p>
        <p className="mt-1 text-sm font-semibold text-foreground">{title}</p>
        <div className="mt-3 text-sm text-muted">{preview}</div>
      </div>
    </div>
  );
}
