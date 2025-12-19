import { redirect } from "next/navigation";
import { AISettingsWrapper } from "@/components/onboarding/AISettingsWrapper";
import { getAuthenticatedUserId } from "@/lib/api/auth";
import { SubscriptionsController } from "@/lib/controllers/subscriptions.controller";
import { generatePrivatePageMetadata } from "@/lib/seo/private-metadata";

export const dynamic = "force-dynamic";

export const metadata = generatePrivatePageMetadata("Onboarding");

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AISettingsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const accountId = params.accountId as string | undefined;
  const locationId = params.locationId as string | undefined;

  if (!accountId || !locationId) {
    redirect("/onboarding/choose-location");
  }

  const { userId } = await getAuthenticatedUserId();
  const limits = await new SubscriptionsController().getUserPlanLimits(userId);

  return <AISettingsWrapper accountId={accountId} locationId={locationId} limits={limits} />;
}
