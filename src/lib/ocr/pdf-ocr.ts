import "@/lib/ocr/ensure-node-ocr-env";
import "pdf-parse/worker";
import { CanvasFactory } from "pdf-parse/worker";
import { PDFParse } from "pdf-parse";
import { withTimeout } from "@/lib/ocr/with-timeout";

export type PdfExtractionResult = {
  text: string;
  pageCount: number;
};

const PDF_EXTRACTION_TIMEOUT_MS = 240_000;

export async function extractTextFromPdf(
  buffer: Buffer,
): Promise<PdfExtractionResult> {
  return withTimeout(
    (async () => {
      const parser = new PDFParse({ data: buffer, CanvasFactory });
      try {
        const result = await parser.getText();
        return {
          text: (result.text ?? "").trim(),
          pageCount: result.total ?? result.pages.length ?? 0,
        };
      } finally {
        await parser.destroy();
      }
    })(),
    PDF_EXTRACTION_TIMEOUT_MS,
    "PDF text extraction timed out. Try again or upload a smaller file.",
  );
}
