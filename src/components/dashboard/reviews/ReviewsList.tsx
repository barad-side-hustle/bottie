"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { ReviewCard, isReviewPublishable } from "@/components/dashboard/reviews/ReviewCard";
import { BulkActionBar } from "@/components/dashboard/reviews/BulkActionBar";
import { BulkPublishDialog } from "@/components/dashboard/reviews/BulkPublishDialog";
import { getReviews } from "@/lib/actions/reviews.actions";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckSquare, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import type { ReviewWithLatestGeneration } from "@/lib/db/repositories";
import { parseFiltersFromSearchParams } from "@/lib/utils/filter-utils";

interface ReviewsListProps {
  reviews: ReviewWithLatestGeneration[];
  accountId: string;
  locationId: string;
  userId: string;
}

export function ReviewsList({ reviews: initialReviews, accountId, locationId, userId }: ReviewsListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("dashboard.reviews.bulkActions");
  const [reviews, setReviews] = useState<ReviewWithLatestGeneration[]>(initialReviews);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkPublishDialog, setShowBulkPublishDialog] = useState(false);

  useEffect(() => {
    setReviews(initialReviews);
    setHasMore(true);
    setSelectedIds(new Set());
  }, [initialReviews]);

  const publishableIds = useMemo(() => new Set(reviews.filter(isReviewPublishable).map((r) => r.id)), [reviews]);

  const selectedPublishable = useMemo(
    () => reviews.filter((r) => selectedIds.has(r.id) && publishableIds.has(r.id)),
    [reviews, selectedIds, publishableIds]
  );

  const isAllSelected = publishableIds.size > 0 && [...publishableIds].every((id) => selectedIds.has(id));

  const handleSelectionChange = useCallback((reviewId: string, selected: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (selected) next.add(reviewId);
      else next.delete(reviewId);
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedIds(new Set(publishableIds));
  }, [publishableIds]);

  const handleDeselectAll = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const handleBulkPublishComplete = useCallback(
    (results: { succeeded: string[]; removed: string[]; failed: { reviewId: string; error: string }[] }) => {
      const doneIds = new Set([...results.succeeded, ...results.removed]);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        for (const id of doneIds) next.delete(id);
        return next;
      });
      if (results.removed.length > 0) {
        setReviews((prev) => prev.filter((r) => !results.removed.includes(r.id)));
      }
      router.refresh();
    },
    [router]
  );

  const loadMoreReviews = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const nextBatch = await getReviews({
        accountId,
        locationId,
        filters: {
          ...parseFiltersFromSearchParams(Object.fromEntries(searchParams.entries())),
          limit: 10,
          offset: reviews.length,
        },
      });

      if (nextBatch.length === 0) {
        setHasMore(false);
      } else {
        setReviews((prev) => [...prev, ...nextBatch]);
      }
    } catch (error) {
      console.error("Failed to load more reviews:", error);
    } finally {
      setIsLoading(false);
    }
  }, [accountId, locationId, hasMore, isLoading, reviews.length, searchParams]);

  const handleUpdate = (updatedReview?: ReviewWithLatestGeneration) => {
    if (updatedReview) {
      setReviews((prev) => prev.map((r) => (r.id === updatedReview.id ? updatedReview : r)));
    }
    router.refresh();
  };

  return (
    <div className={cn("space-y-4", selectedPublishable.length > 0 && "pb-20")}>
      {publishableIds.size > 0 && selectedPublishable.length === 0 && (
        <button
          type="button"
          onClick={handleSelectAll}
          className="flex w-full items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 border border-border/30 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <CheckSquare className="size-3.5" />
          <span>{t("selectAllHint", { count: publishableIds.size })}</span>
        </button>
      )}

      {reviews.map((review) => (
        <div key={review.id}>
          <ReviewCard
            review={review}
            accountId={accountId}
            locationId={locationId}
            userId={userId}
            onUpdate={handleUpdate}
            isSelectable={isReviewPublishable(review)}
            isSelected={selectedIds.has(review.id)}
            onSelectionChange={handleSelectionChange}
          />
        </div>
      ))}

      {hasMore && (
        <div>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <ReviewCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <Button variant="outline" className="w-full gap-2" onClick={loadMoreReviews}>
              <ChevronDown className="size-4" />
              {t("loadMore")}
            </Button>
          )}
        </div>
      )}

      {selectedPublishable.length > 0 && (
        <BulkActionBar
          selectedCount={selectedPublishable.length}
          totalPublishableCount={publishableIds.size}
          isAllSelected={isAllSelected}
          onSelectAll={handleSelectAll}
          onDeselectAll={handleDeselectAll}
          onBulkPublish={() => setShowBulkPublishDialog(true)}
        />
      )}

      <BulkPublishDialog
        open={showBulkPublishDialog}
        onOpenChange={setShowBulkPublishDialog}
        selectedReviews={selectedPublishable}
        accountId={accountId}
        locationId={locationId}
        onComplete={handleBulkPublishComplete}
      />
    </div>
  );
}

function ReviewCardSkeleton() {
  return (
    <div className="w-full rounded-2xl border border-border/40 bg-card overflow-hidden">
      <div className="flex">
        <div className="w-[3px] shrink-0 bg-muted" />
        <div className="flex-1 p-5 sm:p-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <div className="pt-3 mt-3 border-t border-border/30">
              <Skeleton className="h-3 w-20 mb-2" />
              <div className="border-s-2 border-primary/30 ps-3 pe-3 py-2.5 rounded-e-lg bg-muted/30 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
            <div className="pt-2 mt-1 border-t border-border/20 flex items-center justify-end gap-1">
              <Skeleton className="h-9 w-9 rounded-md" />
              <Skeleton className="h-9 w-9 rounded-md" />
              <div className="h-5 w-px bg-border/40 mx-0.5" />
              <Skeleton className="h-8 w-20 rounded-md" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
