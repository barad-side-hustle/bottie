import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { and, eq, isNotNull, notInArray } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { leads } from "@/lib/db/schema";
import { env } from "@/lib/env";
import { sendEmail } from "@/lib/utils/email-service";
import LeadOutreachEmail from "@/lib/emails/lead-outreach";

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

    console.log(`send-outreach: ${pendingLeads.length} leads to email`);

    let emailsSent = 0;
    let emailsFailed = 0;

    for (const lead of pendingLeads) {
      if (!lead.email) continue;

      if (sentEmailSet.has(lead.email)) {
        await db.update(leads).set({ status: "skipped", error: "duplicate email" }).where(eq(leads.id, lead.id));
        continue;
      }

      const subject = `ניהול ביקורות גוגל אוטומטי ל${lead.businessName}`;
      const emailComponent = LeadOutreachEmail({
        businessName: lead.businessName,
        city: lead.city || "",
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
      } else {
        await db
          .update(leads)
          .set({ status: "failed", error: result.error || "Unknown error" })
          .where(eq(leads.id, lead.id));
        emailsFailed++;
      }

      await new Promise((r) => setTimeout(r, 200));
    }

    console.log(`send-outreach: sent ${emailsSent}, failed ${emailsFailed}`);

    return NextResponse.json({
      message: "Send-outreach cron completed",
      emailsSent,
      emailsFailed,
      totalPending: pendingLeads.length,
    });
  } catch (error) {
    console.error("Send-outreach cron failed:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
