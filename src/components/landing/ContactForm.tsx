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
      <div className="text-center py-12">
        <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">{t("form.successTitle")}</h3>
        <p className="text-muted-foreground">{t("form.successMessage")}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg mx-auto">
      <div className="space-y-2">
        <Label htmlFor="subject">{t("form.subject")}</Label>
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
        <Label htmlFor="email">{t("form.email")}</Label>
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
        <Label htmlFor="message">{t("form.message")}</Label>
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
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span>{errorMessage}</span>
        </div>
      )}

      <Button type="submit" disabled={isSubmitting || !subject} className="w-full">
        {isSubmitting ? (
          t("form.submitting")
        ) : (
          <>
            <Send className="h-4 w-4 me-2" />
            {t("form.submit")}
          </>
        )}
      </Button>
    </form>
  );
}
