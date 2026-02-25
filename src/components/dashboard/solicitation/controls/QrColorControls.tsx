"use client";

import { useTranslations } from "next-intl";
import { ColorPicker } from "../ColorPicker";
import type { QrCodeSettings } from "@/lib/types/qr-settings.types";

interface QrColorControlsProps {
  settings: QrCodeSettings;
  onChange: (patch: Partial<QrCodeSettings>) => void;
}

export function QrColorControls({ settings, onChange }: QrColorControlsProps) {
  const t = useTranslations("dashboard.solicitation.colors");

  return (
    <div className="space-y-4">
      <ColorPicker
        label={t("foreground")}
        value={settings.foregroundColor}
        onChange={(foregroundColor) => onChange({ foregroundColor })}
      />
      <ColorPicker
        label={t("background")}
        value={settings.backgroundColor}
        onChange={(backgroundColor) => onChange({ backgroundColor })}
      />
    </div>
  );
}
