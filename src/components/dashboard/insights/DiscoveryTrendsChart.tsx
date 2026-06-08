"use client";

import { useTranslations } from "next-intl";
import {
  DashboardCard,
  DashboardCardContent,
  DashboardCardHeader,
  DashboardCardTitle,
} from "@/components/ui/dashboard-card";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import type { Props as LegendContentProps } from "recharts/types/component/DefaultLegendContent";

function renderLegend(props: LegendContentProps) {
  const { payload } = props;
  if (!payload) return null;
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 pt-4 pb-1">
      {payload.map((entry) => (
        <span key={entry.value} className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-2">
          <span className="h-0.5 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
          {entry.value}
        </span>
      ))}
    </div>
  );
}

interface DailyMetric {
  date: string;
  impressions: number;
  websiteClicks: number;
  phoneCallClicks: number;
  directionRequests: number;
}

interface DiscoveryTrendsChartProps {
  daily: DailyMetric[];
}

export function DiscoveryTrendsChart({ daily }: DiscoveryTrendsChartProps) {
  const t = useTranslations("dashboard.insights");

  if (daily.length <= 1) return null;

  const chartData = daily.map((d) => ({
    date: d.date,
    impressions: d.impressions,
    actions: d.websiteClicks + d.phoneCallClicks + d.directionRequests,
  }));

  return (
    <DashboardCard>
      <DashboardCardHeader>
        <DashboardCardTitle>{t("discovery.title")}</DashboardCardTitle>
      </DashboardCardHeader>
      <DashboardCardContent className="pt-0 px-2 sm:px-4 pb-2 sm:pb-4">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="discoveryLeadFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.1} />
                  <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--hairline)" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: "var(--ink-3)", fontSize: 12, style: { fontVariantNumeric: "tabular-nums" } }}
                axisLine={false}
                tickLine={false}
                tickMargin={8}
                tickFormatter={(val) => {
                  const d = new Date(val);
                  return `${d.getMonth() + 1}/${d.getDate()}`;
                }}
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
              <Area
                type="monotone"
                dataKey="impressions"
                name={t("performance.totalImpressions")}
                stroke="var(--chart-1)"
                strokeWidth={2}
                fill="url(#discoveryLeadFill)"
                fillOpacity={1}
                activeDot={{ r: 3, strokeWidth: 0 }}
              />
              <Area
                type="monotone"
                dataKey="actions"
                name={t("scoreboard.customerActions")}
                stroke="var(--chart-2)"
                strokeWidth={2}
                fill="transparent"
                fillOpacity={1}
                activeDot={{ r: 3, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </DashboardCardContent>
    </DashboardCard>
  );
}
