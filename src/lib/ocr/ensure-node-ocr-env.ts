import "server-only";

import DOMMatrixPolyfill from "@thednp/dommatrix";

/** pdfjs (pdf-parse) expects browser canvas APIs on Node when @napi-rs/canvas is unavailable. */
function applyNodeOcrPolyfills() {
  if (typeof globalThis.DOMMatrix === "undefined") {
    // Polyfill shape differs from lib.dom DOMMatrix; runtime behavior is sufficient for pdfjs.
    (globalThis as Record<string, unknown>).DOMMatrix = DOMMatrixPolyfill;
  }
}

applyNodeOcrPolyfills();

export function ensureNodeOcrEnv() {
  applyNodeOcrPolyfills();
}
