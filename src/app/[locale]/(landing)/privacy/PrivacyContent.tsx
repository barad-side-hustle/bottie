"use client";

import { useTranslations, useLocale } from "next-intl";
import { localeDateMap, type Locale } from "@/lib/locale";
import { SectionBlock } from "@/components/ui/section-block";

const LAST_UPDATED_DATE = new Date("2025-11-09");

export function PrivacyContent() {
  const t = useTranslations("privacy");
  const locale = useLocale() as Locale;

  const formattedDate = LAST_UPDATED_DATE.toLocaleDateString(localeDateMap[locale], {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const informationCollectedItems = t.raw("sections.informationCollected.items") as string[];
  const useOfInformationItems = t.raw("sections.useOfInformation.items") as string[];
  const sharingWithThirdPartiesItems = t.raw("sections.sharingWithThirdParties.items") as string[];
  const userRightsItems = t.raw("sections.userRights.items") as string[];

  return (
    <main className="grow">
      <SectionBlock tone="plain" width="sm">
        <header className="mb-12 max-w-2xl">
          <h1 className="text-3xl font-semibold tracking-[-0.02em] text-ink sm:text-4xl">{t("title")}</h1>
          <p className="mt-3 text-sm text-ink-3 nums">{t("lastUpdated", { date: formattedDate })}</p>
        </header>

        <div className="max-w-2xl space-y-10 text-base leading-relaxed text-ink-2">
          <section className="space-y-3">
            <h2 className="text-xl font-medium text-ink">{t("sections.introduction.title")}</h2>
            <p>{t("sections.introduction.content")}</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-medium text-ink">{t("sections.informationCollected.title")}</h2>
            <p>{t("sections.informationCollected.content")}</p>
            <ul className="ms-5 list-disc space-y-2 marker:text-ink-3">
              {informationCollectedItems.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-medium text-ink">{t("sections.useOfInformation.title")}</h2>
            <p>{t("sections.useOfInformation.content")}</p>
            <ul className="ms-5 list-disc space-y-2 marker:text-ink-3">
              {useOfInformationItems.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-medium text-ink">{t("sections.informationSecurity.title")}</h2>
            <p>{t("sections.informationSecurity.content")}</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-medium text-ink">{t("sections.sharingWithThirdParties.title")}</h2>
            <p>{t("sections.sharingWithThirdParties.content")}</p>
            <ul className="ms-5 list-disc space-y-2 marker:text-ink-3">
              {sharingWithThirdPartiesItems.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-medium text-ink">{t("sections.userRights.title")}</h2>
            <p>{t("sections.userRights.content")}</p>
            <ul className="ms-5 list-disc space-y-2 marker:text-ink-3">
              {userRightsItems.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-medium text-ink">{t("sections.cookies.title")}</h2>
            <p>{t("sections.cookies.content")}</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-medium text-ink">{t("sections.dataRetention.title")}</h2>
            <p>{t("sections.dataRetention.content")}</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-medium text-ink">{t("sections.policyChanges.title")}</h2>
            <p>{t("sections.policyChanges.content")}</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-medium text-ink">{t("sections.contact.title")}</h2>
            <p>{t("sections.contact.content")}</p>
            <p>
              {t("sections.contact.email", { email: t("sections.contact.emailValue") })}{" "}
              <a href={`mailto:${t("sections.contact.emailValue")}`} className="text-accent-text hover:underline">
                {t("sections.contact.emailValue")}
              </a>
            </p>
          </section>
        </div>
      </SectionBlock>
    </main>
  );
}
