import { type NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

const PROTECTED_ROUTES = ["/quiz", "/lab", "/profile", "/os", "/dashboard"];

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const pathnameWithoutLocale = pathname.replace(/^\/(en|fr)(?=\/|$)/, "") || "/";

  const isProtected = PROTECTED_ROUTES.some((route) =>
    pathnameWithoutLocale === route ||
    pathnameWithoutLocale.startsWith(`${route}/`),
  );

  if (isProtected) {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      const loginUrl = new URL("/auth/login", request.url);

      return NextResponse.redirect(loginUrl);
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
