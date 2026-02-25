import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { locales, getLocaleCode, type Locale } from "@/lib/locale";
import { TermsContent } from "./TermsContent";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "terms" });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const localeCode = getLocaleCode(locale as Locale);

  return {
    title: t("title"),
    description: t("sections.general.content"),
    openGraph: {
      title: t("title"),
      description: t("sections.general.content"),
      url: `${baseUrl}/${locale}/terms`,
      siteName: "Bottie.ai",
      locale: localeCode,
      type: "website",
      images: [
        {
          url: `/${locale}/terms/opengraph-image`,
          width: 1200,
          height: 630,
          alt: t("title"),
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("sections.general.content"),
      images: [`/${locale}/terms/opengraph-image`],
    },
    alternates: {
      canonical: `${baseUrl}/${locale}/terms`,
      languages: {
        ...Object.fromEntries(locales.map((l) => [l, `${baseUrl}/${l}/terms`])),
        "x-default": `${baseUrl}/en/terms`,
      },
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function TermsPage() {
  return <TermsContent />;
}
