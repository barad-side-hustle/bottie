import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { LeadsRepository } from "@/lib/db/repositories";
import { sendEmail } from "@/lib/utils/email-service";
import LeadOutreachEmail, { getOutreachSubject } from "@/lib/emails/lead-outreach";
import { translateLeadNames } from "@/lib/leads/translate";
import { COUNTRY_CONFIGS, getCountryConfig, type CountryConfig } from "@/lib/leads/countries";
export const maxDuration = 300;

function cleanBusinessName(name: string): string {
  const cleaned = name.split(/\s*[|–—]\s*/)[0].trim();
  return cleaned || name;
}

function secureCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

async function sendForCountry(
  leadsRepo: LeadsRepository,
  config: CountryConfig,
  sentEmailSet: Set<string>,
  limit: number
): Promise<{ sent: number; failed: number; total: number; aborted: boolean }> {
  const sentEmailList = [...sentEmailSet];
  const pendingLeads = await leadsRepo.findPendingLeads(sentEmailList, limit, config.code);

  if (pendingLeads.length === 0) {
    return { sent: 0, failed: 0, total: 0, aborted: false };
  }

  console.log(`[send-outreach] Processing ${pendingLeads.length} leads for ${config.code}`);

  let displayNames: Map<number, { businessName: string; city: string }>;

  if (config.needsTranslation) {
    const translationInputs = pendingLeads.map((lead) => ({
      businessName: lead.businessName,
      city: lead.city || "",
    }));
    const translationMap = await translateLeadNames(translationInputs);
    displayNames = new Map(
      pendingLeads.map((lead, idx) => {
        const translation = translationMap.get(idx);
        return [
          idx,
          {
            businessName: translation?.shortName || translation?.hebrewBusinessName || lead.businessName,
            city: translation?.hebrewCity || lead.city || "",
          },
        ];
      })
    );
  } else {
    displayNames = new Map(
      pendingLeads.map((lead, idx) => [
        idx,
        { businessName: cleanBusinessName(lead.businessName), city: lead.city || "" },
      ])
    );
  }

  let emailsSent = 0;
  let emailsFailed = 0;
  let consecutiveFailures = 0;

  for (let idx = 0; idx < pendingLeads.length; idx++) {
    const lead = pendingLeads[idx];
    if (consecutiveFailures >= 3) {
      console.error(`[send-outreach] Aborting ${config.code}: 3 consecutive failures`);
      break;
    }
    if (!lead.email) continue;

    if (sentEmailSet.has(lead.email)) {
      await leadsRepo.updateStatus(lead.id, "skipped", { error: "duplicate email" });
      continue;
    }

    const display = displayNames.get(idx)!;
    const ctaUrl = `https://bottie.ai/${config.locale}`;
    const subject = getOutreachSubject(config.locale, display.businessName);

    const emailComponent = LeadOutreachEmail({
      businessName: display.businessName,
      city: display.city,
      locale: config.locale,
      ctaUrl,
    });

    console.log("[send-outreach] Sending email", {
      leadId: lead.id,
      email: lead.email,
      business: lead.businessName,
      country: config.code,
    });

    const result = await sendEmail(lead.email, subject, emailComponent, config.emailSender, config.emailReplyTo);

    if (result.success) {
      await leadsRepo.updateStatus(lead.id, "sent", { sentAt: new Date() });
      sentEmailSet.add(lead.email);
      emailsSent++;
      consecutiveFailures = 0;
    } else {
      await leadsRepo.updateStatus(lead.id, "failed", { error: result.error || "Unknown error" });
      emailsFailed++;
      consecutiveFailures++;
      console.error("[send-outreach] Email send failed", {
        leadId: lead.id,
        email: lead.email,
        error: result.error,
      });
    }

    await new Promise((r) => setTimeout(r, 200));
  }

  return {
    sent: emailsSent,
    failed: emailsFailed,
    total: pendingLeads.length,
    aborted: consecutiveFailures >= 3,
  };
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const expected = `Bearer ${env.CRON_SECRET}`;
  if (!authHeader || !secureCompare(authHeader, expected)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const startTime = Date.now();

  try {
    const leadsRepo = new LeadsRepository();
    const sentEmailSet = await leadsRepo.findSentEmails();

    const countryParam = req.nextUrl.searchParams.get("country")?.toUpperCase();
    const configs = countryParam
      ? ([getCountryConfig(countryParam)].filter(Boolean) as CountryConfig[])
      : Object.values(COUNTRY_CONFIGS);

    if (configs.length === 0) {
      return NextResponse.json({ error: `Unknown country: ${countryParam}` }, { status: 400 });
    }

    console.log("[send-outreach] Starting cron run", {
      countries: configs.map((c) => c.code),
      alreadySentEmails: sentEmailSet.size,
    });

    const LIMIT_PER_COUNTRY = 50;
    const results: Record<string, { sent: number; failed: number; total: number; aborted: boolean }> = {};

    for (const config of configs) {
      results[config.code] = await sendForCountry(leadsRepo, config, sentEmailSet, LIMIT_PER_COUNTRY);
    }

    const elapsedMs = Date.now() - startTime;

    console.log("[send-outreach] Cron run completed", { results, elapsedMs });

    return NextResponse.json({ message: "Send-outreach cron completed", results, elapsedMs });
  } catch (error) {
    const elapsedMs = Date.now() - startTime;
    console.error("[send-outreach] Cron run failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      elapsedMs,
    });

    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
