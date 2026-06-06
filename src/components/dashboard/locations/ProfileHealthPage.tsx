"use client";

import { useTranslations } from "next-intl";
import { DashboardCard, DashboardCardContent } from "@/components/ui/dashboard-card";
import type { ProfileHealthResult } from "@/lib/profile-health";
import { Check, AlertTriangle, X, FileText, Phone, Globe, MapPin, MessageSquare, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfileHealthPageProps {
  result: ProfileHealthResult | null;
}

const ITEM_ICONS: Record<string, typeof FileText> = {
  description: FileText,
  phoneNumber: Phone,
  websiteUrl: Globe,
  address: MapPin,
  responseRate: MessageSquare,
  averageRating: Star,
};

export function ProfileHealthPage({ result }: ProfileHealthPageProps) {
  const t = useTranslations("dashboard.profileHealth");

  if (!result) {
    return (
      <div className="py-16 text-center">
        <p className="text-muted-foreground">{t("noData")}</p>
      </div>
    );
  }

  const scoreColor = result.score >= 80 ? "text-success" : result.score >= 50 ? "text-warning" : "text-destructive";
  const scoreTrackColor =
    result.score >= 80 ? "text-success/15" : result.score >= 50 ? "text-warning/15" : "text-destructive/15";
  const scoreLabel =
    result.score >= 80 ? t("scoreExcellent") : result.score >= 50 ? t("scoreNeedsWork") : t("scoreCritical");

  const completedCount = result.breakdown.filter((i) => i.status === "complete").length;

  const ringSize = 132;
  const ringStroke = 12;
  const ringRadius = (ringSize - ringStroke) / 2;
  const ringCircumference = ringRadius * 2 * Math.PI;
  const ringOffset = ringCircumference - (Math.min(Math.max(result.score, 0), 100) / 100) * ringCircumference;

  return (
    <div>
      <div className="mb-8 space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      <DashboardCard className="mb-8">
        <DashboardCardContent className="p-6 sm:p-8">
          <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-start">
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
                  className={scoreTrackColor}
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
                  className={cn("transition-all duration-500 ease-out", scoreColor)}
                />
              </svg>
              <span className={cn("absolute text-4xl font-bold tabular-nums", scoreColor)}>{result.score}</span>
            </div>
            <div className="space-y-1">
              <p className={cn("text-xl font-semibold", scoreColor)}>{scoreLabel}</p>
              <p className="text-sm text-muted-foreground">{t("outOf100")}</p>
              <p className="text-sm text-muted-foreground">
                {t("completedItems", { completed: completedCount, total: result.breakdown.length })}
              </p>
            </div>
          </div>
        </DashboardCardContent>
      </DashboardCard>

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        {result.breakdown.map((item) => {
          const statusConfig = {
            complete: {
              icon: Check,
              barColor: "bg-success",
              statusColor: "text-success",
              calloutBg: "bg-success/10",
            },
            warning: {
              icon: AlertTriangle,
              barColor: "bg-warning",
              statusColor: "text-warning",
              calloutBg: "bg-warning/10",
            },
            incomplete: {
              icon: X,
              barColor: "bg-destructive",
              statusColor: "text-destructive",
              calloutBg: "bg-destructive/10",
            },
          }[item.status];

          const ItemIcon = ITEM_ICONS[item.label] || FileText;
          const StatusIcon = statusConfig.icon;
          const percentage = Math.round((item.score / item.maxScore) * 100);

          return (
            <div
              key={item.label}
              className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm transition-all duration-200 hover:shadow-md"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
                    <ItemIcon className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{t(`items.${item.label}.title`)}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.score}/{item.maxScore} {t("points")}
                    </p>
                  </div>
                </div>
                <div className={cn("flex shrink-0 items-center gap-1.5", statusConfig.statusColor)}>
                  <StatusIcon className="size-4" />
                  <span className="text-sm font-semibold tabular-nums">{percentage}%</span>
                </div>
              </div>

              <div className="mb-3 h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn("h-full rounded-full transition-all duration-500", statusConfig.barColor)}
                  style={{ width: `${percentage}%` }}
                />
              </div>

              <p className="text-sm text-muted-foreground">{t(`items.${item.label}.description`)}</p>

              {item.actionItem && (
                <div className={cn("mt-3 rounded-xl p-3 text-sm", statusConfig.calloutBg)}>
                  <p className={cn("font-medium", statusConfig.statusColor)}>{t(`items.${item.label}.action`)}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
