import { redirect } from "next/navigation";
import { getGoogleBusinesses } from "@/lib/actions/google.actions";
import { ChooseLocationForm } from "@/components/onboarding/ChooseBusinessForm";

export const dynamic = "force-dynamic";

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

  const availableLocations = await getGoogleBusinesses({ accountId });

  return <ChooseLocationForm accountId={accountId} availableLocations={availableLocations} />;
}
