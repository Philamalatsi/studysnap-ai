import Link from "next/link";
import type { Metadata } from "next";
import { safeRedirectPath } from "@/lib/auth/safe-redirect";
import { LoginForm } from "@/features/auth/login-form";

export const metadata: Metadata = {
  title: "Log in",
};

const AUTH_ERRORS: Record<string, string> = {
  auth_callback_failed: "Sign-in link expired or invalid. Please try again.",
  auth_not_configured:
    "Authentication is not configured. Check your environment variables.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{
    redirect?: string;
    error?: string;
    reset?: string;
  }>;
}) {
  const {
    redirect: redirectParam,
    error: errorCode,
    reset,
  } = await searchParams;
  const redirect = safeRedirectPath(redirectParam, "/dashboard");
  const authError = errorCode ? AUTH_ERRORS[errorCode] : undefined;
  const resetSuccess = reset === "success";

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Welcome back</h1>
        <p className="mt-1 text-sm text-muted">
          Sign in to continue studying
        </p>
      </div>
      {authError && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {authError}
        </p>
      )}
      {resetSuccess && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          Password updated. Sign in with your new password.
        </p>
      )}
      <LoginForm redirectTo={redirect} />
      <p className="text-center text-sm text-muted">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="font-medium text-brand-600 hover:text-brand-700"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}
  