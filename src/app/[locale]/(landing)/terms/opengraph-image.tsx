import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";

export const runtime = "edge";
export const alt = "Terms of Service - Bottie.ai";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function TermsOGImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "terms" });

  const title = t("title");
  const isRTL = locale === "he";

  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        fontFamily: "system-ui, -apple-system, sans-serif",
        direction: isRTL ? "rtl" : "ltr",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 40,
        }}
      >
        <div
          style={{
            width: 100,
            height: 100,
            background: "white",
            borderRadius: 25,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
          }}
        >
          <div
            style={{
              fontSize: 54,
              fontWeight: 900,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            B
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "0 80px",
        }}
      >
        <h1
          style={{
            fontSize: 56,
            fontWeight: 900,
            color: "white",
            textAlign: "center",
            marginBottom: 20,
            lineHeight: 1.2,
            textShadow: "0 4px 12px rgba(0,0,0,0.3)",
          }}
        >
          {title}
        </h1>

        <p
          style={{
            fontSize: 28,
            color: "rgba(255, 255, 255, 0.9)",
            textAlign: "center",
            lineHeight: 1.4,
            maxWidth: 800,
            textShadow: "0 2px 8px rgba(0,0,0,0.2)",
          }}
        >
          Bottie.ai
        </p>
      </div>
    </div>,
    {
      ...size,
    }
  );
}
