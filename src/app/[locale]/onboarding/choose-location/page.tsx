import { redirect } from "next/navigation";
import { getAuthenticatedUserId } from "@/lib/api/auth";
import { getGoogleBusinesses } from "@/lib/actions/google.actions";
import { ChooseLocationForm } from "@/components/onboarding/ChooseBusinessForm";
import { generatePrivatePageMetadata } from "@/lib/seo/private-metadata";

export const dynamic = "force-dynamic";

export const metadata = generatePrivatePageMetadata("Onboarding");

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ChooseLocationPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const accountId = params.accountId as string | undefined;

  if (!accountId) {
    redirect("/onboarding/connect-account");
  }

  const { userId } = await getAuthenticatedUserId();
  const availableLocations = await getGoogleBusinesses(userId, accountId);

  return <ChooseLocationForm accountId={accountId} availableLocations={availableLocations} />;
}
