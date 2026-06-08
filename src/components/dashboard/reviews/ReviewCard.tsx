"use client";

import { useState, useEffect } from "react";
import { StarRating } from "@/components/ui/StarRating";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TooltipIcon, Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { postReviewReply, generateReviewReply, setReviewResponseFeedback } from "@/lib/actions/reviews.actions";
import { useAuth } from "@/contexts/AuthContext";
import { ReplyEditor } from "@/components/dashboard/reviews/ReplyEditor";
import { ReviewStatusBadge } from "@/components/dashboard/reviews/ReviewStatusBadge";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { User, RotateCcw, Pencil, Send, ThumbsUp, ThumbsDown, Check } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useTranslations, useFormatter } from "next-intl";
import { sendRybbitEvent } from "@/lib/analytics";
import type { ReviewWithLatestGeneration } from "@/lib/db/repositories";

export function isReviewPublishable(review: ReviewWithLatestGeneration): boolean {
  return review.replyStatus === "pending" && !!review.latestAiReply;
}

interface ReviewCardProps {
  review: ReviewWithLatestGeneration;
  userId: string;
  locationId: string;
  onUpdate?: (updatedReview?: ReviewWithLatestGeneration) => void;
  isSelectable?: boolean;
  isSelected?: boolean;
  onSelectionChange?: (reviewId: string, selected: boolean) => void;
  density?: "full" | "compact";
  isActive?: boolean;
  onActivate?: (reviewId: string) => void;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function ReviewCard({
  review,
  userId,
  locationId,
  onUpdate,
  isSelectable,
  isSelected,
  onSelectionChange,
  density = "full",
  isActive,
  onActivate,
}: ReviewCardProps) {
  const t = useTranslations("dashboard.reviews.card");
  const tCategories = useTranslations("dashboard.insights.categories");
  const format = useFormatter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [showPublishDialog, setShowPublishDialog] = useState(false);

  const [feedbackState, setFeedbackState] = useState<"liked" | "disliked" | null>(review.latestAiReplyFeedback ?? null);
  const [feedbackComment, setFeedbackComment] = useState(review.latestAiReplyFeedbackComment ?? "");
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);

  useEffect(() => {
    setFeedbackState(review.latestAiReplyFeedback ?? null);
    setFeedbackComment(review.latestAiReplyFeedbackComment ?? "");
    setShowCommentInput(false);
  }, [review.latestAiReplyFeedback, review.latestAiReplyFeedbackComment]);

  const handlePublishConfirm = async () => {
    if (!user) return;

    try {
      const updatedReview = await postReviewReply({ locationId, reviewId: review.id });
      sendRybbitEvent("reply_published", {
        rating: review.rating,
        is_update: review.replyStatus === "posted",
      });
      onUpdate?.(updatedReview);
    } catch (error) {
      console.error("Error publishing reply:", error);
      throw error;
    }
  };

  const handleRegenerate = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;

    try {
      setIsLoading(true);
      const result = await generateReviewReply({ locationId, reviewId: review.id });
      sendRybbitEvent("reply_regenerated", { rating: review.rating });
      onUpdate?.(result.review);
    } catch (error) {
      console.error("Error regenerating reply:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedback = async (value: "liked" | "disliked", e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!review.latestAiReplyId || isFeedbackLoading) return;

    const newFeedback = feedbackState === value ? null : value;
    const previousFeedback = feedbackState;
    const previousComment = feedbackComment;

    setFeedbackState(newFeedback);
    if (newFeedback !== "disliked") {
      setShowCommentInput(false);
      setFeedbackComment("");
    } else {
      setShowCommentInput(true);
    }
    setIsFeedbackLoading(true);

    try {
      await setReviewResponseFeedback({
        locationId,
        responseId: review.latestAiReplyId,
        feedback: newFeedback,
      });
      sendRybbitEvent("reply_feedback", {
        rating: review.rating,
        feedback: newFeedback ?? "cleared",
      });
    } catch (error) {
      console.error("Error setting feedback:", error);
      setFeedbackState(previousFeedback);
      setFeedbackComment(previousComment);
      if (previousFeedback === "disliked") setShowCommentInput(true);
    } finally {
      setIsFeedbackLoading(false);
    }
  };

  const handleSaveComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!review.latestAiReplyId || isFeedbackLoading) return;

