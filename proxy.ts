import createMiddleware from "next-intl/middleware";
import { routing } from "./src/i18n/routing";
import { getSessionFromRequest, checkOnboardingStatus } from "@/lib/auth/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { initAcceptLanguage } from "@/lib/locale-detection";
import { locales, defaultLocale, Locale } from "@/lib/locale";
import { COOKIE_NAME, COOKIE_MAX_AGE } from "@/lib/utils/onboarding-status";

initAcceptLanguage(locales);

const intlMiddleware = createMiddleware(routing);

function getLocaleFromPathname(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  const firstSegment = segments[0];
  return locales.includes(firstSegment as Locale) ? firstSegment : defaultLocale;
}

export async function proxy(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  const user = session?.user ?? null;

  const locale = getLocaleFromPathname(request.nextUrl.pathname);

  if (!user) {
    const isOnboardingRoute = request.nextUrl.pathname.includes("/onboarding");

    if (isOnboardingRoute) {
      const redirectUrl = new URL(`/${locale}/login`, request.url);
      redirectUrl.searchParams.set("redirect", request.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  const intlResponse = intlMiddleware(request);

  if (user) {
    request.headers.set("x-user-id", user.id);

    const isDashboardRoute = request.nextUrl.pathname.includes("/dashboard");
    const isOnboardingRoute = request.nextUrl.pathname.includes("/onboarding");

    if (isDashboardRoute && !isOnboardingRoute) {
      const onboardingCookie = request.cookies.get(COOKIE_NAME);

      if (onboardingCookie?.value !== "true") {
        const isOnboarded = await checkOnboardingStatus(user.id);

        if (isOnboarded) {
          intlResponse.cookies.set(COOKIE_NAME, "true", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: COOKIE_MAX_AGE,
            path: "/",
          });
        } else {
          const redirectUrl = new URL(`/${locale}/onboarding/connect-account`, request.url);
          return NextResponse.redirect(redirectUrl);
        }
      }
    }
  }

  return intlResponse;
}

export const config = {
  matcher: [
    "/(.+)/dashboard/:path*",
    "/(.+)/onboarding/:path*",
    "/(.+)/checkout/:path*",
    "/(.+)/settings/:path*",
    "/blog/:path*",
    "/(.+)/blog/:path*",
  ],
};
