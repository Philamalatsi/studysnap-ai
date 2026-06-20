/** Starts full processing: OCR + summary, flashcards, and quiz (client-side). */
export function triggerMaterialProcessing(materialId: string): void {
  void fetch(`/api/materials/${materialId}/process`, {
    method: "POST",
    credentials: "include",
  }).catch((err) => {
    console.error("Failed to start material processing:", err);
  });
}

/** @deprecated Use triggerMaterialProcessing */
export const triggerMaterialExtraction = triggerMaterialProcessing;