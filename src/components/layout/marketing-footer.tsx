import { Logo } from "@/components/layout/logo";
import { APP_NAME } from "@/lib/constants";

export function MarketingFooter() {
  return (
    <footer className="border-t border-border bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-12 sm:px-6 md:flex-row md:items-center md:justify-between">
        <Logo />
        <p className="text-sm text-muted">
          © {new Date().getFullYear()} {APP_NAME}. Built for students who learn
          smarter.
        </p>
      </div>
    </footer>
  );
}
