import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { and, isNull } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { reviews } from "@/lib/db/schema";
import { ReviewsRepository } from "@/lib/db/repositories/reviews.repository";
import { classifyReview } from "@/lib/ai/classification";
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
    const reviewsToClassify = await db
      .select()
      .from(reviews)
      .where(and(isNull(reviews.classifications)))
      .orderBy(reviews.receivedAt)
      .limit(50);

    if (reviewsToClassify.length === 0) {
      return NextResponse.json({ message: "No reviews to classify", classified: 0 });
    }

    console.log(`Found ${reviewsToClassify.length} reviews to classify`);

    let classified = 0;
    let failed = 0;
    const errors: { reviewId: string; error: string }[] = [];

    const ownerCache = new Map<string, { userId: string } | "skip">();

    for (const review of reviewsToClassify) {
      try {
        if (!ownerCache.has(review.locationId)) {
          const owner = await findLocationOwner(review.locationId);
          if (!owner) {
            ownerCache.set(review.locationId, "skip");
          } else {
            ownerCache.set(review.locationId, { userId: owner.userId });
          }
        }

        const cached = ownerCache.get(review.locationId);
        if (!cached || cached === "skip") {
          errors.push({ reviewId: review.id, error: "No owner found" });
          failed++;
          continue;
        }

        const classification = await classifyReview({ rating: review.rating, text: review.text || null });
        const reviewsRepo = new ReviewsRepository(cached.userId, review.locationId);
        await reviewsRepo.update(review.id, { classifications: classification });

        classified++;
        console.log("Review classified", { reviewId: review.id, sentiment: classification.sentiment });
      } catch (error) {
        console.error("Failed to classify review", { reviewId: review.id, error });
        errors.push({ reviewId: review.id, error: String(error) });
        failed++;
      }
    }

    return NextResponse.json({
      message: "Classify-reviews cron completed",
      total: reviewsToClassify.length,
      classified,
      failed,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Classify-reviews cron failed:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
