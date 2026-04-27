import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { queryWithRetry } from "@/lib/db/retry";
import { LeadsRepository } from "@/lib/db/repositories";
import { scrapeEmails, pickBestEmail, isSocialMediaUrl, SOCIAL_MEDIA_DOMAINS } from "@/lib/leads/scraper";

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

  const startTime = Date.now();
  const BATCH_SIZE = 1;
  const SCRAPE_TIMEOUT_MS = 30_000;

  try {
    const leadsRepo = new LeadsRepository();
    console.log("[scrape-emails] Querying leads needing email", {
      batchSize: BATCH_SIZE,
      excludeDomains: SOCIAL_MEDIA_DOMAINS.length,
    });
    const leadsToScrape = await queryWithRetry(() => leadsRepo.findLeadsNeedingEmail(SOCIAL_MEDIA_DOMAINS, BATCH_SIZE));
    console.log("[scrape-emails] Starting", { leadsToProcess: leadsToScrape.length });

    const [lead] = leadsToScrape;
    if (!lead) {
      const elapsedMs = Date.now() - startTime;
      console.log("[scrape-emails] Completed", { processed: 0, emailsFound: 0, elapsedMs });
      return NextResponse.json({ message: "Scrape-emails cron completed", processed: 0, emailsFound: 0, elapsedMs });
    }

    await leadsRepo.updateStatus(lead.id, "skipped");
    console.log("[scrape-emails] Marked skipped upfront", {
      leadId: lead.id,
      business: lead.businessName,
      website: lead.websiteUrl,
    });

    if (!lead.websiteUrl) {
      console.log("[scrape-emails] Skip (no website)", { leadId: lead.id, business: lead.businessName });
      const elapsedMs = Date.now() - startTime;
      console.log("[scrape-emails] Completed", { processed: 1, emailsFound: 0, elapsedMs });
      return NextResponse.json({ message: "Scrape-emails cron completed", processed: 1, emailsFound: 0, elapsedMs });
    }

    if (isSocialMediaUrl(lead.websiteUrl)) {
      console.log("[scrape-emails] Skip (social media)", {
        leadId: lead.id,
        business: lead.businessName,
        website: lead.websiteUrl,
      });
      const elapsedMs = Date.now() - startTime;
      console.log("[scrape-emails] Completed", { processed: 1, emailsFound: 0, elapsedMs });
      return NextResponse.json({ message: "Scrape-emails cron completed", processed: 1, emailsFound: 0, elapsedMs });
    }

    const leadStart = Date.now();
    console.log("[scrape-emails] Scraping", {
      leadId: lead.id,
      business: lead.businessName,
      website: lead.websiteUrl,
    });

    let bestEmail = "";
    let emailCount = 0;
    let failureMessage: string | null = null;
    try {
      const emails = await Promise.race([
        scrapeEmails(lead.websiteUrl),
        new Promise<string[]>((_, reject) => setTimeout(() => reject(new Error("scrape timeout")), SCRAPE_TIMEOUT_MS)),
      ]);
      emailCount = emails.length;
      bestEmail = pickBestEmail(emails, lead.websiteUrl);
    } catch (error) {
      failureMessage = error instanceof Error ? error.message : String(error);
    }

    const leadElapsed = Date.now() - leadStart;
    if (failureMessage) {
      console.warn("[scrape-emails] Lead failed", {
        leadId: lead.id,
        business: lead.businessName,
        website: lead.websiteUrl,
        error: failureMessage,
        elapsedMs: leadElapsed,
      });
    } else {
      console.log("[scrape-emails] Scraped", {
        leadId: lead.id,
        business: lead.businessName,
        website: lead.websiteUrl,
        emailsFound: emailCount,
        bestEmail: bestEmail || null,
        elapsedMs: leadElapsed,
      });
    }

    if (bestEmail) {
      await leadsRepo.updateEmail(lead.id, bestEmail);
    }

    const elapsedMs = Date.now() - startTime;
    const summary = {
      processed: 1,
      emailsFound: bestEmail ? 1 : 0,
      elapsedMs,
    };
    console.log("[scrape-emails] Completed", summary);

    return NextResponse.json({ message: "Scrape-emails cron completed", ...summary });
  } catch (error) {
    const elapsedMs = Date.now() - startTime;
    console.error("[scrape-emails] Failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      elapsedMs,
    });

    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
