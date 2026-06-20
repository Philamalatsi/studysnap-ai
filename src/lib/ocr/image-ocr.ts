import sharp from "sharp";
import { createWorker } from "tesseract.js";

async function toPngBuffer(buffer: Buffer, mimeType: string): Promise<Buffer> {
  if (mimeType === "image/heic" || mimeType === "image/heif") {
    const heicConvert = (await import("heic-convert")).default;
    const converted = await heicConvert({
      buffer,
      format: "JPEG",
      quality: 0.92,
    });
    const jpegBuffer = Buffer.from(converted);
    return sharp(jpegBuffer).png().toBuffer();
  }

  return sharp(buffer, { failOn: "none" })
    .rotate()
    .png()
    .toBuffer();
}

export async function extractTextFromImage(
  buffer: Buffer,
  mimeType: string,
): Promise<string> {
  const pngBuffer = await toPngBuffer(buffer, mimeType);
  const worker = await createWorker("eng");
  try {
    const {
      data: { text },
    } = await worker.recognize(pngBuffer);
    return text.trim();
  } finally {
    await worker.terminate();
  }
}
