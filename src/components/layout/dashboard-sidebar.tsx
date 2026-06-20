"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FolderOpen, LayoutDashboard, LogOut, Upload } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { Badge } from "@/components/ui/badge";
import { NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { signOut } from "@/features/auth/actions";

const iconMap = {
  "layout-dashboard": LayoutDashboard,
  upload: Upload,
  "folder-open": FolderOpen,
} as const;

export function DashboardSidebar({
  userEmail,
  planTier,
}: {
  userEmail: string;
  planTier: "free" | "premium";
}) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 flex-col border-r border-border bg-white">
      <div className="flex h-16 items-center border-b border-border px-4">
        <Logo />
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {NAV_ITEMS.map((item) => {
          const Icon = iconMap[item.icon];
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const disabled = "disabled" in item && item.disabled;

          if (disabled) {
            return (
              <span
                key={item.href}
                className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted/60"
                title="Coming in Week 2"
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
                <Badge variant="muted" className="ml-auto text-[10px]">
                  Soon
                </Badge>
              </span>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-brand-50 text-brand-700"
                  : "text-muted hover:bg-slate-50 hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-4">
        <div className="mb-3 truncate text-xs text-muted">{userEmail}</div>
        <Badge variant={planTier === "premium" ? "brand" : "muted"}>
          {planTier === "premium" ? "Premium" : "Free plan"}
        </Badge>
        <form action={signOut} className="mt-4">
          <button
            type="submit"
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-slate-50 hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
