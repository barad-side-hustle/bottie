"use client";

import { useState } from "react";
import {
  DashboardCard,
  DashboardCardContent,
  DashboardCardHeader,
  DashboardCardTitle,
} from "@/components/ui/dashboard-card";
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
  type LegendProps,
} from "recharts";
import { format, parseISO, type Locale } from "date-fns";
import { he, enUS } from "date-fns/locale";

const localeMap: Record<string, Locale> = {
  he,
  en: enUS,
};

type SeriesKey = "totalReviews" | "positiveCount" | "negativeCount" | "neutralCount";

const SERIES_CONFIG: Record<SeriesKey, { colorVar: string; gradientId: string }> = {
  totalReviews: { colorVar: "var(--primary)", gradientId: "colorReviews" },
  positiveCount: { colorVar: "var(--success, #22c55e)", gradientId: "colorPositive" },
  negativeCount: { colorVar: "var(--destructive)", gradientId: "colorNegative" },
  neutralCount: { colorVar: "var(--muted-foreground)", gradientId: "colorNeutral" },
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

  const seriesKeys: { key: SeriesKey; labelKey: string }[] = [
    { key: "totalReviews", labelKey: "trends.totalReviews" },
    { key: "positiveCount", labelKey: "trends.positive" },
    { key: "negativeCount", labelKey: "trends.negative" },
    { key: "neutralCount", labelKey: "trends.neutral" },
  ];

  const handleLegendClick = (dataKey: string) => {
    setVisibleSeries((prev) => ({ ...prev, [dataKey]: !prev[dataKey as SeriesKey] }));
  };

  const renderLegend = (props: LegendProps) => {
    const { payload } = props;
    if (!payload) return null;

    return (
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 pt-2 pb-1">
        {payload.map((entry) => {
          const key = entry.dataKey as SeriesKey;
          const isActive = visibleSeries[key];
          return (
            <button
              key={key}
              type="button"
              onClick={() => handleLegendClick(key)}
              className="inline-flex items-center gap-1.5 text-xs cursor-pointer transition-opacity"
              style={{ opacity: isActive ? 1 : 0.4 }}
            >
              <span className="size-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-muted-foreground">{entry.value}</span>
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <DashboardCard>
      <DashboardCardHeader>
        <DashboardCardTitle>{t("sections.trends")}</DashboardCardTitle>
      </DashboardCardHeader>
      <DashboardCardContent className="pt-0 px-2 sm:px-4 pb-2 sm:pb-4">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 8, right: 50, left: -16, bottom: 0 }}>
              <defs>
                {Object.entries(SERIES_CONFIG).map(([key, config]) => (
                  <linearGradient key={key} id={config.gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={config.colorVar} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={config.colorVar} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
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
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "none",
                  borderRadius: "0.75rem",
                  boxShadow: "var(--shadow-md)",
                  padding: "8px 12px",
                  fontSize: "13px",
                }}
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
                  fillOpacity={1}
                  fill={`url(#${SERIES_CONFIG[key].gradientId})`}
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
