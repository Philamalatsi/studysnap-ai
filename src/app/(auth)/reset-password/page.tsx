import Link from "next/link";
import type { Metadata } from "next";
import { ResetPasswordForm } from "@/features/auth/reset-password-form";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Set new password",
};

export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Link expired</h1>
          <p className="mt-1 text-sm text-muted">
            This password reset link is invalid or has expired.
          </p>
        </div>
        <p className="text-center text-sm text-muted">
          <Link
            href="/forgot-password"
            className="font-medium text-brand-600 hover:text-brand-700"
          >
            Request a new reset link
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Set a new password</h1>
        <p className="mt-1 text-sm text-muted">
          Choose a new password for {user.email}
        </p>
      </div>
      <ResetPasswordForm />
    </div>
  );
}
