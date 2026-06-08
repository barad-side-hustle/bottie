import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";

import { BotIconSvg } from "@/lib/brand/logo";
import { ACCENT_TEAL, BG_LIGHT, DARK_TEXT, MUTED_TEXT, fixRtlText, loadRubikFont } from "./og-utils";
import { getLocaleDir, type Locale } from "@/lib/locale";

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
  const isRTL = getLocaleDir(locale as Locale) === "rtl";

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
      <BotIconSvg size={80} color={ACCENT_TEAL} />

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
            color: ACCENT_TEAL,
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
        <BotIconSvg size={28} color={ACCENT_TEAL} />
        <div
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: ACCENT_TEAL,
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
