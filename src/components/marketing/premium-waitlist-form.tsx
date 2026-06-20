"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function PremiumWaitlistForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "pending" | "done" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("pending");
    setError(null);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const body = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(body.error ?? "Could not join waitlist.");
        setStatus("error");
        return;
      }
      setStatus("done");
    } catch {
      setError("Could not reach the server.");
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <p className="mt-6 flex items-center gap-2 text-sm text-emerald-700">
        <CheckCircle2 className="h-4 w-4 shrink-0" />
        You&apos;re on the list — we&apos;ll email you when Premium launches.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-2">
      <Input
        type="email"
        required
        placeholder="you@school.edu"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={status === "pending"}
      />
      <Button fullWidth type="submit" disabled={status === "pending"}>
        {status === "pending" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : null}
        Notify me
      </Button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </form>
  );
}
