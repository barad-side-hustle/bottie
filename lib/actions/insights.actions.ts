"use server";

import { InsightsRepository } from "@/lib/db/repositories/insights.repository";
import { createSafeAction } from "./safe-action";
import { z } from "zod";
import type { ClassificationCategory } from "@/lib/types/classification.types";

const ContextSchema = z.object({
  locationId: z.string().uuid(),
});

const DateRangeSchema = z.object({
  dateFrom: z.coerce.date(),
  dateTo: z.coerce.date(),
});

const GetInsightsSchema = ContextSchema.merge(DateRangeSchema);

const GetTrendsSchema = ContextSchema.merge(DateRangeSchema).extend({
  groupBy: z.enum(["day", "week"]).optional(),
});

const GetReviewsByCategorySchema = ContextSchema.merge(DateRangeSchema).extend({
  category: z.string(),
  type: z.enum(["positive", "negative"]),
  limit: z.number().min(1).max(100).optional(),
});

export const getInsights = createSafeAction(GetInsightsSchema, async ({ locationId, dateFrom, dateTo }, { userId }) => {
  const repo = new InsightsRepository(userId, locationId);
  return repo.getClassificationStats(dateFrom, dateTo);
});

export const getInsightsTrends = createSafeAction(
  GetTrendsSchema,
  async ({ locationId, dateFrom, dateTo, groupBy }, { userId }) => {
    const repo = new InsightsRepository(userId, locationId);
    return repo.getClassificationTrends(dateFrom, dateTo, groupBy || "day");
  }
);

export const getReviewsByCategory = createSafeAction(
  GetReviewsByCategorySchema,
  async ({ locationId, dateFrom, dateTo, category, type, limit }, { userId }) => {
    const repo = new InsightsRepository(userId, locationId);
    return repo.getReviewsByCategory(dateFrom, dateTo, category as ClassificationCategory, type, limit || 20);
  }
);
