"use client";

import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Copy, ExternalLink, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    return <EmptyState title={t("noReviewUrl.title")} description={t("noReviewUrl.description")} icon={QrCode} />;
  }

  return (
    <div className="space-y-4">
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
    <section className="rounded-lg border border-hairline bg-card p-4 sm:p-6">
      <div className="space-y-1">
        <h3 className="text-sm font-semibold tracking-tight text-ink">{t("title")}</h3>
        <p className="text-sm leading-relaxed text-ink-2">{t("description")}</p>
      </div>
      <ul className="mt-4 divide-y divide-hairline border-t border-hairline">
        <CopyLinkRow label={t("googleReviews")} url={reviewUrl} />
        {mapsUrl && <CopyLinkRow label={t("googleMaps")} url={mapsUrl} />}
      </ul>
    </section>
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
    <li className="flex items-center gap-3 py-3">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-ink">{label}</p>
        <p className="truncate text-xs text-ink-3" dir="ltr">
          {url}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <Button variant="outline" size="sm" onClick={handleCopy}>
          {copied ? <Check className="size-4 text-success" /> : <Copy className="size-4" />}
          {copied ? t("copied") : t("copy")}
        </Button>
        <Button variant="ghost" size="icon-sm" asChild>
          <a href={url} target="_blank" rel="noopener noreferrer" aria-label={label}>
            <ExternalLink className="size-4" />
          </a>
        </Button>
      </div>
    </li>
  );
}
