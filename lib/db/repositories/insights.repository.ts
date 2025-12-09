import { eq, and, gte, lte, isNotNull, exists } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { reviews, businesses, userAccounts } from "@/lib/db/schema";
import type {
  ClassificationStats,
  CategoryCount,
  ClassificationTrend,
  ClassificationCategory,
  ReviewClassification,
} from "@/lib/types/classification.types";
import { CLASSIFICATION_CATEGORIES } from "@/lib/types/classification.types";

export class InsightsRepository {
  constructor(
    private userId: string,
    private businessId: string
  ) {}

  private getAccessCondition() {
    return exists(
      db
        .select()
        .from(businesses)
        .innerJoin(userAccounts, eq(userAccounts.accountId, businesses.accountId))
        .where(and(eq(businesses.id, this.businessId), eq(userAccounts.userId, this.userId)))
    );
  }

  async getClassificationStats(dateFrom: Date, dateTo: Date): Promise<ClassificationStats> {
    const conditions = [
      eq(reviews.businessId, this.businessId),
      gte(reviews.date, dateFrom),
      lte(reviews.date, dateTo),
      this.getAccessCondition(),
    ];

    const reviewsData = await db.query.reviews.findMany({
      where: and(...conditions),
    });

    const totalReviews = reviewsData.length;
    const classifiedReviews = reviewsData.filter((r) => r.classifications !== null).length;

    if (totalReviews === 0) {
      return {
        totalReviews: 0,
        classifiedReviews: 0,
        averageRating: 0,
        sentimentBreakdown: { positive: 0, neutral: 0, negative: 0 },
        topPositives: [],
        topNegatives: [],
      };
    }

    const averageRating = reviewsData.reduce((sum, r) => sum + r.rating, 0) / totalReviews;

    const sentimentBreakdown = { positive: 0, neutral: 0, negative: 0 };
    const positiveCounts = new Map<ClassificationCategory, number>();
    const negativeCounts = new Map<ClassificationCategory, number>();

    for (const review of reviewsData) {
      const classification = review.classifications as ReviewClassification | null;
      if (!classification) continue;

      sentimentBreakdown[classification.sentiment]++;

      for (const pos of classification.positives) {
        const category = pos.category as ClassificationCategory;
        if (CLASSIFICATION_CATEGORIES.includes(category)) {
          positiveCounts.set(category, (positiveCounts.get(category) || 0) + 1);
        }
      }

      for (const neg of classification.negatives) {
        const category = neg.category as ClassificationCategory;
        if (CLASSIFICATION_CATEGORIES.includes(category)) {
          negativeCounts.set(category, (negativeCounts.get(category) || 0) + 1);
        }
      }
    }

    const topPositives = this.formatCategoryCounts(positiveCounts, classifiedReviews);
    const topNegatives = this.formatCategoryCounts(negativeCounts, classifiedReviews);

    return {
      totalReviews,
      classifiedReviews,
      averageRating: Math.round(averageRating * 10) / 10,
      sentimentBreakdown,
      topPositives,
      topNegatives,
    };
  }

  async getClassificationTrends(
    dateFrom: Date,
    dateTo: Date,
    groupBy: "day" | "week" = "day"
  ): Promise<ClassificationTrend[]> {
    const conditions = [
      eq(reviews.businessId, this.businessId),
      gte(reviews.date, dateFrom),
      lte(reviews.date, dateTo),
      this.getAccessCondition(),
    ];

    const reviewsData = await db.query.reviews.findMany({
      where: and(...conditions),
      orderBy: (reviews, { asc }) => [asc(reviews.date)],
    });

    const dateFormat = groupBy === "week" ? "week" : "day";
    const groupedData = new Map<
      string,
      {
        totalReviews: number;
        totalRating: number;
        positive: number;
        negative: number;
        neutral: number;
      }
    >();

    for (const review of reviewsData) {
      const dateKey = this.getDateKey(review.date, dateFormat);

      if (!groupedData.has(dateKey)) {
        groupedData.set(dateKey, {
          totalReviews: 0,
          totalRating: 0,
          positive: 0,
          negative: 0,
          neutral: 0,
        });
      }

      const group = groupedData.get(dateKey)!;
      group.totalReviews++;
      group.totalRating += review.rating;

      const classification = review.classifications as ReviewClassification | null;
      if (classification) {
        group[classification.sentiment]++;
      }
    }

    return Array.from(groupedData.entries())
      .map(([date, data]) => ({
        date,
        totalReviews: data.totalReviews,
        averageRating: Math.round((data.totalRating / data.totalReviews) * 10) / 10,
        positiveCount: data.positive,
        negativeCount: data.negative,
        neutralCount: data.neutral,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  async getTopCategories(
    dateFrom: Date,
    dateTo: Date,
    type: "positive" | "negative",
    limit: number = 10
  ): Promise<CategoryCount[]> {
    const conditions = [
      eq(reviews.businessId, this.businessId),
      gte(reviews.date, dateFrom),
      lte(reviews.date, dateTo),
      isNotNull(reviews.classifications),
      this.getAccessCondition(),
    ];

    const reviewsData = await db.query.reviews.findMany({
      where: and(...conditions),
    });

    const counts = new Map<ClassificationCategory, number>();

    for (const review of reviewsData) {
      const classification = review.classifications as ReviewClassification | null;
      if (!classification) continue;

      const mentions = type === "positive" ? classification.positives : classification.negatives;
      for (const mention of mentions) {
        const category = mention.category as ClassificationCategory;
        if (CLASSIFICATION_CATEGORIES.includes(category)) {
          counts.set(category, (counts.get(category) || 0) + 1);
        }
      }
    }

    return this.formatCategoryCounts(counts, reviewsData.length).slice(0, limit);
  }

  async getReviewsByCategory(
    dateFrom: Date,
    dateTo: Date,
    category: ClassificationCategory,
    type: "positive" | "negative",
    limit: number = 20
  ) {
    const conditions = [
      eq(reviews.businessId, this.businessId),
      gte(reviews.date, dateFrom),
      lte(reviews.date, dateTo),
      isNotNull(reviews.classifications),
      this.getAccessCondition(),
    ];

    const reviewsData = await db.query.reviews.findMany({
      where: and(...conditions),
      orderBy: (reviews, { desc }) => [desc(reviews.date)],
    });

    return reviewsData
      .filter((review) => {
        const classification = review.classifications as ReviewClassification | null;
        if (!classification) return false;

        const mentions = type === "positive" ? classification.positives : classification.negatives;
        return mentions.some((m) => m.category === category);
      })
      .slice(0, limit);
  }

  private formatCategoryCounts(counts: Map<ClassificationCategory, number>, total: number): CategoryCount[] {
    return Array.from(counts.entries())
      .map(([category, count]) => ({
        category,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);
  }

  private getDateKey(date: Date, format: "day" | "week"): string {
    if (format === "week") {
      const d = new Date(date);
      const day = d.getDay();
      const diff = d.getDate() - day;
      d.setDate(diff);
      return d.toISOString().split("T")[0];
    }
    return date.toISOString().split("T")[0];
  }
}
