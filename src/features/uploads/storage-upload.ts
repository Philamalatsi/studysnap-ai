import { UPLOADS_BUCKET } from "@/features/uploads/utils";

export async function uploadToStorageWithProgress(params: {
  supabaseUrl: string;
  anonKey: string;
  accessToken: string;
  path: string;
  file: File;
  mimeType: string;
  onProgress: (percent: number) => void;
}): Promise<void> {
  const { supabaseUrl, anonKey, accessToken, path, file, mimeType, onProgress } =
    params;

  const encodedPath = path
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  const uploadUrl = `${supabaseUrl}/storage/v1/object/${UPLOADS_BUCKET}/${encodedPath}`;

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable && event.total > 0) {
        onProgress(Math.min(100, Math.round((event.loaded / event.total) * 100)));
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress(100);
        resolve();
        return;
      }

      let message = `Upload failed (${xhr.status})`;
      try {
        const body = JSON.parse(xhr.responseText) as { message?: string; error?: string };
        message = body.message ?? body.error ?? message;
      } catch {
        if (xhr.responseText) message = xhr.responseText;
      }
      reject(new Error(message));
    });

    xhr.addEventListener("error", () => {
      reject(new Error("Network error during upload."));
    });

    xhr.addEventListener("abort", () => {
      reject(new Error("Upload was cancelled."));
    });

    xhr.open("POST", uploadUrl);
    xhr.setRequestHeader("Authorization", `Bearer ${accessToken}`);
    xhr.setRequestHeader("apikey", anonKey);
    xhr.setRequestHeader("Content-Type", mimeType || "application/octet-stream");
    xhr.setRequestHeader("x-upsert", "false");
    xhr.send(file);
  });
}

export async function removeStorageObject(params: {
  supabaseUrl: string;
  anonKey: string;
  accessToken: string;
  path: string;
}): Promise<void> {
  const encodedPath = params.path
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  const deleteUrl = `${params.supabaseUrl}/storage/v1/object/${UPLOADS_BUCKET}/${encodedPath}`;

  await fetch(deleteUrl, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${params.accessToken}`,
      apikey: params.anonKey,
    },
  });
}
