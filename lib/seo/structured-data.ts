import { getTranslations } from "next-intl/server";
import { type Locale } from "@/lib/locale";

export function generateOrganizationSchema(locale: Locale) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Bottie.ai",
    url: baseUrl,
    logo: `${baseUrl}/images/logo-full.svg`,
    description:
      locale === "en"
        ? "AI-powered Google review management and automated response generation for businesses"
        : "ניהול ביקורות Google ויצירת מענה אוטומטי מבוסס בינה מלאכותית לעסקים",
    contactPoint: {
      "@type": "ContactPoint",
      email: "alon@bottie.ai",
      contactType: "customer support",
      availableLanguage: ["English", "Hebrew"],
    },
    address: {
      "@type": "PostalAddress",
      addressCountry: "IL",
      addressLocality: "Tel Aviv",
    },
  };
}

export function generateSoftwareApplicationSchema(locale: Locale) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Bottie.ai",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web Browser",
    url: baseUrl,
    description:
      locale === "en"
        ? "Automatically generate professional responses to customer reviews using artificial intelligence. Bottie.ai integrates with Google Business Profile to help businesses manage their online reputation efficiently."
        : "ייצור אוטומטי של תשובות מקצועיות לביקורות לקוחות באמצעות בינה מלאכותית. Bottie.ai משתלב עם Google Business Profile כדי לעזור לעסקים לנהל את המוניטין המקוון שלהם ביעילות.",
    offers: [
      {
        "@type": "Offer",
        name: locale === "en" ? "Free Plan" : "תוכנית חינמית",
        price: "0",
        priceCurrency: "ILS",
        description:
          locale === "en"
            ? "5 AI-generated responses per month, 1 location, manual approval"
            : "5 תשובות AI בחודש, מיקום אחד, אישור ידני",
      },
      {
        "@type": "Offer",
        name: locale === "en" ? "Basic Plan" : "תוכנית בסיסית",
        price: "290",
        priceCurrency: "ILS",
        description:
          locale === "en"
            ? "100 AI-generated responses per month, 3 locations, auto-publish, WhatsApp support"
            : "100 תשובות AI בחודש, 3 מיקומים, פרסום אוטומטי, תמיכה בווטסאפ",
      },
      {
        "@type": "Offer",
        name: locale === "en" ? "Pro Plan" : "תוכנית מקצועית",
        price: "790",
        priceCurrency: "ILS",
        description:
          locale === "en"
            ? "Unlimited AI-generated responses, unlimited locations, auto-publish, priority WhatsApp support"
            : "תשובות AI ללא הגבלה, מיקומים ללא הגבלה, פרסום אוטומטי, תמיכה עדיפה בווטסאפ",
      },
    ],
    featureList: [
      locale === "en" ? "AI-powered review responses" : "תשובות ביקורות מבוססות AI",
      locale === "en" ? "Google Business Profile integration" : "אינטגרציה עם Google Business Profile",
      locale === "en" ? "Automatic response publishing" : "פרסום תשובות אוטומטי",
      locale === "en" ? "Manual approval workflow" : "תהליך אישור ידני",
      locale === "en" ? "WhatsApp support" : "תמיכה בווטסאפ",
      locale === "en" ? "Multi-location management" : "ניהול מיקומים מרובים",
      locale === "en" ? "Custom tone and language settings" : "הגדרות טון ושפה מותאמות אישית",
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "3",
      bestRating: "5",
      worstRating: "1",
    },
  };
}

export async function generateFAQPageSchema(locale: Locale) {
  const t = await getTranslations({ locale, namespace: "landing.faq" });

  const FAQ_ITEM_COUNT = 8;
  const mainEntity = Array.from({ length: FAQ_ITEM_COUNT }).map((_, index) => ({
    "@type": "Question",
    name: t(`items.${index}.question`),
    acceptedAnswer: {
      "@type": "Answer",
      text: t(`items.${index}.answer`),
    },
  }));

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity,
  };
}
