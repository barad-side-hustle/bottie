import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { locales, getLocaleCode, type Locale } from "@/lib/locale";
import { AboutContent } from "./AboutContent";
import { StructuredData } from "@/components/seo/StructuredData";
import { generateOrganizationSchema } from "@/lib/seo/structured-data";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const localeCode = getLocaleCode(locale as Locale);

  return {
    title: t("meta.title"),
    description: t("meta.description"),
    keywords: t("meta.keywords"),
    openGraph: {
      title: t("meta.title"),
      description: t("meta.description"),
      url: `${baseUrl}/${locale}/about`,
      siteName: "Bottie.ai",
      locale: localeCode,
      type: "website",
      images: [
        {
          url: `/${locale}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: t("meta.title"),
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t("meta.title"),
      description: t("meta.description"),
      images: [`/${locale}/opengraph-image`],
    },
    alternates: {
      canonical: `${baseUrl}/${locale}/about`,
      languages: {
        ...Object.fromEntries(locales.map((l) => [l, `${baseUrl}/${l}/about`])),
        "x-default": `${baseUrl}/en/about`,
      },
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  return (
    <>
      <StructuredData data={generateOrganizationSchema(locale as Locale)} />
      <AboutContent />
    </>
  );
}
