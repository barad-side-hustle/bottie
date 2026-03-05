"use server";

import { z } from "zod";
import { sendContactFormEmail } from "@/lib/utils/email-service";

const contactFormSchema = z.object({
  email: z.string().email(),
  subject: z.enum(["general", "support", "bug", "feature", "business"]),
  message: z.string().min(10).max(2000),
});

type ContactFormInput = z.infer<typeof contactFormSchema>;

interface ContactFormResult {
  success: boolean;
  error?: string;
}

export async function submitContactForm(input: ContactFormInput): Promise<ContactFormResult> {
  const validation = contactFormSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.errors.map((e) => e.message).join(", "),
    };
  }

  const { email, subject, message } = validation.data;

  const result = await sendContactFormEmail({ email, subject, message });

  return {
    success: result.success,
    error: result.error,
  };
}
