type QuoteCardProps = {
  text: string;
  who: string;
  className?: string;
};

export function QuoteCard({ text, who, className }: QuoteCardProps) {
  return (
    <blockquote
      className={
        className ??
        "rounded-xl border border-brand-100 bg-brand-50/40 px-5 py-4"
      }
    >
      <p className="text-sm leading-relaxed text-foreground">
        &ldquo;{text}&rdquo;
      </p>
      <footer className="mt-2 text-xs font-medium text-muted">— {who}</footer>
    </blockquote>
  );
}
