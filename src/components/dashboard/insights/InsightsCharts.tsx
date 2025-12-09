"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import type {
  ClassificationStats,
  ClassificationTrend,
  ClassificationCategory,
} from "@/lib/types/classification.types";
import { TrendsChart } from "./TrendsChart";
import { CategoriesCard } from "./CategoriesCard";
import { CategoryReviewsModal } from "./CategoryReviewsModal";

interface InsightsChartsProps {
  stats: ClassificationStats;
  trends: ClassificationTrend[];
  accountId: string;
  businessId: string;
  dateFrom: Date;
  dateTo: Date;
}

export function InsightsCharts({ stats, trends, accountId, businessId, dateFrom, dateTo }: InsightsChartsProps) {
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
        accountId={accountId}
        businessId={businessId}
        dateFrom={dateFrom}
        dateTo={dateTo}
      />
      <TrendsChart trends={trends} locale={locale} />
    </div>
  );
}
