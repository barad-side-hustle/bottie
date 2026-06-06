"use client";

import { useTranslations, useLocale } from "next-intl";
import { localeDateMap, type Locale } from "@/lib/locale";
import { SectionBlock, SectionHeading } from "@/components/ui/section-block";

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
        <SectionHeading title={t("title")} align="start" className="mb-10" />

        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t("sections.introduction.title")}</h2>
            <p className="text-muted-foreground leading-relaxed">{t("sections.introduction.content")}</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t("sections.informationCollected.title")}</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">{t("sections.informationCollected.content")}</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 me-6">
              {informationCollectedItems.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t("sections.useOfInformation.title")}</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">{t("sections.useOfInformation.content")}</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 me-6">
              {useOfInformationItems.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t("sections.informationSecurity.title")}</h2>
            <p className="text-muted-foreground leading-relaxed">{t("sections.informationSecurity.content")}</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              {t("sections.sharingWithThirdParties.title")}
            </h2>
            <p className="text-muted-foreground leading-relaxed">{t("sections.sharingWithThirdParties.content")}</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 me-6 mt-4">
              {sharingWithThirdPartiesItems.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t("sections.userRights.title")}</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">{t("sections.userRights.content")}</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 me-6">
              {userRightsItems.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t("sections.cookies.title")}</h2>
            <p className="text-muted-foreground leading-relaxed">{t("sections.cookies.content")}</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t("sections.dataRetention.title")}</h2>
            <p className="text-muted-foreground leading-relaxed">{t("sections.dataRetention.content")}</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t("sections.policyChanges.title")}</h2>
            <p className="text-muted-foreground leading-relaxed">{t("sections.policyChanges.content")}</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t("sections.contact.title")}</h2>
            <p className="text-muted-foreground leading-relaxed">{t("sections.contact.content")}</p>
            <div className="mt-4 space-y-2 text-muted-foreground">
              <p>
                {t("sections.contact.email", { email: t("sections.contact.emailValue") })}{" "}
                <a href={`mailto:${t("sections.contact.emailValue")}`} className="text-primary hover:underline">
                  {t("sections.contact.emailValue")}
                </a>
              </p>
            </div>
          </section>

          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground">{t("lastUpdated", { date: formattedDate })}</p>
          </div>
        </div>
      </SectionBlock>
    </main>
  );
}
