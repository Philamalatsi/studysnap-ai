"use client";

import Link from "next/link";
import { useActionState } from "react";
import { safeRedirectPath } from "@/lib/auth/safe-redirect";
import { signIn, type AuthActionState } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: AuthActionState = {};

export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const [state, formAction, pending] = useActionState(signIn, initialState);
  const safeRedirect = safeRedirectPath(redirectTo, "/dashboard");

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="redirect" value={safeRedirect} />
      <Input
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="you@school.edu"
        required
      />
      <Input
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
      />
      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}
      <Button type="submit" fullWidth disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>
      <p className="text-center text-sm text-muted">
        <Link
          href="/forgot-password"
          className="font-medium text-brand-600 hover:text-brand-700"
        >
          Forgot password?
        </Link>
      </p>
    </form>
  );
}
