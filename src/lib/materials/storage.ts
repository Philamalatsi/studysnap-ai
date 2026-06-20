import "server-only";

import { assertStoragePathOwned } from "@/lib/supabase/assert-storage-path";
import { createClient } from "@/lib/supabase/server";

const SIGNED_URL_TTL_SECONDS = 3600;

/**
 * Signed preview URL using the authenticated user's session (RLS applies).
 */
export async function getMaterialSignedUrl(
  bucket: string,
  path: string,
  userId: string,
): Promise<string | null> {
  assertStoragePathOwned(path, userId);

  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);

  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}
