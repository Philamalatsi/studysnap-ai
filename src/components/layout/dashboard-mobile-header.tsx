"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FolderOpen, LayoutDashboard, LogOut, Upload } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { signOut } from "@/features/auth/actions";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/upload", label: "Upload", icon: Upload },
  { href: "/dashboard/materials", label: "Files", icon: FolderOpen },
] as const;

export function DashboardMobileHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white md:hidden">
      <div className="flex h-14 items-center justify-between gap-2 px-4">
        <Logo showText={false} />
        <span className="min-w-0 flex-1 truncate text-sm font-medium text-muted">
          Dashboard
        </span>
        <form action={signOut}>
          <button
            type="submit"
            className="rounded-lg p-2 text-muted hover:bg-slate-100"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </form>
      </div>
      <nav className="flex gap-1 border-t border-border px-2 py-2">
        {links.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href ||
            (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium",
                active
                  ? "bg-brand-50 text-brand-700"
                  : "text-muted hover:bg-slate-50",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
