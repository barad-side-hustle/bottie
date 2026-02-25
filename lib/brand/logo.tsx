export const BRAND_BLUE = "#0f74c5";
const BRAND_NAME = "Bottie";

export function BotIconSvg({ size, color = BRAND_BLUE }: { size: number; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: size, height: size }}
    >
      <path d="M12 8V4H8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

      <rect width="16" height="12" x="4" y="8" rx="2" stroke={color} strokeWidth="2" />

      <path d="M2 14h2" stroke={color} strokeWidth="2" strokeLinecap="round" />

      <path d="M20 14h2" stroke={color} strokeWidth="2" strokeLinecap="round" />

      <path d="M9 13v2" stroke={color} strokeWidth="2" strokeLinecap="round" />

      <path d="M15 13v2" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function FullLogoJsx({ height, color = BRAND_BLUE, gap = 8 }: { height: number; color?: string; gap?: number }) {
  const fontSize = Math.round(height * 0.65);

  return (
    <div style={{ display: "flex", alignItems: "center", gap }}>
      <BotIconSvg size={height} color={color} />
      <span
        style={{
          fontSize,
          fontWeight: 700,
          color,
          lineHeight: 1,
          letterSpacing: "-0.02em",
        }}
      >
        {BRAND_NAME}
      </span>
    </div>
  );
}
