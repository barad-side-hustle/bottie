import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { and, eq, or, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { reviews } from "@/lib/db/schema";
import { ReviewsRepository } from "@/lib/db/repositories/reviews.repository";
import { LocationsRepository } from "@/lib/db/repositories/locations.repository";
import { AccountsRepository } from "@/lib/db/repositories/accounts.repository";
import { ReviewsController } from "@/lib/controllers/reviews.controller";
import { findLocationOwner } from "@/lib/utils/find-location-owner";
import type { StarConfig } from "@/lib/types";
import { env } from "@/lib/env";

export const maxDuration = 300;

function secureCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const expected = `Bearer ${env.CRON_SECRET}`;
  if (!authHeader || !secureCompare(authHeader, expected)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const pendingWithDraft = and(
      eq(reviews.replyStatus, "pending"),
      sql`EXISTS (
        SELECT 1 FROM review_responses rr
        WHERE rr.review_id = ${reviews.id}
        AND rr.status = 'draft'
      )`
    );

    const failedPosting = and(eq(reviews.replyStatus, "failed"), eq(reviews.failureReason, "posting"));

    const reviewsToPost = await db
      .select()
      .from(reviews)
      .where(or(pendingWithDraft, failedPosting))
      .orderBy(reviews.receivedAt)
      .limit(50);

    if (reviewsToPost.length === 0) {
      return NextResponse.json({ message: "No replies to post", posted: 0 });
    }

    console.log(`Found ${reviewsToPost.length} reviews to post replies for`);

    let posted = 0;
    let skipped = 0;
    let failed = 0;
    const errors: { reviewId: string; error: string }[] = [];

    const locationCache = new Map<
      string,
      | {
          userId: string;
          accountId: string;
          location: Awaited<ReturnType<LocationsRepository["get"]>>;
        }
      | "skip"
    >();

    for (const review of reviewsToPost) {
      try {
        if (!locationCache.has(review.locationId)) {
          const owner = await findLocationOwner(review.locationId);
          if (!owner) {
            console.error("No owner found for location", { locationId: review.locationId });
            locationCache.set(review.locationId, "skip");
          } else {
            const locationsRepo = new LocationsRepository(owner.userId);
            const location = await locationsRepo.get(review.locationId);
            if (!location) {
              console.error("Location not found", { locationId: review.locationId });
              locationCache.set(review.locationId, "skip");
            } else {
              locationCache.set(review.locationId, {
                userId: owner.userId,
                accountId: owner.accountId,
                location,
              });
            }
          }
        }

        const cached = locationCache.get(review.locationId);
        if (!cached || cached === "skip") {
          errors.push({ reviewId: review.id, error: "Location not found or no owner" });
          failed++;
          continue;
        }

        const { userId, accountId, location } = cached;
        const starConfig: StarConfig = location!.starConfigs[review.rating as 1 | 2 | 3 | 4 | 5];

        if (!starConfig.autoReply) {
          skipped++;
          continue;
        }

        const accountsRepo = new AccountsRepository(userId);
        const account = await accountsRepo.get(accountId);
        const encryptedToken = account?.googleRefreshToken;

        if (!encryptedToken) {
          console.error("Cannot auto-post: no refresh token", { reviewId: review.id });
          const reviewsRepo = new ReviewsRepository(userId, review.locationId);
          await reviewsRepo.update(review.id, { replyStatus: "failed", failureReason: "posting" });
          failed++;
          continue;
        }

        const reviewsController = new ReviewsController(userId, accountId, review.locationId);

        try {
          await reviewsController.postReply(review.id);
          console.log("Reply posted to Google", { reviewId: review.id });
          posted++;
        } catch (error) {
          if (error instanceof Error && error.message === "REVIEW_DELETED_FROM_GOOGLE") {
            console.log("Review was deleted from Google, removed from DB", { reviewId: review.id });
            posted++;
            continue;
          }
          console.error("Failed to post reply", { reviewId: review.id, error });
          const reviewsRepo = new ReviewsRepository(userId, review.locationId);
          await reviewsRepo.update(review.id, { replyStatus: "failed", failureReason: "posting" });
          errors.push({ reviewId: review.id, error: "Posting failed" });
          failed++;
        }
      } catch (error) {
        console.error("Unexpected error posting review reply", { reviewId: review.id, error });
        errors.push({ reviewId: review.id, error: String(error) });
        failed++;
      }
    }

    return NextResponse.json({
      message: "Post-replies cron completed",
      total: reviewsToPost.length,
      posted,
      skipped,
      failed,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Post-replies cron failed:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
