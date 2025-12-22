import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Resend } from "resend";
import { ReviewsRepository } from "@/lib/db/repositories/reviews.repository";
import { LocationsRepository } from "@/lib/db/repositories/locations.repository";
import { AccountsRepository } from "@/lib/db/repositories/accounts.repository";
import { UsersConfigsRepository } from "@/lib/db/repositories/users-configs.repository";
import { SubscriptionsController } from "@/lib/controllers/subscriptions.controller";
import { ReviewsController } from "@/lib/controllers/reviews.controller";
import type { ReplyStatus, StarConfig } from "@/lib/types";
import type { ReviewNotificationEmailProps } from "@/lib/emails/review-notification";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

interface ProcessReviewRequest {
  userId: string;
  accountId: string;
  locationId: string;
  reviewId: string;
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

      if (internalSecret !== process.env.INTERNAL_API_SECRET) {
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
        replyStatus: "quota_exceeded" as ReplyStatus,
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
        replyStatus: "failed" as ReplyStatus,
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
          replyStatus: "failed" as ReplyStatus,
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
            replyStatus: "failed" as ReplyStatus,
          });

          replyStatus = "failed";
        }
      }
    } else {
      await reviewsRepo.update(reviewId, {
        replyStatus: "pending" as ReplyStatus,
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
        const { eq } = await import("drizzle-orm");

        const locationConnections = await db.query.accountLocations.findMany({
          where: eq(accountLocations.locationId, locationId),
        });

        const accountIds = [...new Set(locationConnections.map((lc) => lc.accountId))];
        const allUserAccounts = [];

        for (const accId of accountIds) {
          const usersForAccount = await db.query.userAccounts.findMany({
            where: eq(userAccounts.accountId, accId),
          });
          allUserAccounts.push(...usersForAccount);
        }

        const uniqueUserIds = [...new Set(allUserAccounts.map((ua) => ua.userId))];

        console.log(`Found ${uniqueUserIds.length} unique users connected to location ${locationId}`);

        const supabase = createAdminClient();
        const usersConfigsRepo = new UsersConfigsRepository();

        const { default: ReviewNotificationEmailComponent } = await import("@/lib/emails/review-notification");

        for (const currentUserId of uniqueUserIds) {
          try {
            const userConfig = await usersConfigsRepo.getOrCreate(currentUserId);

            if (!userConfig.configs.EMAIL_ON_NEW_REVIEW) {
              console.log(`User ${currentUserId} has email notifications disabled, skipping`);
              continue;
            }

            const { data: userData } = await supabase.auth.admin.getUserById(currentUserId);

            if (!userData.user) {
              console.error("User not found in Supabase Auth", { userId: currentUserId });
              continue;
            }

            const recipientEmail = userData.user.email;
            const recipientName = userData.user.user_metadata?.display_name || userData.user.email;

            if (!recipientEmail) {
              console.error("User email not found", { userId: currentUserId });
              continue;
            }

            const locale = "en";
            const status = replyStatus as "pending" | "posted";

            const reviewPageUrl = `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/dashboard/accounts/${accountId}/locations/${location.id}/reviews/${reviewId}`;

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

            const resend = new Resend(process.env.RESEND_API_KEY!);
            await resend.emails.send({
              from: process.env.RESEND_FROM_EMAIL!,
              to: recipientEmail,
              subject,
              react: emailComponent,
            });

            console.log("Email sent successfully", {
              userId: currentUserId,
              reviewId,
              replyStatus,
              locale,
            });
          } catch (emailError) {
            console.error("Failed to send email to user", {
              userId: currentUserId,
              reviewId,
              error: emailError,
            });
          }
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
