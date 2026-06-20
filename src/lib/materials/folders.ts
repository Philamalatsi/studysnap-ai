import type { Material, MaterialFolder } from "@/types/database";

export const UNCATEGORIZED_FOLDER_LABEL = "Unsorted";

export type MaterialFolderGroup = {
  id: string | null;
  name: string;
  materials: Material[];
};

export function groupMaterialsByFolder(
  materials: Material[],
  folders: MaterialFolder[],
): MaterialFolderGroup[] {
  const folderNames = new Map(folders.map((f) => [f.id, f.name]));
  const groups = new Map<string | null, Material[]>();

  for (const material of materials) {
    const key = material.folder_id ?? null;
    const list = groups.get(key) ?? [];
    list.push(material);
    groups.set(key, list);
  }

  const result: MaterialFolderGroup[] = [];

  for (const folder of folders) {
    const items = groups.get(folder.id);
    if (items?.length) {
      result.push({ id: folder.id, name: folder.name, materials: items });
      groups.delete(folder.id);
    }
  }

  const unsorted = groups.get(null);
  if (unsorted?.length) {
    result.push({
      id: null,
      name: UNCATEGORIZED_FOLDER_LABEL,
      materials: unsorted,
    });
  }

  for (const [id, items] of groups) {
    if (id && items.length) {
      result.push({
        id,
        name: folderNames.get(id) ?? "Folder",
        materials: items,
      });
    }
  }

  return result;
}
