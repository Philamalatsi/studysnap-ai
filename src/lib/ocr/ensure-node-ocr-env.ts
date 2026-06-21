import "server-only";

import DOMMatrixPolyfill from "@thednp/dommatrix";

/** pdfjs (pdf-parse) and tesseract.js expect browser canvas APIs on Node. */
export function ensureNodeOcrEnv() {
  if (typeof globalThis.DOMMatrix === "undefined") {
    // Polyfill shape differs from lib.dom DOMMatrix; runtime behavior is sufficient for pdfjs.
    (globalThis as Record<string, unknown>).DOMMatrix = DOMMatrixPolyfill;
  }
}
