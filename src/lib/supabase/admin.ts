import "server-only";

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { getSupabaseEnv } from "@/lib/supabase/env";

/**
 * Service-role Supabase client — bypasses RLS.
 * Server-only. Never import from Client Components or shared client modules.
 *
 * Prefer `createClient()` from `@/lib/supabase/server` (user session + RLS)
 * for materials, storage, and signed URLs.
 */
export function createAdminClient() {
  const { url } = getSupabaseEnv();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url || !serviceKey) {
    throw new Error(
      "Admin client is not configured. SUPABASE_SERVICE_ROLE_KEY is server-only and optional.",
    );
  }

  if (serviceKey.startsWith("NEXT_PUBLIC_")) {
    throw new Error("Service role key must not use NEXT_PUBLIC_ prefix.");
  }

  return createClient<Database>(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function isAdminClientConfigured(): boolean {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());
}
