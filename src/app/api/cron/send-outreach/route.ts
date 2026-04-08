import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { and, eq, isNotNull, notInArray } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { leads } from "@/lib/db/schema";
import { env } from "@/lib/env";
import { sendEmail } from "@/lib/utils/email-service";
import LeadOutreachEmail from "@/lib/emails/lead-outreach";
import { CronSummaryEmail } from "@/lib/emails/cron-summary";

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

  try {
    const sentEmails = await db.select({ email: leads.email }).from(leads).where(eq(leads.status, "sent"));

    const sentEmailSet = new Set(sentEmails.map((l) => l.email).filter(Boolean));

    const sentEmailList = [...sentEmailSet].filter(Boolean) as string[];
    const pendingLeads = await db
      .select()
      .from(leads)
      .where(
        and(
          eq(leads.status, "pending"),
          isNotNull(leads.email),
          sentEmailList.length > 0 ? notInArray(leads.email, sentEmailList) : undefined
        )
      )
      .limit(50);

    console.log("[send-outreach] Starting cron run", {
      pendingLeads: pendingLeads.length,
      alreadySentEmails: sentEmailSet.size,
    });

    let emailsSent = 0;
    let emailsFailed = 0;
    let consecutiveFailures = 0;

    for (const lead of pendingLeads) {
      if (consecutiveFailures >= 3) {
        console.error("[send-outreach] Aborting: 3 consecutive failures, likely a config issue");
        break;
      }
      if (!lead.email) continue;

      if (sentEmailSet.has(lead.email)) {
        console.log("[send-outreach] Skipping duplicate email", {
          leadId: lead.id,
          email: lead.email,
          business: lead.businessName,
        });
        await db.update(leads).set({ status: "skipped", error: "duplicate email" }).where(eq(leads.id, lead.id));
        continue;
      }

      const subject = `ניהול ביקורות גוגל אוטומטי ל${lead.businessName}`;
      const emailComponent = LeadOutreachEmail({
        businessName: lead.businessName,
        city: lead.city || "",
      });

      console.log("[send-outreach] Sending email", {
        leadId: lead.id,
        email: lead.email,
        business: lead.businessName,
        city: lead.city,
      });

      const result = await sendEmail(
        lead.email,
        subject,
        emailComponent,
        "Alon from Bottie <alon@bottie.ai>",
        "alon@bottie.ai"
      );

      if (result.success) {
        await db.update(leads).set({ status: "sent", sentAt: new Date() }).where(eq(leads.id, lead.id));
        sentEmailSet.add(lead.email);
        emailsSent++;
        consecutiveFailures = 0;
        console.log("[send-outreach] Email sent successfully", {
          leadId: lead.id,
          email: lead.email,
          business: lead.businessName,
        });
      } else {
        await db
          .update(leads)
          .set({ status: "failed", error: result.error || "Unknown error" })
          .where(eq(leads.id, lead.id));
        emailsFailed++;
        consecutiveFailures++;
        console.error("[send-outreach] Email send failed", {
          leadId: lead.id,
          email: lead.email,
          business: lead.businessName,
          error: result.error,
        });
      }

      await new Promise((r) => setTimeout(r, 200));
    }

    const elapsedMs = Date.now() - startTime;
    const summary = {
      emailsSent,
      emailsFailed,
      totalPending: pendingLeads.length,
      elapsedMs,
    };

    console.log("[send-outreach] Cron run completed successfully", summary);

    await sendEmail(
      "alon710@gmail.com",
      `Outreach: ${emailsSent} sent, ${emailsFailed} failed`,
      CronSummaryEmail({
        cronName: "Send Outreach",
        status: emailsFailed > 0 && emailsSent === 0 ? "error" : "success",
        lines: [
          `Emails sent: ${emailsSent}`,
          `Emails failed: ${emailsFailed}`,
          `Total pending: ${pendingLeads.length}`,
          `Duration: ${(elapsedMs / 1000).toFixed(1)}s`,
          ...(consecutiveFailures >= 3 ? ["Aborted early: 3 consecutive failures"] : []),
        ],
      })
    );

    return NextResponse.json({ message: "Send-outreach cron completed", ...summary });
  } catch (error) {
    const elapsedMs = Date.now() - startTime;
    console.error("[send-outreach] Cron run failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      elapsedMs,
    });

    await sendEmail(
      "alon710@gmail.com",
      "Outreach: FAILED",
      CronSummaryEmail({
        cronName: "Send Outreach",
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
