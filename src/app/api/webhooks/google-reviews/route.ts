import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { locations, type ReviewInsert, type Location } from "@/lib/db/schema";
import { getReview, starRatingToNumber, parseGoogleTimestamp } from "@/lib/google/reviews";
import { decryptToken, extractLocationId } from "@/lib/google/business-profile";
import { ReviewsRepository } from "@/lib/db/repositories/reviews.repository";
import { AccountsRepository } from "@/lib/db/repositories/accounts.repository";
import { verifyPubSubToken, getPubSubWebhookAudience } from "@/lib/google/pubsub-auth";
import { isDuplicateKeyError, getPostgresErrorCode, getPostgresErrorDetail } from "@/lib/db/error-handlers";
import { findLocationOwner } from "@/lib/utils/find-location-owner";
import { env } from "@/lib/env";

export const runtime = "nodejs";

interface PubSubMessage {
  message: {
    data: string;
    messageId: string;
    publishTime: string;
  };
  subscription: string;
}

interface PubSubNotificationData {
  type: "NEW_REVIEW" | "UPDATED_REVIEW";
  review: string;
  location: string;
}

interface LocationLookupResult {
  userId: string;
  accountId: string;
  location: Location;
  accountLocationId: string;
}

async function findLocationByGoogleBusinessId(googleBusinessId: string): Promise<LocationLookupResult | null> {
  try {
    const locationId = extractLocationId(googleBusinessId);
    if (!locationId) {
      console.error("Could not extract location ID from:", googleBusinessId);
      return null;
    }

    const location = await db.query.locations.findFirst({
      where: eq(locations.googleLocationId, locationId),
    });

    if (!location) {
      console.log("Skipping untracked location:", locationId);
      return null;
    }

    const owner = await findLocationOwner(location.id);
    if (!owner) {
      console.error("No owner user account found for location:", location.id);
      return null;
    }

    return {
      userId: owner.userId,
      accountId: owner.accountId,
      location,
      accountLocationId: owner.accountLocationId,
    };
  } catch (error) {
    console.error("Error finding location:", error);
    return null;
  }
}

async function getAccountRefreshToken(userId: string, accountId: string): Promise<string | null> {
  try {
    const accountsRepo = new AccountsRepository(userId);
    const account = await accountsRepo.get(accountId);

    if (!account) {
      console.error("Account not found", { userId, accountId });
      return null;
    }

    return account.googleRefreshToken || null;
  } catch (error) {
    console.error("Error fetching account refresh token:", error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const expectedAudience = getPubSubWebhookAudience();

    const verificationResult = await verifyPubSubToken(authHeader, expectedAudience);

    if (!verificationResult.valid) {
      console.error("Pub/Sub authentication failed:", verificationResult.error);
      return NextResponse.json({ error: "Unauthorized", details: verificationResult.error }, { status: 401 });
    }

    const body = (await request.json()) as PubSubMessage;

    const messageData = body.message.data;
    const notificationJson = Buffer.from(messageData, "base64").toString("utf-8");
    const notification: PubSubNotificationData = JSON.parse(notificationJson);

    console.log("Webhook received:", {
      messageId: body.message.messageId,
      type: notification.type,
      location: notification.location,
    });

    const { type: notificationType, review: reviewName, location: locationName } = notification;

    if (notificationType !== "NEW_REVIEW" && notificationType !== "UPDATED_REVIEW") {
      console.log("Ignoring non-review notification:", notificationType);
      return NextResponse.json({ message: "Notification type ignored" }, { status: 200 });
    }

    const locationData = await findLocationByGoogleBusinessId(locationName);
    if (!locationData) {
      console.log("Notification ignored: untracked location", locationName);
      return NextResponse.json({ message: "Location not tracked" }, { status: 200 });
    }

    const { userId, accountId, location, accountLocationId } = locationData;
    console.log("Found location:", {
      userId,
      accountId,
      locationId: location.id,
      locationName: location.name,
      accountLocationId,
    });

    const encryptedToken = await getAccountRefreshToken(userId, accountId);
    if (!encryptedToken) {
      console.error("No refresh token found for account:", accountId);
      return NextResponse.json({ error: "No refresh token found" }, { status: 400 });
    }

    const refreshToken = await decryptToken(encryptedToken);

    console.log("Fetching review from Google API:", reviewName);
    const googleReview = await getReview(reviewName, refreshToken, env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET);
    console.log("Fetched Google review:", {
      reviewId: googleReview.reviewId,
      rating: googleReview.starRating,
      reviewer: googleReview.reviewer.displayName,
    });

    const reviewsRepo = new ReviewsRepository(userId, location.id);
    const existingReview = await reviewsRepo.findByGoogleReviewId(googleReview.reviewId);

    if (existingReview) {
      if (notificationType === "UPDATED_REVIEW") {
        try {
          const newRating = starRatingToNumber(googleReview.starRating);
          const newText = googleReview.comment || "";

          const updatedReview = await reviewsRepo.update(existingReview.id, {
            rating: newRating,
            text: newText,
            updateTime: parseGoogleTimestamp(googleReview.updateTime),
            name: googleReview.reviewer.displayName,
            photoUrl: googleReview.reviewer.profilePhotoUrl || null,
            isAnonymous: googleReview.reviewer.isAnonymous || false,
          });

          console.log("Review updated successfully:", updatedReview.id);
          return NextResponse.json(
            {
              message: "Review updated",
              reviewId: updatedReview.id,
            },
            { status: 200 }
          );
        } catch (error) {
          console.error("Failed to update review:", error);
          return NextResponse.json({ error: "Failed to update review" }, { status: 500 });
        }
      }

      console.log("Review already exists, skipping:", existingReview.id);
      return NextResponse.json({ message: "Review already exists" }, { status: 200 });
    }

    const reviewData: ReviewInsert = {
      locationId: location.id,
      googleReviewId: googleReview.reviewId,
      googleReviewName: googleReview.name,
      name: googleReview.reviewer.displayName,
      photoUrl: googleReview.reviewer.profilePhotoUrl || null,
      rating: starRatingToNumber(googleReview.starRating),
      text: googleReview.comment || "",
      date: parseGoogleTimestamp(googleReview.createTime),
      updateTime: parseGoogleTimestamp(googleReview.updateTime),
      receivedAt: new Date(),
      isAnonymous: googleReview.reviewer.isAnonymous || false,
      replyStatus: "pending",
    };

    console.log("Creating new review in database");
    try {
      const newReview = await reviewsRepo.create(reviewData);
      console.log("Review created successfully:", newReview.id);

      return NextResponse.json(
        {
          message: "Review received successfully",
          reviewId: newReview.id,
        },
        { status: 200 }
      );
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        const errorDetail = getPostgresErrorDetail(error);
        console.warn("Race condition detected: Review already inserted by another process", {
          googleReviewId: googleReview.reviewId,
          locationId: location.id,
          userId,
          accountId,
          detail: errorDetail,
        });
        return NextResponse.json({ message: "Review already exists" }, { status: 200 });
      }

      console.error("Unexpected database error when creating review:", {
        googleReviewId: googleReview.reviewId,
        locationId: location.id,
        errorCode: getPostgresErrorCode(error),
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  } catch (error) {
    console.error("Error processing Google review notification:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
