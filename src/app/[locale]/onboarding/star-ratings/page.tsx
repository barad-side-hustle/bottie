import { redirect } from "next/navigation";
import { StarRatingsWrapper } from "@/components/onboarding/StarRatingsWrapper";
import { generatePrivatePageMetadata } from "@/lib/seo/private-metadata";

export const dynamic = "force-dynamic";

export const metadata = generatePrivatePageMetadata("Onboarding");

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
