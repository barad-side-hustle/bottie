import { redirect } from "next/navigation";
import { getLocation } from "@/lib/actions/locations.actions";
import { LocationDetailsWrapper } from "@/components/onboarding/BusinessDetailsWrapper";

export const dynamic = "force-dynamic";

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

  const location = await getLocation({ locationId: locationId! });

  return <LocationDetailsWrapper accountId={accountId!} locationId={locationId!} location={location} />;
}
