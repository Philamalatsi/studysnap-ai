"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const LINKS = [
  { href: "#students", label: "Students" },
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#pricing", label: "Pricing" },
] as const;

const toggleClassName =
  "rounded-lg p-2 text-muted hover:bg-slate-100 hover:text-foreground";

function MobileMenuToggle({
  open,
  onToggle,
}: {
  open: boolean;
  onToggle: () => void;
}) {
  if (open) {
    return (
      <button
        type="button"
        onClick={onToggle}
        className={toggleClassName}
        aria-expanded="true"
        aria-controls="marketing-mobile-menu"
        aria-label="Close menu"
      >
        <X className="h-5 w-5" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      className={toggleClassName}
      aria-expanded="false"
      aria-controls="marketing-mobile-menu"
      aria-label="Open menu"
    >
      <Menu className="h-5 w-5" />
    </button>
  );
}

export function MarketingMobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <MobileMenuToggle open={open} onToggle={() => setOpen((v) => !v)} />

      {open && (
        <div
          id="marketing-mobile-menu"
          role="navigation"
          aria-label="Mobile"
          className="absolute left-0 right-0 top-16 z-50 border-b border-border bg-white px-4 py-4 shadow-lg"
        >
          <nav className="flex flex-col gap-1">
            {LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-slate-50"
              >
                {link.label}
              </a>
            ))}
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted hover:bg-slate-50"
            >
              Log in
            </Link>
            <Link href="/signup" onClick={() => setOpen(false)} className="mt-2">
              <Button fullWidth size="sm">
                Get started free
              </Button>
            </Link>
          </nav>
        </div>
      )}
    </div>
  );
}