    setIsFeedbackLoading(true);
    try {
      await setReviewResponseFeedback({
        locationId,
        responseId: review.latestAiReplyId,
        feedback: "disliked",
        comment: feedbackComment || undefined,
      });
      setShowCommentInput(false);
    } catch (error) {
      console.error("Error saving feedback comment:", error);
    } finally {
      setIsFeedbackLoading(false);
    }
  };

  const hasActions =
    review.replyStatus === "pending" || review.replyStatus === "failed" || review.replyStatus === "posted";

  const showFeedback = !!review.latestAiReply;

  const revealActions = cn(
    "opacity-0 transition-opacity duration-150",
    "group-hover:opacity-100 group-focus-within:opacity-100 focus-within:opacity-100",
    "[@media(hover:none)]:opacity-100",
    isSelected && "opacity-100"
  );

  const checkbox = isSelectable && (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onSelectionChange?.(review.id, !isSelected);
      }}
      className={cn(
        "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-surface-3",
        density === "full" && revealActions
      )}
      aria-label={isSelected ? "Deselect review" : "Select review"}
    >
      <span
        className={cn(
          "flex h-[18px] w-[18px] items-center justify-center rounded-[4px] border-[1.5px] transition-colors duration-150",
          isSelected ? "border-primary bg-primary text-primary-foreground" : "border-line-strong"
        )}
      >
        {isSelected && <Check className="h-3 w-3" strokeWidth={3} />}
      </span>
    </button>
  );

  const avatar = (
    <Avatar className="mt-0.5 h-9 w-9 shrink-0 rounded-md">
      <AvatarImage src={review.photoUrl || undefined} alt={`${review.name} profile`} />
      <AvatarFallback className="rounded-md bg-surface-2">
        {review.photoUrl ? (
          <User className="h-4 w-4 text-ink-3" />
        ) : (
          <span className="text-xs font-semibold text-ink-2">{getInitials(review.name)}</span>
        )}
      </AvatarFallback>
    </Avatar>
  );

  if (density === "compact") {
    const categoryChips = [
      ...(review.classifications?.positives ?? []).map((m) => m.category),
      ...(review.classifications?.negatives ?? []).map((m) => m.category),
    ].slice(0, 2);

    return (
      <div
        role="button"
        tabIndex={0}
        data-review-id={review.id}
        onClick={() => onActivate?.(review.id)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onActivate?.(review.id);
          }
        }}
        aria-current={isActive ? "true" : undefined}
        className={cn(
          "group relative flex w-full cursor-pointer flex-col gap-2 rounded-lg border p-3 text-start outline-none transition-colors duration-150",
          "focus-visible:ring-2 focus-visible:ring-ring",
          isActive
            ? "border-line-strong bg-surface-3"
            : isSelected
              ? "border-line-strong bg-accent-tint"
              : "border-hairline hover:border-line-strong hover:bg-surface-2"
        )}
      >
        <div className="flex items-center gap-2">
          {checkbox}
          <h3 className="truncate text-sm font-semibold text-ink">{review.name}</h3>
          <span className="ms-auto shrink-0 text-xs tabular-nums text-ink-3">
            {format.dateTime(new Date(review.date), { month: "short", day: "numeric" })}
          </span>
        </div>

        <StarRating rating={review.rating} size={14} />

        <p className={cn("line-clamp-2 text-xs leading-snug text-ink-2", !review.text && "italic text-ink-3")}>
          {review.text || t("noText")}
        </p>

        <div className="flex flex-wrap items-center gap-1.5">
          <ReviewStatusBadge review={review} />
          {categoryChips.map((category) => (
            <Badge key={category} variant="outline" className="rounded-full bg-surface-2 font-normal">
              {tCategories(category)}
            </Badge>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className={cn(
          "group relative flex gap-3 px-4 py-3 transition-colors duration-150",
          isSelected ? "bg-accent-tint" : "hover:bg-surface-2"
        )}
      >
        {checkbox}
        {avatar}

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h3 className="truncate text-sm font-medium text-ink">{review.name}</h3>
            <StarRating rating={review.rating} size={14} />
            <span className="flex items-center gap-1 text-xs tabular-nums text-ink-3">
              {format.dateTime(new Date(review.date), {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
              <TooltipIcon text={t("dateTooltip")} additionalInfoLabel={t("reviewDateLabel")} />
            </span>
            <span className="ms-auto">
              <ReviewStatusBadge review={review} />
            </span>
          </div>

          <p className={cn("text-sm leading-relaxed text-ink-2", !review.text && "italic text-ink-3")}>
            {review.text || t("noText")}
          </p>

          {review.latestAiReply && (
            <div className="rounded-md bg-surface-2 p-3">
              <div className="mb-1.5 flex items-center gap-2">
                <span className="text-xs font-medium text-ink-3">{t("aiReplyLabel")}</span>
                {review.replyStatus === "posted" && review.latestAiReplyPostedAt && (
                  <>
                    <span className="text-xs text-ink-3">&middot;</span>
                    <span className="flex items-center gap-1 text-xs tabular-nums text-ink-3">
                      {format.dateTime(new Date(review.latestAiReplyPostedAt), {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                      <TooltipIcon text={t("replyDateTooltip")} additionalInfoLabel={t("replyDateLabel")} />
                    </span>
                  </>
                )}
              </div>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ) : (
                <p className="text-sm leading-relaxed text-ink">{review.latestAiReply}</p>
              )}
            </div>
          )}

          {(hasActions || showFeedback) && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                {showFeedback && (
                  <div className="flex items-center gap-1">
                    <TooltipProvider delayDuration={300}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            onClick={(e) => handleFeedback("liked", e)}
                            disabled={isFeedbackLoading || isLoading}
                            size="icon-sm"
                            variant="ghost"
                            aria-label={t("feedback.like")}
                            className={cn(feedbackState === "liked" && "bg-positive-tint text-success-foreground")}
                          >
                            <ThumbsUp className="size-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>{t("feedback.like")}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider delayDuration={300}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            onClick={(e) => handleFeedback("disliked", e)}
                            disabled={isFeedbackLoading || isLoading}
                            size="icon-sm"
                            variant="ghost"
                            aria-label={t("feedback.dislike")}
                            className={cn(feedbackState === "disliked" && "bg-negative-tint text-destructive")}
                          >
                            <ThumbsDown className="size-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>{t("feedback.dislike")}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                )}
                {hasActions && (
                  <div className={cn("flex items-center gap-1 ms-auto", revealActions)}>
                    <TooltipProvider delayDuration={300}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            onClick={handleRegenerate}
                            disabled={isLoading}
                            size="icon-sm"
                            variant="ghost"
                            aria-label={t("actions.regenerate")}
                          >
                            <RotateCcw className="size-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>{t("actions.regenerate")}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider delayDuration={300}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setShowEditor(true);
                            }}
                            disabled={isLoading}
                            size="icon-sm"
                            variant="ghost"
                            aria-label={t("actions.edit")}
                          >
                            <Pencil className="size-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>{t("actions.edit")}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider delayDuration={300}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setShowPublishDialog(true);
                            }}
                            disabled={isLoading}
                            size="icon-sm"
                            variant="default"
                            aria-label={review.replyStatus === "posted" ? t("actions.update") : t("actions.publish")}
                          >
                            <Send className="size-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {review.replyStatus === "posted" ? t("actions.update") : t("actions.publish")}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                )}
              </div>

              {showCommentInput && feedbackState === "disliked" && (
                <form onSubmit={handleSaveComment} className="flex items-center gap-2">
                  <Input
                    value={feedbackComment}
                    onChange={(e) => setFeedbackComment(e.target.value)}
                    placeholder={t("feedback.commentPlaceholder")}
                    maxLength={500}
                    className="h-8 text-sm"
                    disabled={isFeedbackLoading}
                  />
                  <Button
                    type="submit"
                    size="sm"
                    variant="outline"
                    disabled={isFeedbackLoading || !feedbackComment.trim()}
                    className="h-8 shrink-0"
                  >
                    {t("feedback.saveComment")}
                  </Button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>

      <ReplyEditor
        review={review}
        userId={userId}
        locationId={locationId}
        open={showEditor}
        onClose={() => setShowEditor(false)}
        onSave={() => {
          setShowEditor(false);
          onUpdate?.();
        }}
      />

      <ConfirmationDialog
        open={showPublishDialog}
        onOpenChange={setShowPublishDialog}
        title={review.replyStatus === "posted" ? t("updateDialog.title") : t("publishDialog.title")}
        description={
          <div className="space-y-3">
            <p>{review.replyStatus === "posted" ? t("updateDialog.description") : t("publishDialog.description")}</p>
            <div className="space-y-2 rounded-md bg-surface-2 p-3">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">{t("publishDialog.reviewer")}</span>
                <span>{review.name}</span>
                <span>&middot;</span>
                <StarRating rating={review.rating} size={14} />
              </div>
              <div className="text-sm">{review.text && <p className="mt-1 text-ink-2">{review.text}</p>}</div>
            </div>
            <div className="rounded-md bg-surface-2 p-3">
              <div className="mb-1.5 text-xs font-medium text-ink-3">{t("publishDialog.replyPreview")}</div>
              <p className="text-sm text-ink">{review.latestAiReply}</p>
            </div>
          </div>
        }
        confirmText={review.replyStatus === "posted" ? t("updateDialog.confirm") : t("publishDialog.confirm")}
        cancelText={review.replyStatus === "posted" ? t("updateDialog.cancel") : t("publishDialog.cancel")}
        onConfirm={handlePublishConfirm}
        variant="default"
        loadingText={review.replyStatus === "posted" ? t("updateDialog.loading") : t("publishDialog.loading")}
      />
    </>
  );
}
