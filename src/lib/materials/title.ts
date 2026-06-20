const GENERIC_TITLE = /^(screenshot|img_|image|photo|scan|upload|document)/i;

export function suggestTitleFromExtractedText(
  text: string,
  fallback: string,
): string | null {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const chapterLine = lines.find(
    (line) =>
      line.length >= 8 &&
      line.length <= 100 &&
      /^(chapter|unit|lesson|topic|section)\s+/i.test(line),
  );
  if (chapterLine) return chapterLine;

  const first = lines[0];
  if (
    first &&
    first.length >= 8 &&
    first.length <= 80 &&
    !GENERIC_TITLE.test(first)
  ) {
    return first;
  }

  if (GENERIC_TITLE.test(fallback)) {
    const second = lines.find((line) => line.length >= 8 && line.length <= 80);
    if (second) return second;
  }

  return null;
}
