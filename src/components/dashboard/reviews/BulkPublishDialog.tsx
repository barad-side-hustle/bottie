"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StarRating } from "@/components/ui/StarRating";
import { CircularProgress } from "@/components/ui/circular-progress";
import { postReviewReply } from "@/lib/actions/reviews.actions";
import { User, Loader2, CheckCircle2, XCircle, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import type { ReviewWithLatestGeneration } from "@/lib/db/repositories";

const REVIEW_DELETED_MARKER = "REVIEW_DELETED_FROM_GOOGLE";

interface BulkPublishDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedReviews: ReviewWithLatestGeneration[];
  locationId: string;
  onComplete: (results: {
    succeeded: string[];
    removed: string[];
    failed: { reviewId: string; error: string }[];
  }) => void;
}

type Phase = "confirm" | "publishing" | "results";
type ReviewStatus = "pending" | "publishing" | "succeeded" | "removed" | { error: string };

export function BulkPublishDialog({
  open,
  onOpenChange,
  selectedReviews,
  locationId,
  onComplete,
}: BulkPublishDialogProps) {
  const t = useTranslations("dashboard.reviews.bulkActions");
  const [phase, setPhase] = useState<Phase>("confirm");
  const [statusMap, setStatusMap] = useState<Map<string, ReviewStatus>>(new Map());
  const [results, setResults] = useState<{
    succeeded: string[];
    removed: string[];
    failed: { reviewId: string; error: string }[];
  }>({ succeeded: [], removed: [], failed: [] });

  const completed = [...statusMap.values()].filter(
    (s) => s === "succeeded" || s === "removed" || typeof s === "object"
  ).length;
  const total = selectedReviews.length;
  const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

  const handlePublish = async () => {
    setPhase("publishing");

    const initialMap = new Map<string, ReviewStatus>();
    for (const r of selectedReviews) initialMap.set(r.id, "pending");
    setStatusMap(initialMap);

    const acc = {
      succeeded: [] as string[],
      removed: [] as string[],
      failed: [] as { reviewId: string; error: string }[],
    };

    for (const review of selectedReviews) {
      setStatusMap((prev) => new Map(prev).set(review.id, "publishing"));

      try {
        await postReviewReply({ locationId, reviewId: review.id });
        acc.succeeded.push(review.id);
        setStatusMap((prev) => new Map(prev).set(review.id, "succeeded"));
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";

        if (message.includes(REVIEW_DELETED_MARKER)) {
          acc.removed.push(review.id);
          setStatusMap((prev) => new Map(prev).set(review.id, "removed"));
        } else {
          acc.failed.push({ reviewId: review.id, error: message });
          setStatusMap((prev) => new Map(prev).set(review.id, { error: message }));
        }
      }
    }

    setResults(acc);
    setPhase("results");
    onComplete(acc);
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setPhase("confirm");
      setStatusMap(new Map());
      setResults({ succeeded: [], removed: [], failed: [] });
    }, 200);
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const getStatusIcon = (status: ReviewStatus) => {
    if (status === "publishing") return <Loader2 className="size-4 animate-spin text-primary" />;
    if (status === "succeeded") return <CheckCircle2 className="size-4 text-green-600 dark:text-green-400" />;
    if (status === "removed") return <Trash2 className="size-4 text-muted-foreground" />;
    if (typeof status === "object") return <XCircle className="size-4 text-destructive" />;
    return <div className="size-4 rounded-full border-2 border-border/40" />;
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (phase === "publishing") return;
        if (!v) handleClose();
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {phase === "results"
              ? t("complete", { succeeded: results.succeeded.length, total })
              : t("dialogTitle", { count: total })}
          </DialogTitle>
          {phase === "confirm" && <DialogDescription>{t("dialogDescription")}</DialogDescription>}
          {phase === "publishing" && <DialogDescription>{t("publishing", { completed, total })}</DialogDescription>}
        </DialogHeader>

        {phase === "confirm" && (
          <div className="max-h-64 overflow-y-auto space-y-2">
            {selectedReviews.map((review) => (
              <div key={review.id} className="flex items-start gap-3 rounded-lg border border-border/40 p-3">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage src={review.photoUrl || undefined} />
                  <AvatarFallback className="bg-primary/10 text-xs">
                    {review.photoUrl ? <User className="h-4 w-4 text-primary" /> : getInitials(review.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">{review.name}</span>
                    <StarRating rating={review.rating} size={12} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{review.latestAiReply}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {phase === "publishing" && (
          <div className="space-y-4">
            <div className="flex justify-center py-2">
              <CircularProgress value={progressPercent} size={80} strokeWidth={6} />
            </div>
            <div className="max-h-48 overflow-y-auto space-y-1.5">
              {selectedReviews.map((review) => {
                const status = statusMap.get(review.id) ?? "pending";
                return (
                  <div
                    key={review.id}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                      status === "publishing" && "bg-primary/5",
                      (status === "succeeded" || status === "removed") && "opacity-60"
                    )}
                  >
                    {getStatusIcon(status)}
                    <span className={cn("truncate flex-1", status === "removed" && "line-through")}>{review.name}</span>
                    {status === "removed" && (
                      <span className="text-xs text-muted-foreground">{t("reviewRemoved")}</span>
                    )}
                    {typeof status === "object" && (
                      <span className="text-xs text-destructive truncate max-w-[140px]">{status.error}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {phase === "results" && (
          <div className="space-y-3">
            {results.succeeded.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{t("complete", { succeeded: results.succeeded.length, total })}</span>
              </div>
            )}
            {results.removed.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Trash2 className="h-4 w-4 shrink-0" />
                <span>{t("removedCount", { count: results.removed.length })}</span>
              </div>
            )}
            {results.failed.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <XCircle className="h-4 w-4 shrink-0" />
                  <span>{t("someFailed", { count: results.failed.length })}</span>
                </div>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {results.failed.map((f) => {
                    const review = selectedReviews.find((r) => r.id === f.reviewId);
                    return (
                      <p key={f.reviewId} className="text-xs text-muted-foreground ps-6">
                        {review?.name}: {f.error}
                      </p>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          {phase === "confirm" && (
            <>
              <Button variant="outline" onClick={handleClose}>
                {t("cancel")}
              </Button>
              <Button onClick={handlePublish} className="gap-1.5">
                {t("confirm")}
              </Button>
            </>
          )}
          {phase === "results" && <Button onClick={handleClose}>{t("done")}</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
