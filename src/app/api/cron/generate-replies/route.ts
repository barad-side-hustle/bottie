import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { and, eq, or, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { reviews } from "@/lib/db/schema";
import { ReviewsRepository } from "@/lib/db/repositories/reviews.repository";
import { LocationsRepository } from "@/lib/db/repositories/locations.repository";
import { ReviewsController } from "@/lib/controllers/reviews.controller";
import { SubscriptionsController } from "@/lib/controllers/subscriptions.controller";
import { findLocationOwner } from "@/lib/utils/find-location-owner";
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
    const pendingWithNoDraft = and(
      eq(reviews.replyStatus, "pending"),
      sql`NOT EXISTS (
        SELECT 1 FROM review_responses rr
        WHERE rr.review_id = ${reviews.id}
        AND rr.status IN ('draft', 'posted')
      )`
    );

    const failedGeneration = and(eq(reviews.replyStatus, "failed"), eq(reviews.failureReason, "generation"));
    const failedQuota = and(eq(reviews.replyStatus, "failed"), eq(reviews.failureReason, "quota"));

    const reviewsToProcess = await db
      .select()
      .from(reviews)
      .where(or(pendingWithNoDraft, failedGeneration, failedQuota))
      .orderBy(reviews.receivedAt)
      .limit(100);

    if (reviewsToProcess.length === 0) {
      return NextResponse.json({ message: "No reviews to process", processed: 0 });
    }

    console.log(`Found ${reviewsToProcess.length} reviews to generate replies for`);

    let processed = 0;
    let failed = 0;
    const errors: { reviewId: string; error: string }[] = [];

    const locationCache = new Map<
      string,
      | {
          userId: string;
          accountId: string;
          quotaAllowed: boolean;
        }
      | "skip"
    >();

    for (const review of reviewsToProcess) {
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
              const subscriptionsController = new SubscriptionsController();
              const quotaCheck = await subscriptionsController.checkLocationQuota(review.locationId);
              locationCache.set(review.locationId, {
                userId: owner.userId,
                accountId: owner.accountId,
                quotaAllowed: quotaCheck.allowed,
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

        const { userId, accountId, quotaAllowed } = cached;

        if (!quotaAllowed) {
          const reviewsRepo = new ReviewsRepository(userId, review.locationId);
          console.log("Quota exceeded, skipping", { reviewId: review.id, locationId: review.locationId });
          await reviewsRepo.update(review.id, { replyStatus: "failed", failureReason: "quota" });
          failed++;
          continue;
        }

        const reviewsController = new ReviewsController(userId, accountId, review.locationId);

        console.log("Generating AI reply", { reviewId: review.id });
        try {
          await reviewsController.generateReply(review.id);
          console.log("AI reply generated", { reviewId: review.id });
        } catch (error) {
          console.error("Failed to generate AI reply", { reviewId: review.id, error });
          const reviewsRepo = new ReviewsRepository(userId, review.locationId);
          await reviewsRepo.update(review.id, { replyStatus: "failed", failureReason: "generation" });
          errors.push({ reviewId: review.id, error: "Generation failed" });
          failed++;
          continue;
        }

        processed++;
        console.log("Reply generated", { reviewId: review.id });
      } catch (error) {
        console.error("Unexpected error processing review", { reviewId: review.id, error });
        errors.push({ reviewId: review.id, error: String(error) });
        failed++;
      }
    }

    return NextResponse.json({
      message: "Generate-replies cron completed",
      total: reviewsToProcess.length,
      processed,
      failed,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Generate-replies cron failed:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
