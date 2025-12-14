import { eq, and, inArray, gte, lte, exists, desc, asc, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import {
  reviews,
  reviewResponses,
  userAccounts,
  accountLocations,
  type Review,
  type ReviewInsert,
} from "@/lib/db/schema";
import type { ReviewFilters } from "@/lib/types";
import { BaseRepository } from "./base.repository";
import { NotFoundError, ForbiddenError } from "@/lib/api/errors";
import { type ReviewResponseWithReview } from "./review-responses.repository";

export type ReviewWithLatestGeneration = Review & {
  latestAiReply?: string;
  latestAiReplyId?: string;
  latestAiReplyGeneratedBy?: string | null;
  latestAiReplyPostedBy?: string | null;
  latestAiReplyPostedAt?: Date | null;
  latestAiReplyType?: "imported" | "ai_generated" | "human_generated";
};

export class ReviewsRepository extends BaseRepository<ReviewInsert, Review, Partial<Review>> {
  constructor(
    private userId: string,
    private locationId: string
  ) {
    super();
  }

  private getAccessCondition() {
    return exists(
      db
        .select()
        .from(accountLocations)
        .innerJoin(userAccounts, eq(userAccounts.accountId, accountLocations.accountId))
        .where(and(eq(accountLocations.locationId, this.locationId), eq(userAccounts.userId, this.userId)))
    );
  }

  async get(reviewId: string): Promise<ReviewWithLatestGeneration | null> {
    const review = await db.query.reviews.findFirst({
      where: and(eq(reviews.id, reviewId), eq(reviews.locationId, this.locationId), this.getAccessCondition()),
    });

    if (!review) return null;

    const latestGen = await db.query.reviewResponses.findFirst({
      where: and(eq(reviewResponses.reviewId, reviewId), inArray(reviewResponses.status, ["draft", "posted"])),
      orderBy: [desc(reviewResponses.createdAt)],
    });

    return {
      ...review,
      latestAiReply: latestGen?.text,
      latestAiReplyId: latestGen?.id,
      latestAiReplyGeneratedBy: latestGen?.generatedBy,
      latestAiReplyPostedBy: latestGen?.postedBy,
      latestAiReplyPostedAt: latestGen?.postedAt,
      latestAiReplyType: latestGen?.type,
    };
  }

  async list(filters: Partial<ReviewFilters> = {}): Promise<ReviewWithLatestGeneration[]> {
    const conditions = [eq(reviews.locationId, this.locationId), this.getAccessCondition()];

    if (filters.replyStatus && filters.replyStatus.length > 0) {
      conditions.push(inArray(reviews.replyStatus, filters.replyStatus));
    }

    if (filters.rating && filters.rating.length > 0) {
      conditions.push(inArray(reviews.rating, filters.rating));
    }

    if (filters.ids && filters.ids.length > 0) {
      conditions.push(inArray(reviews.id, filters.ids));
    }

    if (filters.dateFrom) {
      conditions.push(gte(reviews.receivedAt, filters.dateFrom));
    }

    if (filters.dateTo) {
      conditions.push(lte(reviews.receivedAt, filters.dateTo));
    }

    if (filters.sentiment && filters.sentiment.length > 0) {
      conditions.push(sql`${reviews.classifications}->>'sentiment' IN (${sql.join(filters.sentiment, sql`, `)})`);
    }

    const limit = filters.limit || undefined;
    const offset = filters.offset || undefined;

    let orderBy;
    if (filters.sort) {
      const { orderBy: sortField, orderDirection } = filters.sort;
      const columnMap = {
        receivedAt: reviews.receivedAt,
        rating: reviews.rating,
        date: reviews.date,
        replyStatus: reviews.replyStatus,
      } as const;
      const column = columnMap[sortField as keyof typeof columnMap];
      orderBy = orderDirection === "asc" ? asc(column) : desc(column);
    } else {
      orderBy = desc(reviews.receivedAt);
    }

    const reviewsData = await db.query.reviews.findMany({
      where: and(...conditions),
      limit,
      offset,
      orderBy: orderBy,
    });

    if (reviewsData.length === 0) {
      return [];
    }

    const reviewIds = reviewsData.map((r) => r.id);

    const responses = await db.query.reviewResponses.findMany({
      where: and(inArray(reviewResponses.reviewId, reviewIds), inArray(reviewResponses.status, ["draft", "posted"])),
      orderBy: [desc(reviewResponses.createdAt)],
    });

    const responseMap = new Map<string, (typeof responses)[0]>();

    for (const resp of responses) {
      if (!responseMap.has(resp.reviewId)) {
        responseMap.set(resp.reviewId, resp);
      }
    }

    return reviewsData.map((review) => {
      const latestGen = responseMap.get(review.id);
      return {
        ...review,
        latestAiReply: latestGen?.text,
        latestAiReplyId: latestGen?.id,
        latestAiReplyGeneratedBy: latestGen?.generatedBy,
        latestAiReplyPostedBy: latestGen?.postedBy,
        latestAiReplyPostedAt: latestGen?.postedAt,
        latestAiReplyType: latestGen?.type,
      };
    });
  }

  async create(data: ReviewInsert): Promise<Review> {
    const accessCheck = await db
      .select({ hasAccess: sql<boolean>`${this.getAccessCondition()}` })
      .from(sql`(SELECT 1) as _dummy`);

    if (!accessCheck[0]?.hasAccess) {
      throw new ForbiddenError("Access denied");
    }

    const reviewData: ReviewInsert = {
      ...data,
      locationId: this.locationId,
      replyStatus: data.replyStatus || "pending",
    };

    const [created] = await db.insert(reviews).values(reviewData).returning();

    if (!created) throw new Error("Failed to create review");

    return created;
  }

  async update(reviewId: string, data: Partial<Review>): Promise<Review> {
    const [updated] = await db
      .update(reviews)
      .set({ ...data, updateTime: new Date() })
      .where(and(eq(reviews.id, reviewId), eq(reviews.locationId, this.locationId), this.getAccessCondition()))
      .returning();

    if (!updated) {
      throw new NotFoundError("Review not found or access denied");
    }

    return updated;
  }

  async delete(reviewId: string): Promise<void> {
    const [deleted] = await db
      .delete(reviews)
      .where(and(eq(reviews.id, reviewId), eq(reviews.locationId, this.locationId), this.getAccessCondition()))
      .returning();

    if (!deleted) {
      throw new NotFoundError("Review not found or access denied");
    }
  }

  async markAsPosted(reviewId: string): Promise<Review> {
    return this.update(reviewId, {
      replyStatus: "posted",
    });
  }

  async markAsRejected(reviewId: string): Promise<Review> {
    return this.update(reviewId, {
      replyStatus: "rejected",
    });
  }

  async findByGoogleReviewId(googleReviewId: string): Promise<Review | null> {
    const result = await db.query.reviews.findFirst({
      where: and(
        eq(reviews.googleReviewId, googleReviewId),
        eq(reviews.locationId, this.locationId),
        this.getAccessCondition()
      ),
    });

    return result ?? null;
  }

  async getRecentPosted(limit: number = 5): Promise<ReviewResponseWithReview[]> {
    return await db.query.reviewResponses.findMany({
      where: and(
        eq(reviewResponses.locationId, this.locationId),
        eq(reviewResponses.status, "posted"),
        this.getAccessCondition()
      ),
      orderBy: [desc(reviewResponses.postedAt)],
      limit,
      with: {
        review: true,
      },
    });
  }
}
