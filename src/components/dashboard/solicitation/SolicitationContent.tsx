"use client";

import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DashboardCard,
  DashboardCardContent,
  DashboardCardDescription,
  DashboardCardHeader,
  DashboardCardTitle,
} from "@/components/ui/dashboard-card";
import { EmptyState } from "@/components/ui/empty-state";
import { QrCustomizer } from "./QrCustomizer";
import { getDefaultQrSettings } from "@/lib/utils/qr-defaults";
import type { QrCodeSettings } from "@/lib/types/qr-settings.types";

interface SolicitationContentProps {
  reviewUrl: string | null;
  mapsUrl: string | null;
  locationName: string;
  locationId: string;
  qrCodeSettings: QrCodeSettings | null;
}

export function SolicitationContent({
  reviewUrl,
  mapsUrl,
  locationName,
  locationId,
  qrCodeSettings,
}: SolicitationContentProps) {
  const t = useTranslations("dashboard.solicitation");

  if (!reviewUrl) {
    return <EmptyState title={t("noReviewUrl.title")} description={t("noReviewUrl.description")} />;
  }

  return (
    <div className="space-y-6">
      <QrCustomizer
        reviewUrl={reviewUrl}
        mapsUrl={mapsUrl}
        locationId={locationId}
        locationName={locationName}
        initialSettings={qrCodeSettings ?? getDefaultQrSettings()}
      />
      <ShareLinksSection reviewUrl={reviewUrl} mapsUrl={mapsUrl} />
    </div>
  );
}

function ShareLinksSection({ reviewUrl, mapsUrl }: { reviewUrl: string; mapsUrl: string | null }) {
  const t = useTranslations("dashboard.solicitation.shareLinks");

  return (
    <DashboardCard>
      <DashboardCardHeader>
        <DashboardCardTitle>{t("title")}</DashboardCardTitle>
        <DashboardCardDescription>{t("description")}</DashboardCardDescription>
      </DashboardCardHeader>
      <DashboardCardContent>
        <div className="space-y-4">
          <CopyLinkRow label={t("googleReviews")} url={reviewUrl} />
          {mapsUrl && <CopyLinkRow label={t("googleMaps")} url={mapsUrl} />}
        </div>
      </DashboardCardContent>
    </DashboardCard>
  );
}

function CopyLinkRow({ label, url }: { label: string; url: string }) {
  const t = useTranslations("dashboard.solicitation.shareLinks");
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [url]);

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border/40 p-3">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{label}</p>
        <p className="truncate text-xs text-muted-foreground">{url}</p>
      </div>
      <div className="flex shrink-0 gap-2">
        <Button variant="outline" size="sm" onClick={handleCopy}>
          {copied ? <Check className="size-4 text-green-500" /> : <Copy className="size-4" />}
          {copied ? t("copied") : t("copy")}
        </Button>
        <Button variant="ghost" size="sm" asChild>
          <a href={url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="size-4" />
          </a>
        </Button>
      </div>
    </div>
  );
}
