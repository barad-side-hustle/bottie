"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useTranslations, useFormatter } from "next-intl";
import { getReviewsByCategory } from "@/lib/actions/insights.actions";
import { StarRating } from "@/components/ui/StarRating";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { ClassificationCategory } from "@/lib/types/classification.types";
import type { Review } from "@/lib/db/schema/reviews.schema";

interface CategoryReviewsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: ClassificationCategory | null;
  type: "positive" | "negative" | null;
  locationId: string;
  dateFrom: Date;
  dateTo: Date;
}

export function CategoryReviewsModal({
  open,
  onOpenChange,
  category,
  type,
  locationId,
  dateFrom,
  dateTo,
}: CategoryReviewsModalProps) {
  const t = useTranslations("dashboard.insights");
  const tCategories = useTranslations("dashboard.insights.categories");
  const format = useFormatter();

  const fetchKey = open && category && type ? `${category}-${type}` : null;
  const [lastFetchKey, setLastFetchKey] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    if (!fetchKey) return;
    if (fetchKey === lastFetchKey) return;

    let cancelled = false;

    getReviewsByCategory({
      locationId,
      dateFrom,
      dateTo,
      category: category!,
      type: type!,
      limit: 50,
    })
      .then((data) => {
        if (!cancelled) {
          setReviews(data);
          setLastFetchKey(fetchKey);
        }
      })
      .catch((error) => {
        console.error("Error fetching reviews:", error);
        if (!cancelled) {
          setReviews([]);
          setLastFetchKey(fetchKey);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [fetchKey, lastFetchKey, locationId, dateFrom, dateTo, category, type]);

  const isLoading = fetchKey !== null && fetchKey !== lastFetchKey;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {category ? t("modal.title", { category: tCategories(category) }) : t("modal.title", { category: "" })}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2 rounded-lg border border-hairline p-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-md" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                  <Skeleton className="h-16 w-full" />
                </div>
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <p className="py-8 text-center text-sm text-ink-2">{t("modal.noReviews")}</p>
          ) : (
            reviews.map((review) => (
              <div
                key={review.id}
                className="space-y-3 rounded-lg border border-hairline p-4 transition-colors hover:bg-surface-2"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 shrink-0 rounded-md">
                      <AvatarImage src={review.photoUrl || undefined} alt={`${review.name} profile`} />
                      <AvatarFallback className="rounded-md bg-surface-2">
                        {review.photoUrl ? (
                          <User className="h-4 w-4 text-ink-3" />
                        ) : (
                          <span className="text-xs font-semibold text-ink-2">{getInitials(review.name)}</span>
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-ink">{review.name}</p>
                      <p className="text-xs tabular-nums text-ink-3">
                        {format.dateTime(new Date(review.date), {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <StarRating rating={review.rating} size={16} />
                </div>
                {review.text && <p className="text-sm leading-relaxed text-ink-2">{review.text}</p>}
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
