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
    <div className="rounded-2xl border border-border/60 bg-primary/[0.03] shadow-sm p-5 sm:p-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <span className="text-sm font-semibold text-primary">{review.name.charAt(0)}</span>
            </div>
            <div className="min-w-0">
              <h4 className="font-semibold text-sm truncate">{review.name}</h4>
              <p className="text-xs text-muted-foreground">{review.date}</p>
            </div>
          </div>
          <StarRating rating={review.rating} size={16} />
        </div>

        <p className="text-sm leading-relaxed">{review.text}</p>

        <div>
          <span className="text-xs font-medium text-muted-foreground mb-2 block">{t("aiReplyLabel")}</span>
          <div className="border-s-2 border-primary/30 ps-3">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : (
              <p className={cn("text-sm leading-relaxed transition-opacity duration-300 opacity-100")}>{replyText}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
