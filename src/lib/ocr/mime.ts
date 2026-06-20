const IMAGE_MIMES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

export function isImageMime(mimeType: string): boolean {
  return IMAGE_MIMES.has(mimeType);
}

export function isPdfMime(mimeType: string): boolean {
  return mimeType === "application/pdf";
}

export function isSupportedForOcr(mimeType: string): boolean {
  return isImageMime(mimeType) || isPdfMime(mimeType);
}
