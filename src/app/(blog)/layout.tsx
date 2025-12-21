import type { Metadata } from "next";
import { Rubik, Nunito } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import Script from "next/script";
import "../globals.css";

const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["latin"],
  display: "swap",
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "600", "700", "800", "900"],
});

export function generateViewport() {
  return {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    themeColor: "#8b5cf6",
  };
}

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${rubik.variable} ${nunito.variable}`}>
      <body className="font-sans antialiased">
        {children}
        <Toaster richColors />

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
      </body>
    </html>
  );
}
