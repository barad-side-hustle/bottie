import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PrivacyContent } from "./PrivacyContent";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "privacy" });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const localeCode = locale === "he" ? "he_IL" : "en_US";

  return {
    title: t("title"),
    description: t("sections.introduction.content"),
    openGraph: {
      title: t("title"),
      description: t("sections.introduction.content"),
      url: `${baseUrl}/${locale}/privacy`,
      siteName: "Bottie.ai",
      locale: localeCode,
      type: "website",
      images: [
        {
          url: `/${locale}/privacy/opengraph-image`,
          width: 1200,
          height: 630,
          alt: t("title"),
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("sections.introduction.content"),
      images: [`/${locale}/privacy/opengraph-image`],
    },
    alternates: {
      canonical: `${baseUrl}/${locale}/privacy`,
      languages: {
        en: `${baseUrl}/en/privacy`,
        he: `${baseUrl}/he/privacy`,
        "x-default": `${baseUrl}/en/privacy`,
      },
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function PrivacyPage() {
  return <PrivacyContent />;
}
