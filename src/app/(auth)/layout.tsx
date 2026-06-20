import { AuthBrandPanel } from "@/components/auth/auth-brand-panel";
import { SupabaseConfigAlert } from "@/components/auth/supabase-config-alert";
import { Logo } from "@/components/layout/logo";
import { Card, CardContent } from "@/components/ui/card";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-muted px-4 py-12">
      <Logo className="mb-6" />
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <AuthBrandPanel />
          <SupabaseConfigAlert />
          {children}
        </CardContent>
      </Card>
    </div>
  );
}
