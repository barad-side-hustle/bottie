"use client";

import { useState } from "react";
import type {
  ClassificationStats,
  ClassificationTrend,
  ClassificationCategory,
} from "@/lib/types/classification.types";
import { CustomerFeedbackCard } from "./CustomerFeedbackCard";
import { CategoryReviewsModal } from "./CategoryReviewsModal";

interface InsightsChartsProps {
  stats: ClassificationStats;
  trends: ClassificationTrend[];
  locationId: string;
  dateFrom: Date;
  dateTo: Date;
}

export function InsightsCharts({ stats, locationId, dateFrom, dateTo }: InsightsChartsProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ClassificationCategory | null>(null);
  const [selectedType, setSelectedType] = useState<"positive" | "negative" | null>(null);

  const handleCategoryClick = (category: ClassificationCategory, type: "positive" | "negative") => {
    setSelectedCategory(category);
    setSelectedType(type);
    setModalOpen(true);
  };

  return (
    <>
      <CustomerFeedbackCard
        topPositives={stats.topPositives}
        topNegatives={stats.topNegatives}
        topics={stats.topTopics}
        sentimentBreakdown={stats.sentimentBreakdown}
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
    </>
  );
}
