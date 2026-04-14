import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { ZoeLeadsRepository } from "@/lib/db/repositories/zoe-leads.repository";
import {
  scrapeEmails,
  pickBestEmailWithAI,
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

  try {
    const leadsRepo = new ZoeLeadsRepository();
    console.log("[zoe-scrape-emails] Querying leads needing email", {
      batchSize: BATCH_SIZE,
      excludeDomains: SOCIAL_MEDIA_DOMAINS.length,
    });
    const leadsToScrape = await leadsRepo.findLeadsNeedingEmail(SOCIAL_MEDIA_DOMAINS, BATCH_SIZE);
    console.log("[zoe-scrape-emails] Starting", { leadsToProcess: leadsToScrape.length });

    let emailsFound = 0;
    let processed = 0;

    const results = await withConcurrency(leadsToScrape, 5, async (lead) => {
      if (Date.now() - startTime > TIMEOUT_MS) {
        return { lead, email: "", scraped: false };
      }

      if (!lead.websiteUrl || isSocialMediaUrl(lead.websiteUrl)) {
        return { lead, email: "", scraped: true };
      }

      try {
        const emails = await Promise.race([
          scrapeEmails(lead.websiteUrl),
          new Promise<string[]>((_, reject) => setTimeout(() => reject(new Error("scrape timeout")), 30_000)),
        ]);
        const best = await pickBestEmailWithAI(emails, lead.businessName);
        processed++;

        console.log("[zoe-scrape-emails] Processed", {
          business: lead.businessName,
          website: lead.websiteUrl,
          emailsFound: emails.length,
          bestEmail: best || null,
        });

        if (best) {
          emailsFound++;
        }

        return { lead, email: best, scraped: true };
      } catch (error) {
        console.warn("[zoe-scrape-emails] Lead failed", {
          business: lead.businessName,
          website: lead.websiteUrl,
          error: error instanceof Error ? error.message : String(error),
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
    const summary = { processed, emailsFound, elapsedMs };

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
