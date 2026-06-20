"use client";

import Link from "next/link";
import { BookOpen } from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  showText = true,
}: {
  className?: string;
  showText?: boolean;
}) {
  return (
    <Link href="/" className={cn("flex items-center gap-2", className)}>
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white shadow-sm">
        <BookOpen className="h-5 w-5" aria-hidden />
      </span>
      {showText && (
        <span className="text-lg font-semibold tracking-tight text-foreground">
          {APP_NAME}
        </span>
      )}
    </Link>
  );
}
