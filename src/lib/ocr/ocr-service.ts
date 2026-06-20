import "server-only";

import { extractTextFromImage } from "@/lib/ocr/image-ocr";
import { isImageMime, isPdfMime, isSupportedForOcr } from "@/lib/ocr/mime";
import { extractTextFromPdf } from "@/lib/ocr/pdf-ocr";

export type OcrResult = {
  text: string;
  pageCount: number | null;
};

export async function runOcr(
  buffer: Buffer,
  mimeType: string,
): Promise<OcrResult> {
  if (!isSupportedForOcr(mimeType)) {
    throw new Error(`Unsupported file type for OCR: ${mimeType}`);
  }

  if (isPdfMime(mimeType)) {
    const { text, pageCount } = await extractTextFromPdf(buffer);
    return { text, pageCount };
  }

  if (isImageMime(mimeType)) {
    const text = await extractTextFromImage(buffer, mimeType);
    return { text, pageCount: null };
  }

  throw new Error(`Unsupported file type for OCR: ${mimeType}`);
}
