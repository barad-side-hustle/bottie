import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Hero } from "@/components/landing/Hero";
import { Statistics } from "@/components/landing/Statistics";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { PricingCards } from "@/components/landing/PricingCards";
import { Testimonials } from "@/components/landing/Testimonials";
import { FAQ } from "@/components/landing/FAQ";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { StructuredData } from "@/components/seo/StructuredData";
import {
  generateOrganizationSchema,
  generateSoftwareApplicationSchema,
  generateFAQPageSchema,
} from "@/lib/seo/structured-data";
import { type Locale } from "@/lib/locale";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const localeCode = locale === "he" ? "he_IL" : "en_US";

  return {
    title: t("title"),
    description: t("description"),
    keywords: t("keywords"),
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: `${baseUrl}/${locale}`,
      siteName: "Bottie.ai",
      locale: localeCode,
      type: "website",
      images: [
        {
          url: `/${locale}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: t("ogImage.alt"),
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
      images: [`/${locale}/opengraph-image`],
    },
    alternates: {
      canonical: `${baseUrl}/${locale}`,
      languages: {
        en: `${baseUrl}/en`,
        he: `${baseUrl}/he`,
        "x-default": `${baseUrl}/en`,
      },
    },
  };
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  const schemas = [
    generateOrganizationSchema(locale as Locale),
    generateSoftwareApplicationSchema(locale as Locale),
    await generateFAQPageSchema(locale as Locale),
  ];

  return (
    <>
      <StructuredData data={schemas} />
      <main className="grow space-y-20">
        <Hero />
        <Statistics />
        <HowItWorks />
        <PricingCards />
        <Testimonials />
        <FAQ />
        <FinalCTA />
      </main>
    </>
  );
}
