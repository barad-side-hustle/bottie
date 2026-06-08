import { getTranslations, getMessages } from "next-intl/server";
import { type Locale } from "@/lib/locale";
import { PRICE_PER_LOCATION, FREE_LOCATION_LIMITS } from "@/lib/subscriptions/plans";

const APP_NAME = "Bottie";

function getBaseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

export async function generateOrganizationSchema(locale: Locale) {
  const baseUrl = getBaseUrl();
  const t = await getTranslations({ locale, namespace: "metadata" });

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${baseUrl}/#organization`,
    name: APP_NAME,
    url: baseUrl,
    logo: {
      "@type": "ImageObject",
      url: `${baseUrl}/images/logo-full.svg`,
    },
    description: t("description"),
    contactPoint: {
      "@type": "ContactPoint",
      email: "alon@bottie.ai",
      contactType: "customer support",
      availableLanguage: ["English", "Hebrew", "Spanish"],
    },
    address: {
      "@type": "PostalAddress",
      addressCountry: "IL",
      addressLocality: "Tel Aviv",
    },
  };
}

export function generateWebSiteSchema(locale: Locale) {
  const baseUrl = getBaseUrl();

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${baseUrl}/#website`,
    name: APP_NAME,
    url: `${baseUrl}/${locale}`,
    inLanguage: locale,
    publisher: {
      "@id": `${baseUrl}/#organization`,
    },
  };
}

export async function generateSoftwareApplicationSchema(locale: Locale) {
  const baseUrl = getBaseUrl();
  const t = await getTranslations({ locale, namespace: "metadata" });
  const tPlans = await getTranslations({ locale, namespace: "landing.pricing.plans" });

  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: APP_NAME,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web Browser",
    url: baseUrl,
    description: t("description"),
    offers: [
      {
        "@type": "Offer",
        name: tPlans("free.name"),
        price: "0",
        priceCurrency: "USD",
        description: tPlans("free.description", { count: FREE_LOCATION_LIMITS.reviewsPerMonth }),
      },
      {
        "@type": "Offer",
        name: tPlans("pro.name"),
        price: String(PRICE_PER_LOCATION),
        priceCurrency: "USD",
        description: tPlans("pro.description"),
      },
    ],
    featureList: [
      locale === "en"
        ? "AI-powered review responses"
        : locale === "he"
          ? "תשובות ביקורות מבוססות AI"
          : "Respuestas a resenas con IA",
      locale === "en"
        ? "Google Business Profile integration"
        : locale === "he"
          ? "אינטגרציה עם Google Business Profile"
          : "Integracion con Google Business Profile",
      locale === "en"
        ? "Automatic response publishing"
        : locale === "he"
          ? "פרסום תשובות אוטומטי"
          : "Publicacion automatica de respuestas",
      locale === "en"
        ? "Manual approval workflow"
        : locale === "he"
          ? "תהליך אישור ידני"
          : "Flujo de aprobacion manual",
      locale === "en"
        ? "Performance analytics and insights"
        : locale === "he"
          ? "ניתוח ביצועים ותובנות"
          : "Analiticas e informacion de rendimiento",
      locale === "en"
        ? "Multi-location management"
        : locale === "he"
          ? "ניהול מיקומים מרובים"
          : "Gestion de multiples ubicaciones",
      locale === "en"
        ? "Custom tone and language settings"
        : locale === "he"
          ? "הגדרות טון ושפה מותאמות אישית"
          : "Ajustes de tono e idioma personalizados",
    ],
  };
}

export async function generateFAQPageSchema(locale: Locale) {
  const t = await getTranslations({ locale, namespace: "landing.faq" });
  const messages = (await getMessages({ locale })) as {
    landing?: { faq?: { items?: Record<string, unknown> } };
  };

  const items = messages.landing?.faq?.items ?? {};
  const itemCount = Object.keys(items).length;

  const mainEntity = Array.from({ length: itemCount }).map((_, index) => ({
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
