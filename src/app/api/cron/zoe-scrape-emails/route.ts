import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { queryWithRetry } from "@/lib/db/retry";
import { ZoeLeadsRepository } from "@/lib/db/repositories/zoe-leads.repository";
import {
  scrapeEmails,
  pickBestEmail,
  withConcurrency,
  isSocialMediaUrl,
  SOCIAL_MEDIA_DOMAINS,
} from "@/lib/leads/scraper";

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
  const TIMEOUT_MS = 240_000;
  const PER_LEAD_BUDGET_MS = 45_000;
  const BATCH_SIZE = 10;
  const CONCURRENCY = 2;

  try {
    const leadsRepo = new ZoeLeadsRepository();
    console.log("[zoe-scrape-emails] Querying leads needing email", {
      batchSize: BATCH_SIZE,
      concurrency: CONCURRENCY,
      excludeDomains: SOCIAL_MEDIA_DOMAINS.length,
    });
    const leadsToScrape = await queryWithRetry(() => leadsRepo.findLeadsNeedingEmail(SOCIAL_MEDIA_DOMAINS, BATCH_SIZE));
    console.log("[zoe-scrape-emails] Starting", { leadsToProcess: leadsToScrape.length });

    let emailsFound = 0;
    let processed = 0;
    let skippedNoWebsite = 0;
    let skippedSocial = 0;
    let skippedBudget = 0;
    let perLeadBudgetExceeded = 0;
    let noEmailsFound = 0;

    await withConcurrency(leadsToScrape, CONCURRENCY, async (lead, idx) => {
      const leadLabel = `${idx + 1}/${leadsToScrape.length}`;

      if (Date.now() - startTime > TIMEOUT_MS) {
        console.warn("[zoe-scrape-emails] Budget exhausted, skipping lead", {
          leadLabel,
          leadId: lead.id,
          business: lead.businessName,
        });
        skippedBudget++;
        return;
      }

      if (!lead.websiteUrl) {
        console.log("[zoe-scrape-emails] Skip (no website)", {
          leadLabel,
          leadId: lead.id,
          business: lead.businessName,
        });
        skippedNoWebsite++;
        await leadsRepo.updateStatus(lead.id, "skipped");
        return;
      }

      if (isSocialMediaUrl(lead.websiteUrl)) {
        console.log("[zoe-scrape-emails] Skip (social media)", {
          leadLabel,
          leadId: lead.id,
          business: lead.businessName,
          website: lead.websiteUrl,
        });
        skippedSocial++;
        await leadsRepo.updateStatus(lead.id, "skipped");
        return;
      }

      const leadStart = Date.now();
      console.log("[zoe-scrape-emails] Scraping", {
        leadLabel,
        leadId: lead.id,
        business: lead.businessName,
        website: lead.websiteUrl,
      });

      const controller = new AbortController();
      const budgetTimer = setTimeout(() => controller.abort(new Error("per-lead budget exceeded")), PER_LEAD_BUDGET_MS);

      try {
        const emails = await scrapeEmails(lead.websiteUrl, controller.signal);
        if (controller.signal.aborted) throw new Error("per-lead budget exceeded");
        const best = pickBestEmail(emails, lead.websiteUrl);
        processed++;

        console.log("[zoe-scrape-emails] Scraped", {
          leadLabel,
          leadId: lead.id,
          business: lead.businessName,
          website: lead.websiteUrl,
          emailsFound: emails.length,
          bestEmail: best || null,
          elapsedMs: Date.now() - leadStart,
        });

        if (best) {
          emailsFound++;
          await leadsRepo.updateEmail(lead.id, best);
        } else {
          noEmailsFound++;
          await leadsRepo.updateStatus(lead.id, "skipped");
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (message === "per-lead budget exceeded") perLeadBudgetExceeded++;
        console.warn("[zoe-scrape-emails] Lead failed", {
          leadLabel,
          leadId: lead.id,
          business: lead.businessName,
          website: lead.websiteUrl,
          error: message,
          elapsedMs: Date.now() - leadStart,
        });
        processed++;
        await leadsRepo.updateStatus(lead.id, "skipped");
      } finally {
        clearTimeout(budgetTimer);
      }
    });

    const elapsedMs = Date.now() - startTime;
    const summary = {
      processed,
      emailsFound,
      skippedNoWebsite,
      skippedSocial,
      skippedBudget,
      perLeadBudgetExceeded,
      noEmailsFound,
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
