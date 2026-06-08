"use client";

import { useTranslations, useLocale } from "next-intl";
import type { Locale } from "@/lib/locale";
import { SectionBlock } from "@/components/ui/section-block";

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
        <header className="mb-12 max-w-2xl">
          <h1 className="text-3xl font-semibold tracking-[-0.02em] text-ink sm:text-4xl">{t("title")}</h1>
          <p className="mt-3 text-sm text-ink-3 nums">{t("lastUpdated", { date: formattedDate })}</p>
        </header>

        <div className="max-w-2xl space-y-10 text-base leading-relaxed text-ink-2">
          <section className="space-y-3">
            <h2 className="text-xl font-medium text-ink">{t("sections.general.title")}</h2>
            <p>{t("sections.general.content")}</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-medium text-ink">{t("sections.service.title")}</h2>
            <p>{t("sections.service.content")}</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-medium text-ink">{t("sections.permittedUse.title")}</h2>
            <p>{t("sections.permittedUse.content")}</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-medium text-ink">{t("sections.userAccount.title")}</h2>
            <p>{t("sections.userAccount.content")}</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-medium text-ink">{t("sections.paymentRefunds.title")}</h2>
            <p>{t("sections.paymentRefunds.content")}</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-medium text-ink">{t("sections.intellectualProperty.title")}</h2>
            <p>{t("sections.intellectualProperty.content")}</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-medium text-ink">{t("sections.limitationLiability.title")}</h2>
            <p>{t("sections.limitationLiability.content")}</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-medium text-ink">{t("sections.changes.title")}</h2>
            <p>{t("sections.changes.content")}</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-medium text-ink">{t("sections.contact.title")}</h2>
            <p>
              {t("sections.contact.content")}{" "}
              <a href={`mailto:${t("sections.contact.email")}`} className="text-accent-text hover:underline">
                {t("sections.contact.email")}
              </a>
            </p>
          </section>
        </div>
      </SectionBlock>
    </main>
  );
}
