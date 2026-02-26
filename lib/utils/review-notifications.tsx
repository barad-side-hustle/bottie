import { db } from "@/lib/db/client";
import { accountLocations, userAccounts } from "@/lib/db/schema";
import { user as userTable } from "@/lib/db/schema/auth.schema";
import { eq, inArray } from "drizzle-orm";
import { UsersConfigsRepository } from "@/lib/db/repositories/users-configs.repository";
import ReviewNotificationEmail, { type ReviewNotificationEmailProps } from "@/lib/emails/review-notification";
import { sendEmail } from "@/lib/utils/email-service";
import { env } from "@/lib/env";

interface SendReviewNotificationsParams {
  reviewId: string;
  locationId: string;
  accountId: string;
  locationName: string;
  reviewerName: string;
  reviewRating: number;
  reviewText: string;
  aiReply: string;
  replyStatus: "pending" | "posted";
}

export async function sendReviewNotifications(params: SendReviewNotificationsParams): Promise<void> {
  const {
    reviewId,
    locationId,
    accountId,
    locationName,
    reviewerName,
    reviewRating,
    reviewText,
    aiReply,
    replyStatus,
  } = params;

  try {
    console.log("Sending email notifications to all opted-in users connected to location", {
      reviewId,
      locationId,
      replyStatus,
    });

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

    const emailPromises = uniqueUserIds.map(async (currentUserId) => {
      const userConfig = await usersConfigsRepo.getOrCreate(currentUserId);

      if (!userConfig.configs.EMAIL_ON_NEW_REVIEW) {
        console.log(`User ${currentUserId} has email notifications disabled, skipping`);
        return;
      }

      const [userData] = await db
        .select({ email: userTable.email, name: userTable.name })
        .from(userTable)
        .where(eq(userTable.id, currentUserId))
        .limit(1);

      if (!userData?.email) {
        console.error("User or email not found", { userId: currentUserId });
        return;
      }

      const recipientEmail = userData.email;
      const recipientName = userData.name || userData.email;
      const locale = "en";

      const reviewPageUrl = `${env.NEXT_PUBLIC_APP_URL}/${locale}/dashboard/accounts/${accountId}/locations/${locationId}/reviews/${reviewId}`;

      const emailProps: ReviewNotificationEmailProps = {
        title: "New Review Received",
        greeting: `Hi ${recipientName},`,
        body: "You received a new review for",
        businessName: locationName,
        noReviewText: "No review text provided",
        aiReplyHeader: "AI Generated Reply",
        statusText: replyStatus === "pending" ? "Pending Approval" : "Posted",
        viewReviewButton: "View Review",
        footer: "You're receiving this email because you enabled notifications for new reviews",
        reviewerName,
        rating: reviewRating,
        reviewText: reviewText || "",
        aiReply,
        status: replyStatus,
        reviewPageUrl,
      };

      const emailComponent = <ReviewNotificationEmail {...emailProps} />;
      const subject = `New ${reviewRating}-star review for ${locationName}`;

      const result = await sendEmail(recipientEmail, subject, emailComponent);

      if (result.success) {
        console.log("Email sent successfully", { userId: currentUserId, reviewId, replyStatus });
      } else {
        console.error("Failed to send email to user", { userId: currentUserId, reviewId, error: result.error });
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
