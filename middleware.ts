import createMiddleware from "next-intl/middleware";
import { routing } from "./src/i18n/routing";
import { updateSession } from "@/lib/supabase/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { initAcceptLanguage } from "@/lib/locale-detection";
import { locales } from "@/lib/locale";

initAcceptLanguage(locales);

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request);

  if (user) {
    request.headers.set("x-user-id", user.id);

    const isDashboardRoute = request.nextUrl.pathname.includes("/dashboard");
    const isOnboardingRoute = request.nextUrl.pathname.includes("/onboarding");

    if (isDashboardRoute && !isOnboardingRoute) {
      const onboardingCookie = request.cookies.get("onboarding_complete");

      if (onboardingCookie?.value === "false") {
        const pathParts = request.nextUrl.pathname.split("/").filter(Boolean);
        const locale = pathParts[0] || "en";

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
  matcher: ["/(.+)/dashboard/:path*", "/(.+)/onboarding/:path*", "/(.+)/checkout/:path*", "/(.+)/settings/:path*"],
};
