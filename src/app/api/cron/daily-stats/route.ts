import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { gte, sql } from "drizzle-orm";
import { env } from "@/lib/env";
import { db } from "@/lib/db/client";
import { user, googleAccounts, reviews } from "@/lib/db/schema";
import { sendEmail } from "@/lib/utils/email-service";
import DailyStatsEmail from "@/lib/emails/daily-stats";
import { ZoeLeadsRepository } from "@/lib/db/repositories";

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
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const zoeLeadsRepo = new ZoeLeadsRepository();

    const [
      newUsers,
      newGoogleAccounts,
      reviewCountResult,
      zoeSentByCountry,
      zoePendingByCountry,
      zoeLeadsFound,
      zoeEmailsScraped,
      zoeLeadsSkipped,
    ] = await Promise.all([
      db.select({ name: user.name, email: user.email }).from(user).where(gte(user.createdAt, since)),
      db
        .select({ email: googleAccounts.email, accountName: googleAccounts.accountName })
        .from(googleAccounts)
        .where(gte(googleAccounts.connectedAt, since)),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(reviews)
        .where(gte(reviews.receivedAt, since)),
      zoeLeadsRepo.countSentByCountry(since),
      zoeLeadsRepo.countPendingByCountry(),
      zoeLeadsRepo.countFoundSince(since),
      zoeLeadsRepo.countEmailsScrapedSince(since),
      zoeLeadsRepo.countSkippedSince(since),
    ]);

    const reviewCount = reviewCountResult[0]?.count ?? 0;
    const zoeTotalSent = zoeSentByCountry.reduce((sum, s) => sum + s.count, 0);

    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || "alon@bottie.ai";

    await sendEmail(
      adminEmail,
      `Daily Stats: ${newUsers.length} users, ${reviewCount} reviews, ${zoeTotalSent} outreach`,
      DailyStatsEmail({
        newUsers,
        newGoogleAccounts,
        reviewCount,
        outreachStats: { sentByCountry: zoeSentByCountry, pendingByCountry: zoePendingByCountry },
        leadPipelineStats: {
          found: zoeLeadsFound,
          emailsScraped: zoeEmailsScraped,
          skipped: zoeLeadsSkipped,
        },
      })
    );

    console.log("[daily-stats] Sent daily stats email", {
      newUsers: newUsers.length,
      newGoogleAccounts: newGoogleAccounts.length,
      reviewCount,
      zoeOutreachSent: zoeTotalSent,
    });

    return NextResponse.json({
      message: "Daily stats email sent",
      newUsers: newUsers.length,
      newGoogleAccounts: newGoogleAccounts.length,
      reviewCount,
      zoeOutreachSent: zoeTotalSent,
    });
  } catch (error) {
    console.error("[daily-stats] Failed to send daily stats", error);
    return NextResponse.json({ error: "Failed to send daily stats email" }, { status: 500 });
  }
}
