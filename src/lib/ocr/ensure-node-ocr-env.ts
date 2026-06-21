import "server-only";

import { DOMMatrix, ImageData, Path2D } from "@napi-rs/canvas";

/** pdfjs (via pdf-parse) expects browser canvas APIs; @napi-rs/canvas provides them on Node. */
function applyNodeOcrPolyfills() {
  const global = globalThis as Record<string, unknown>;

  if (typeof globalThis.DOMMatrix === "undefined") {
    global.DOMMatrix = DOMMatrix;
  }
  if (typeof globalThis.Path2D === "undefined") {
    global.Path2D = Path2D;
  }
  if (typeof globalThis.ImageData === "undefined") {
    global.ImageData = ImageData;
  }
}

applyNodeOcrPolyfills();

export function ensureNodeOcrEnv() {
  applyNodeOcrPolyfills();
}
