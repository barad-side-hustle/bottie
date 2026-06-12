import { Font, Img } from "@react-email/components";

export const emailColors = {
  background: "#fdf9f6",
  card: "#ffffff",
  surface: "#f7f3ef",
  foreground: "#221d18",
  muted: "#68625c",
  subtle: "#8c8781",
  border: "#e4e0db",
  primary: "#117878",
  primaryHover: "#006a6a",
  primaryForeground: "#ffffff",
  accentTint: "#dcf4f4",
  accentText: "#005454",
  success: "#42926b",
  successTint: "#def5e8",
  warning: "#ce9a43",
  warningTint: "#ffeed3",
  destructive: "#c94d42",
  destructiveTint: "#ffe9e5",
  star: "#c79d59",
  starEmpty: "#e1ddda",
} as const;

export const emailTailwindConfig = {
  theme: {
    extend: {
      colors: {
        background: emailColors.background,
        card: emailColors.card,
        surface: emailColors.surface,
        foreground: emailColors.foreground,
        muted: emailColors.muted,
        subtle: emailColors.subtle,
        border: emailColors.border,
        primary: emailColors.primary,
        "primary-hover": emailColors.primaryHover,
        "accent-tint": emailColors.accentTint,
        "accent-text": emailColors.accentText,
        success: emailColors.success,
        "success-tint": emailColors.successTint,
        warning: emailColors.warning,
        "warning-tint": emailColors.warningTint,
        destructive: emailColors.destructive,
        "destructive-tint": emailColors.destructiveTint,
        highlight: emailColors.warning,
        star: emailColors.star,
        "star-empty": emailColors.starEmpty,
      },
      fontFamily: {
        sans: [
          "Inter Tight",
          "Inter",
          "Assistant",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
      },
    },
  },
};

const emailFontUrl = "https://fonts.gstatic.com/s/intertight/v9/NGSwv5HMAFg6IuGlBNMjxIsF-69MQQ.woff2";

export function EmailFont() {
  return (
    <>
      <Font
        fontFamily="Inter Tight"
        fallbackFontFamily="sans-serif"
        webFont={{ url: emailFontUrl, format: "woff2" }}
        fontWeight={400}
        fontStyle="normal"
      />
      <Font
        fontFamily="Inter Tight"
        fallbackFontFamily="sans-serif"
        webFont={{ url: emailFontUrl, format: "woff2" }}
        fontWeight={600}
        fontStyle="normal"
      />
    </>
  );
}

export function EmailLogo({ align = "center" }: { align?: "center" | "left" }) {
  return (
    <table
      role="presentation"
      cellPadding="0"
      cellSpacing="0"
      align={align}
      style={{ margin: align === "center" ? "0 auto" : undefined, borderCollapse: "collapse" }}
    >
      <tbody>
        <tr>
          <td style={{ verticalAlign: "middle", paddingRight: "8px" }}>
            <Img
              src="https://bottie.ai/images/bot-icon.png"
              width="26"
              height="26"
              alt="Bottie"
              style={{ display: "block" }}
            />
          </td>
          <td style={{ verticalAlign: "middle" }}>
            <span
              style={{
                fontSize: "20px",
                fontWeight: 600,
                letterSpacing: "-0.02em",
                color: emailColors.foreground,
                fontFamily: "'Inter Tight', sans-serif",
              }}
            >
              Bottie
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  );
}
