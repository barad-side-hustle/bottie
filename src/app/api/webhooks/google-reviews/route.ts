import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { locations, accountLocations, type ReviewInsert, type Location } from "@/lib/db/schema";
import { getReview, starRatingToNumber, parseGoogleTimestamp } from "@/lib/google/reviews";
import { decryptToken, extractLocationId } from "@/lib/google/business-profile";
import { ReviewsRepository } from "@/lib/db/repositories/reviews.repository";
import { AccountsRepository } from "@/lib/db/repositories/accounts.repository";
import { verifyPubSubToken, getPubSubWebhookAudience } from "@/lib/google/pubsub-auth";
import { isDuplicateKeyError, getPostgresErrorCode, getPostgresErrorDetail } from "@/lib/db/error-handlers";
import { classifyReview } from "@/lib/ai/classification";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

    console.log("Searching for location with googleLocationId", locationId);

    const location = await db.query.locations.findFirst({
      where: eq(locations.googleLocationId, locationId),
    });

    if (!location) {
      console.error("No location found for googleLocationId", locationId);
      return null;
    }

    const accountLocationConnections = await db.query.accountLocations.findMany({
      where: eq(accountLocations.locationId, location.id),
      with: {
        account: {
          with: {
            userAccounts: true,
          },
        },
      },
    });

    if (!accountLocationConnections || accountLocationConnections.length === 0) {
      console.error("No account connections found for location:", location.id);
      return null;
    }

    const connectedAccounts = accountLocationConnections.filter((ac) => ac.connected);
    const accountsToCheck = connectedAccounts.length > 0 ? connectedAccounts : accountLocationConnections;

    for (const accountLocation of accountsToCheck) {
      const ownerUser = accountLocation.account.userAccounts
        .filter((ua) => ua.role === "owner")
        .sort((a, b) => {
          const dateA = a.addedAt ? new Date(a.addedAt).getTime() : 0;
          const dateB = b.addedAt ? new Date(b.addedAt).getTime() : 0;
          if (dateA !== dateB) return dateA - dateB;
          return a.userId.localeCompare(b.userId);
        })[0];

      if (ownerUser) {
        return {
          userId: ownerUser.userId,
          accountId: accountLocation.accountId,
          location: location,
          accountLocationId: accountLocation.id,
        };
      }
    }

    console.error("No owner user account found for location:", location.id);
    return null;
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

    console.log("Pub/Sub authentication successful:", {
      serviceAccount: verificationResult.email,
    });

    const body = (await request.json()) as PubSubMessage;

    console.log("Received Pub/Sub notification:", {
      messageId: body.message.messageId,
      publishTime: body.message.publishTime,
    });

    const messageData = body.message.data;
    const notificationJson = Buffer.from(messageData, "base64").toString("utf-8");
    const notification: PubSubNotificationData = JSON.parse(notificationJson);

    console.log("Parsed notification:", notification);

    const { type: notificationType, review: reviewName, location: locationName } = notification;

    if (notificationType !== "NEW_REVIEW" && notificationType !== "UPDATED_REVIEW") {
      console.log("Ignoring non-review notification:", notificationType);
      return NextResponse.json({ message: "Notification type ignored" }, { status: 200 });
    }

    const locationData = await findLocationByGoogleBusinessId(locationName);
    if (!locationData) {
      console.error("Location not found for:", locationName);
      return NextResponse.json({ error: "Location not found" }, { status: 404 });
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
    const googleReview = await getReview(
      reviewName,
      refreshToken,
      process.env.GOOGLE_CLIENT_ID!,
      process.env.GOOGLE_CLIENT_SECRET!
    );
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

          classifyReview({
            rating: newRating,
            text: newText || null,
          })
            .then((classification) => {
              reviewsRepo
                .update(existingReview.id, { classifications: classification })
                .then(() => {
                  console.log("Updated review re-classified successfully:", existingReview.id);
                })
                .catch((err) => {
                  console.error("Failed to save updated classification:", err);
                });
            })
            .catch((err) => {
              console.error("Failed to re-classify updated review:", err);
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

      classifyReview({
        rating: reviewData.rating,
        text: reviewData.text || null,
      })
        .then((classification) => {
          reviewsRepo
            .update(newReview.id, { classifications: classification })
            .then(() => {
              console.log("Review classified successfully:", {
                reviewId: newReview.id,
                sentiment: classification.sentiment,
                positives: classification.positives.length,
                negatives: classification.negatives.length,
              });
            })
            .catch((err) => {
              console.error("Failed to save classification:", {
                reviewId: newReview.id,
                error: err instanceof Error ? err.message : String(err),
              });
            });
        })
        .catch((err) => {
          console.error("Failed to classify review:", {
            reviewId: newReview.id,
            error: err instanceof Error ? err.message : String(err),
          });
        });

      const processReviewUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/internal/process-review`;
      console.log("Triggering review processing:", {
        url: processReviewUrl,
        reviewId: newReview.id,
        userId,
        accountId,
        locationId: location.id,
      });

      try {
        const response = await fetch(processReviewUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Internal-Secret": process.env.INTERNAL_API_SECRET!,
          },
          body: JSON.stringify({
            userId,
            accountId,
            locationId: location.id,
            reviewId: newReview.id,
          }),
        });

        console.log("Process-review endpoint responded:", {
          status: response.status,
          statusText: response.statusText,
          reviewId: newReview.id,
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Process-review returned error:", {
            status: response.status,
            body: errorText.substring(0, 200),
            reviewId: newReview.id,
          });
        }
      } catch (error) {
        console.error("Failed to trigger review processing:", {
          error: error instanceof Error ? error.message : String(error),
          reviewId: newReview.id,
        });
      }

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
