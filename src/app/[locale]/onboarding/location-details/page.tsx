import { redirect } from "@/i18n/routing";
import { getAuthenticatedUserId } from "@/lib/api/auth";
import { getLocation } from "@/lib/actions/locations.actions";
import { LocationDetailsWrapper } from "@/components/onboarding/BusinessDetailsWrapper";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function LocationDetailsPage({
  params: paramsPromise,
  searchParams: searchParamsPromise,
}: PageProps) {
  const { locale } = await paramsPromise;
  const sp = await searchParamsPromise;
  const accountId = sp.accountId as string | undefined;
  const locationId = sp.locationId as string | undefined;

  if (!accountId || !locationId) {
    redirect({ href: "/onboarding/choose-location", locale });
  }

  const { userId } = await getAuthenticatedUserId();
  const location = await getLocation(userId!, locationId!);

  return <LocationDetailsWrapper accountId={accountId!} locationId={locationId!} location={location} />;
}
