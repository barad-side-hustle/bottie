"use client";

import { useTranslations } from "next-intl";
import type { FrameStyle, QrCodeSettings } from "@/lib/types/qr-settings.types";
import { cn } from "@/lib/utils";
import { ColorPicker } from "../ColorPicker";

const FRAME_STYLES: FrameStyle[] = ["none", "simple", "rounded", "badge"];

interface QrFrameControlsProps {
  settings: QrCodeSettings;
  onChange: (patch: Partial<QrCodeSettings>) => void;
}

export function QrFrameControls({ settings, onChange }: QrFrameControlsProps) {
  const t = useTranslations("dashboard.solicitation.frame");

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <label className="text-xs font-medium text-muted-foreground">{t("title")}</label>
        <div className="grid grid-cols-2 gap-2">
          {FRAME_STYLES.map((style) => (
            <button
              key={style}
              type="button"
              onClick={() => onChange({ frameStyle: style })}
              className={cn(
                "flex cursor-pointer flex-col items-center gap-1.5 rounded-lg border p-3 text-xs transition-all",
                settings.frameStyle === style
                  ? "border-primary bg-primary/5 ring-2 ring-primary"
                  : "border-border/60 hover:border-border"
              )}
            >
              <FramePreview style={style} />
              <span className="font-medium">{t(style)}</span>
            </button>
          ))}
        </div>
      </div>

      {settings.frameStyle !== "none" && (
        <ColorPicker
          label={t("color")}
          value={settings.frameColor}
          onChange={(frameColor) => onChange({ frameColor })}
        />
      )}
    </div>
  );
}

function FramePreview({ style }: { style: FrameStyle }) {
  const size = 32;

  if (style === "none") {
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="text-foreground">
        <rect x={6} y={6} width={20} height={20} fill="currentColor" opacity={0.2} />
      </svg>
    );
  }

  const rounded = style === "rounded" || style === "badge";
  const hasBadge = style === "badge";

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="text-foreground">
      <rect x={1} y={1} width={30} height={30} rx={rounded ? 4 : 0} fill="none" stroke="currentColor" strokeWidth={2} />
      <rect x={6} y={6} width={20} height={hasBadge ? 16 : 20} fill="currentColor" opacity={0.2} />
      {hasBadge && <rect x={1} y={24} width={30} height={7} rx={rounded ? 0 : 0} fill="currentColor" opacity={0.4} />}
    </svg>
  );
}
