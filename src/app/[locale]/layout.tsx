import type { Metadata } from "next";
import { Inter_Tight, Assistant } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { AuthProvider } from "@/contexts/AuthContext";
import { DirectionProvider } from "@/contexts/DirectionProvider";
import { DirectionalToaster } from "@/components/DirectionalToaster";
import { RybbitProvider } from "@/components/RybbitProvider";

import { locales, getLocaleDir, getLocaleCode, localeCodeMap, type Locale } from "@/lib/locale";
import "../globals.css";
import Script from "next/script";

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const assistant = Assistant({
  variable: "--font-assistant",
  subsets: ["hebrew", "latin"],
  display: "swap",
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export function generateViewport() {
  return {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    themeColor: "#1f7b83",
  };
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const localeCode = getLocaleCode(locale as Locale);
  const alternateLocale = locales.filter((l) => l !== locale).map((l) => localeCodeMap[l]);
  const ogImage = {
    url: `/${locale}/opengraph-image`,
    width: 1200,
    height: 630,
    alt: t("ogImage.alt"),
  };

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: t("title"),
      template: `%s | ${t("title")}`,
    },
    description: t("description"),
    keywords: t("keywords"),
    applicationName: "Bottie.ai",
    category: "Business Software",
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      type: "website",
      locale: localeCode,
      alternateLocale: alternateLocale,
      siteName: "Bottie.ai",
      title: t("title"),
      description: t("description"),
      url: `${baseUrl}/${locale}`,
      images: [ogImage],
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
        ...Object.fromEntries(locales.map((l) => [l, `${baseUrl}/${l}`])),
        "x-default": `${baseUrl}/en`,
      },
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: "Bottie.ai",
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  const messages = await getMessages({ locale });
  const dir = getLocaleDir(locale as Locale);

  return (
    <html lang={locale} dir={dir} className={`${interTight.variable} ${assistant.variable}`}>
      <body className="font-sans antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <DirectionProvider initialDir={dir}>
            <AuthProvider>
              <RybbitProvider />

              {children}
              <DirectionalToaster />
            </AuthProvider>
          </DirectionProvider>

          <Script src="https://www.googletagmanager.com/gtag/js?id=AW-17485891262" strategy="afterInteractive" />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'AW-17485891262');
              gtag('config', 'G-4077J0PY28');
            `}
          </Script>
          <Script id="sw-register" strategy="afterInteractive">
            {`if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js').catch(function(){})}`}
          </Script>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
