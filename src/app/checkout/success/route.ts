import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { defaultLocale, isValidLocale } from "@/lib/locale";

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get("NEXT_LOCALE")?.value;
  const locale = localeCookie && isValidLocale(localeCookie) ? localeCookie : defaultLocale;

  const url = new URL(`/${locale}/checkout/success`, request.url);
  url.search = request.nextUrl.search;
  return NextResponse.redirect(url);
}
