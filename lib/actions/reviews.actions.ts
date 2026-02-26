"use server";

import { cache } from "react";
import { ReviewsController } from "@/lib/controllers/reviews.controller";
import { createSafeAction } from "./safe-action";
import { findLocationOwner } from "@/lib/utils/find-location-owner";
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
    replyStatus: z.array(z.enum(["pending", "posted", "failed"])).optional(),
    rating: z.array(z.number()).optional(),
    sentiment: z.array(z.enum(["positive", "neutral", "negative"])).optional(),
    dateFrom: z.date().optional(),
    dateTo: z.date().optional(),
  })
  .optional();

const ContextSchema = z.object({
  locationId: z.string().uuid(),
});

const GetReviewsSchema = ContextSchema.extend({
  filters: ReviewFiltersSchema,
});

const ReviewIdSchema = ContextSchema.extend({
  reviewId: z.string().uuid(),
});

const PostReviewReplySchema = ReviewIdSchema.extend({
  customReply: z.string().optional(),
});

const SaveReviewDraftSchema = ReviewIdSchema.extend({
  customReply: z.string(),
});

const SetFeedbackSchema = ContextSchema.extend({
  responseId: z.string().uuid(),
  feedback: z.enum(["liked", "disliked"]).nullable(),
  comment: z.string().max(500).optional(),
});

const resolveAccountId = cache(async (locationId: string): Promise<string> => {
  const owner = await findLocationOwner(locationId);
  if (!owner) throw new Error("No owner found for location");
  return owner.accountId;
});

export const getReviews = createSafeAction(GetReviewsSchema, async ({ locationId, filters }, { userId }) => {
  const accountId = await resolveAccountId(locationId);
  const controller = new ReviewsController(userId, accountId, locationId);
  return controller.getReviews(filters);
});

export const getReview = createSafeAction(ReviewIdSchema, async ({ locationId, reviewId }, { userId }) => {
  const accountId = await resolveAccountId(locationId);
  const controller = new ReviewsController(userId, accountId, locationId);
  return controller.getReview(reviewId);
});

export const generateReviewReply = createSafeAction(ReviewIdSchema, async ({ locationId, reviewId }, { userId }) => {
  const accountId = await resolveAccountId(locationId);
  const controller = new ReviewsController(userId, accountId, locationId);
  return controller.generateReply(reviewId);
});

export const saveReviewDraft = createSafeAction(
  SaveReviewDraftSchema,
  async ({ locationId, reviewId, customReply }, { userId }) => {
    const accountId = await resolveAccountId(locationId);
    const controller = new ReviewsController(userId, accountId, locationId);
    return controller.saveDraft(reviewId, customReply);
  }
);

export const postReviewReply = createSafeAction(
  PostReviewReplySchema,
  async ({ locationId, reviewId, customReply }, { userId }) => {
    const accountId = await resolveAccountId(locationId);
    const controller = new ReviewsController(userId, accountId, locationId);
    const { review } = await controller.postReply(reviewId, customReply, userId);
    return review;
  }
);

export const setReviewResponseFeedback = createSafeAction(
  SetFeedbackSchema,
  async ({ locationId, responseId, feedback, comment }, { userId }) => {
    const accountId = await resolveAccountId(locationId);
    const controller = new ReviewsController(userId, accountId, locationId);
    return controller.setFeedback(responseId, feedback, comment);
  }
);
