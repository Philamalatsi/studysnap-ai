import Link from "next/link";
import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/features/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Reset password",
};

export default function ForgotPasswordPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Reset your password</h1>
        <p className="mt-1 text-sm text-muted">
          We&apos;ll email you a reset link
        </p>
      </div>
      <ForgotPasswordForm />
      <p className="text-center text-sm text-muted">
        <Link
          href="/login"
          className="font-medium text-brand-600 hover:text-brand-700"
        >
          Back to log in
        </Link>
      </p>
    </div>
  );
}
