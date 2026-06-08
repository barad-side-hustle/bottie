"use client";

import { StarRating } from "@/components/ui/StarRating";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import type { DemoReview } from "./demo-data";

interface DemoReviewCardProps {
  review: DemoReview;
  replyText: string;
  isLoading: boolean;
}

export function DemoReviewCard({ review, replyText, isLoading }: DemoReviewCardProps) {
  const t = useTranslations("landing.demo");

  return (
    <div className="rounded-lg border border-hairline bg-surface p-5 sm:p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-2">
              <span className="text-sm font-medium text-ink-2">{review.name.charAt(0)}</span>
            </div>
            <div className="min-w-0">
              <h4 className="truncate text-sm font-medium text-ink">{review.name}</h4>
              <p className="text-xs tabular-nums text-ink-3">{review.date}</p>
            </div>
          </div>
          <StarRating rating={review.rating} size={15} />
        </div>

        <p className="text-sm leading-relaxed text-ink-2">{review.text}</p>

        <div className="rounded-md bg-surface-2 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.06em] text-ink-3">{t("aiReplyLabel")}</p>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : (
            <p className={cn("text-sm leading-relaxed text-ink opacity-100 transition-opacity duration-300")}>
              {replyText}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
