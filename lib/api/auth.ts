import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { resolveLocale } from "@/lib/locale-detection";
import { env } from "@/lib/env";

export async function getAuthenticatedUserId(): Promise<{ userId: string }> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("User not authenticated");
    }

    return { userId: session.user.id };
  } catch (error) {
    console.error("Failed to authenticate user:", error);
    throw new Error("Failed to authenticate user");
  }
}

export async function createLocaleAwareRedirect(
  path: string,
  searchParams?: Record<string, string>
): Promise<NextResponse> {
  const locale = await resolveLocale();
  const baseUrl = env.NEXT_PUBLIC_APP_URL;

  const localePath = `/${locale}${path}`;

  let url = `${baseUrl}${localePath}`;
  if (searchParams && Object.keys(searchParams).length > 0) {
    const params = new URLSearchParams(searchParams);
    url = `${url}?${params.toString()}`;
  }

  return NextResponse.redirect(url);
}
