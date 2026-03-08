import { Suspense } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { getTranslations } from "next-intl/server";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { buildLocationBreadcrumbs } from "@/lib/utils/breadcrumbs";
import { getLocation } from "@/lib/actions/locations.actions";
import { getInsights, getInsightsTrends } from "@/lib/actions/insights.actions";
import { getPerformanceMetrics } from "@/lib/actions/metrics.actions";
import { InsightsDateFilter, InsightsCharts } from "@/components/dashboard/insights";
import { InsightsScoreboard } from "@/components/dashboard/insights/InsightsScoreboard";
import { TrendsChart } from "@/components/dashboard/insights/TrendsChart";
import { DiscoveryTrendsChart } from "@/components/dashboard/insights/DiscoveryTrendsChart";
import { EmptyState } from "@/components/ui/empty-state";
import { subDays } from "date-fns";

export const dynamic = "force-dynamic";

interface InsightsPageProps {
  params: Promise<{ locale: string; locationId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function InsightsPage({ params, searchParams }: InsightsPageProps) {
  const { locale, locationId } = await params;
  const resolvedSearchParams = await searchParams;

  const t = await getTranslations({ locale, namespace: "dashboard.insights" });
  const tBreadcrumbs = await getTranslations({ locale, namespace: "breadcrumbs" });

  const location = await getLocation({ locationId });

  const dateFromParam = resolvedSearchParams.dateFrom as string | undefined;
  const dateToParam = resolvedSearchParams.dateTo as string | undefined;

  let dateTo = dateToParam ? new Date(dateToParam) : new Date();
  if (isNaN(dateTo.getTime())) {
    dateTo = new Date();
  }

  let dateFrom = dateFromParam ? new Date(dateFromParam) : subDays(dateTo, 30);
  if (isNaN(dateFrom.getTime())) {
    dateFrom = subDays(dateTo, 30);
  }

  const [insights, trends, performanceMetrics] = await Promise.all([
    getInsights({ locationId, dateFrom, dateTo }),
    getInsightsTrends({ locationId, dateFrom, dateTo, groupBy: "day" }),
    getPerformanceMetrics({ locationId, dateFrom, dateTo }).catch(() => null),
  ]);

  const hasData = insights.totalReviews > 0;

  return (
    <PageContainer>
      <div className="mb-4">
        <Breadcrumbs
          items={buildLocationBreadcrumbs({
            locationName: location.name,
            locationId,
            currentSection: "insights",
            t: tBreadcrumbs,
          })}
        />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <PageHeader title={t("title", { businessName: location.name })} description={t("description")} />
        <Suspense>
          <InsightsDateFilter dateFrom={dateFrom} dateTo={dateTo} />
        </Suspense>
      </div>

      <div className="mt-6 space-y-6">
        {!hasData ? (
          <EmptyState title={t("noData")} description={t("noDataDescription")} />
        ) : (
          <>
            <InsightsScoreboard stats={insights} performance={performanceMetrics?.totals ?? null} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <TrendsChart trends={trends} locale={locale} />
              {performanceMetrics && <DiscoveryTrendsChart daily={performanceMetrics.daily} />}
            </div>

            <InsightsCharts
              stats={insights}
              trends={trends}
              locationId={locationId}
              dateFrom={dateFrom}
              dateTo={dateTo}
            />
          </>
        )}
      </div>
    </PageContainer>
  );
}
