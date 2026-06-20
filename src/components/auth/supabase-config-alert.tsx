import Link from "next/link";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export function SupabaseConfigAlert() {
  if (isSupabaseConfigured()) {
    return null;
  }

  return (
    <div
      role="alert"
      className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
    >
      <p className="font-medium">Supabase not connected</p>
      <p className="mt-1">
        Add your <strong>anon public</strong> API key to{" "}
        <code className="rounded bg-amber-100 px-1">.env.local</code> and restart
        the dev server. See{" "}
        <Link
          href="https://supabase.com/dashboard/project/dmwixrrtzxtbwndzalqq/settings/api"
          className="font-medium underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          Project Settings → API
        </Link>{" "}
        or <code className="rounded bg-amber-100 px-1">docs/SUPABASE_AUTH_SETUP.md</code>.
      </p>
    </div>
  );
}
