import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";

import { BotIconSvg, BRAND_BLUE } from "@/lib/brand/logo";
import { BG_LIGHT, DARK_TEXT, MUTED_TEXT, PASTEL_LAVENDER, PASTEL_SKY, fixRtlText, loadRubikFont } from "./og-utils";

export const alt = "Bottie.ai - AI Review Management";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function OGImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "landing.hero" });
  const tMeta = await getTranslations({ locale, namespace: "metadata" });

  const title = t("title");
  const highlight = t("titleHighlight");
  const description = tMeta("description");
  const isRTL = locale === "he";

  const [rubikBold, rubikRegular] = await Promise.all([loadRubikFont(700), loadRubikFont(400)]);

  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: BG_LIGHT,
        fontFamily: "Rubik",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -80,
          right: -60,
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: PASTEL_LAVENDER,
          opacity: 0.6,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -100,
          left: -80,
          width: 350,
          height: 350,
          borderRadius: "50%",
          background: PASTEL_SKY,
          opacity: 0.6,
        }}
      />

      <BotIconSvg size={80} />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "0 100px",
          marginTop: 28,
        }}
      >
        <div
          style={{
            fontSize: 52,
            fontWeight: 700,
            color: DARK_TEXT,
            textAlign: "center",
            lineHeight: 1.2,
          }}
        >
          {isRTL ? fixRtlText(title) : title}
        </div>
        <div
          style={{
            fontSize: 52,
            fontWeight: 700,
            color: BRAND_BLUE,
            textAlign: "center",
            lineHeight: 1.2,
            marginTop: 4,
          }}
        >
          {isRTL ? fixRtlText(highlight) : highlight}
        </div>

        <div
          style={{
            fontSize: 24,
            color: MUTED_TEXT,
            textAlign: "center",
            lineHeight: 1.5,
            maxWidth: 900,
            marginTop: 24,
          }}
        >
          {isRTL ? fixRtlText(description) : description}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 36,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <BotIconSvg size={28} />
        <div
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: BRAND_BLUE,
          }}
        >
          Bottie.ai
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: "Rubik", data: rubikBold, weight: 700 as const, style: "normal" as const },
        { name: "Rubik", data: rubikRegular, weight: 400 as const, style: "normal" as const },
      ],
    }
  );
}
