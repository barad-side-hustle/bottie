"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  DashboardCard,
  DashboardCardContent,
  DashboardCardHeader,
  DashboardCardTitle,
} from "@/components/ui/dashboard-card";
import { getPerformanceMetrics } from "@/lib/actions/metrics.actions";
import { Eye, MousePointerClick, Phone, MapPin } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface PerformanceMetricsProps {
  locationId: string;
  dateFrom: Date;
  dateTo: Date;
}

interface MetricsData {
  totals: {
    totalImpressions: number;
    searchImpressions: number;
    mapsImpressions: number;
    websiteClicks: number;
    phoneCallClicks: number;
    directionRequests: number;
  };
  daily: {
    date: string;
    impressions: number;
    websiteClicks: number;
    phoneCallClicks: number;
    directionRequests: number;
  }[];
}

export function PerformanceMetrics({ locationId, dateFrom, dateTo }: PerformanceMetricsProps) {
  const t = useTranslations("dashboard.insights.performance");
  const [data, setData] = useState<MetricsData | null>(null);

  useEffect(() => {
    getPerformanceMetrics({ locationId, dateFrom, dateTo })
      .then(setData)
      .catch(() => {});
  }, [locationId, dateFrom, dateTo]);

  if (!data || data.totals.totalImpressions === 0) return null;

  const statCards = [
    { label: t("totalImpressions"), value: data.totals.totalImpressions, icon: Eye },
    { label: t("websiteClicks"), value: data.totals.websiteClicks, icon: MousePointerClick },
    { label: t("phoneCalls"), value: data.totals.phoneCallClicks, icon: Phone },
    { label: t("directionRequests"), value: data.totals.directionRequests, icon: MapPin },
  ];

  return (
    <DashboardCard>
      <DashboardCardHeader>
        <DashboardCardTitle>{t("title")}</DashboardCardTitle>
      </DashboardCardHeader>
      <DashboardCardContent className="pt-0">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {statCards.map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-lg border border-border/40 p-4">
              <div className="flex items-center gap-2 mb-1">
                <Icon className="size-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
              <p className="text-2xl font-bold">{value.toLocaleString()}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4 mb-3">
          <p className="text-sm font-medium text-muted-foreground">
            {t("searchImpressions")}: {data.totals.searchImpressions.toLocaleString()}
          </p>
          <p className="text-sm font-medium text-muted-foreground">
            {t("mapsImpressions")}: {data.totals.mapsImpressions.toLocaleString()}
          </p>
        </div>

        {data.daily.length > 1 && (
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.daily}>
                <defs>
                  <linearGradient id="perfGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(val) => {
                    const d = new Date(val);
                    return `${d.getMonth() + 1}/${d.getDate()}`;
                  }}
                  className="text-muted-foreground"
                />
                <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="impressions"
                  name={t("totalImpressions")}
                  stroke="hsl(var(--primary))"
                  fill="url(#perfGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </DashboardCardContent>
    </DashboardCard>
  );
}
