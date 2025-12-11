"use server";

import { ReviewsController } from "@/lib/controllers/reviews.controller";
import type { ReviewCreate, ReviewUpdate } from "@/lib/types";
import { createSafeAction } from "./safe-action";
import { z } from "zod";

const ReviewFiltersSchema = z
  .object({
    ids: z.array(z.string()).optional(),
    limit: z.number().optional(),
    offset: z.number().optional(),
    sort: z
      .object({
        orderBy: z.enum(["receivedAt", "rating", "date", "replyStatus"]),
        orderDirection: z.enum(["asc", "desc"]),
      })
      .optional(),
    replyStatus: z.array(z.enum(["pending", "rejected", "posted", "failed", "quota_exceeded"])).optional(),
    rating: z.array(z.number()).optional(),
    dateFrom: z.date().optional(),
    dateTo: z.date().optional(),
  })
  .optional();

const ContextSchema = z.object({
  accountId: z.string().uuid(),
  locationId: z.string().uuid(),
});

const GetReviewsSchema = ContextSchema.extend({
  filters: ReviewFiltersSchema,
});

const ReviewIdSchema = ContextSchema.extend({
  reviewId: z.string().uuid(),
});

const UpdateReviewSchema = ReviewIdSchema.extend({
  data: z.custom<ReviewUpdate>(),
});

const PostReviewReplySchema = ReviewIdSchema.extend({
  customReply: z.string().optional(),
});

const SaveReviewDraftSchema = ReviewIdSchema.extend({
  customReply: z.string(),
});

const CreateReviewSchema = ContextSchema.extend({
  data: z.custom<Omit<ReviewCreate, "accountId" | "locationId">>(),
});

export const getReviews = createSafeAction(GetReviewsSchema, async ({ accountId, locationId, filters }, { userId }) => {
  const controller = new ReviewsController(userId, accountId, locationId);
  return controller.getReviews(filters);
});

export const getReview = createSafeAction(ReviewIdSchema, async ({ accountId, locationId, reviewId }, { userId }) => {
  const controller = new ReviewsController(userId, accountId, locationId);
  return controller.getReview(reviewId);
});

export const updateReview = createSafeAction(
  UpdateReviewSchema,
  async ({ accountId, locationId, reviewId, data }, { userId }) => {
    const controller = new ReviewsController(userId, accountId, locationId);
    return controller.updateReview(reviewId, data);
  }
);

export const generateReviewReply = createSafeAction(
  ReviewIdSchema,
  async ({ accountId, locationId, reviewId }, { userId }) => {
    const controller = new ReviewsController(userId, accountId, locationId);
    return controller.generateReply(reviewId);
  }
);

export const saveReviewDraft = createSafeAction(
  SaveReviewDraftSchema,
  async ({ accountId, locationId, reviewId, customReply }, { userId }) => {
    const controller = new ReviewsController(userId, accountId, locationId);
    return controller.saveDraft(reviewId, customReply);
  }
);

export const postReviewReply = createSafeAction(
  PostReviewReplySchema,
  async ({ accountId, locationId, reviewId, customReply }, { userId }) => {
    const controller = new ReviewsController(userId, accountId, locationId);
    const { review } = await controller.postReply(reviewId, customReply, userId);
    return review;
  }
);

export const createReview = createSafeAction(
  CreateReviewSchema,
  async ({ accountId, locationId, data }, { userId }) => {
    const controller = new ReviewsController(userId, accountId, locationId);
    const reviewData: ReviewCreate = {
      locationId,
      ...data,
    };
    return controller.createReview(reviewData);
  }
);
