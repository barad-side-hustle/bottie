"use client";

import { Star, MapPin, Crown, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { LocationSummaryWithSub } from "@/lib/actions/overview.actions";
import Image from "next/image";

export function LocationSummaryCards({ summaries }: { summaries: LocationSummaryWithSub[] }) {
  const t = useTranslations("dashboard.overview");

  if (summaries.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-lg font-semibold tracking-[-0.02em] text-foreground">{t("yourLocations")}</h2>
        <span className="text-xs tabular-nums text-ink-3">{summaries.length}</span>
      </div>

      <div className="overflow-hidden rounded-lg border border-hairline bg-surface">
        <ul className="divide-y divide-hairline">
          {summaries.map((loc) => {
            const href =
              loc.pendingCount > 0
                ? `/dashboard/locations/${loc.locationId}/reviews?replyStatus=pending`
                : `/dashboard/locations/${loc.locationId}/reviews`;

            return (
              <li key={loc.locationId}>
                <Link
                  href={href}
                  className="group flex items-center gap-4 px-4 py-3.5 transition-colors duration-150 hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md bg-surface-2">
                    {loc.photoUrl ? (
                      <Image
                        src={loc.photoUrl}
                        alt={loc.locationName}
                        width={36}
                        height={36}
                        className="size-full object-cover"
                      />
                    ) : (
                      <MapPin className="size-4 text-ink-3" strokeWidth={1.5} aria-hidden />
                    )}
                  </span>

                  <span className="flex min-w-0 flex-1 items-center gap-2">
                    <span className="truncate font-medium text-ink">{loc.locationName}</span>
                    {loc.isPaid ? (
                      <Badge variant="accent" className="shrink-0 gap-1">
                        <Crown className="size-3" aria-hidden />
                        {t("proBadge")}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="shrink-0">
                        {t("freeBadge")}
                      </Badge>
                    )}
                  </span>

                  <span className="flex w-14 shrink-0 items-center justify-end gap-1 text-sm tabular-nums text-ink-2">
                    {loc.avgRating ? (
                      <>
                        <Star className="size-3.5 fill-star-filled text-star-filled" aria-hidden />
                        {loc.avgRating.toFixed(1)}
                      </>
                    ) : (
                      <span className="text-ink-3">-</span>
                    )}
                  </span>

                  <span className="flex w-24 shrink-0 justify-end">
                    {loc.pendingCount > 0 ? (
                      <Badge variant="warning" className="tabular-nums">
                        {t("pendingBadge", { count: loc.pendingCount })}
                      </Badge>
                    ) : null}
                  </span>

                  <ChevronRight
                    className={cn(
                      "size-4 shrink-0 text-ink-3 transition-colors duration-150 group-hover:text-ink-2 rtl:rotate-180"
                    )}
                    aria-hidden
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
