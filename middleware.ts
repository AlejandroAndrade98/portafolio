import { NextRequest, NextResponse } from "next/server";
import { defaultLocale, isLocale } from "@/lib/i18n";

const LOCALE_COOKIE = "locale";

function shouldIgnore(pathname: string) {
  if (pathname.startsWith("/_next")) return true;
  if (pathname.startsWith("/api")) return true;
  if (pathname === "/favicon.ico") return true;
  if (pathname.includes(".")) return true;
  return false;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (shouldIgnore(pathname)) return NextResponse.next();

  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0];

  const cookieLocale = req.cookies.get(LOCALE_COOKIE)?.value;
  const preferred = cookieLocale && isLocale(cookieLocale) ? cookieLocale : defaultLocale;

  if (!first) {
    const url = req.nextUrl.clone();
    url.pathname = `/${preferred}`;
    const res = NextResponse.redirect(url);
    res.cookies.set(LOCALE_COOKIE, preferred, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
    return res;
  }

  if (!isLocale(first)) {
    const url = req.nextUrl.clone();
    url.pathname = `/${preferred}${pathname.startsWith("/") ? "" : "/"}${pathname}`;
    const res = NextResponse.redirect(url);
    res.cookies.set(LOCALE_COOKIE, preferred, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
    return res;
  }

  const res = NextResponse.next();
  if (cookieLocale !== first) {
    res.cookies.set(LOCALE_COOKIE, first, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }
  return res;
}

export const config = {
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};