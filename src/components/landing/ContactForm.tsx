"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { submitContactForm } from "@/lib/actions/contact";
import { Send, CheckCircle2, AlertCircle } from "lucide-react";

const SUBJECT_OPTIONS = ["general", "support", "bug", "feature", "business"] as const;

export function ContactForm() {
  const t = useTranslations("contact");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus("idle");

    try {
      const result = await submitContactForm({
        email,
        subject: subject as (typeof SUBJECT_OPTIONS)[number],
        message,
        honeypot,
      });

      if (result.success) {
        setStatus("success");
        setEmail("");
        setSubject("");
        setMessage("");
      } else {
        setStatus("error");
        setErrorMessage(result.error || t("form.error"));
      }
    } catch {
      setStatus("error");
      setErrorMessage(t("form.error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "success") {
    return (
      <div className="flex flex-col items-start gap-3 py-8 text-start">
        <CheckCircle2 className="size-6 text-positive" strokeWidth={1.75} aria-hidden="true" />
        <div className="space-y-1.5">
          <h3 className="text-xl font-semibold tracking-[-0.02em] text-ink">{t("form.successTitle")}</h3>
          <p className="text-base leading-relaxed text-ink-2">{t("form.successMessage")}</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden" tabIndex={-1}>
        <label htmlFor="company-website">Company website</label>
        <input
          id="company-website"
          name="company-website"
          type="text"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="subject" className="text-ink">
          {t("form.subject")}
        </Label>
        <Select value={subject} onValueChange={setSubject} required>
          <SelectTrigger id="subject">
            <SelectValue placeholder={t("form.subjectPlaceholder")} />
          </SelectTrigger>
          <SelectContent>
            {SUBJECT_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {t(`form.subjects.${option}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-ink">
          {t("form.email")}
        </Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("form.emailPlaceholder")}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="message" className="text-ink">
          {t("form.message")}
        </Label>
        <Textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t("form.messagePlaceholder")}
          rows={6}
          required
          minLength={10}
          maxLength={2000}
        />
      </div>

      {status === "error" && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-md border border-hairline bg-negative-tint px-3 py-2 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{errorMessage}</span>
        </div>
      )}

      <Button type="submit" size="lg" disabled={isSubmitting || !subject} className="w-full">
        {isSubmitting ? (
          t("form.submitting")
        ) : (
          <>
            <Send className="size-4 me-2" aria-hidden="true" />
            {t("form.submit")}
          </>
        )}
      </Button>
    </form>
  );
}
