import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { queryWithRetry } from "@/lib/db/retry";
import { ZoeLeadsRepository } from "@/lib/db/repositories/zoe-leads.repository";
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
  const PER_LEAD_BUDGET_MS = 30_000;

  try {
    const leadsRepo = new ZoeLeadsRepository();
    console.log("[zoe-scrape-emails] Querying leads needing email", {
      batchSize: BATCH_SIZE,
      excludeDomains: SOCIAL_MEDIA_DOMAINS.length,
    });
    const leadsToScrape = await queryWithRetry(() => leadsRepo.findLeadsNeedingEmail(SOCIAL_MEDIA_DOMAINS, BATCH_SIZE));
    console.log("[zoe-scrape-emails] Starting", { leadsToProcess: leadsToScrape.length });

    const [lead] = leadsToScrape;
    if (!lead) {
      const elapsedMs = Date.now() - startTime;
      console.log("[zoe-scrape-emails] Completed", { processed: 0, emailsFound: 0, elapsedMs });
      return NextResponse.json({
        message: "Zoe scrape-emails cron completed",
        processed: 0,
        emailsFound: 0,
        elapsedMs,
      });
    }

    await leadsRepo.updateStatus(lead.id, "skipped");
    console.log("[zoe-scrape-emails] Marked skipped upfront", {
      leadId: lead.id,
      business: lead.businessName,
      website: lead.websiteUrl,
    });

    if (!lead.websiteUrl) {
      console.log("[zoe-scrape-emails] Skip (no website)", { leadId: lead.id, business: lead.businessName });
      const elapsedMs = Date.now() - startTime;
      console.log("[zoe-scrape-emails] Completed", { processed: 1, emailsFound: 0, elapsedMs });
      return NextResponse.json({
        message: "Zoe scrape-emails cron completed",
        processed: 1,
        emailsFound: 0,
        elapsedMs,
      });
    }

    if (isSocialMediaUrl(lead.websiteUrl)) {
      console.log("[zoe-scrape-emails] Skip (social media)", {
        leadId: lead.id,
        business: lead.businessName,
        website: lead.websiteUrl,
      });
      const elapsedMs = Date.now() - startTime;
      console.log("[zoe-scrape-emails] Completed", { processed: 1, emailsFound: 0, elapsedMs });
      return NextResponse.json({
        message: "Zoe scrape-emails cron completed",
        processed: 1,
        emailsFound: 0,
        elapsedMs,
      });
    }

    const leadStart = Date.now();
    console.log("[zoe-scrape-emails] Scraping", {
      leadId: lead.id,
      business: lead.businessName,
      website: lead.websiteUrl,
    });

    const controller = new AbortController();
    const budgetTimer = setTimeout(() => controller.abort(new Error("per-lead budget exceeded")), PER_LEAD_BUDGET_MS);

    let bestEmail = "";
    let emailCount = 0;
    let failureMessage: string | null = null;
    try {
      const emails = await Promise.race([
        scrapeEmails(lead.websiteUrl, controller.signal),
        new Promise<string[]>((_, reject) =>
          setTimeout(() => reject(new Error("per-lead budget exceeded")), PER_LEAD_BUDGET_MS)
        ),
      ]);
      if (controller.signal.aborted) throw new Error("per-lead budget exceeded");
      emailCount = emails.length;
      bestEmail = pickBestEmail(emails, lead.websiteUrl);
    } catch (error) {
      failureMessage = error instanceof Error ? error.message : String(error);
    } finally {
      clearTimeout(budgetTimer);
    }

    const leadElapsed = Date.now() - leadStart;
    if (failureMessage) {
      console.warn("[zoe-scrape-emails] Lead failed", {
        leadId: lead.id,
        business: lead.businessName,
        website: lead.websiteUrl,
        error: failureMessage,
        elapsedMs: leadElapsed,
      });
    } else {
      console.log("[zoe-scrape-emails] Scraped", {
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
    console.log("[zoe-scrape-emails] Completed", summary);

    return NextResponse.json({ message: "Zoe scrape-emails cron completed", ...summary });
  } catch (error) {
    const elapsedMs = Date.now() - startTime;
    console.error("[zoe-scrape-emails] Failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      elapsedMs,
    });

    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
