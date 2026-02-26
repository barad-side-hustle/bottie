import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { and, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { reviews, reviewResponses } from "@/lib/db/schema";
import { ReviewsRepository } from "@/lib/db/repositories/reviews.repository";
import { LocationsRepository } from "@/lib/db/repositories/locations.repository";
import { findLocationOwner } from "@/lib/utils/find-location-owner";
import { sendReviewNotifications } from "@/lib/utils/review-notifications";
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
    const hasResponse = and(
      inArray(reviews.replyStatus, ["pending", "posted"]),
      sql`EXISTS (
        SELECT 1 FROM review_responses rr
        WHERE rr.review_id = ${reviews.id}
        AND rr.status IN ('draft', 'posted')
      )`
    );

    const isFailed = eq(reviews.replyStatus, "failed");

    const reviewsToNotify = await db
      .select()
      .from(reviews)
      .where(and(eq(reviews.notificationSent, false), sql`(${hasResponse} OR ${isFailed})`))
      .orderBy(reviews.receivedAt)
      .limit(50);

    if (reviewsToNotify.length === 0) {
      return NextResponse.json({ message: "No notifications to send", sent: 0 });
    }

    console.log(`Found ${reviewsToNotify.length} reviews needing notifications`);

    let sent = 0;
    let failed = 0;
    const errors: { reviewId: string; error: string }[] = [];

    const locationCache = new Map<
      string,
      | {
          userId: string;
          locationName: string;
        }
      | "skip"
    >();

    for (const review of reviewsToNotify) {
      try {
        if (!locationCache.has(review.locationId)) {
          const owner = await findLocationOwner(review.locationId);
          if (!owner) {
            locationCache.set(review.locationId, "skip");
          } else {
            const locationsRepo = new LocationsRepository(owner.userId);
            const location = await locationsRepo.get(review.locationId);
            if (!location) {
              locationCache.set(review.locationId, "skip");
            } else {
              locationCache.set(review.locationId, {
                userId: owner.userId,
                locationName: location.name,
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

        const { userId, locationName } = cached;

        let aiReply: string | undefined;

        if (review.replyStatus !== "failed") {
          const [latestResponse] = await db
            .select({ text: reviewResponses.text })
            .from(reviewResponses)
            .where(and(eq(reviewResponses.reviewId, review.id), inArray(reviewResponses.status, ["draft", "posted"])))
            .orderBy(sql`${reviewResponses.createdAt} DESC`)
            .limit(1);

          if (!latestResponse) {
            errors.push({ reviewId: review.id, error: "No response found" });
            failed++;
            continue;
          }

          aiReply = latestResponse.text;
        }

        await sendReviewNotifications({
          reviewId: review.id,
          locationId: review.locationId,
          locationName,
          reviewerName: review.name,
          reviewRating: review.rating,
          reviewText: review.text || "",
          aiReply,
          replyStatus: review.replyStatus as "pending" | "posted" | "failed",
        });

        const reviewsRepo = new ReviewsRepository(userId, review.locationId);
        await reviewsRepo.update(review.id, { notificationSent: true });

        sent++;
        console.log("Notification sent", { reviewId: review.id });
      } catch (error) {
        console.error("Failed to send notification", { reviewId: review.id, error });
        errors.push({ reviewId: review.id, error: String(error) });
        failed++;
      }
    }

    return NextResponse.json({
      message: "Notifications cron completed",
      total: reviewsToNotify.length,
      sent,
      failed,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Send-notifications cron failed:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
