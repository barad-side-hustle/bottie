"use client";

import { useTranslations } from "next-intl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InsightsScoreboard } from "./InsightsScoreboard";
import { TrendsChart } from "./TrendsChart";
import { DiscoveryTrendsChart } from "./DiscoveryTrendsChart";
import { InsightsCharts } from "./InsightsCharts";
import type { getPerformanceMetrics } from "@/lib/actions/metrics.actions";
import type { ClassificationStats, ClassificationTrend } from "@/lib/types/classification.types";

type PerformanceMetrics = Awaited<ReturnType<typeof getPerformanceMetrics>>;

interface InsightsTabsProps {
  insights: ClassificationStats;
  trends: ClassificationTrend[];
  performanceMetrics: PerformanceMetrics | null;
  locale: string;
  locationId: string;
  dateFrom: Date;
  dateTo: Date;
}

export function InsightsTabs({
  insights,
  trends,
  performanceMetrics,
  locale,
  locationId,
  dateFrom,
  dateTo,
}: InsightsTabsProps) {
  const t = useTranslations("dashboard.insights");

  const hasPerformance = performanceMetrics !== null;

  return (
    <div className="space-y-6">
      <InsightsScoreboard stats={insights} performance={performanceMetrics?.totals ?? null} />

      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">{t("tabs.trends")}</TabsTrigger>
          <TabsTrigger value="categories">{t("tabs.categories")}</TabsTrigger>
          {hasPerformance && <TabsTrigger value="performance">{t("tabs.performance")}</TabsTrigger>}
        </TabsList>

        <TabsContent value="trends" className="mt-0">
          <TrendsChart trends={trends} locale={locale} />
        </TabsContent>

        <TabsContent value="categories" className="mt-0">
          <InsightsCharts stats={insights} locationId={locationId} dateFrom={dateFrom} dateTo={dateTo} />
        </TabsContent>

        {performanceMetrics && (
          <TabsContent value="performance" className="mt-0">
            <PerformancePanel performance={performanceMetrics} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

function PerformancePanel({ performance }: { performance: PerformanceMetrics }) {
  const t = useTranslations("dashboard.insights");

  const channels: { label: string; value: number }[] = [
    { label: t("performance.totalImpressions"), value: performance.totals.totalImpressions },
    { label: t("performance.websiteClicks"), value: performance.totals.websiteClicks },
    { label: t("performance.phoneCalls"), value: performance.totals.phoneCallClicks },
  ];

  return (
    <div className="space-y-6">
      <DiscoveryTrendsChart daily={performance.daily} />

      <div className="rounded-lg border border-hairline bg-card">
        <ul className="divide-y divide-hairline">
          {channels.map((c) => (
            <li key={c.label} className="flex items-center justify-between gap-4 px-5 py-3">
              <span className="text-sm text-ink-2">{c.label}</span>
              <span className="text-sm font-medium tabular-nums text-foreground">{c.value.toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
