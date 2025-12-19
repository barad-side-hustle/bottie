import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { getTranslations } from "next-intl/server";
import { Hero } from "@/components/landing/Hero";
import { Pricing } from "@/components/landing/Pricing";
import { StructuredData } from "@/components/seo/StructuredData";
import {
  generateOrganizationSchema,
  generateSoftwareApplicationSchema,
  generateFAQPageSchema,
} from "@/lib/seo/structured-data";
import { type Locale } from "@/lib/locale";

const Statistics = dynamic(
  () => import("@/components/landing/Statistics").then((mod) => ({ default: mod.Statistics })),
  {
    ssr: true,
  }
);

const HowItWorks = dynamic(
  () => import("@/components/landing/HowItWorks").then((mod) => ({ default: mod.HowItWorks })),
  {
    ssr: true,
  }
);

const Testimonials = dynamic(
  () => import("@/components/landing/Testimonials").then((mod) => ({ default: mod.Testimonials })),
  { ssr: true }
);

const FAQ = dynamic(() => import("@/components/landing/FAQ").then((mod) => ({ default: mod.FAQ })), {
  ssr: true,
  loading: () => <div className="h-96 animate-pulse bg-muted rounded-lg" />,
});

const FinalCTA = dynamic(() => import("@/components/landing/FinalCTA").then((mod) => ({ default: mod.FinalCTA })), {
  ssr: true,
});

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
        <Pricing />
        <Testimonials />
        <FAQ />
        <FinalCTA />
      </main>
    </>
  );
}
