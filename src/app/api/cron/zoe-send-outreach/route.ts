import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { ZoeLeadsRepository } from "@/lib/db/repositories/zoe-leads.repository";
import { sendEmail } from "@/lib/utils/email-service";
import ZoeLeadOutreachEmail, { getZoeOutreachSubject } from "@/lib/emails/zoe-lead-outreach";
import { translateLeadNames } from "@/lib/leads/translate";
import { ZOE_COUNTRY_CONFIG } from "@/lib/leads/zoe-countries";

export const maxDuration = 300;

function secureCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

const TIME_BUDGET_MS = 250_000;

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const expected = `Bearer ${env.CRON_SECRET}`;
  if (!authHeader || !secureCompare(authHeader, expected)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const startTime = Date.now();

  try {
    const leadsRepo = new ZoeLeadsRepository();
    const sentEmailSet = new Set<string>();
    const LIMIT = 50;

    console.log("[zoe-send-outreach] Starting cron run", {
      country: ZOE_COUNTRY_CONFIG.code,
    });

    const pendingLeads = await leadsRepo.findPendingLeads(LIMIT, ZOE_COUNTRY_CONFIG.code);

    if (pendingLeads.length === 0) {
      const elapsedMs = Date.now() - startTime;
      console.log("[zoe-send-outreach] No pending leads", { elapsedMs });
      return NextResponse.json({
        message: "Zoe send-outreach cron completed",
        results: { sent: 0, failed: 0, total: 0, aborted: false },
        elapsedMs,
      });
    }

    console.log(`[zoe-send-outreach] Processing ${pendingLeads.length} leads`);

    const translationInputs = pendingLeads.map((lead) => ({
      businessName: lead.businessName,
      city: lead.city || "",
    }));
    const translationMap = await translateLeadNames(translationInputs);
    const displayNames = new Map(
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

    let emailsSent = 0;
    let emailsFailed = 0;
    let consecutiveFailures = 0;

    for (let idx = 0; idx < pendingLeads.length; idx++) {
      const lead = pendingLeads[idx];

      if (Date.now() - startTime > TIME_BUDGET_MS) {
        console.warn("[zoe-send-outreach] Time budget exhausted, stopping early");
        break;
      }

      if (consecutiveFailures >= 3) {
        console.error("[zoe-send-outreach] Aborting: 3 consecutive failures");
        break;
      }

      if (!lead.email) continue;

      if (sentEmailSet.has(lead.email)) {
        await leadsRepo.updateStatus(lead.id, "skipped", { error: "duplicate email" });
        continue;
      }

      const display = displayNames.get(idx)!;
      const subject = getZoeOutreachSubject(display.businessName);

      const emailComponent = ZoeLeadOutreachEmail({
        businessName: display.businessName,
        city: display.city,
      });

      console.log("[zoe-send-outreach] Sending email", {
        leadId: lead.id,
        email: lead.email,
        business: lead.businessName,
      });

      const result = await sendEmail(
        lead.email,
        subject,
        emailComponent,
        ZOE_COUNTRY_CONFIG.emailSender,
        ZOE_COUNTRY_CONFIG.emailReplyTo
      );

      if (result.success) {
        await leadsRepo.updateStatus(lead.id, "sent", { sentAt: new Date() });
        sentEmailSet.add(lead.email);
        emailsSent++;
        consecutiveFailures = 0;
      } else {
        await leadsRepo.updateStatus(lead.id, "failed", { error: result.error || "Unknown error" });
        emailsFailed++;
        consecutiveFailures++;
        console.error("[zoe-send-outreach] Email send failed", {
          leadId: lead.id,
          email: lead.email,
          error: result.error,
        });
      }

      await new Promise((r) => setTimeout(r, 200));
    }

    const results = {
      sent: emailsSent,
      failed: emailsFailed,
      total: pendingLeads.length,
      aborted: consecutiveFailures >= 3,
    };

    const elapsedMs = Date.now() - startTime;

    console.log("[zoe-send-outreach] Cron run completed", { results, elapsedMs });

    return NextResponse.json({ message: "Zoe send-outreach cron completed", results, elapsedMs });
  } catch (error) {
    const elapsedMs = Date.now() - startTime;
    console.error("[zoe-send-outreach] Cron run failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      elapsedMs,
    });

    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
