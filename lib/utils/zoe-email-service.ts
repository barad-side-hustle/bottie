import { Resend } from "resend";
import { ReactElement } from "react";

interface EmailResult {
  success: boolean;
  error?: string;
}

export async function zoeSendEmail(
  to: string,
  subject: string,
  reactComponent: ReactElement,
  from: string,
  replyTo: string
): Promise<EmailResult> {
  try {
    const apiKey = process.env.ZOE_RESEND_API_KEY;
    if (!apiKey) {
      return { success: false, error: "ZOE_RESEND_API_KEY not configured" };
    }

    const resend = new Resend(apiKey);

    const result = await resend.emails.send({
      from,
      to: [to],
      subject,
      react: reactComponent,
      replyTo,
    });

    if (result.error) {
      console.error("[zoe-email] Failed to send:", { error: result.error, to, subject });
      return { success: false, error: result.error.message || "Failed to send email" };
    }

    console.log("[zoe-email] Sent successfully:", { to, subject, id: result.data?.id });
    return { success: true };
  } catch (error) {
    console.error("[zoe-email] Unexpected error:", {
      error: error instanceof Error ? error.message : String(error),
      to,
      subject,
    });
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}
