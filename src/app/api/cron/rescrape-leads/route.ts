import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { LeadsRepository } from "@/lib/db/repositories";
import { scrapeEmails, pickBestEmailWithAI, withConcurrency, isSocialMediaUrl } from "@/lib/leads/scraper";
import { sendEmail } from "@/lib/utils/email-service";
import { CronSummaryEmail } from "@/lib/emails/cron-summary";

export const maxDuration = 300;

const SOCIAL_MEDIA_DOMAINS = [
  "instagram.com",
  "facebook.com",
  "fb.com",
  "fb.me",
  "tiktok.com",
  "twitter.com",
  "x.com",
  "linkedin.com",
  "youtube.com",
  "youtu.be",
  "linktr.ee",
  "waze.com",
];

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

  const startTime = Date.now();
  const TIMEOUT_MS = 240_000;
  const BATCH_SIZE = 50;

  try {
    const leadsRepo = new LeadsRepository();
    const skippedLeads = await leadsRepo.findSkippedWithWebsite(SOCIAL_MEDIA_DOMAINS, BATCH_SIZE);

    console.log("[rescrape-leads] Starting rescrape", {
      leadsToProcess: skippedLeads.length,
    });

    let emailsFound = 0;
    let processed = 0;

    const results = await withConcurrency(skippedLeads, 5, async (lead) => {
      if (Date.now() - startTime > TIMEOUT_MS) {
        return { lead, email: "" };
      }

      if (!lead.websiteUrl || isSocialMediaUrl(lead.websiteUrl)) {
        return { lead, email: "" };
      }

      const emails = await scrapeEmails(lead.websiteUrl);
      const best = await pickBestEmailWithAI(emails, lead.businessName);
      processed++;

      if (best) {
        emailsFound++;
        console.log(`[rescrape-leads] Found email for "${lead.businessName}": ${best}`);
      }

      return { lead, email: best };
    });

    for (const { lead, email } of results) {
      if (email) {
        await leadsRepo.updateEmail(lead.id, email);
      }
    }

    const elapsedMs = Date.now() - startTime;
    const summary = {
      processed,
      emailsFound,
      elapsedMs,
    };

    console.log("[rescrape-leads] Completed", summary);

    await sendEmail(
      "alon@bottie.ai",
      `Rescrape Leads: ${emailsFound} new emails from ${processed} leads`,
      CronSummaryEmail({
        cronName: "Rescrape Leads",
        status: "success",
        lines: [
          `Processed: ${processed}`,
          `Emails found: ${emailsFound}`,
          `Duration: ${(elapsedMs / 1000).toFixed(1)}s`,
        ],
      })
    );

    return NextResponse.json({ message: "Rescrape-leads cron completed", ...summary });
  } catch (error) {
    const elapsedMs = Date.now() - startTime;
    console.error("[rescrape-leads] Failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      elapsedMs,
    });

    await sendEmail(
      "alon@bottie.ai",
      "Rescrape Leads: FAILED",
      CronSummaryEmail({
        cronName: "Rescrape Leads",
        status: "error",
        lines: [
          `Error: ${error instanceof Error ? error.message : String(error)}`,
          `Duration: ${(elapsedMs / 1000).toFixed(1)}s`,
        ],
      })
    ).catch(() => {});

    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
