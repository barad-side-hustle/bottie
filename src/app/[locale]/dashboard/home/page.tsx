import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { getTranslations } from "next-intl/server";
import { getOverviewData } from "@/lib/actions/overview.actions";
import { getAccountsWithLocations } from "@/lib/actions/accounts.actions";
import { RedirectToOnboarding } from "@/components/dashboard/home/RedirectToOnboarding";
import { OverviewStats } from "@/components/dashboard/overview/OverviewStats";
import { PendingReviewsBanner } from "@/components/dashboard/overview/PendingReviewsBanner";
import { LocationSummaryCards } from "@/components/dashboard/overview/LocationSummaryCards";

export const dynamic = "force-dynamic";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dashboard.home" });

  const allAccounts = await getAccountsWithLocations();
  const hasLocations = allAccounts.some((account) => account.accountLocations.length > 0);

  if (!hasLocations) {
    return <RedirectToOnboarding href="/onboarding" />;
  }

  const overviewData = await getOverviewData();

  return (
    <PageContainer>
      <PageHeader title={t("title")} description={t("description")} />
      <div className="space-y-6">
        <OverviewStats data={overviewData} />
        {overviewData.pendingCount > 0 && <PendingReviewsBanner data={overviewData} />}
        <LocationSummaryCards summaries={overviewData.locationSummaries} />
      </div>
    </PageContainer>
  );
}
