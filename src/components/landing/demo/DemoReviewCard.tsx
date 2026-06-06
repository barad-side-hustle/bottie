"use client";

import { StarRating } from "@/components/ui/StarRating";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";
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
    <div className="rounded-3xl border border-border/60 bg-card p-5 shadow-sm sm:p-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary">
              <span className="text-sm font-semibold text-primary">{review.name.charAt(0)}</span>
            </div>
            <div className="min-w-0">
              <h4 className="truncate text-sm font-semibold">{review.name}</h4>
              <p className="text-xs text-muted-foreground">{review.date}</p>
            </div>
          </div>
          <StarRating rating={review.rating} size={16} />
        </div>

        <p className="text-sm leading-relaxed">{review.text}</p>

        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/12 px-2.5 py-1 text-xs font-semibold text-brand">
              <Sparkles className="size-3.5" />
              AI
            </span>
            <span className="text-xs font-medium text-muted-foreground">{t("aiReplyLabel")}</span>
          </div>
          <div className="border-s-2 border-primary/30 ps-3">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : (
              <p className={cn("text-sm leading-relaxed opacity-100 transition-opacity duration-300")}>{replyText}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
