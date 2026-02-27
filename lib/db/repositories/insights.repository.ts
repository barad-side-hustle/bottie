import { eq, and, gte, lte, sql, count, avg, isNotNull, desc } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { reviews } from "@/lib/db/schema";
import { createLocationAccessCondition } from "./access-conditions";
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
    private locationId: string
  ) {}

  private getAccessCondition() {
    return createLocationAccessCondition(this.userId, this.locationId);
  }

  private async getClassifiedReviews(dateFrom: Date, dateTo: Date, limit?: number) {
    return db.query.reviews.findMany({
      where: and(
        eq(reviews.locationId, this.locationId),
        gte(reviews.date, dateFrom),
        lte(reviews.date, dateTo),
        isNotNull(reviews.classifications),
        this.getAccessCondition()
      ),
      columns: {
        id: true,
        classifications: true,
      },
      orderBy: desc(reviews.date),
      limit: limit ?? 2000,
    });
  }

  private countCategoriesFromReviews(
    reviewsData: { classifications: ReviewClassification | null }[],
    arrayField: "positives" | "negatives"
  ): Map<ClassificationCategory, number> {
    const categoryCounts = new Map<ClassificationCategory, number>();

    for (const review of reviewsData) {
      if (!review.classifications) continue;

      const mentions = review.classifications[arrayField];

      const uniqueCategories = new Set<ClassificationCategory>();
      for (const mention of mentions) {
        if (CLASSIFICATION_CATEGORIES.includes(mention.category)) {
          uniqueCategories.add(mention.category);
        }
      }

      for (const category of uniqueCategories) {
        const currentCount = categoryCounts.get(category) || 0;
        categoryCounts.set(category, currentCount + 1);
      }
    }

    return categoryCounts;
  }

  private formatCategoryCountsToTop(
    categoryCounts: Map<ClassificationCategory, number>,
    totalClassified: number,
    limit: number
  ): CategoryCount[] {
    return Array.from(categoryCounts.entries())
      .map(([category, count]) => ({
        category,
        count,
        percentage: totalClassified > 0 ? Math.round((count / totalClassified) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  async getClassificationStats(dateFrom: Date, dateTo: Date): Promise<ClassificationStats> {
    const statsResult = await db
      .select({
        totalReviews: count(),
        classifiedReviews: count(reviews.classifications),
        averageRating: avg(reviews.rating),
        positiveCount: sql<number>`COUNT(*) FILTER (WHERE ${reviews.classifications}->>'sentiment' = 'positive')`,
        neutralCount: sql<number>`COUNT(*) FILTER (WHERE ${reviews.classifications}->>'sentiment' = 'neutral')`,
        negativeCount: sql<number>`COUNT(*) FILTER (WHERE ${reviews.classifications}->>'sentiment' = 'negative')`,
      })
      .from(reviews)
      .where(
        and(
          eq(reviews.locationId, this.locationId),
          gte(reviews.date, dateFrom),
          lte(reviews.date, dateTo),
          this.getAccessCondition()
        )
      );

    const stats = statsResult[0];
    const totalReviews = Number(stats?.totalReviews || 0);
    const classifiedReviews = Number(stats?.classifiedReviews || 0);

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

    const classifiedReviewsData = await this.getClassifiedReviews(dateFrom, dateTo);
    const sampleSize = classifiedReviewsData.length;

    const positiveCounts = this.countCategoriesFromReviews(classifiedReviewsData, "positives");
    const negativeCounts = this.countCategoriesFromReviews(classifiedReviewsData, "negatives");

    const topPositives = this.formatCategoryCountsToTop(positiveCounts, sampleSize, 10);
    const topNegatives = this.formatCategoryCountsToTop(negativeCounts, sampleSize, 10);

    return {
      totalReviews,
      classifiedReviews,
      averageRating: Math.round(Number(stats?.averageRating || 0) * 10) / 10,
      sentimentBreakdown: {
        positive: Number(stats?.positiveCount || 0),
        neutral: Number(stats?.neutralCount || 0),
        negative: Number(stats?.negativeCount || 0),
      },
      topPositives,
      topNegatives,
    };
  }

  async getClassificationTrends(
    dateFrom: Date,
    dateTo: Date,
    groupBy: "day" | "week" = "day"
  ): Promise<ClassificationTrend[]> {
    const dateTrunc = groupBy === "week" ? "week" : "day";

    const result = await db
      .select({
        date: sql<string>`TO_CHAR(DATE_TRUNC(${sql.raw(`'${dateTrunc}'`)}, ${reviews.date}), 'YYYY-MM-DD')`,
        totalReviews: count(),
        averageRating: sql<number>`ROUND(AVG(${reviews.rating})::numeric, 1)`,
        positiveCount: sql<number>`COUNT(*) FILTER (WHERE ${reviews.classifications}->>'sentiment' = 'positive')`,
        negativeCount: sql<number>`COUNT(*) FILTER (WHERE ${reviews.classifications}->>'sentiment' = 'negative')`,
        neutralCount: sql<number>`COUNT(*) FILTER (WHERE ${reviews.classifications}->>'sentiment' = 'neutral')`,
      })
      .from(reviews)
      .where(
        and(
          eq(reviews.locationId, this.locationId),
          gte(reviews.date, dateFrom),
          lte(reviews.date, dateTo),
          this.getAccessCondition()
        )
      )
      .groupBy(sql`DATE_TRUNC(${sql.raw(`'${dateTrunc}'`)}, ${reviews.date})`)
      .orderBy(sql`DATE_TRUNC(${sql.raw(`'${dateTrunc}'`)}, ${reviews.date}) ASC`);

    return result.map((row) => ({
      date: row.date,
      totalReviews: Number(row.totalReviews),
      averageRating: Number(row.averageRating) || 0,
      positiveCount: Number(row.positiveCount),
      negativeCount: Number(row.negativeCount),
      neutralCount: Number(row.neutralCount),
    }));
  }

  async getTopCategories(
    dateFrom: Date,
    dateTo: Date,
    type: "positive" | "negative",
    limit: number = 10
  ): Promise<CategoryCount[]> {
    const classifiedReviewsData = await this.getClassifiedReviews(dateFrom, dateTo);
    const sampleSize = classifiedReviewsData.length;

    if (sampleSize === 0) {
      return [];
    }

    const categoryCounts = this.countCategoriesFromReviews(
      classifiedReviewsData,
      type === "positive" ? "positives" : "negatives"
    );

    return this.formatCategoryCountsToTop(categoryCounts, sampleSize, limit);
  }

  async getReviewsByCategory(
    dateFrom: Date,
    dateTo: Date,
    category: ClassificationCategory,
    type: "positive" | "negative",
    limit: number = 20
  ) {
    const arrayField = type === "positive" ? "positives" : "negatives";

    const result = await db.query.reviews.findMany({
      where: and(
        eq(reviews.locationId, this.locationId),
        gte(reviews.date, dateFrom),
        lte(reviews.date, dateTo),
        isNotNull(reviews.classifications),
        sql`EXISTS (
          SELECT 1 FROM jsonb_array_elements(${reviews.classifications}->${sql.raw(`'${arrayField}'`)}) as elem
          WHERE elem->>'category' = ${category}
        )`,
        this.getAccessCondition()
      ),
      orderBy: (reviews, { desc }) => [desc(reviews.date)],
      limit,
    });

    return result;
  }
}
