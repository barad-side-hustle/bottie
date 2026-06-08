"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { ReviewCard, isReviewPublishable } from "@/components/dashboard/reviews/ReviewCard";
import { ReviewDetailPanel, type ReviewDetailPanelHandle } from "@/components/dashboard/reviews/ReviewDetailPanel";
import { BulkActionBar } from "@/components/dashboard/reviews/BulkActionBar";
import { BulkPublishDialog } from "@/components/dashboard/reviews/BulkPublishDialog";
import { getReviews } from "@/lib/actions/reviews.actions";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { CheckSquare, ChevronDown, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { useMediaQuery } from "react-responsive";
import type { ReviewWithLatestGeneration } from "@/lib/db/repositories";
import { parseFiltersFromSearchParams } from "@/lib/utils/filter-utils";

interface ReviewsInboxProps {
  reviews: ReviewWithLatestGeneration[];
  locationId: string;
  userId: string;
}

export function ReviewsInbox({ reviews: initialReviews, locationId, userId }: ReviewsInboxProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("dashboard.reviews.bulkActions");
  const tInbox = useTranslations("dashboard.reviews.inbox");

  const [reviews, setReviews] = useState<ReviewWithLatestGeneration[]>(initialReviews);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkPublishDialog, setShowBulkPublishDialog] = useState(false);

  const [activeReviewId, setActiveReviewId] = useState<string | null>(initialReviews[0]?.id ?? null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const isDesktop = useMediaQuery({ query: "(min-width: 1024px)" });
  const detailRef = useRef<ReviewDetailPanelHandle>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setReviews(initialReviews);
    setHasMore(true);
    setSelectedIds(new Set());
    setActiveReviewId((prev) =>
      prev && initialReviews.some((r) => r.id === prev) ? prev : (initialReviews[0]?.id ?? null)
    );
  }, [initialReviews]);

  const publishableIds = useMemo(() => new Set(reviews.filter(isReviewPublishable).map((r) => r.id)), [reviews]);

  const selectedPublishable = useMemo(
    () => reviews.filter((r) => selectedIds.has(r.id) && publishableIds.has(r.id)),
    [reviews, selectedIds, publishableIds]
  );

  const isAllSelected = publishableIds.size > 0 && [...publishableIds].every((id) => selectedIds.has(id));

  const activeReview = useMemo(() => reviews.find((r) => r.id === activeReviewId) ?? null, [reviews, activeReviewId]);

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
  }, [locationId, hasMore, isLoading, reviews.length, searchParams]);

  const handleUpdate = useCallback(
    (updatedReview?: ReviewWithLatestGeneration) => {
      if (updatedReview) {
        setReviews((prev) => prev.map((r) => (r.id === updatedReview.id ? updatedReview : r)));
      }
      router.refresh();
    },
    [router]
  );

  const openReview = useCallback(
    (reviewId: string) => {
      setActiveReviewId(reviewId);
      if (!isDesktop) setSheetOpen(true);
    },
    [isDesktop]
  );

  const advanceSelection = useCallback(
    (fromId: string) => {
      const index = reviews.findIndex((r) => r.id === fromId);
      const next = reviews.slice(index + 1).find((r) => isReviewPublishable(r));
      if (next) {
        setActiveReviewId(next.id);
      } else if (!isDesktop) {
        setSheetOpen(false);
      }
    },
    [reviews, isDesktop]
  );

  useEffect(() => {
    const isTypingTarget = (el: EventTarget | null) => {
      if (!(el instanceof HTMLElement)) return false;
      const tag = el.tagName;
      return tag === "INPUT" || tag === "TEXTAREA" || el.isContentEditable;
    };

    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        if (activeReview && isReviewPublishable(activeReview)) {
          e.preventDefault();
          detailRef.current?.publish();
        }
        return;
      }

      if (isTypingTarget(e.target)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (reviews.length === 0) return;

      const currentIndex = activeReviewId ? reviews.findIndex((r) => r.id === activeReviewId) : -1;

      if (e.key === "j" || e.key === "ArrowDown") {
        e.preventDefault();
        const nextIndex = Math.min(currentIndex + 1, reviews.length - 1);
        const nextId = reviews[nextIndex]?.id;
        if (nextId) {
          setActiveReviewId(nextId);
          if (nextIndex >= reviews.length - 2 && hasMore && !isLoading) void loadMoreReviews();
        }
      } else if (e.key === "k" || e.key === "ArrowUp") {
        e.preventDefault();
        const prevIndex = Math.max(currentIndex - 1, 0);
        const prevId = reviews[prevIndex]?.id;
        if (prevId) setActiveReviewId(prevId);
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (activeReviewId) {
          if (!isDesktop) setSheetOpen(true);
          else detailRef.current?.focusEditor();
        }
      } else if (e.key === "e" || e.key === "E") {
        if (activeReview && (activeReview.latestAiReply || activeReview.replyStatus !== "posted")) {
          e.preventDefault();
          if (!isDesktop) setSheetOpen(true);
          detailRef.current?.focusEditor();
        }
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [reviews, activeReviewId, activeReview, isDesktop, hasMore, isLoading, loadMoreReviews]);

  const detailPanel = activeReview ? (
    <ReviewDetailPanel
      key={activeReview.id}
      ref={detailRef}
      review={activeReview}
      locationId={locationId}
      onUpdate={handleUpdate}
      onPublished={advanceSelection}
    />
  ) : (
    <EmptyDetail title={tInbox("detailEmptyTitle")} hint={tInbox("detailEmptyHint")} />
  );

  const list = (
    <div
      ref={listRef}
      className="divide-y divide-border overflow-hidden rounded-lg border border-hairline bg-card lg:rounded-none lg:border-x-0 lg:border-t-0"
    >
      {publishableIds.size > 0 && selectedPublishable.length === 0 && (
        <button
          type="button"
          onClick={handleSelectAll}
          className="flex w-full items-center gap-2 border-b border-hairline bg-surface-2 px-4 py-2.5 text-start text-sm text-ink-2 transition-colors hover:text-ink"
        >
          <CheckSquare className="size-3.5" />
          <span>{t("selectAllHint", { count: publishableIds.size })}</span>
        </button>
      )}

      {reviews.map((review) => (
        <ReviewCard
          key={review.id}
          review={review}
          locationId={locationId}
          userId={userId}
          onUpdate={handleUpdate}
          isSelectable={isReviewPublishable(review)}
          isSelected={selectedIds.has(review.id)}
          onSelectionChange={handleSelectionChange}
          isActive={activeReviewId === review.id}
          onActivate={openReview}
          density="compact"
        />
      ))}

      {hasMore && isLoading && Array.from({ length: 2 }).map((_, i) => <ReviewRowSkeleton key={i} />)}

      {hasMore && !isLoading && (
        <button
          type="button"
          onClick={loadMoreReviews}
          className="flex w-full items-center justify-center gap-2 px-4 py-3 text-sm text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink"
        >
          <ChevronDown className="size-4" />
          {t("loadMore")}
        </button>
      )}
    </div>
  );

  return (
    <div className={cn(selectedPublishable.length > 0 && "pb-20")}>
      <div className="hidden lg:grid lg:grid-cols-[minmax(360px,1fr)_minmax(440px,520px)]">
        <div className="min-w-0 border-e border-hairline">{list}</div>
        <aside className="min-w-0">
          <div className="sticky top-32 h-[calc(100vh-9rem)] overflow-hidden rounded-lg border border-hairline bg-card">
            {detailPanel}
          </div>
        </aside>
      </div>

      <div className="lg:hidden">{list}</div>

      <Sheet open={sheetOpen && !isDesktop} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="h-[88vh] gap-0 rounded-t-lg p-0">
          <SheetTitle className="sr-only">{activeReview?.name ?? tInbox("detailEmptyTitle")}</SheetTitle>
          <div className="h-full pt-2">{detailPanel}</div>
        </SheetContent>
      </Sheet>

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
        locationId={locationId}
        onComplete={handleBulkPublishComplete}
      />
    </div>
  );
}

function EmptyDetail({ title, hint }: { title: string; hint: string }) {
  const tInbox = useTranslations("dashboard.reviews.inbox");
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
      <span className="flex size-10 items-center justify-center rounded-lg border border-hairline bg-surface-2 text-ink-3">
        <Inbox className="size-5" />
      </span>
      <div className="space-y-1">
        <p className="font-sans text-sm font-semibold tracking-[-0.01em] text-ink">{title}</p>
        <p className="text-sm text-ink-2">{hint}</p>
      </div>
      <p className="text-xs text-ink-3">{tInbox("keyboardHint")}</p>
    </div>
  );
}

function ReviewRowSkeleton() {
  return (
    <div className="flex gap-3 px-4 py-3">
      <Skeleton className="mt-0.5 h-9 w-9 shrink-0 rounded-md" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-20" />
          <Skeleton className="ms-auto h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}
