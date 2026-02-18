"use client";

import {
  DashboardCard,
  DashboardCardContent,
  DashboardCardHeader,
  DashboardCardTitle,
} from "@/components/ui/dashboard-card";
import { useTranslations } from "next-intl";
import type { ClassificationTrend } from "@/lib/types/classification.types";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
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

  return (
    <DashboardCard>
      <DashboardCardHeader>
        <DashboardCardTitle>{t("sections.trends")}</DashboardCardTitle>
      </DashboardCardHeader>
      <DashboardCardContent className="pt-0">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorReviews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="formattedDate" stroke="var(--muted-foreground)" fontSize={12} />
              <YAxis stroke="var(--muted-foreground)" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                }}
              />
              <Area
                type="monotone"
                dataKey="totalReviews"
                stroke="var(--primary)"
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
