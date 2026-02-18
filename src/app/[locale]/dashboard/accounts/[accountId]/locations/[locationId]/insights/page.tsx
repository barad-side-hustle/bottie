import { Suspense } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { BackButton } from "@/components/ui/back-button";
import { getTranslations } from "next-intl/server";
import { getLocation } from "@/lib/actions/locations.actions";
import { getInsights, getInsightsTrends } from "@/lib/actions/insights.actions";
import { getAuthenticatedUserId } from "@/lib/api/auth";
import { InsightsDateFilter, InsightsOverview, InsightsCharts } from "@/components/dashboard/insights";
import { EmptyState } from "@/components/ui/empty-state";
import { subDays } from "date-fns";
import { SubscriptionsController } from "@/lib/controllers/subscriptions.controller";
import { FeatureLockedState } from "@/components/dashboard/FeatureLockedState";

export const dynamic = "force-dynamic";

interface InsightsPageProps {
  params: Promise<{ locale: string; accountId: string; locationId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function InsightsPage({ params, searchParams }: InsightsPageProps) {
  const { locale, locationId } = await params;
  const resolvedSearchParams = await searchParams;

  const { userId } = await getAuthenticatedUserId();
  const t = await getTranslations({ locale, namespace: "dashboard.insights" });
  const tCommon = await getTranslations({ locale, namespace: "common" });

  const subscriptionsController = new SubscriptionsController();
  const analyticsAccess = await subscriptionsController.checkFeatureAccess(userId, "analytics");

  if (!analyticsAccess.hasAccess) {
    return (
      <PageContainer>
        <div className="mb-6">
          <BackButton label={tCommon("back")} />
        </div>
        <PageHeader title={t("title", { businessName: "Insights" })} description={t("description")} />
        <div className="mt-6">
          <FeatureLockedState feature="analytics" requiredPlan={analyticsAccess.requiredPlan} />
        </div>
      </PageContainer>
    );
  }

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

  const [location, insights, trends] = await Promise.all([
    getLocation({ locationId }),
    getInsights({ locationId, dateFrom, dateTo }),
    getInsightsTrends({ locationId, dateFrom, dateTo, groupBy: "day" }),
  ]);

  const hasData = insights.totalReviews > 0;

  return (
    <PageContainer>
      <div className="mb-6">
        <BackButton label={tCommon("back")} />
      </div>

      <PageHeader title={t("title", { businessName: location.name })} description={t("description")} />

      <div className="mt-6 space-y-6">
        <Suspense>
          <InsightsDateFilter dateFrom={dateFrom} dateTo={dateTo} />
        </Suspense>

        {!hasData ? (
          <EmptyState title={t("noData")} description={t("noDataDescription")} />
        ) : (
          <>
            <InsightsOverview stats={insights} />
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
