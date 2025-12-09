"use server";

import { InsightsRepository } from "@/lib/db/repositories/insights.repository";
import { createSafeAction } from "./safe-action";
import { z } from "zod";
import type { ClassificationCategory } from "@/lib/types/classification.types";

const ContextSchema = z.object({
  accountId: z.string().uuid(),
  businessId: z.string().uuid(),
});

const DateRangeSchema = z.object({
  dateFrom: z.coerce.date(),
  dateTo: z.coerce.date(),
});

const GetInsightsSchema = ContextSchema.merge(DateRangeSchema);

const GetTrendsSchema = ContextSchema.merge(DateRangeSchema).extend({
  groupBy: z.enum(["day", "week"]).optional(),
});

const GetTopCategoriesSchema = ContextSchema.merge(DateRangeSchema).extend({
  type: z.enum(["positive", "negative"]),
  limit: z.number().min(1).max(50).optional(),
});

const GetReviewsByCategorySchema = ContextSchema.merge(DateRangeSchema).extend({
  category: z.string(),
  type: z.enum(["positive", "negative"]),
  limit: z.number().min(1).max(100).optional(),
});

export const getInsights = createSafeAction(GetInsightsSchema, async ({ businessId, dateFrom, dateTo }, { userId }) => {
  const repo = new InsightsRepository(userId, businessId);
  return repo.getClassificationStats(dateFrom, dateTo);
});

export const getInsightsTrends = createSafeAction(
  GetTrendsSchema,
  async ({ businessId, dateFrom, dateTo, groupBy }, { userId }) => {
    const repo = new InsightsRepository(userId, businessId);
    return repo.getClassificationTrends(dateFrom, dateTo, groupBy || "day");
  }
);

export const getTopCategories = createSafeAction(
  GetTopCategoriesSchema,
  async ({ businessId, dateFrom, dateTo, type, limit }, { userId }) => {
    const repo = new InsightsRepository(userId, businessId);
    return repo.getTopCategories(dateFrom, dateTo, type, limit || 10);
  }
);

export const getReviewsByCategory = createSafeAction(
  GetReviewsByCategorySchema,
  async ({ businessId, dateFrom, dateTo, category, type, limit }, { userId }) => {
    const repo = new InsightsRepository(userId, businessId);
    return repo.getReviewsByCategory(dateFrom, dateTo, category as ClassificationCategory, type, limit || 20);
  }
);
