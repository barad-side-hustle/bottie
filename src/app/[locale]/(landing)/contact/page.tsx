import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { locales, getLocaleCode, type Locale } from "@/lib/locale";
import { ContactForm } from "@/components/landing/ContactForm";
import { SectionBlock, SectionHeading } from "@/components/ui/section-block";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const localeCode = getLocaleCode(locale as Locale);

  return {
    title: t("meta.title"),
    description: t("meta.description"),
    keywords: t("meta.keywords"),
    openGraph: {
      title: t("meta.title"),
      description: t("meta.description"),
      url: `${baseUrl}/${locale}/contact`,
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
      canonical: `${baseUrl}/${locale}/contact`,
      languages: {
        ...Object.fromEntries(locales.map((l) => [l, `${baseUrl}/${l}/contact`])),
        "x-default": `${baseUrl}/en/contact`,
      },
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function ContactPage() {
  const t = await getTranslations("contact");

  return (
    <SectionBlock tone="cream" width="sm">
      <SectionHeading title={t("page.title")} subtitle={t("page.description")} className="mb-12" />
      <div className="mx-auto w-full max-w-lg rounded-lg border border-hairline bg-card p-6 sm:p-8 md:p-10">
        <ContactForm />
      </div>
    </SectionBlock>
  );
}
