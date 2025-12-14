import { eq, and, gte, lte, sql, count, avg, isNotNull } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { reviews, accountLocations, userAccounts } from "@/lib/db/schema";
import type {
  ClassificationStats,
  CategoryCount,
  ClassificationTrend,
  ClassificationCategory,
} from "@/lib/types/classification.types";
import { CLASSIFICATION_CATEGORIES } from "@/lib/types/classification.types";

export class InsightsRepository {
  constructor(
    private userId: string,
    private locationId: string
  ) {}

  private getAccessCondition() {
    return sql`EXISTS (
      SELECT 1 FROM ${accountLocations} al
      INNER JOIN ${userAccounts} ua ON ua.account_id = al.account_id
      WHERE al.location_id = ${this.locationId}
      AND ua.user_id = ${this.userId}
    )`;
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

    const [positivesResult, negativesResult] = await Promise.all([
      db.execute(sql`
        SELECT
          elem->>'category' as category,
          COUNT(*)::int as count
        FROM ${reviews},
          jsonb_array_elements(${reviews.classifications}->'positives') as elem
        WHERE ${reviews.locationId} = ${this.locationId}
          AND ${reviews.date} >= ${dateFrom}
          AND ${reviews.date} <= ${dateTo}
          AND ${reviews.classifications} IS NOT NULL
          AND ${this.getAccessCondition()}
        GROUP BY elem->>'category'
        ORDER BY count DESC
        LIMIT 10
      `),
      db.execute(sql`
        SELECT
          elem->>'category' as category,
          COUNT(*)::int as count
        FROM ${reviews},
          jsonb_array_elements(${reviews.classifications}->'negatives') as elem
        WHERE ${reviews.locationId} = ${this.locationId}
          AND ${reviews.date} >= ${dateFrom}
          AND ${reviews.date} <= ${dateTo}
          AND ${reviews.classifications} IS NOT NULL
          AND ${this.getAccessCondition()}
        GROUP BY elem->>'category'
        ORDER BY count DESC
        LIMIT 10
      `),
    ]);

    const topPositives = this.formatCategoryResults(
      positivesResult as unknown as { category: string; count: number }[],
      classifiedReviews
    );
    const topNegatives = this.formatCategoryResults(
      negativesResult as unknown as { category: string; count: number }[],
      classifiedReviews
    );

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
    const arrayField = type === "positive" ? "positives" : "negatives";

    const totalResult = await db
      .select({ count: count() })
      .from(reviews)
      .where(
        and(
          eq(reviews.locationId, this.locationId),
          gte(reviews.date, dateFrom),
          lte(reviews.date, dateTo),
          isNotNull(reviews.classifications),
          this.getAccessCondition()
        )
      );

    const totalClassified = Number(totalResult[0]?.count || 0);

    const result = await db.execute(sql`
      SELECT
        elem->>'category' as category,
        COUNT(*)::int as count
      FROM ${reviews},
        jsonb_array_elements(${reviews.classifications}->${sql.raw(`'${arrayField}'`)}) as elem
      WHERE ${reviews.locationId} = ${this.locationId}
        AND ${reviews.date} >= ${dateFrom}
        AND ${reviews.date} <= ${dateTo}
        AND ${reviews.classifications} IS NOT NULL
        AND ${this.getAccessCondition()}
      GROUP BY elem->>'category'
      ORDER BY count DESC
      LIMIT ${limit}
    `);

    return (result as unknown as { category: string; count: number }[])
      .filter((row) => CLASSIFICATION_CATEGORIES.includes(row.category as ClassificationCategory))
      .map((row) => ({
        category: row.category as ClassificationCategory,
        count: Number(row.count),
        percentage: totalClassified > 0 ? Math.round((Number(row.count) / totalClassified) * 100) : 0,
      }));
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

  private formatCategoryResults(rows: { category: string; count: number }[], totalClassified: number): CategoryCount[] {
    return rows
      .filter((row) => CLASSIFICATION_CATEGORIES.includes(row.category as ClassificationCategory))
      .map((row) => ({
        category: row.category as ClassificationCategory,
        count: Number(row.count),
        percentage: totalClassified > 0 ? Math.round((Number(row.count) / totalClassified) * 100) : 0,
      }));
  }
}
