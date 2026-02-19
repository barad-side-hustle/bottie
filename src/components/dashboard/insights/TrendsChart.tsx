"use client";

import {
  DashboardCard,
  DashboardCardContent,
  DashboardCardHeader,
  DashboardCardTitle,
} from "@/components/ui/dashboard-card";
import { useTranslations } from "next-intl";
import type { ClassificationTrend } from "@/lib/types/classification.types";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { format, parseISO, type Locale } from "date-fns";
import { he, enUS } from "date-fns/locale";

const localeMap: Record<string, Locale> = {
  he,
  en: enUS,
};

interface TrendsChartProps {
  trends: ClassificationTrend[];
  locale: string;
}

export function TrendsChart({ trends, locale }: TrendsChartProps) {
  const t = useTranslations("dashboard.insights");
  const dateLocale = localeMap[locale] || enUS;

  const trendData = trends.map((trend) => ({
    ...trend,
    formattedDate: format(parseISO(trend.date), "MMM d", { locale: dateLocale }),
  }));

  const average =
    trendData.length > 0 ? Math.round(trendData.reduce((sum, d) => sum + d.totalReviews, 0) / trendData.length) : 0;

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
                <linearGradient id="colorReviews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
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
              {average > 0 && (
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
              <Area
                type="monotone"
                dataKey="totalReviews"
                stroke="var(--primary)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorReviews)"
                name={t("overview.totalReviews")}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </DashboardCardContent>
    </DashboardCard>
  );
}
