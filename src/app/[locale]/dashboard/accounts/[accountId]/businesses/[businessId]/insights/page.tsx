import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { BackButton } from "@/components/ui/back-button";
import { getTranslations } from "next-intl/server";
import { getBusiness } from "@/lib/actions/businesses.actions";
import { getInsights, getInsightsTrends } from "@/lib/actions/insights.actions";
import { getAuthenticatedUserId } from "@/lib/api/auth";
import { InsightsDateFilter, InsightsOverview, InsightsCharts } from "@/components/dashboard/insights";
import { EmptyState } from "@/components/ui/empty-state";
import { subDays } from "date-fns";

export const dynamic = "force-dynamic";

interface InsightsPageProps {
  params: Promise<{ locale: string; accountId: string; businessId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function InsightsPage({ params, searchParams }: InsightsPageProps) {
  const { locale, accountId, businessId } = await params;
  const resolvedSearchParams = await searchParams;

  const { userId } = await getAuthenticatedUserId();
  const t = await getTranslations({ locale, namespace: "dashboard.insights" });
  const tCommon = await getTranslations({ locale, namespace: "common" });

  const dateFromParam = resolvedSearchParams.dateFrom as string | undefined;
  const dateToParam = resolvedSearchParams.dateTo as string | undefined;

  const dateTo = dateToParam ? new Date(dateToParam) : new Date();
  const dateFrom = dateFromParam ? new Date(dateFromParam) : subDays(dateTo, 30);

  const [business, insights, trends] = await Promise.all([
    getBusiness(userId, accountId, businessId),
    getInsights({ accountId, businessId, dateFrom, dateTo }),
    getInsightsTrends({ accountId, businessId, dateFrom, dateTo, groupBy: "day" }),
  ]);

  const hasData = insights.totalReviews > 0;

  return (
    <PageContainer>
      <div className="mb-6">
        <BackButton label={tCommon("back")} />
      </div>

      <PageHeader title={t("title", { businessName: business.name })} description={t("description")} />

      <div className="mt-6 space-y-6">
        <InsightsDateFilter dateFrom={dateFrom} dateTo={dateTo} />

        {!hasData ? (
          <EmptyState title={t("noData")} description={t("noDataDescription")} />
        ) : (
          <>
            <InsightsOverview stats={insights} />
            <InsightsCharts stats={insights} trends={trends} />
          </>
        )}
      </div>
    </PageContainer>
  );
}
