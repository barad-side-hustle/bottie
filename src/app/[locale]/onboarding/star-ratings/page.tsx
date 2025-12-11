import { redirect } from "next/navigation";
import { StarRatingsWrapper } from "@/components/onboarding/StarRatingsWrapper";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function StarRatingsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const accountId = params.accountId as string | undefined;
  const locationId = params.locationId as string | undefined;

  if (!accountId || !locationId) {
    redirect("/onboarding/choose-location");
  }

  return <StarRatingsWrapper accountId={accountId} locationId={locationId} />;
}
