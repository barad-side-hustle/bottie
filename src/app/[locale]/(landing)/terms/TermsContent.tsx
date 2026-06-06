"use client";

import { useTranslations, useLocale } from "next-intl";
import type { Locale } from "@/lib/locale";
import { SectionBlock, SectionHeading } from "@/components/ui/section-block";

const LAST_UPDATED_DATE = new Date("2025-11-09");

export function TermsContent() {
  const t = useTranslations("terms");
  const locale = useLocale() as Locale;

  const formattedDate = LAST_UPDATED_DATE.toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="grow">
      <SectionBlock tone="plain" width="sm">
        <SectionHeading title={t("title")} align="start" className="mb-10" />

        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t("sections.general.title")}</h2>
            <p className="text-muted-foreground leading-relaxed">{t("sections.general.content")}</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t("sections.service.title")}</h2>
            <p className="text-muted-foreground leading-relaxed">{t("sections.service.content")}</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t("sections.permittedUse.title")}</h2>
            <p className="text-muted-foreground leading-relaxed">{t("sections.permittedUse.content")}</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t("sections.userAccount.title")}</h2>
            <p className="text-muted-foreground leading-relaxed">{t("sections.userAccount.content")}</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t("sections.paymentRefunds.title")}</h2>
            <p className="text-muted-foreground leading-relaxed">{t("sections.paymentRefunds.content")}</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t("sections.intellectualProperty.title")}</h2>
            <p className="text-muted-foreground leading-relaxed">{t("sections.intellectualProperty.content")}</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t("sections.limitationLiability.title")}</h2>
            <p className="text-muted-foreground leading-relaxed">{t("sections.limitationLiability.content")}</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t("sections.changes.title")}</h2>
            <p className="text-muted-foreground leading-relaxed">{t("sections.changes.content")}</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t("sections.contact.title")}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t("sections.contact.content")}{" "}
              <a href={`mailto:${t("sections.contact.email")}`} className="text-primary hover:underline">
                {t("sections.contact.email")}
              </a>
            </p>
          </section>

          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground">{t("lastUpdated", { date: formattedDate })}</p>
          </div>
        </div>
      </SectionBlock>
    </main>
  );
}
