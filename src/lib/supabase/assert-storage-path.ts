/** Ensures storage paths match the expected per-user layout. */
export function assertStoragePathOwned(
  storagePath: string,
  userId: string,
): void {
  const prefix = `${userId}/`;
  if (!storagePath.startsWith(prefix)) {
    throw new Error("Storage path does not belong to the current user.");
  }
}
