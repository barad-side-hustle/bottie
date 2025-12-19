import { redirect } from "next/navigation";
import { getAuthenticatedUserId } from "@/lib/api/auth";
import { getLocation } from "@/lib/actions/locations.actions";
import { LocationDetailsWrapper } from "@/components/onboarding/BusinessDetailsWrapper";
import { generatePrivatePageMetadata } from "@/lib/seo/private-metadata";

export const dynamic = "force-dynamic";

export const metadata = generatePrivatePageMetadata("Onboarding");

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function LocationDetailsPage({ searchParams: searchParamsPromise }: PageProps) {
  const sp = await searchParamsPromise;
  const accountId = sp.accountId as string | undefined;
  const locationId = sp.locationId as string | undefined;

  if (!accountId || !locationId) {
    redirect("/onboarding/choose-location");
  }

  const { userId } = await getAuthenticatedUserId();
  const location = await getLocation(userId!, locationId!);

  return <LocationDetailsWrapper accountId={accountId!} locationId={locationId!} location={location} />;
}
