import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getLocation } from "@/lib/actions/locations.actions";
import { getCompetitorBenchmark } from "@/lib/actions/competitors.actions";
import { SubscriptionsController } from "@/lib/controllers/subscriptions.controller";
import { CompetitorsView } from "@/components/dashboard/locations/CompetitorsView";
import { CompetitorsLockedState } from "@/components/dashboard/locations/CompetitorsLockedState";

export const dynamic = "force-dynamic";

export default async function CompetitorsRoute({
  params,
}: {
  params: Promise<{ locale: string; locationId: string }>;
}) {
  const { locale, locationId } = await params;
  const t = await getTranslations({ locale, namespace: "dashboard.competitors" });

  try {
    await getLocation({ locationId });
  } catch {
    redirect(`/${locale}/dashboard/home`);
  }

  const isPaid = await new SubscriptionsController().isLocationPaid(locationId);
  const result = isPaid ? await getCompetitorBenchmark({ locationId }).catch(() => null) : null;

  return (
    <PageContainer>
      <PageHeader title={t("title")} description={t("description")} />

      <div className="mt-6">
        {isPaid ? (
          <CompetitorsView result={result} locationId={locationId} />
        ) : (
          <CompetitorsLockedState locationId={locationId} />
        )}
      </div>
    </PageContainer>
  );
}
