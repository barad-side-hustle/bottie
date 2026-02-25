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
        <label className="text-xs font-medium text-muted-foreground">{t("linkType")}</label>
        <div className="grid grid-cols-3 gap-2">
          {LINK_TYPES.map(({ value, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => onChange({ linkType: value })}
              className={cn(
                "flex cursor-pointer flex-col items-center gap-1.5 rounded-lg border p-3 text-xs transition-all",
                settings.linkType === value
                  ? "border-primary bg-primary/5 ring-2 ring-primary"
                  : "border-border/60 hover:border-border"
              )}
            >
              <Icon className="size-4" />
              <span className="font-medium">{t(`linkTypes.${value}`)}</span>
            </button>
          ))}
        </div>
        {settings.linkType === "custom" && (
          <Input
            value={settings.customUrl}
            onChange={(e) => onChange({ customUrl: e.target.value })}
            placeholder="https://..."
            dir="ltr"
            className="h-9 text-sm"
          />
        )}
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">{tFrame("text")}</label>
          <Input
            value={settings.frameText}
            onChange={(e) => onChange({ frameText: e.target.value })}
            placeholder={tFrame("textPlaceholder")}
            className="h-9 text-sm"
            maxLength={40}
          />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-muted-foreground">{tFrame("fontSize")}</label>
            <span className="text-xs text-muted-foreground">{settings.frameTextSize}px</span>
          </div>
          <Slider
            value={[settings.frameTextSize]}
            onValueChange={([v]) => onChange({ frameTextSize: v })}
            min={10}
            max={24}
            step={1}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">{tFrame("font")}</label>
          <div className="grid grid-cols-2 gap-2">
            {FRAME_FONTS.map((font) => (
              <button
                key={font}
                type="button"
                onClick={() => onChange({ frameTextFont: font })}
                className={cn(
                  "cursor-pointer rounded-lg border px-3 py-2 text-sm transition-all",
                  settings.frameTextFont === font
                    ? "border-primary bg-primary/5 ring-2 ring-primary"
                    : "border-border/60 hover:border-border"
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

      <QrLogoControls settings={settings} locationId={locationId} onChange={onChange} />
    </div>
  );
}
