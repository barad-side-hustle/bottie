import createMiddleware from "next-intl/middleware";
import { routing } from "./src/i18n/routing";
import { updateSession } from "@/lib/supabase/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { initAcceptLanguage, resolveLocale } from "@/lib/locale-detection";
import { locales, defaultLocale, Locale } from "@/lib/locale";

initAcceptLanguage(locales);

const intlMiddleware = createMiddleware(routing);

function getLocaleFromPathname(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  const firstSegment = segments[0];
  return locales.includes(firstSegment as Locale) ? firstSegment : defaultLocale;
}

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request);

  if (request.nextUrl.pathname === "/") {
    const userId = user?.id;
    const locale = await resolveLocale({ userId });
    const redirectUrl = new URL(`/${locale}`, request.url);
    return NextResponse.redirect(redirectUrl);
  }

  const locale = getLocaleFromPathname(request.nextUrl.pathname);

  if (!user) {
    const isOnboardingRoute = request.nextUrl.pathname.includes("/onboarding");

    if (isOnboardingRoute) {
      const redirectUrl = new URL(`/${locale}/login`, request.url);
      redirectUrl.searchParams.set("redirect", request.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  if (user) {
    request.headers.set("x-user-id", user.id);

    const isDashboardRoute = request.nextUrl.pathname.includes("/dashboard");
    const isOnboardingRoute = request.nextUrl.pathname.includes("/onboarding");

    if (isDashboardRoute && !isOnboardingRoute) {
      const onboardingCookie = request.cookies.get("onboarding_complete");

      if (onboardingCookie?.value !== "true") {
        const redirectUrl = new URL(`/${locale}/onboarding/connect-account`, request.url);
        return NextResponse.redirect(redirectUrl);
      }
    }
  }

  const intlResponse = intlMiddleware(request);

  if (supabaseResponse.cookies.getAll().length > 0) {
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      intlResponse.cookies.set(cookie.name, cookie.value);
    });
  }

  return intlResponse;
}

export const config = {
  matcher: ["/", "/(.+)/dashboard/:path*", "/(.+)/onboarding/:path*", "/(.+)/checkout/:path*", "/(.+)/settings/:path*"],
};
