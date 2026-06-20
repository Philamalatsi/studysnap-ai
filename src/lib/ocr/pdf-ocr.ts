import { PDFParse } from "pdf-parse";

export type PdfExtractionResult = {
  text: string;
  pageCount: number;
};

export async function extractTextFromPdf(
  buffer: Buffer,
): Promise<PdfExtractionResult> {
  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    return {
      text: (result.text ?? "").trim(),
      pageCount: result.total ?? result.pages.length ?? 0,
    };
  } finally {
    await parser.destroy();
  }
}
