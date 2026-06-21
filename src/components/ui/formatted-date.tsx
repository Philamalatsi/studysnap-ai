import { formatMaterialDate } from "@/lib/materials/display";

/** Locale-aware date text; suppressHydrationWarning avoids server/client timezone mismatches. */
export function FormattedDate({
  iso,
  className,
}: {
  iso: string;
  className?: string;
}) {
  return (
    <time dateTime={iso} className={className} suppressHydrationWarning>
      {formatMaterialDate(iso)}
    </time>
  );
}
