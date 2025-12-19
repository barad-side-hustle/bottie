"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useLocale } from "next-intl";
import type {
  ClassificationStats,
  ClassificationTrend,
  ClassificationCategory,
} from "@/lib/types/classification.types";
import { CategoriesCard } from "./CategoriesCard";
import { CategoryReviewsModal } from "./CategoryReviewsModal";
import {
  DashboardCard,
  DashboardCardContent,
  DashboardCardHeader,
  DashboardCardTitle,
} from "@/components/ui/dashboard-card";

const TrendsChart = dynamic(() => import("./TrendsChart").then((mod) => ({ default: mod.TrendsChart })), {
  ssr: false,
  loading: () => (
    <DashboardCard className="hover:scale-100 hover:-translate-y-0">
      <DashboardCardHeader>
        <DashboardCardTitle>Loading chart...</DashboardCardTitle>
      </DashboardCardHeader>
      <DashboardCardContent className="pt-0">
        <div className="h-64 animate-pulse bg-muted rounded-lg" />
      </DashboardCardContent>
    </DashboardCard>
  ),
});

interface InsightsChartsProps {
  stats: ClassificationStats;
  trends: ClassificationTrend[];
  locationId: string;
  dateFrom: Date;
  dateTo: Date;
}

export function InsightsCharts({ stats, trends, locationId, dateFrom, dateTo }: InsightsChartsProps) {
  const locale = useLocale();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ClassificationCategory | null>(null);
  const [selectedType, setSelectedType] = useState<"positive" | "negative" | null>(null);

  const handleCategoryClick = (category: ClassificationCategory, type: "positive" | "negative") => {
    setSelectedCategory(category);
    setSelectedType(type);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <CategoriesCard
        topPositives={stats.topPositives}
        topNegatives={stats.topNegatives}
        onCategoryClick={handleCategoryClick}
      />
      <CategoryReviewsModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        category={selectedCategory}
        type={selectedType}
        locationId={locationId}
        dateFrom={dateFrom}
        dateTo={dateTo}
      />
      <TrendsChart trends={trends} locale={locale} />
    </div>
  );
}
