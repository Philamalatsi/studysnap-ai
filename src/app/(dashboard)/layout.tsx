import { redirect } from "next/navigation";
import { DashboardMobileHeader } from "@/components/layout/dashboard-mobile-header";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { createClient } from "@/lib/supabase/server";
import { getProfileByUserId } from "@/lib/supabase/queries";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isSupabaseConfigured()) {
    redirect("/login?error=auth_not_configured");
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login?redirect=%2Fdashboard");
  }

  const profile = await getProfileByUserId(user.id).catch(() => null);
  const email = profile?.email ?? user.email ?? "";
  const planTier = profile?.plan_tier ?? "free";

  return (
    <div className="flex min-h-screen bg-surface-muted">
      <aside className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
        <DashboardSidebar userEmail={email} planTier={planTier} />
      </aside>
      <div className="flex min-h-screen flex-1 flex-col md:pl-64">
        <DashboardMobileHeader />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
