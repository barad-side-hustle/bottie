"use client";

import { useTranslations } from "next-intl";
import type { FrameFont, QrCodeSettings, QrLinkType } from "@/lib/types/qr-settings.types";
import { cn } from "@/lib/utils";
import { ColorPicker } from "../ColorPicker";
import { QrLogoControls } from "./QrLogoControls";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Link, MapPin, Globe } from "lucide-react";

const FRAME_FONTS: FrameFont[] = [
  "sans-serif",
  "serif",
  "monospace",
  "cursive",
  "arial",
  "georgia",
  "impact",
  "verdana",
];

const LINK_TYPES: { value: QrLinkType; icon: typeof Link }[] = [
  { value: "review", icon: Link },
  { value: "googleMaps", icon: MapPin },
  { value: "custom", icon: Globe },
];

interface QrContentControlsProps {
  settings: QrCodeSettings;
  locationId: string;
  onChange: (patch: Partial<QrCodeSettings>) => void;
}

export function QrContentControls({ settings, locationId, onChange }: QrContentControlsProps) {
  const t = useTranslations("dashboard.solicitation.content");
  const tFrame = useTranslations("dashboard.solicitation.frame");

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <label className="text-xs font-semibold uppercase tracking-[0.02em] text-ink-2">{t("linkType")}</label>
        <div className="grid grid-cols-3 gap-2">
          {LINK_TYPES.map(({ value, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => onChange({ linkType: value })}
              aria-pressed={settings.linkType === value}
              className={cn(
                "flex cursor-pointer flex-col items-center gap-1.5 rounded-md border p-3 text-xs transition-colors duration-150 ease-[var(--ease-standard)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                settings.linkType === value
                  ? "border-line-strong bg-surface-3 font-medium text-ink"
                  : "border-hairline text-ink-2 hover:bg-surface-2"
              )}
            >
              <Icon className="size-4 text-ink-3" strokeWidth={1.5} />
              <span>{t(`linkTypes.${value}`)}</span>
            </button>
          ))}
        </div>
        {settings.linkType === "custom" && (
          <Input
            value={settings.customUrl}
            onChange={(e) => onChange({ customUrl: e.target.value })}
            placeholder="https://..."
            dir="ltr"
            className="text-sm"
          />
        )}
      </div>

      <div className="space-y-4 border-t border-hairline pt-6">
        <div className="space-y-2">
          <label className="text-xs font-medium text-ink-2">{tFrame("text")}</label>
          <Input
            value={settings.frameText}
            onChange={(e) => onChange({ frameText: e.target.value })}
            placeholder={tFrame("textPlaceholder")}
            className="text-sm"
            maxLength={40}
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-ink-2">{tFrame("fontSize")}</label>
            <span className="text-xs tabular-nums text-ink-3">{settings.frameTextSize}px</span>
          </div>
          <Slider
            value={[settings.frameTextSize]}
            onValueChange={([v]) => onChange({ frameTextSize: v })}
            min={10}
            max={24}
            step={1}
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-ink-2">{tFrame("font")}</label>
          <div className="grid grid-cols-2 gap-2">
            {FRAME_FONTS.map((font) => (
              <button
                key={font}
                type="button"
                onClick={() => onChange({ frameTextFont: font })}
                aria-pressed={settings.frameTextFont === font}
                className={cn(
                  "cursor-pointer rounded-md border px-3 py-2 text-sm transition-colors duration-150 ease-[var(--ease-standard)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  settings.frameTextFont === font
                    ? "border-line-strong bg-surface-3 text-ink"
                    : "border-hairline text-ink-2 hover:bg-surface-2"
                )}
                style={{ fontFamily: font }}
              >
                {tFrame(`fonts.${font}`)}
              </button>
            ))}
          </div>
        </div>
        <ColorPicker
          label={tFrame("textColor")}
          value={settings.frameTextColor}
          onChange={(frameTextColor) => onChange({ frameTextColor })}
        />
      </div>

      <div className="border-t border-hairline pt-6">
        <QrLogoControls settings={settings} locationId={locationId} onChange={onChange} />
      </div>
    </div>
  );
}
