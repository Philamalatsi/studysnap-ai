import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { MarketingMobileNav } from "@/components/marketing/marketing-mobile-nav";
import { Button } from "@/components/ui/button";

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-white/80 backdrop-blur-md">
      <div className="relative mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-8 text-sm font-medium text-muted md:flex">
          <a href="#students" className="hover:text-foreground transition-colors">
            Students
          </a>
          <a href="#features" className="hover:text-foreground transition-colors">
            Features
          </a>
          <a href="#how-it-works" className="hover:text-foreground transition-colors">
            How it works
          </a>
          <a href="#pricing" className="hover:text-foreground transition-colors">
            Pricing
          </a>
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/login" className="hidden sm:block">
            <Button variant="ghost" size="sm">
              Log in
            </Button>
          </Link>
          <Link href="/signup" className="hidden sm:block">
            <Button size="sm">Get started free</Button>
          </Link>
          <MarketingMobileNav />
        </div>
      </div>
    </header>
  );
}
