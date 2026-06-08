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
  totalReviews: { colorVar: "var(--chart-1)" },
  positiveCount: { colorVar: "var(--positive)" },
  negativeCount: { colorVar: "var(--negative)" },
  neutralCount: { colorVar: "var(--chart-neutral)" },
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
      <div className="flex flex-wrap items-center justify-center gap-1.5 pt-4 pb-1">
        {payload.map((entry) => {
          const key = entry.dataKey as SeriesKey;
          const isActive = visibleSeries[key];
          return (
            <button
              key={key}
              type="button"
              onClick={() => handleLegendClick(key)}
              aria-pressed={isActive}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium transition-colors",
                isActive ? "border-hairline bg-surface-2 text-ink" : "border-transparent text-ink-3 hover:bg-surface-2"
              )}
            >
              <span
                className="h-0.5 w-3 rounded-full"
                style={{ backgroundColor: isActive ? entry.color : "var(--ink-3)" }}
              />
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
          {trendDelta !== null && <DeltaBadge value={trendDelta} />}
        </div>
      </DashboardCardHeader>
      <DashboardCardContent className="pt-2 px-2 sm:px-4 pb-2 sm:pb-4">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 8, right: 50, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="trendsLeadFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.1} />
                  <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--hairline)" vertical={false} />
              <XAxis
                dataKey="formattedDate"
                tick={{ fill: "var(--ink-3)", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickMargin={8}
              />
              <YAxis
                tick={{ fill: "var(--ink-3)", fontSize: 12, style: { fontVariantNumeric: "tabular-nums" } }}
                axisLine={false}
                tickLine={false}
                tickMargin={8}
                allowDecimals={false}
                width={40}
              />
              <Tooltip
                cursor={{ stroke: "var(--hairline)", strokeWidth: 1 }}
                contentStyle={{
                  backgroundColor: "var(--popover)",
                  border: "1px solid var(--hairline)",
                  borderRadius: "var(--radius-lg)",
                  boxShadow: "var(--shadow-md)",
                  padding: "8px 12px",
                  fontSize: "13px",
                  fontVariantNumeric: "tabular-nums",
                }}
                labelStyle={{ color: "var(--ink-3)", marginBottom: "4px", fontWeight: 600 }}
              />
              <Legend content={renderLegend} />
              {visibleSeries.totalReviews && average > 0 && (
                <ReferenceLine
                  y={average}
                  stroke="var(--ink-3)"
                  strokeDasharray="4 4"
                  label={{
                    value: `${t("trends.average")}: ${average}`,
                    position: "right",
                    fill: "var(--ink-3)",
                    fontSize: 11,
                  }}
                />
              )}
              {seriesKeys.map(({ key, labelKey }) => {
                const isLead = key === "totalReviews";
                return (
                  <Area
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={SERIES_CONFIG[key].colorVar}
                    strokeWidth={2}
                    fill={isLead ? "url(#trendsLeadFill)" : "transparent"}
                    fillOpacity={1}
                    activeDot={{ r: 3, strokeWidth: 0 }}
                    name={t(labelKey)}
                    hide={!visibleSeries[key]}
                  />
                );
              })}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </DashboardCardContent>
    </DashboardCard>
  );
}
