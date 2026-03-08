"use client";

import { useTranslations } from "next-intl";
import {
  DashboardCard,
  DashboardCardContent,
  DashboardCardHeader,
  DashboardCardTitle,
} from "@/components/ui/dashboard-card";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";

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
                <linearGradient id="discoveryImpressions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="discoveryActions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--success, #22c55e)" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="var(--success, #22c55e)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--border)" strokeOpacity={0.5} vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickMargin={8}
                tickFormatter={(val) => {
                  const d = new Date(val);
                  return `${d.getMonth() + 1}/${d.getDate()}`;
                }}
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
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} iconType="circle" iconSize={8} />
              <Area
                type="monotone"
                dataKey="impressions"
                name={t("performance.totalImpressions")}
                stroke="var(--primary)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#discoveryImpressions)"
              />
              <Area
                type="monotone"
                dataKey="actions"
                name={t("scoreboard.customerActions")}
                stroke="var(--success, #22c55e)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#discoveryActions)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </DashboardCardContent>
    </DashboardCard>
  );
}
