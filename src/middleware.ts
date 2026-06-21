import { type NextRequest, NextResponse } from "next/server";
import {
  updateSession,
  withSessionCookies,
} from "@/lib/supabase/middleware";
import { safeRedirectPath } from "@/lib/auth/safe-redirect";

const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/auth/callback",
];
const AUTH_ROUTES = ["/login", "/signup", "/forgot-password"];

function isPublicRoute(pathname: string) {
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

function isAuthRoute(pathname: string) {
  return AUTH_ROUTES.some((route) => pathname === route);
}

function isDashboardRoute(pathname: string) {
  return pathname.startsWith("/dashboard");
}

function redirectAuthCodeToCallback(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const code = request.nextUrl.searchParams.get("code");

  if (!code || pathname === "/auth/callback") {
    return null;
  }

  const url = request.nextUrl.clone();
  url.pathname = "/auth/callback";

  if (
    request.nextUrl.searchParams.get("type") === "recovery" &&
    !url.searchParams.has("next")
  ) {
    url.searchParams.set("next", "/reset-password");
  }

  if (pathname === "/" && !url.searchParams.has("next")) {
    url.searchParams.set("next", "/reset-password");
  }

  return url;
}

export async function middleware(request: NextRequest) {
  const authCodeRedirect = redirectAuthCodeToCallback(request);
  if (authCodeRedirect) {
    return NextResponse.redirect(authCodeRedirect);
  }

  const { supabaseResponse, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  if (isDashboardRoute(pathname) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return withSessionCookies(
      supabaseResponse,
      NextResponse.redirect(url),
    );
  }

  if (user && isAuthRoute(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = safeRedirectPath(
      request.nextUrl.searchParams.get("redirect"),
      "/dashboard",
    );
    url.search = "";
    return withSessionCookies(
      supabaseResponse,
      NextResponse.redirect(url),
    );
  }

  if (!isPublicRoute(pathname) && !isDashboardRoute(pathname) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return withSessionCookies(
      supabaseResponse,
      NextResponse.redirect(url),
    );
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
