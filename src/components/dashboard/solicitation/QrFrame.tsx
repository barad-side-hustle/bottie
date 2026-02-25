"use client";

import { forwardRef } from "react";
import { QrStyled, type QrStyledHandle } from "./QrStyled";
import type { QrCodeSettings } from "@/lib/types/qr-settings.types";
import { cn } from "@/lib/utils";

interface QrFrameProps {
  url: string;
  settings: QrCodeSettings;
  size: number;
}

export const QrFrame = forwardRef<QrStyledHandle, QrFrameProps>(function QrFrame({ url, settings, size }, ref) {
  const hasText = !!settings.frameText;
  const hasFrame = settings.frameStyle !== "none";
  const isRounded = settings.frameStyle === "rounded" || settings.frameStyle === "badge";

  if (!hasFrame && !hasText) {
    return <QrStyled ref={ref} url={url} settings={settings} size={size} />;
  }

  return (
    <div
      className={cn(
        "inline-flex flex-col items-center overflow-hidden",
        hasFrame && "border-[3px]",
        isRounded && "rounded-2xl"
      )}
      style={hasFrame ? { borderColor: settings.frameColor } : undefined}
    >
      <div className={hasFrame ? "p-4" : ""}>
        <QrStyled ref={ref} url={url} settings={settings} size={size} />
      </div>
      {hasText && (
        <div
          className="w-full px-4 py-2 text-center"
          style={hasFrame ? { backgroundColor: settings.frameColor } : undefined}
        >
          <span
            className="font-semibold"
            style={{
              color: settings.frameTextColor,
              fontFamily: settings.frameTextFont,
              fontSize: settings.frameTextSize,
            }}
          >
            {settings.frameText}
          </span>
        </div>
      )}
    </div>
  );
});
