import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { queryWithRetry } from "@/lib/db/retry";
import { LeadsRepository } from "@/lib/db/repositories";
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
  const BATCH_SIZE = 10;
  const CONCURRENCY = 2;
  const SCRAPE_TIMEOUT_MS = 30_000;

  try {
    const leadsRepo = new LeadsRepository();
    console.log("[scrape-emails] Querying leads needing email", {
      batchSize: BATCH_SIZE,
      concurrency: CONCURRENCY,
      excludeDomains: SOCIAL_MEDIA_DOMAINS.length,
    });
    const leadsToScrape = await queryWithRetry(() => leadsRepo.findLeadsNeedingEmail(SOCIAL_MEDIA_DOMAINS, BATCH_SIZE));
    console.log("[scrape-emails] Starting", { leadsToProcess: leadsToScrape.length });

    let emailsFound = 0;
    let processed = 0;
    let skippedNoWebsite = 0;
    let skippedSocial = 0;
    let skippedBudget = 0;
    let scrapeTimeouts = 0;
    let noEmailsFound = 0;

    const results = await withConcurrency(leadsToScrape, CONCURRENCY, async (lead, idx) => {
      const leadLabel = `${idx + 1}/${leadsToScrape.length}`;

      if (Date.now() - startTime > TIMEOUT_MS) {
        console.warn("[scrape-emails] Budget exhausted, skipping lead", {
          leadLabel,
          leadId: lead.id,
          business: lead.businessName,
        });
        skippedBudget++;
        return { lead, email: "", scraped: false };
      }

      if (!lead.websiteUrl) {
        console.log("[scrape-emails] Skip (no website)", {
          leadLabel,
          leadId: lead.id,
          business: lead.businessName,
        });
        skippedNoWebsite++;
        return { lead, email: "", scraped: true };
      }

      if (isSocialMediaUrl(lead.websiteUrl)) {
        console.log("[scrape-emails] Skip (social media)", {
          leadLabel,
          leadId: lead.id,
          business: lead.businessName,
          website: lead.websiteUrl,
        });
        skippedSocial++;
        return { lead, email: "", scraped: true };
      }

      const leadStart = Date.now();
      console.log("[scrape-emails] Scraping", {
        leadLabel,
        leadId: lead.id,
        business: lead.businessName,
        website: lead.websiteUrl,
      });

      try {
        const emails = await Promise.race([
          scrapeEmails(lead.websiteUrl),
          new Promise<string[]>((_, reject) =>
            setTimeout(() => reject(new Error("scrape timeout")), SCRAPE_TIMEOUT_MS)
          ),
        ]);
        const best = pickBestEmail(emails, lead.websiteUrl);
        processed++;
        if (best) {
          emailsFound++;
        } else {
          noEmailsFound++;
        }

        console.log("[scrape-emails] Scraped", {
          leadLabel,
          leadId: lead.id,
          business: lead.businessName,
          website: lead.websiteUrl,
          emailsFound: emails.length,
          bestEmail: best || null,
          elapsedMs: Date.now() - leadStart,
        });

        return { lead, email: best, scraped: true };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (message === "scrape timeout") scrapeTimeouts++;
        console.warn("[scrape-emails] Lead failed", {
          leadLabel,
          leadId: lead.id,
          business: lead.businessName,
          website: lead.websiteUrl,
          error: message,
          elapsedMs: Date.now() - leadStart,
        });
        processed++;
        return { lead, email: "", scraped: true };
      }
    });

    for (const { lead, email, scraped } of results) {
      if (email) {
        await leadsRepo.updateEmail(lead.id, email);
      } else if (scraped) {
        await leadsRepo.updateStatus(lead.id, "skipped");
      }
    }

    const elapsedMs = Date.now() - startTime;
    const summary = {
      processed,
      emailsFound,
      skippedNoWebsite,
      skippedSocial,
      skippedBudget,
      scrapeTimeouts,
      noEmailsFound,
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
