"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Download, RotateCcw, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { QrFrame } from "./QrFrame";
import type { QrStyledHandle } from "./QrStyled";
import { downloadQrPng, downloadQrSvg } from "./qr-download-utils";
import { QrDesignControls } from "./controls/QrDesignControls";
import { QrContentControls } from "./controls/QrContentControls";
import { getDefaultQrSettings } from "@/lib/utils/qr-defaults";
import { updateLocationConfig } from "@/lib/actions/locations.actions";
import type { QrCodeSettings } from "@/lib/types/qr-settings.types";
import { sendRybbitEvent } from "@/lib/analytics";

const QR_SIZE = 384;

interface QrCustomizerProps {
  reviewUrl: string;
  mapsUrl: string | null;
  locationId: string;
  locationName: string;
  initialSettings: QrCodeSettings;
}

export function QrCustomizer({ reviewUrl, mapsUrl, locationId, locationName, initialSettings }: QrCustomizerProps) {
  const t = useTranslations("dashboard.solicitation");
  const tQr = useTranslations("dashboard.solicitation.qrCode");
  const tActions = useTranslations("dashboard.solicitation.actions");

  const qrRef = useRef<QrStyledHandle>(null);
  const [settings, setSettings] = useState<QrCodeSettings>(initialSettings);
  const [saving, setSaving] = useState(false);

  const filePrefix = locationName.replace(/\s+/g, "-").toLowerCase();

  const activeUrl = useMemo(() => {
    if (settings.linkType === "googleMaps" && mapsUrl) return mapsUrl;
    if (settings.linkType === "custom" && settings.customUrl) return settings.customUrl;
    return reviewUrl;
  }, [settings.linkType, settings.customUrl, reviewUrl, mapsUrl]);

  const handleChange = useCallback((patch: Partial<QrCodeSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await updateLocationConfig({ locationId, config: { qrCodeSettings: settings } });
      sendRybbitEvent("qr_settings_saved");
    } catch {
      console.error("Failed to save QR settings");
    } finally {
      setSaving(false);
    }
  }, [locationId, settings]);

  const handleReset = useCallback(() => {
    setSettings(getDefaultQrSettings());
  }, []);

  const handleDownloadPng = useCallback(() => {
    if (!qrRef.current) return;
    downloadQrPng(qrRef.current, settings, QR_SIZE, `${filePrefix}-review-qr`);
    sendRybbitEvent("qr_exported", { format: "png" });
  }, [settings, filePrefix]);

  const handleDownloadSvg = useCallback(() => {
    if (!qrRef.current) return;
    downloadQrSvg(qrRef.current, `${filePrefix}-review-qr`);
    sendRybbitEvent("qr_exported", { format: "svg" });
  }, [filePrefix]);

  return (
    <DashboardCard className="overflow-hidden">
      <div className="grid lg:grid-cols-[minmax(0,420px)_1fr]">
        <div className="flex flex-col items-center justify-center gap-4 border-b border-hairline bg-surface-2 p-6 sm:p-8 lg:border-b-0 lg:border-e">
          <span className="text-xs font-semibold uppercase tracking-[0.02em] text-ink-2">{t("tabs.design")}</span>
          <div className="max-w-full rounded-lg border border-hairline bg-white p-4">
            <QrFrame ref={qrRef} url={activeUrl} settings={settings} size={QR_SIZE} />
          </div>
        </div>

        <div className="flex min-w-0 flex-col p-4 sm:p-6">
          <Tabs defaultValue="design" className="flex-1">
            <TabsList className="w-full">
              <TabsTrigger value="design" className="flex-1">
                {t("tabs.design")}
              </TabsTrigger>
              <TabsTrigger value="content" className="flex-1">
                {t("tabs.content")}
              </TabsTrigger>
            </TabsList>

            <div className="mt-6">
              <TabsContent value="design">
                <QrDesignControls settings={settings} onChange={handleChange} />
              </TabsContent>

              <TabsContent value="content">
                <QrContentControls settings={settings} locationId={locationId} onChange={handleChange} />
              </TabsContent>
            </div>
          </Tabs>

          <div className="mt-6 flex items-center justify-end gap-2 border-t border-hairline pt-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Download className="size-4" />
                  {tQr("export")}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleDownloadPng} className="cursor-pointer">
                  {tQr("downloadPng")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownloadSvg} className="cursor-pointer">
                  {tQr("downloadSvg")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" onClick={handleReset}>
              <RotateCcw className="size-4" />
              {tActions("reset")}
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              {saving ? tActions("saving") : tActions("save")}
            </Button>
          </div>
        </div>
      </div>
    </DashboardCard>
  );
}
