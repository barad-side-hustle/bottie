import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { authUsers, subscriptions, locations, accountLocations, userAccounts, reviews } from "@/lib/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { generateWeeklySummary, generateWeeklySummaryFromClassifications } from "@/lib/ai/summaries";
import { WeeklySummariesRepository } from "@/lib/db/repositories/weekly-summaries.repository";
import { InsightsRepository } from "@/lib/db/repositories/insights.repository";
import WeeklySummaryEmail from "@/lib/emails/weekly-summary";
import { UsersConfigsRepository } from "@/lib/db/repositories/users-configs.repository";
import { env } from "@/lib/env";
import { sendEmail } from "@/lib/utils/email-service";
const weeklySummariesRepo = new WeeklySummariesRepository();
const usersConfigsRepo = new UsersConfigsRepository();

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
    const today = new Date();
    const lastSaturday = new Date(today);
    lastSaturday.setDate(today.getDate() - 1);
    lastSaturday.setHours(23, 59, 59, 999);

    const lastSunday = new Date(lastSaturday);
    lastSunday.setDate(lastSaturday.getDate() - 6);
    lastSunday.setHours(0, 0, 0, 0);

    console.log(`Running Weekly Summary Cron for period: ${lastSunday.toISOString()} to ${lastSaturday.toISOString()}`);

    const proSubscriptions = await db
      .select({
        userId: subscriptions.userId,
      })
      .from(subscriptions)
      .where(and(eq(subscriptions.status, "active"), eq(subscriptions.planTier, "pro")));

    const proUserIds = proSubscriptions.map((sub) => sub.userId);

    if (proUserIds.length === 0) {
      return NextResponse.json({ message: "No pro users found" });
    }

    let emailsSent = 0;
    let summariesGenerated = 0;
    const errors: { userId: string; error: string }[] = [];

    for (const userId of proUserIds) {
      try {
        const userConfig = await usersConfigsRepo.get(userId);
        const isEnabled = userConfig?.configs?.WEEKLY_SUMMARY_ENABLED ?? false;

        if (!isEnabled) {
          continue;
        }

        const locale = "en";

        const [user] = await db.select().from(authUsers).where(eq(authUsers.id, userId));
        if (!user || !user.email) continue;

        const userLocations = await db
          .select({
            location: locations,
          })
          .from(locations)
          .innerJoin(accountLocations, eq(accountLocations.locationId, locations.id))
          .innerJoin(userAccounts, eq(userAccounts.accountId, accountLocations.accountId))
          .where(and(eq(userAccounts.userId, userId), eq(accountLocations.connected, true)));

        const uniqueLocations = [...new Map(userLocations.map((ul) => [ul.location.id, ul.location])).values()];

        for (const location of uniqueLocations) {
          const locationReviews = await db
            .select()
            .from(reviews)
            .where(
              and(eq(reviews.locationId, location.id), gte(reviews.date, lastSunday), lte(reviews.date, lastSaturday))
            );

          if (locationReviews.length === 0) {
            continue;
          }

          const insightsRepo = new InsightsRepository(userId, location.id);
          const stats = await insightsRepo.getClassificationStats(lastSunday, lastSaturday);
          const topPositives = await insightsRepo.getTopCategories(lastSunday, lastSaturday, "positive", 5);
          const topNegatives = await insightsRepo.getTopCategories(lastSunday, lastSaturday, "negative", 5);

          const hasClassifications = stats.classifiedReviews > 0;
          const summaryData = hasClassifications
            ? await generateWeeklySummaryFromClassifications({
                businessName: location.name,
                stats,
                topPositives,
                topNegatives,
                language: "en",
              })
            : await generateWeeklySummary(location.name, locationReviews, "en");

          const averageRating = locationReviews.reduce((acc, r) => acc + r.rating, 0) / locationReviews.length;

          const { created } = await weeklySummariesRepo.upsert({
            locationId: location.id,
            weekStartDate: lastSunday.toISOString().split("T")[0],
            weekEndDate: lastSaturday.toISOString().split("T")[0],
            totalReviews: locationReviews.length,
            averageRating,
            positiveThemes: summaryData.positiveThemes,
            negativeThemes: summaryData.negativeThemes,
            recommendations: summaryData.recommendations,
          });

          if (!created) {
            continue;
          }

          summariesGenerated++;

          {
            const dateRangeStr = `${lastSunday.toLocaleDateString("en", { day: "numeric", month: "short" })} - ${lastSaturday.toLocaleDateString("en", { day: "numeric", month: "short" })}`;

            const subject = `Weekly Summary for ${location.name}`;

            const sentimentData = hasClassifications
              ? {
                  positive: stats.sentimentBreakdown.positive,
                  neutral: stats.sentimentBreakdown.neutral,
                  negative: stats.sentimentBreakdown.negative,
                  positiveLabel: "Positive",
                  neutralLabel: "Neutral",
                  negativeLabel: "Negative",
                }
              : undefined;

            const emailComponent = WeeklySummaryEmail({
              title: "Weekly Summary",
              dateRange: dateRangeStr,
              businessName: location.name,
              statsTitle: "Weekly Overview",
              totalReviewsLabel: "Total Reviews",
              averageRatingLabel: "Average Rating",
              totalReviews: locationReviews.length,
              averageRating: averageRating.toFixed(1),
              sentimentTitle: hasClassifications ? "Sentiment Breakdown" : undefined,
              sentiment: sentimentData,
              positiveThemesTitle: "Strengths",
              positiveThemes: summaryData.positiveThemes,
              negativeThemesTitle: "Areas for Improvement",
              negativeThemes: summaryData.negativeThemes,
              recommendationsTitle: "Recommended Actions",
              recommendations: summaryData.recommendations,
              viewDashboardButton: "View Dashboard",
              dashboardUrl: `${env.NEXT_PUBLIC_APP_URL}/${locale}/dashboard/home`,
              footer: "Sent by Bottie.ai",
            });

            const result = await sendEmail(user.email, subject, emailComponent);
            if (result.success) {
              emailsSent++;
            }
          }
        }
      } catch (err) {
        console.error(`Error processing user ${userId}:`, err);
        errors.push({ userId, error: String(err) });
      }
    }

    return NextResponse.json({
      success: true,
      emailsSent,
      summariesGenerated,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Cron Job Failed:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
