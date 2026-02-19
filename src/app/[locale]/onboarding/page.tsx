import { getGoogleBusinesses } from "@/lib/actions/google.actions";
import { getLocation } from "@/lib/actions/locations.actions";
import { getAuthenticatedUserId } from "@/lib/api/auth";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function OnboardingPage({ searchParams: searchParamsPromise }: PageProps) {
  const sp = await searchParamsPromise;
  const accountId = (sp.accountId as string) || null;
  const locationId = (sp.locationId as string) || null;

  await getAuthenticatedUserId();

  const [availableLocations, location] = await Promise.all([
    accountId ? getGoogleBusinesses({ accountId }).catch(() => []) : Promise.resolve(null),
    locationId ? getLocation({ locationId }).catch(() => null) : Promise.resolve(null),
  ]);

  return (
    <OnboardingWizard
      initialAccountId={accountId}
      initialLocationId={locationId}
      availableLocations={availableLocations}
      location={location}
    />
  );
}
