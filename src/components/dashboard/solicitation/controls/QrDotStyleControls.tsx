"use client";

import { useTranslations } from "next-intl";
import type { DotType, QrCodeSettings } from "@/lib/types/qr-settings.types";
import { cn } from "@/lib/utils";

const DOT_TYPES: DotType[] = ["square", "dots", "rounded", "extra-rounded", "classy", "classy-rounded"];

interface QrDotStyleControlsProps {
  settings: QrCodeSettings;
  onChange: (patch: Partial<QrCodeSettings>) => void;
}

export function QrDotStyleControls({ settings, onChange }: QrDotStyleControlsProps) {
  const t = useTranslations("dashboard.solicitation.dotStyle");

  return (
    <div className="space-y-3">
      <label className="text-xs font-medium text-muted-foreground">{t("title")}</label>
      <div className="grid grid-cols-3 gap-2">
        {DOT_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => onChange({ dotType: type })}
            className={cn(
              "flex cursor-pointer flex-col items-center gap-1.5 rounded-lg border p-3 text-xs transition-all",
              settings.dotType === type
                ? "border-primary bg-primary/5 ring-2 ring-primary"
                : "border-border/60 hover:border-border"
            )}
          >
            <DotPreview type={type} />
            <span className="font-medium">{t(type)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function DotPreview({ type }: { type: DotType }) {
  const size = 6;
  const gap = 2;
  const grid = 3;
  const total = grid * size + (grid - 1) * gap;

  const dots = [];
  for (let r = 0; r < grid; r++) {
    for (let c = 0; c < grid; c++) {
      const x = c * (size + gap);
      const y = r * (size + gap);
      dots.push({ x, y });
    }
  }

  function renderDot(x: number, y: number, i: number) {
    switch (type) {
      case "dots":
        return <circle key={i} cx={x + size / 2} cy={y + size / 2} r={size / 2} fill="currentColor" />;
      case "rounded":
        return <rect key={i} x={x} y={y} width={size} height={size} rx={size * 0.3} fill="currentColor" />;
      case "extra-rounded":
        return <rect key={i} x={x} y={y} width={size} height={size} rx={size * 0.45} fill="currentColor" />;
      case "classy":
        return (
          <path
            key={i}
            d={`M${x} ${y}h${size}v${size}h${-size * 0.6}q${-size * 0.4} 0 ${-size * 0.4} ${-size * 0.4}z`}
            fill="currentColor"
          />
        );
      case "classy-rounded":
        return <rect key={i} x={x} y={y} width={size} height={size} rx={size * 0.2} fill="currentColor" />;
      default:
        return <rect key={i} x={x} y={y} width={size} height={size} fill="currentColor" />;
    }
  }

  return (
    <svg width={total} height={total} viewBox={`0 0 ${total} ${total}`} className="text-foreground">
      {dots.map((d, i) => renderDot(d.x, d.y, i))}
    </svg>
  );
}
