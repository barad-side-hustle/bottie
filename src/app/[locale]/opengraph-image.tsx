import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";

export const runtime = "edge";
export const alt = "Bottie.ai - AI Review Management";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function OGImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });

  const description = t("description");
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
            width: 120,
            height: 120,
            background: "white",
            borderRadius: 30,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
          }}
        >
          <div
            style={{
              fontSize: 64,
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
            fontSize: 60,
            fontWeight: 900,
            color: "white",
            textAlign: "center",
            marginBottom: 20,
            lineHeight: 1.2,
            textShadow: "0 4px 12px rgba(0,0,0,0.3)",
          }}
        >
          Bottie.ai
        </h1>

        <p
          style={{
            fontSize: 32,
            color: "rgba(255, 255, 255, 0.95)",
            textAlign: "center",
            lineHeight: 1.4,
            maxWidth: 900,
            textShadow: "0 2px 8px rgba(0,0,0,0.2)",
          }}
        >
          {description}
        </p>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 40,
          display: "flex",
          alignItems: "center",
          gap: 12,
          background: "rgba(255, 255, 255, 0.2)",
          backdropFilter: "blur(10px)",
          padding: "16px 32px",
          borderRadius: 50,
        }}
      >
        <div
          style={{
            fontSize: 24,
            color: "white",
            fontWeight: 600,
          }}
        >
          {isRTL ? "מופעל על ידי AI" : "Powered by AI"}
        </div>
      </div>
    </div>,
    {
      ...size,
    }
  );
}
