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
      <div className="text-center py-16">
        <p className="text-muted-foreground">{t("noData")}</p>
      </div>
    );
  }

  const scoreColor = result.score >= 80 ? "text-success" : result.score >= 50 ? "text-warning" : "text-destructive";
  const scoreBgColor =
    result.score >= 80 ? "bg-success/10" : result.score >= 50 ? "bg-warning/10" : "bg-destructive/10";
  const scoreRingColor =
    result.score >= 80 ? "ring-success/20" : result.score >= 50 ? "ring-warning/20" : "ring-destructive/20";
  const scoreLabel =
    result.score >= 80 ? t("scoreExcellent") : result.score >= 50 ? t("scoreNeedsWork") : t("scoreCritical");

  const completedCount = result.breakdown.filter((i) => i.status === "complete").length;

  return (
    <div>
      <div className="space-y-1 mb-8">
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      <DashboardCard className="mb-8">
        <DashboardCardContent className="p-6">
          <div className="flex items-center gap-6">
            <div
              className={cn(
                "flex items-center justify-center size-24 rounded-full ring-2",
                scoreBgColor,
                scoreRingColor
              )}
            >
              <span className={cn("text-4xl font-bold", scoreColor)}>{result.score}</span>
            </div>
            <div>
              <p className={cn("text-lg font-semibold", scoreColor)}>{scoreLabel}</p>
              <p className="text-sm text-muted-foreground">{t("outOf100")}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {t("completedItems", { completed: completedCount, total: result.breakdown.length })}
              </p>
            </div>
          </div>
        </DashboardCardContent>
      </DashboardCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {result.breakdown.map((item) => {
          const statusConfig = {
            complete: {
              icon: Check,
              bg: "bg-success/5",
              border: "border-success/20",
              iconBg: "bg-success/10",
              iconColor: "text-success",
              barColor: "bg-success",
            },
            warning: {
              icon: AlertTriangle,
              bg: "bg-warning/5",
              border: "border-warning/20",
              iconBg: "bg-warning/10",
              iconColor: "text-warning",
              barColor: "bg-warning",
            },
            incomplete: {
              icon: X,
              bg: "bg-destructive/5",
              border: "border-destructive/20",
              iconBg: "bg-destructive/10",
              iconColor: "text-destructive",
              barColor: "bg-destructive",
            },
          }[item.status];

          const ItemIcon = ITEM_ICONS[item.label] || FileText;
          const StatusIcon = statusConfig.icon;
          const percentage = Math.round((item.score / item.maxScore) * 100);

          return (
            <DashboardCard key={item.label} className={cn("transition-colors", statusConfig.bg, statusConfig.border)}>
              <DashboardCardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={cn("flex items-center justify-center size-10 rounded-lg", statusConfig.iconBg)}>
                      <ItemIcon className={cn("size-5", statusConfig.iconColor)} />
                    </div>
                    <div>
                      <p className="font-medium">{t(`items.${item.label}.title`)}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.score}/{item.maxScore} {t("points")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <StatusIcon className={cn("size-4", statusConfig.iconColor)} />
                    <span className={cn("text-sm font-medium", statusConfig.iconColor)}>{percentage}%</span>
                  </div>
                </div>

                <div className="h-2 bg-secondary rounded-full overflow-hidden mb-3">
                  <div
                    className={cn("h-full rounded-full transition-all", statusConfig.barColor)}
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <p className="text-sm text-muted-foreground">{t(`items.${item.label}.description`)}</p>

                {item.actionItem && (
                  <div className={cn("mt-3 p-3 rounded-lg text-sm", statusConfig.iconBg)}>
                    <p className={cn("font-medium", statusConfig.iconColor)}>{t(`items.${item.label}.action`)}</p>
                  </div>
                )}
              </DashboardCardContent>
            </DashboardCard>
          );
        })}
      </div>
    </div>
  );
}
