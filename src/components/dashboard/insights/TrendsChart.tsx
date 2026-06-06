"use client";

import { useState } from "react";
import {
  DashboardCard,
  DashboardCardContent,
  DashboardCardHeader,
  DashboardCardTitle,
} from "@/components/ui/dashboard-card";
import { DeltaBadge } from "@/components/ui/bento";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import type { ClassificationTrend } from "@/lib/types/classification.types";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from "recharts";
import type { Props as LegendContentProps } from "recharts/types/component/DefaultLegendContent";
import { format, parseISO, type Locale } from "date-fns";
import { he, enUS } from "date-fns/locale";

const localeMap: Record<string, Locale> = {
  he,
  en: enUS,
};

type SeriesKey = "totalReviews" | "positiveCount" | "negativeCount" | "neutralCount";

const SERIES_CONFIG: Record<SeriesKey, { colorVar: string }> = {
  totalReviews: { colorVar: "var(--primary)" },
  positiveCount: { colorVar: "var(--success, #22c55e)" },
  negativeCount: { colorVar: "var(--destructive)" },
  neutralCount: { colorVar: "var(--muted-foreground)" },
};

interface TrendsChartProps {
  trends: ClassificationTrend[];
  locale: string;
}

export function TrendsChart({ trends, locale }: TrendsChartProps) {
  const t = useTranslations("dashboard.insights");
  const dateLocale = localeMap[locale] || enUS;
  const [visibleSeries, setVisibleSeries] = useState<Record<SeriesKey, boolean>>({
    totalReviews: true,
    positiveCount: false,
    negativeCount: false,
    neutralCount: false,
  });

  const trendData = trends.map((trend) => ({
    ...trend,
    formattedDate: format(parseISO(trend.date), "MMM d", { locale: dateLocale }),
  }));

  const average =
    trendData.length > 0 ? Math.round(trendData.reduce((sum, d) => sum + d.totalReviews, 0) / trendData.length) : 0;

  const half = Math.floor(trendData.length / 2);
  const firstHalfTotal = trendData.slice(0, half).reduce((sum, d) => sum + d.totalReviews, 0);
  const secondHalfTotal = trendData.slice(half).reduce((sum, d) => sum + d.totalReviews, 0);
  const trendDelta =
    half > 0 && firstHalfTotal > 0 ? ((secondHalfTotal - firstHalfTotal) / firstHalfTotal) * 100 : null;

  const seriesKeys: { key: SeriesKey; labelKey: string }[] = [
    { key: "totalReviews", labelKey: "trends.totalReviews" },
    { key: "positiveCount", labelKey: "trends.positive" },
    { key: "negativeCount", labelKey: "trends.negative" },
    { key: "neutralCount", labelKey: "trends.neutral" },
  ];

  const handleLegendClick = (dataKey: string) => {
    setVisibleSeries((prev) => ({ ...prev, [dataKey]: !prev[dataKey as SeriesKey] }));
  };

  const renderLegend = (props: LegendContentProps) => {
    const { payload } = props;
    if (!payload) return null;

    return (
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 pt-3 pb-1">
        {payload.map((entry) => {
          const key = entry.dataKey as SeriesKey;
          const isActive = visibleSeries[key];
          return (
            <button
              key={key}
              type="button"
              onClick={() => handleLegendClick(key)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium transition-colors hover:bg-muted/60",
                isActive ? "text-foreground" : "text-muted-foreground/60"
              )}
            >
              <span className="size-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
              <span>{entry.value}</span>
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <DashboardCard>
      <DashboardCardHeader className="pb-0">
        <div className="flex items-center justify-between gap-3">
          <DashboardCardTitle>{t("sections.trends")}</DashboardCardTitle>
          {trendDelta !== null && <DeltaBadge value={trendDelta} className="rounded-full bg-muted/60 px-2.5 py-1" />}
        </div>
      </DashboardCardHeader>
      <DashboardCardContent className="pt-2 px-2 sm:px-4 pb-2 sm:pb-4">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 8, right: 50, left: -16, bottom: 0 }}>
              <CartesianGrid stroke="var(--border)" strokeOpacity={0.5} vertical={false} />
              <XAxis
                dataKey="formattedDate"
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickMargin={8}
              />
              <YAxis
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickMargin={8}
                allowDecimals={false}
              />
              <Tooltip
                cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "0.75rem",
                  boxShadow: "var(--shadow-md)",
                  padding: "8px 12px",
                  fontSize: "13px",
                }}
                labelStyle={{ color: "var(--muted-foreground)", marginBottom: "4px", fontWeight: 600 }}
              />
              <Legend content={renderLegend} />
              {visibleSeries.totalReviews && average > 0 && (
                <ReferenceLine
                  y={average}
                  stroke="var(--muted-foreground)"
                  strokeDasharray="4 4"
                  strokeOpacity={0.6}
                  label={{
                    value: `${t("trends.average")}: ${average}`,
                    position: "right",
                    fill: "var(--muted-foreground)",
                    fontSize: 11,
                  }}
                />
              )}
              {seriesKeys.map(({ key, labelKey }) => (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={SERIES_CONFIG[key].colorVar}
                  strokeWidth={2}
                  fill={SERIES_CONFIG[key].colorVar}
                  fillOpacity={0.12}
                  name={t(labelKey)}
                  hide={!visibleSeries[key]}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </DashboardCardContent>
    </DashboardCard>
  );
}
