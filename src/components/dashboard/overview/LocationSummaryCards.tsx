"use client";

import { Star, MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { DashboardCard, DashboardCardContent } from "@/components/ui/dashboard-card";
import { Badge } from "@/components/ui/badge";
import type { LocationSummary } from "@/lib/db/repositories/stats.repository";
import Image from "next/image";

export function LocationSummaryCards({ summaries }: { summaries: LocationSummary[] }) {
  const t = useTranslations("dashboard.overview");
  const router = useRouter();

  if (summaries.length === 0) return null;

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">{t("yourLocations")}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {summaries.map((loc) => (
          <button
            key={loc.locationId}
            type="button"
            onClick={() => router.push(`/dashboard/accounts/${loc.accountId}/locations/${loc.locationId}/reviews`)}
            className="text-start w-full"
          >
            <DashboardCard className="hover:shadow-md hover:border-primary/20 transition-all cursor-pointer">
              <DashboardCardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-muted overflow-hidden shrink-0">
                    {loc.photoUrl ? (
                      <Image
                        src={loc.photoUrl}
                        alt={loc.locationName}
                        width={40}
                        height={40}
                        className="size-full object-cover"
                      />
                    ) : (
                      <MapPin className="size-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{loc.locationName}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {loc.avgRating && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Star className="size-3 fill-current" />
                          {loc.avgRating.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>
                  {loc.pendingCount > 0 && (
                    <Badge variant="secondary" className="shrink-0">
                      {t("pendingBadge", { count: loc.pendingCount })}
                    </Badge>
                  )}
                </div>
              </DashboardCardContent>
            </DashboardCard>
          </button>
        ))}
      </div>
    </div>
  );
}
