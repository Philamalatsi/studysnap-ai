/** Shared Supabase URL/key for browser and server clients. */
export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() ?? "http://localhost:3000";

  return { url, anonKey, appUrl };
}

export function isSupabaseConfigured(): boolean {
  const { url, anonKey } = getSupabaseEnv();
  const validKey =
    anonKey.startsWith("eyJ") ||
    anonKey.startsWith("sb_publishable_") ||
    anonKey.startsWith("sb_");
  return (
    url.includes("supabase.co") &&
    anonKey.length > 20 &&
    validKey &&
    !anonKey.includes("placeholder")
  );
}
