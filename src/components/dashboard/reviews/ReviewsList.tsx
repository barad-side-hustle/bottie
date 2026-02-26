"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { ReviewCard } from "@/components/dashboard/reviews/ReviewCard";
import { getReviews } from "@/lib/actions/reviews.actions";
import { useInView } from "react-intersection-observer";
import { Skeleton } from "@/components/ui/skeleton";
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
  const [reviews, setReviews] = useState<ReviewWithLatestGeneration[]>(initialReviews);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { ref, inView } = useInView();

  useEffect(() => {
    setReviews(initialReviews);
    setHasMore(true);
  }, [initialReviews]);

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

  useEffect(() => {
    if (inView) {
      loadMoreReviews();
    }
  }, [inView, loadMoreReviews]);

  const handleUpdate = (updatedReview?: ReviewWithLatestGeneration) => {
    if (updatedReview) {
      setReviews((prev) => prev.map((r) => (r.id === updatedReview.id ? updatedReview : r)));
    }
    router.refresh();
  };

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div key={review.id}>
          <ReviewCard
            review={review}
            accountId={accountId}
            locationId={locationId}
            userId={userId}
            onUpdate={handleUpdate}
          />
        </div>
      ))}

      {hasMore && (
        <div ref={ref}>
          {isLoading && (
            <div className="space-y-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <ReviewCardSkeleton key={i} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ReviewCardSkeleton() {
  return (
    <div className="w-full rounded-2xl border border-border/40 bg-card p-5 sm:p-6">
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
        <div>
          <Skeleton className="h-3 w-20 mb-2" />
          <div className="border-s-2 border-primary/30 ps-3 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
        <div className="flex items-center justify-end gap-1">
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-8 w-20 rounded-md ms-2" />
        </div>
      </div>
    </div>
  );
}
