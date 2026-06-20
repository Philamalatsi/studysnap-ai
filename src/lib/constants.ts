export const APP_NAME = "StudySnap AI";

export const FREE_UPLOAD_LIMIT = 20;

export const ACCEPTED_UPLOAD_TYPES = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
  "image/heic": [".heic"],
  "image/heif": [".heif"],
  "application/pdf": [".pdf"],
} as const;

export const ACCEPTED_MIME_TYPES = Object.keys(ACCEPTED_UPLOAD_TYPES);

export const MAX_UPLOAD_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: "layout-dashboard" as const },
  { href: "/dashboard/upload", label: "Upload", icon: "upload" as const },
  { href: "/dashboard/materials", label: "Materials", icon: "folder-open" as const },
] as const;
