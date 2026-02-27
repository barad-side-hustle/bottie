import { db } from "@/lib/db/client";
import { accountLocations, userAccounts, locationMembers } from "@/lib/db/schema";
import { user as userTable } from "@/lib/db/schema/auth.schema";
import { eq, inArray } from "drizzle-orm";

import ReviewNotificationEmail, { type ReviewNotificationEmailProps } from "@/lib/emails/review-notification";
import { sendEmail } from "@/lib/utils/email-service";
import { env } from "@/lib/env";

interface SendReviewNotificationsParams {
  reviewId: string;
  locationId: string;
  locationName: string;
  reviewerName: string;
  reviewRating: number;
  reviewText: string;
  aiReply?: string;
  replyStatus: "pending" | "posted" | "failed";
}

export async function sendReviewNotifications(params: SendReviewNotificationsParams): Promise<void> {
  const { reviewId, locationId, locationName, reviewerName, reviewRating, reviewText, aiReply, replyStatus } = params;

  console.log("Sending email notifications to all opted-in users connected to location", {
    reviewId,
    locationId,
    replyStatus,
  });

  const locationConnections = await db.query.accountLocations.findMany({
    where: eq(accountLocations.locationId, locationId),
  });

  const accountIds = [...new Set(locationConnections.map((lc) => lc.accountId))];

  const allUserAccounts =
    accountIds.length > 0
      ? await db.query.userAccounts.findMany({ where: inArray(userAccounts.accountId, accountIds) })
      : [];

  const members = await db.query.locationMembers.findMany({
    where: eq(locationMembers.locationId, locationId),
  });

  const uniqueUserIds = [...new Set([...allUserAccounts.map((ua) => ua.userId), ...members.map((m) => m.userId)])];

  console.log(`Found ${uniqueUserIds.length} unique users connected to location ${locationId}`);

  const emailPromises = uniqueUserIds.map(async (currentUserId) => {
    const [userData] = await db
      .select({ email: userTable.email, name: userTable.name, emailOnNewReview: userTable.emailOnNewReview })
      .from(userTable)
      .where(eq(userTable.id, currentUserId))
      .limit(1);

    if (!userData?.email) {
      console.error("User or email not found", { userId: currentUserId });
      return;
    }

    if (!userData.emailOnNewReview) {
      console.log(`User ${currentUserId} has email notifications disabled, skipping`);
      return;
    }

    const recipientEmail = userData.email;
    const recipientName = userData.name || userData.email;
    const reviewPageUrl = `${env.NEXT_PUBLIC_APP_URL}/dashboard/locations/${locationId}/reviews/${reviewId}`;

    const statusTextMap = {
      pending: "Pending Approval",
      posted: "Posted",
      failed: "Reply Generation Failed",
    };

    const emailProps: ReviewNotificationEmailProps = {
      title: "New Review Received",
      greeting: `Hi ${recipientName},`,
      body: "You received a new review for",
      businessName: locationName,
      noReviewText: "No review text provided",
      aiReplyHeader: "AI Generated Reply",
      statusText: statusTextMap[replyStatus],
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
    const subject = `New ${reviewRating}-star review from ${reviewerName} for ${locationName}`;

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
}
