"use client";

import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ProfileHealthResult } from "@/lib/profile-health";
import { Check, AlertTriangle, X, FileText, Phone, Globe, MapPin, MessageSquare, Star, ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { BadgeProps } from "@/components/ui/badge";

interface ProfileHealthPageProps {
  result: ProfileHealthResult | null;
}

const ITEM_ICONS: Record<string, LucideIcon> = {
  description: FileText,
  phoneNumber: Phone,
  websiteUrl: Globe,
  address: MapPin,
  responseRate: MessageSquare,
  averageRating: Star,
};

const STATUS_CONFIG: Record<string, { icon: LucideIcon; variant: BadgeProps["variant"] }> = {
  complete: { icon: Check, variant: "success" },
  warning: { icon: AlertTriangle, variant: "warning" },
  incomplete: { icon: X, variant: "destructive" },
};

const STATUS_PRIORITY: Record<string, number> = { incomplete: 0, warning: 1, complete: 2 };

const FIX_TARGET: Record<string, { section: string; labelKey: string }> = {
  description: { section: "settings", labelKey: "settings" },
  phoneNumber: { section: "settings", labelKey: "settings" },
  websiteUrl: { section: "settings", labelKey: "settings" },
  address: { section: "settings", labelKey: "settings" },
  responseRate: { section: "reviews", labelKey: "reviews" },
  averageRating: { section: "get-reviews", labelKey: "getReviews" },
};

export function ProfileHealthPage({ result }: ProfileHealthPageProps) {
  const t = useTranslations("dashboard.profileHealth");
  const tBreadcrumbs = useTranslations("breadcrumbs");
  const params = useParams();
  const locale = params.locale as string;
  const locationId = params.locationId as string;

  if (!result) {
    return (
      <div className="py-16 text-center">
        <p className="text-muted-foreground">{t("noData")}</p>
      </div>
    );
  }

  const scoreLabel =
    result.score >= 80 ? t("scoreExcellent") : result.score >= 50 ? t("scoreNeedsWork") : t("scoreCritical");

  const completedCount = result.breakdown.filter((i) => i.status === "complete").length;

  const orderedBreakdown = [...result.breakdown].sort((a, b) => STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status]);

  const ringSize = 168;
  const ringStroke = 12;
  const ringRadius = (ringSize - ringStroke) / 2;
  const ringCircumference = ringRadius * 2 * Math.PI;
  const ringOffset = ringCircumference - (Math.min(Math.max(result.score, 0), 100) / 100) * ringCircumference;

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
      <div className="lg:sticky lg:top-6 lg:self-start">
        <div className="flex flex-col items-center gap-5 rounded-lg border border-hairline bg-card p-6 text-center">
          <div
            className="relative inline-flex shrink-0 items-center justify-center"
            style={{ width: ringSize, height: ringSize }}
            role="progressbar"
            aria-valuenow={result.score}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <svg width={ringSize} height={ringSize} className="-rotate-90">
              <circle
                cx={ringSize / 2}
                cy={ringSize / 2}
                r={ringRadius}
                fill="none"
                stroke="currentColor"
                strokeWidth={ringStroke}
                className="text-surface-2"
              />
              <circle
                cx={ringSize / 2}
                cy={ringSize / 2}
                r={ringRadius}
                fill="none"
                stroke="currentColor"
                strokeWidth={ringStroke}
                strokeLinecap="round"
                strokeDasharray={ringCircumference}
                strokeDashoffset={ringOffset}
                className="text-primary transition-all duration-500 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-5xl font-semibold tabular-nums leading-none text-primary">{result.score}</span>
              <span className="mt-1 text-xs text-ink-3">{t("outOf100")}</span>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-lg font-semibold tracking-[-0.01em] text-ink">{scoreLabel}</p>
            <p className="text-sm tabular-nums text-ink-2">
              {t("completedItems", { completed: completedCount, total: result.breakdown.length })}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-hairline bg-card">
        <ul className="divide-y divide-hairline">
          {orderedBreakdown.map((item) => {
            const statusConfig = STATUS_CONFIG[item.status];
            const ItemIcon = ITEM_ICONS[item.label] || FileText;
            const StatusIcon = statusConfig.icon;
            const percentage = Math.round((item.score / item.maxScore) * 100);
            const fix = item.actionItem ? FIX_TARGET[item.label] : undefined;

            return (
              <li key={item.label} className="flex items-start gap-4 p-4">
                <ItemIcon className="mt-0.5 size-4 shrink-0 text-ink-3" strokeWidth={1.5} aria-hidden />

                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-3">
                    <p className="min-w-0 flex-1 truncate text-sm font-medium text-ink">
                      {t(`items.${item.label}.title`)}
                    </p>
                    <span className="shrink-0 text-xs font-medium tabular-nums text-ink-3">
                      {item.score}/{item.maxScore} {t("points")}
                    </span>
                    <Badge variant={statusConfig.variant} className="shrink-0 tabular-nums">
                      <StatusIcon />
                      {percentage}%
                    </Badge>
                  </div>
                  <p className="text-sm leading-relaxed text-ink-2">{t(`items.${item.label}.description`)}</p>
                  {item.actionItem && (
                    <p className="text-sm leading-relaxed text-ink-3">{t(`items.${item.label}.action`)}</p>
                  )}
                  {fix && (
                    <div className="pt-1">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/${locale}/dashboard/locations/${locationId}/${fix.section}`}>
                          {tBreadcrumbs(fix.labelKey)}
                          <ArrowRight className="size-3.5" />
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
