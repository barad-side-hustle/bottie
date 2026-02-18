import { cookies } from "next/headers";

export const COOKIE_NAME = "onboarding_complete";
export const COOKIE_MAX_AGE = 24 * 60 * 60;

export async function setOnboardingStatusCookie(hasLocations: boolean): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, hasLocations ? "true" : "false", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
}
