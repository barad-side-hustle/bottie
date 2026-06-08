"use client";

import type { QrCodeSettings } from "@/lib/types/qr-settings.types";
import { QrColorControls } from "./QrColorControls";
import { QrDotStyleControls } from "./QrDotStyleControls";
import { QrCornerStyleControls } from "./QrCornerStyleControls";
import { QrFrameControls } from "./QrFrameControls";

interface QrDesignControlsProps {
  settings: QrCodeSettings;
  onChange: (patch: Partial<QrCodeSettings>) => void;
}

export function QrDesignControls({ settings, onChange }: QrDesignControlsProps) {
  return (
    <div className="divide-y divide-hairline [&>*]:py-6 first:[&>*]:pt-0 last:[&>*]:pb-0">
      <QrColorControls settings={settings} onChange={onChange} />
      <QrDotStyleControls settings={settings} onChange={onChange} />
      <QrCornerStyleControls settings={settings} onChange={onChange} />
      <QrFrameControls settings={settings} onChange={onChange} />
    </div>
  );
}
