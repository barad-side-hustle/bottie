"use client";

import { useTranslations } from "next-intl";
import type { CornerSquareType, CornerDotType, QrCodeSettings } from "@/lib/types/qr-settings.types";
import { cn } from "@/lib/utils";

const CORNER_SQUARE_TYPES: CornerSquareType[] = ["square", "dot", "extra-rounded"];
const CORNER_DOT_TYPES: CornerDotType[] = ["square", "dot"];

interface QrCornerStyleControlsProps {
  settings: QrCodeSettings;
  onChange: (patch: Partial<QrCodeSettings>) => void;
}

export function QrCornerStyleControls({ settings, onChange }: QrCornerStyleControlsProps) {
  const t = useTranslations("dashboard.solicitation.cornerStyle");

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <label className="text-xs font-medium text-muted-foreground">{t("outerTitle")}</label>
        <div className="grid grid-cols-3 gap-2">
          {CORNER_SQUARE_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => onChange({ cornerSquareType: type })}
              className={cn(
                "flex cursor-pointer flex-col items-center gap-1.5 rounded-lg border p-3 text-xs transition-all",
                settings.cornerSquareType === type
                  ? "border-primary bg-primary/5 ring-2 ring-primary"
                  : "border-border/60 hover:border-border"
              )}
            >
              <CornerSquarePreview type={type} />
              <span className="font-medium">{t(type)}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-xs font-medium text-muted-foreground">{t("innerTitle")}</label>
        <div className="grid grid-cols-2 gap-2">
          {CORNER_DOT_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => onChange({ cornerDotType: type })}
              className={cn(
                "flex cursor-pointer flex-col items-center gap-1.5 rounded-lg border p-3 text-xs transition-all",
                settings.cornerDotType === type
                  ? "border-primary bg-primary/5 ring-2 ring-primary"
                  : "border-border/60 hover:border-border"
              )}
            >
              <CornerDotPreview type={type} />
              <span className="font-medium">{t(type)}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function CornerSquarePreview({ type }: { type: CornerSquareType }) {
  const size = 24;
  const strokeWidth = 3;

  switch (type) {
    case "dot":
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="text-foreground">
          <rect
            x={strokeWidth / 2}
            y={strokeWidth / 2}
            width={size - strokeWidth}
            height={size - strokeWidth}
            rx={(size - strokeWidth) / 2}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
          />
        </svg>
      );
    case "extra-rounded":
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="text-foreground">
          <rect
            x={strokeWidth / 2}
            y={strokeWidth / 2}
            width={size - strokeWidth}
            height={size - strokeWidth}
            rx={6}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
          />
        </svg>
      );
    default:
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="text-foreground">
          <rect
            x={strokeWidth / 2}
            y={strokeWidth / 2}
            width={size - strokeWidth}
            height={size - strokeWidth}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
          />
        </svg>
      );
  }
}

function CornerDotPreview({ type }: { type: CornerDotType }) {
  const size = 24;

  if (type === "dot") {
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="text-foreground">
        <circle cx={size / 2} cy={size / 2} r={size / 3} fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="text-foreground">
      <rect x={size / 4} y={size / 4} width={size / 2} height={size / 2} fill="currentColor" />
    </svg>
  );
}
