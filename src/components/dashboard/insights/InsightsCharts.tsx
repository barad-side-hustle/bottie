"use client";

import {
  DashboardCard,
  DashboardCardContent,
  DashboardCardHeader,
  DashboardCardTitle,
} from "@/components/ui/dashboard-card";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";
import type { ClassificationStats, ClassificationTrend, CategoryCount } from "@/lib/types/classification.types";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format, parseISO } from "date-fns";

interface InsightsChartsProps {
  stats: ClassificationStats;
  trends: ClassificationTrend[];
}

export function InsightsCharts({ stats, trends }: InsightsChartsProps) {
  const t = useTranslations("dashboard.insights");
  const tCategories = useTranslations("dashboard.insights.categories");

  const trendData = trends.map((t) => ({
    ...t,
    formattedDate: format(parseISO(t.date), "MMM d"),
  }));

  return (
    <div className="space-y-6">
      <DashboardCard className="hover:scale-100 hover:-translate-y-0">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardCard className="hover:scale-100 hover:-translate-y-0">
          <DashboardCardHeader>
            <DashboardCardTitle>{t("sections.topPositives")}</DashboardCardTitle>
          </DashboardCardHeader>
          <DashboardCardContent className="pt-0">
            <CategoryList categories={stats.topPositives} type="positive" tCategories={tCategories} />
          </DashboardCardContent>
        </DashboardCard>

        <DashboardCard className="hover:scale-100 hover:-translate-y-0">
          <DashboardCardHeader>
            <DashboardCardTitle>{t("sections.topNegatives")}</DashboardCardTitle>
          </DashboardCardHeader>
          <DashboardCardContent className="pt-0">
            <CategoryList categories={stats.topNegatives} type="negative" tCategories={tCategories} />
          </DashboardCardContent>
        </DashboardCard>
      </div>
    </div>
  );
}

interface CategoryListProps {
  categories: CategoryCount[];
  type: "positive" | "negative";
  tCategories: ReturnType<typeof useTranslations>;
}

function CategoryList({ categories, type, tCategories }: CategoryListProps) {
  const t = useTranslations("dashboard.insights");

  if (categories.length === 0) {
    return <p className="text-muted-foreground text-sm py-4">{t("noCategories")}</p>;
  }

  const maxCount = categories[0]?.count || 1;

  return (
    <div className="space-y-3">
      {categories.slice(0, 6).map((cat) => (
        <div key={cat.category} className="flex items-center gap-3">
          <Badge variant={type === "positive" ? "default" : "destructive"} className="min-w-[100px] justify-center">
            {tCategories(cat.category)}
          </Badge>
          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${type === "positive" ? "bg-green-500" : "bg-red-500"}`}
              style={{ width: `${(cat.count / maxCount) * 100}%` }}
            />
          </div>
          <span className="text-sm font-medium text-muted-foreground min-w-[50px] text-right">
            {cat.count} ({cat.percentage}%)
          </span>
        </div>
      ))}
    </div>
  );
}
