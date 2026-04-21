import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { queryWithRetry } from "@/lib/db/retry";
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
  const PER_LEAD_BUDGET_MS = 45_000;
  const BATCH_SIZE = 10;

  try {
    const leadsRepo = new ZoeLeadsRepository();
    console.log("[zoe-scrape-emails] Querying leads needing email", {
      batchSize: BATCH_SIZE,
      excludeDomains: SOCIAL_MEDIA_DOMAINS.length,
    });
    const leadsToScrape = await queryWithRetry(() => leadsRepo.findLeadsNeedingEmail(SOCIAL_MEDIA_DOMAINS, BATCH_SIZE));
    console.log("[zoe-scrape-emails] Starting", { leadsToProcess: leadsToScrape.length });

    let emailsFound = 0;
    let processed = 0;

    await withConcurrency(leadsToScrape, 5, async (lead) => {
      if (Date.now() - startTime > TIMEOUT_MS) return;

      if (!lead.websiteUrl || isSocialMediaUrl(lead.websiteUrl)) {
        await leadsRepo.updateStatus(lead.id, "skipped");
        return;
      }

      const controller = new AbortController();
      const budgetTimer = setTimeout(() => controller.abort(new Error("per-lead budget exceeded")), PER_LEAD_BUDGET_MS);

      try {
        const emails = await scrapeEmails(lead.websiteUrl, controller.signal);
        const best = await Promise.race([
          pickBestEmailWithAI(emails, lead.businessName),
          new Promise<string>((_, reject) => {
            controller.signal.addEventListener("abort", () => reject(new Error("per-lead budget exceeded")), {
              once: true,
            });
          }),
        ]);
        processed++;

        console.log("[zoe-scrape-emails] Processed", {
          business: lead.businessName,
          website: lead.websiteUrl,
          emailsFound: emails.length,
          bestEmail: best || null,
        });

        if (best) {
          emailsFound++;
          await leadsRepo.updateEmail(lead.id, best);
        } else {
          await leadsRepo.updateStatus(lead.id, "skipped");
        }
      } catch (error) {
        console.warn("[zoe-scrape-emails] Lead failed", {
          business: lead.businessName,
          website: lead.websiteUrl,
          error: error instanceof Error ? error.message : String(error),
        });
        processed++;
        await leadsRepo.updateStatus(lead.id, "skipped");
      } finally {
        clearTimeout(budgetTimer);
      }
    });

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
