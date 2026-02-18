import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { ReviewsRepository } from "@/lib/db/repositories/reviews.repository";
import { LocationsRepository } from "@/lib/db/repositories/locations.repository";
import { AccountsRepository } from "@/lib/db/repositories/accounts.repository";
import { UsersConfigsRepository } from "@/lib/db/repositories/users-configs.repository";
import { SubscriptionsController } from "@/lib/controllers/subscriptions.controller";
import { ReviewsController } from "@/lib/controllers/reviews.controller";
import type { ReplyStatus, StarConfig } from "@/lib/types";
import type { ReviewNotificationEmailProps } from "@/lib/emails/review-notification";
import { env } from "@/lib/env";
import { sendEmail } from "@/lib/utils/email-service";

export const runtime = "nodejs";
export const maxDuration = 60;

interface ProcessReviewRequest {
  userId: string;
  accountId: string;
  locationId: string;
  reviewId: string;
}

function secureCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export async function POST(request: NextRequest) {
  try {
    const isTestMode = process.env.NODE_ENV === "test";

    if (!isTestMode) {
      const internalSecret = request.headers.get("X-Internal-Secret");

      if (!internalSecret) {
        console.error("Unauthorized internal API call: X-Internal-Secret header missing");
        return NextResponse.json({ error: "Unauthorized: Missing authentication header" }, { status: 401 });
      }

      if (!secureCompare(internalSecret, env.INTERNAL_API_SECRET)) {
        console.error("Forbidden internal API call: X-Internal-Secret header invalid");
        return NextResponse.json({ error: "Forbidden: Invalid authentication credentials" }, { status: 403 });
      }
    }

    const body = (await request.json()) as ProcessReviewRequest;
    const { userId, accountId, locationId, reviewId } = body;

    console.log("Processing review", {
      userId,
      accountId,
      locationId,
      reviewId,
    });

    const reviewsRepo = new ReviewsRepository(userId, locationId);
    const locationsRepo = new LocationsRepository(userId);
    const accountsRepo = new AccountsRepository(userId);
    const reviewsController = new ReviewsController(userId, accountId, locationId);

    const review = await reviewsRepo.get(reviewId);
    if (!review) {
      console.error("Review not found", { reviewId });
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    const location = await locationsRepo.get(locationId);
    if (!location) {
      console.error("Location not found", { locationId });
      return NextResponse.json({ error: "Location not found" }, { status: 404 });
    }

    const subscriptionsController = new SubscriptionsController();
    const quotaCheck = await subscriptionsController.checkReviewQuota(userId);

    if (!quotaCheck.allowed) {
      console.log("User has exceeded review quota", {
        userId,
        reviewId,
        currentCount: quotaCheck.currentCount,
        limit: quotaCheck.limit,
      });

      await reviewsRepo.update(reviewId, {
        replyStatus: "quota_exceeded",
      });

      console.log("Review saved without AI reply due to quota limit", { reviewId });
      return NextResponse.json(
        {
          message: "Review saved but quota exceeded",
          quotaExceeded: true,
        },
        { status: 200 }
      );
    }

    console.log("Quota check passed", {
      userId,
      reviewId,
      currentCount: quotaCheck.currentCount,
      limit: quotaCheck.limit,
    });

    const starConfig: StarConfig = location.starConfigs[review.rating as 1 | 2 | 3 | 4 | 5];

    console.log("Generating AI reply", { reviewId });
    let aiReply: string;
    try {
      const result = await reviewsController.generateReply(reviewId);
      aiReply = result.aiReply;
      console.log("AI reply generated successfully", { reviewId });
    } catch (error) {
      console.error("Failed to generate AI reply", { error });
      await reviewsRepo.update(reviewId, {
        replyStatus: "failed",
      });
      return NextResponse.json(
        {
          error: "Failed to generate AI reply",
        },
        { status: 500 }
      );
    }

    let replyStatus: ReplyStatus = "pending";

    if (starConfig.autoReply) {
      const account = await accountsRepo.get(accountId);
      const encryptedToken = account?.googleRefreshToken;

      if (!encryptedToken) {
        console.error("Cannot auto-post: no refresh token available");
        await reviewsRepo.update(reviewId, {
          replyStatus: "failed",
        });
        replyStatus = "failed";
      } else {
        try {
          await reviewsController.postReply(reviewId);
          console.log("AI reply auto-posted to Google", { reviewId });
          replyStatus = "posted";
        } catch (error) {
          console.error("Failed to post reply to Google:", {
            reviewId,
            error,
          });

          await reviewsRepo.update(reviewId, {
            replyStatus: "failed",
          });

          replyStatus = "failed";
        }
      }
    } else {
      await reviewsRepo.update(reviewId, {
        replyStatus: "pending",
      });
      console.log("AI reply awaiting approval", { reviewId });
    }

    if (replyStatus === "pending" || replyStatus === "posted") {
      try {
        console.log("Sending email notifications to all opted-in users connected to location", {
          reviewId,
          locationId,
          replyStatus,
        });

        const { db } = await import("@/lib/db/client");
        const { accountLocations, userAccounts } = await import("@/lib/db/schema");
        const { eq, inArray } = await import("drizzle-orm");

        const locationConnections = await db.query.accountLocations.findMany({
          where: eq(accountLocations.locationId, locationId),
        });

        const accountIds = [...new Set(locationConnections.map((lc) => lc.accountId))];

        const allUserAccounts = await db.query.userAccounts.findMany({
          where: inArray(userAccounts.accountId, accountIds),
        });

        const uniqueUserIds = [...new Set(allUserAccounts.map((ua) => ua.userId))];

        console.log(`Found ${uniqueUserIds.length} unique users connected to location ${locationId}`);

        const usersConfigsRepo = new UsersConfigsRepository();
        const { user: userTable } = await import("@/lib/db/schema/auth.schema");
        const { eq: eqOp } = await import("drizzle-orm");

        const { default: ReviewNotificationEmailComponent } = await import("@/lib/emails/review-notification");

        const emailPromises = uniqueUserIds.map(async (currentUserId) => {
          const userConfig = await usersConfigsRepo.getOrCreate(currentUserId);

          if (!userConfig.configs.EMAIL_ON_NEW_REVIEW) {
            console.log(`User ${currentUserId} has email notifications disabled, skipping`);
            return;
          }

          const [userData] = await db
            .select({ email: userTable.email, name: userTable.name })
            .from(userTable)
            .where(eqOp(userTable.id, currentUserId))
            .limit(1);

          if (!userData) {
            console.error("User not found", { userId: currentUserId });
            return;
          }

          const recipientEmail = userData.email;
          const recipientName = userData.name || userData.email;

          if (!recipientEmail) {
            console.error("User email not found", { userId: currentUserId });
            return;
          }

          const locale = "en";
          const status = replyStatus as "pending" | "posted";

          const reviewPageUrl = `${env.NEXT_PUBLIC_APP_URL}/${locale}/dashboard/accounts/${accountId}/locations/${location.id}/reviews/${reviewId}`;

          const emailProps: ReviewNotificationEmailProps = {
            title: "New Review Received",
            greeting: `Hi ${recipientName || recipientEmail},`,
            body: "You received a new review for",
            businessName: location.name,
            noReviewText: "No review text provided",
            aiReplyHeader: "AI Generated Reply",
            statusText: status === "pending" ? "Pending Approval" : "Posted",
            viewReviewButton: "View Review",
            footer: "You're receiving this email because you enabled notifications for new reviews",
            reviewerName: review.name,
            rating: review.rating,
            reviewText: review.text || "",
            aiReply,
            status,
            reviewPageUrl,
          };

          const emailComponent = <ReviewNotificationEmailComponent {...emailProps} />;
          const subject = `New ${review.rating}-star review for ${location.name}`;

          const result = await sendEmail(recipientEmail, subject, emailComponent);

          if (result.success) {
            console.log("Email sent successfully", {
              userId: currentUserId,
              reviewId,
              replyStatus,
              locale,
            });
          } else {
            console.error("Failed to send email to user", {
              userId: currentUserId,
              reviewId,
              error: result.error,
            });
          }
        });

        const results = await Promise.allSettled(emailPromises);
        const failures = results.filter((r) => r.status === "rejected");
        if (failures.length > 0) {
          console.error(`${failures.length} email(s) failed to send`, {
            reviewId,
            errors: failures.map((f) => (f as PromiseRejectedResult).reason),
          });
        }

        console.log("Finished sending email notifications to all opted-in users");
      } catch (error) {
        console.error("Failed to send email notifications", { reviewId, error });
      }
    }

    console.log("Review processed successfully", { reviewId, replyStatus });

    return NextResponse.json(
      {
        message: "Review processed successfully",
        reviewId,
        replyStatus,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing review", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
