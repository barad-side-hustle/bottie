import { eq, and, desc, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { reviewResponses, type ReviewResponse, type ReviewResponseInsert, type Review } from "@/lib/db/schema";
import { ForbiddenError } from "@/lib/api/errors";
import { createLocationAccessCondition } from "./access-conditions";

export type ReviewResponseWithReview = ReviewResponse & {
  review: Review;
};

export class ReviewResponsesRepository {
  constructor(
    private userId: string,
    private accountId: string,
    private locationId: string
  ) {}

  private getAccessCondition() {
    return createLocationAccessCondition(this.userId, this.locationId);
  }

  async create(data: Omit<ReviewResponseInsert, "accountId" | "locationId">): Promise<ReviewResponse> {
    const accessCheck = await db
      .select({ hasAccess: sql<boolean>`${this.getAccessCondition()}` })
      .from(sql`(SELECT 1) as _dummy`);

    if (!accessCheck[0]?.hasAccess) {
      throw new ForbiddenError("Access denied");
    }

    const insertData: ReviewResponseInsert = {
      ...data,
      accountId: this.accountId,
      locationId: this.locationId,
    };

    const [created] = await db.insert(reviewResponses).values(insertData).returning();

    if (!created) throw new Error("Failed to create review response entry");

    return created;
  }

  async updateStatus(id: string, status: "draft" | "posted" | "rejected"): Promise<ReviewResponse | undefined> {
    const [updated] = await db
      .update(reviewResponses)
      .set({ status })
      .where(
        and(
          eq(reviewResponses.id, id),
          eq(reviewResponses.accountId, this.accountId),
          eq(reviewResponses.locationId, this.locationId),
          this.getAccessCondition()
        )
      )
      .returning();

    if (!updated) {
      throw new ForbiddenError("Access denied or response not found");
    }

    return updated;
  }

  async getLatestDraft(reviewId: string): Promise<ReviewResponse | undefined> {
    return await db.query.reviewResponses.findFirst({
      where: and(
        eq(reviewResponses.reviewId, reviewId),
        eq(reviewResponses.accountId, this.accountId),
        eq(reviewResponses.locationId, this.locationId),
        eq(reviewResponses.status, "draft"),
        this.getAccessCondition()
      ),
      orderBy: [desc(reviewResponses.createdAt)],
    });
  }

  async getLatestGenerated(reviewId: string): Promise<ReviewResponse | undefined> {
    return await db.query.reviewResponses.findFirst({
      where: and(
        eq(reviewResponses.reviewId, reviewId),
        eq(reviewResponses.accountId, this.accountId),
        eq(reviewResponses.locationId, this.locationId),
        eq(reviewResponses.status, "draft"),
        eq(reviewResponses.type, "ai_generated"),
        this.getAccessCondition()
      ),
      orderBy: [desc(reviewResponses.createdAt)],
    });
  }

  async getRecent(status: "draft" | "posted" | "rejected", limit: number = 5): Promise<ReviewResponseWithReview[]> {
    return await db.query.reviewResponses.findMany({
      where: and(
        eq(reviewResponses.accountId, this.accountId),
        eq(reviewResponses.locationId, this.locationId),
        eq(reviewResponses.status, status),
        this.getAccessCondition()
      ),
      orderBy: [desc(reviewResponses.createdAt)],
      limit: limit,
      with: {
        review: true,
      },
    });
  }
}
