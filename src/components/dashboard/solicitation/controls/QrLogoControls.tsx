"use client";

import { useCallback, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Upload, X, Loader2, ImageIcon, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import type { QrCodeSettings } from "@/lib/types/qr-settings.types";

interface QrLogoControlsProps {
  settings: QrCodeSettings;
  locationId: string;
  onChange: (patch: Partial<QrCodeSettings>) => void;
}

export function QrLogoControls({ settings, locationId, onChange }: QrLogoControlsProps) {
  const t = useTranslations("dashboard.solicitation.logo");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setUploading(true);
      setError(null);
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("locationId", locationId);

        const res = await fetch("/api/upload/qr-logo", { method: "POST", body: formData });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Upload failed");
        }

        const { url } = await res.json();
        onChange({ logoUrl: url });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Upload failed";
        setError(msg);
        console.error("Logo upload failed:", err);
      } finally {
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    [locationId, onChange]
  );

  const handleRemove = useCallback(() => {
    onChange({ logoUrl: null });
  }, [onChange]);

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <label className="text-xs font-medium text-muted-foreground">{t("title")}</label>

        {settings.logoUrl ? (
          <div className="flex items-center gap-3 rounded-lg border border-border/60 p-3">
            <div className="flex size-10 items-center justify-center rounded bg-primary/10">
              <ImageIcon className="size-5 text-primary" />
            </div>
            <span className="flex-1 text-sm font-medium">{t("uploaded")}</span>
            <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()}>
              <RefreshCw className="size-4" />
              {t("change")}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleRemove}>
              <X className="size-4" />
              {t("remove")}
            </Button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border/60 p-6 text-sm text-muted-foreground transition-colors hover:border-border hover:text-foreground"
          >
            {uploading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                {t("uploading")}
              </>
            ) : (
              <>
                <Upload className="size-4" />
                {t("upload")}
              </>
            )}
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleUpload}
          className="hidden"
        />
        <p className="text-xs text-muted-foreground">{t("maxSize")}</p>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>

      {settings.logoUrl && (
        <div className="space-y-3">
          <label className="text-xs font-medium text-muted-foreground">{t("size")}</label>
          <Slider
            value={[settings.logoSize]}
            onValueChange={([v]) => onChange({ logoSize: v })}
            min={0.2}
            max={0.4}
            step={0.05}
          />
        </div>
      )}
    </div>
  );
}
