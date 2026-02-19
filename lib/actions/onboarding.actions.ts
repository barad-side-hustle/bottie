"use server";

export async function updateOnboardingStatus(hasLocations: boolean): Promise<void> {
  const { setOnboardingStatusCookie } = await import("@/lib/utils/onboarding-status");
  await setOnboardingStatusCookie(hasLocations);
}
