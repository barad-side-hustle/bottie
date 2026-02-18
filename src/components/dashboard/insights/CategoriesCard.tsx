"use client";

import {
  DashboardCard,
  DashboardCardContent,
  DashboardCardHeader,
  DashboardCardTitle,
} from "@/components/ui/dashboard-card";
import { useTranslations } from "next-intl";
import type { CategoryCount, ClassificationCategory } from "@/lib/types/classification.types";
import { TrendingUp, TrendingDown } from "lucide-react";

interface CombinedCategory extends CategoryCount {
  type: "positive" | "negative";
}

interface CategoriesCardProps {
  topPositives: CategoryCount[];
  topNegatives: CategoryCount[];
  onCategoryClick: (category: ClassificationCategory, type: "positive" | "negative") => void;
}

export function CategoriesCard({ topPositives, topNegatives, onCategoryClick }: CategoriesCardProps) {
  const t = useTranslations("dashboard.insights");
  const tCategories = useTranslations("dashboard.insights.categories");

  const combinedCategories: CombinedCategory[] = [
    ...topPositives.map((cat) => ({ ...cat, type: "positive" as const })),
    ...topNegatives.map((cat) => ({ ...cat, type: "negative" as const })),
  ].sort((a, b) => b.count - a.count);

  if (combinedCategories.length === 0) {
    return (
      <DashboardCard>
        <DashboardCardHeader>
          <DashboardCardTitle>{t("sections.categories")}</DashboardCardTitle>
        </DashboardCardHeader>
        <DashboardCardContent className="pt-0">
          <p className="text-muted-foreground text-sm py-4">{t("noCategories")}</p>
        </DashboardCardContent>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard>
      <DashboardCardHeader>
        <DashboardCardTitle>{t("sections.categories")}</DashboardCardTitle>
      </DashboardCardHeader>
      <DashboardCardContent className="pt-0">
        <div className="space-y-1">
          {combinedCategories.map((cat) => {
            const Icon = cat.type === "positive" ? TrendingUp : TrendingDown;
            const colorClass = cat.type === "positive" ? "text-success" : "text-destructive";

            return (
              <button
                key={`${cat.type}-${cat.category}`}
                onClick={() => onCategoryClick(cat.category, cat.type)}
                className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors cursor-pointer text-start"
              >
                <Icon className={`h-4 w-4 shrink-0 ${colorClass}`} />
                <span className="flex-1 text-sm font-medium truncate">{tCategories(cat.category)}</span>
                <span className="text-sm text-muted-foreground shrink-0">
                  {cat.count} ({cat.percentage}%)
                </span>
              </button>
            );
          })}
        </div>
      </DashboardCardContent>
    </DashboardCard>
  );
}
