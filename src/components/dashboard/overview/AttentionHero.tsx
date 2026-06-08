"use client";

import { Check, ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import type { OverviewData } from "@/lib/actions/overview.actions";

export function AttentionHero({ data }: { data: OverviewData }) {
  const t = useTranslations("dashboard.overview");

  if (data.pendingCount > 0) {
    const topPending = data.locationSummaries.reduce<(typeof data.locationSummaries)[number] | null>((max, loc) => {
      if (!max || loc.pendingCount > max.pendingCount) return loc;
      return max;
    }, null);
    const target = topPending ?? data.locationSummaries[0];
    const href = target ? `/dashboard/locations/${target.locationId}/reviews?replyStatus=pending` : "/dashboard/home";

    return (
      <section className="flex flex-col gap-5 border-b border-hairline pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-end gap-4">
          <span className="text-5xl font-semibold leading-none tracking-[-0.02em] tabular-nums text-accent-text sm:text-6xl">
            {data.pendingCount}
          </span>
          <div className="flex flex-col gap-1 pb-1">
            <span className="text-xs font-semibold uppercase tracking-[0.06em] text-ink-2">{t("attention.title")}</span>
            <p className="text-sm text-ink-2">{t("attention.needsReply", { count: data.pendingCount })}</p>
          </div>
        </div>
        <Button asChild size="lg" className="shrink-0">
          <Link href={href}>
            {t("attention.openInbox")}
            <ArrowRight className="size-4 rtl:rotate-180" aria-hidden />
          </Link>
        </Button>
      </section>
    );
  }

  return (
    <section className="flex items-center gap-4 border-b border-hairline pb-8">
      <span
        className="flex size-10 shrink-0 items-center justify-center rounded-full border border-hairline bg-surface-2 text-ink-2"
        aria-hidden
      >
        <Check className="size-5" strokeWidth={1.75} />
      </span>
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold tracking-[-0.02em] text-foreground">{t("attention.allCaughtUp")}</h2>
        <p className="text-sm text-ink-2">{t("attention.allCaughtUpHint")}</p>
      </div>
    </section>
  );
}
