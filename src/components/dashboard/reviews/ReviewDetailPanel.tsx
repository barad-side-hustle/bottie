"use client";

import { useRef, useImperativeHandle, forwardRef } from "react";
import { StarRating } from "@/components/ui/StarRating";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider, TooltipIcon } from "@/components/ui/tooltip";
import { ReviewStatusBadge } from "@/components/dashboard/reviews/ReviewStatusBadge";
import { useReplyWorkspace } from "@/components/dashboard/reviews/useReplyWorkspace";
import { User, RotateCcw, Send, ThumbsUp, ThumbsDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations, useFormatter } from "next-intl";
import { useDirection } from "@/contexts/DirectionProvider";
import { isReviewPublishable } from "@/components/dashboard/reviews/ReviewCard";
import type { ReviewWithLatestGeneration } from "@/lib/db/repositories";
import type { ClassificationCategory } from "@/lib/types/classification.types";

export interface ReviewDetailPanelHandle {
  focusEditor: () => void;
  publish: () => void;
}

interface ReviewDetailPanelProps {
  review: ReviewWithLatestGeneration;
  locationId: string;
  onUpdate?: (updatedReview?: ReviewWithLatestGeneration) => void;
  onPublished?: (reviewId: string) => void;
  variant?: "panel" | "page";
  className?: string;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export const ReviewDetailPanel = forwardRef<ReviewDetailPanelHandle, ReviewDetailPanelProps>(function ReviewDetailPanel(
  { review, locationId, onUpdate, onPublished, variant = "panel", className },
  ref
) {
  const t = useTranslations("dashboard.reviews.card");
  const tEditor = useTranslations("dashboard.reviews.editor");
  const tCategories = useTranslations("dashboard.insights.categories");
  const format = useFormatter();
  const { dir } = useDirection();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const workspace = useReplyWorkspace({ review, locationId, onUpdate });

  const handlePublish = async () => {
    try {
      await workspace.publish();
      onPublished?.(review.id);
    } catch {}
  };

  useImperativeHandle(
    ref,
    () => ({
      focusEditor: () => textareaRef.current?.focus(),
      publish: () => {
        if (isReviewPublishable(review) && !workspace.isBusy) void handlePublish();
      },
    }),
    [review, workspace.isBusy]
  );

  const classification = review.classifications;
  const categoryChips: { category: ClassificationCategory; tone: "positive" | "negative" }[] = [
    ...(classification?.positives ?? []).map((m) => ({ category: m.category, tone: "positive" as const })),
    ...(classification?.negatives ?? []).map((m) => ({ category: m.category, tone: "negative" as const })),
  ];
  const freeTopics = classification?.topics ?? [];
  const hasTopics = categoryChips.length > 0 || freeTopics.length > 0;

  const canEdit =
    review.replyStatus === "pending" || review.replyStatus === "failed" || review.replyStatus === "posted";
  const hasReply = !!review.latestAiReply;
  const publishable = isReviewPublishable(review);
  const isPosted = review.replyStatus === "posted";

  const isPage = variant === "page";

  return (
    <div className={cn("flex h-full min-h-0 flex-col", className)} dir={dir}>
      <div className={cn("min-h-0 flex-1", !isPage && "overflow-y-auto")}>
        <div className="space-y-5 p-5">
          <div className="flex items-start gap-3">
            <Avatar className="mt-0.5 h-10 w-10 shrink-0 rounded-md">
              <AvatarImage src={review.photoUrl || undefined} alt={`${review.name} profile`} />
              <AvatarFallback className="rounded-md bg-surface-2">
                {review.photoUrl ? (
                  <User className="h-5 w-5 text-ink-3" />
                ) : (
                  <span className="text-sm font-semibold text-ink-2">{getInitials(review.name)}</span>
                )}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <h2 className="truncate font-sans text-base font-semibold tracking-[-0.01em] text-ink">
                  {review.name}
                </h2>
                <span className="ms-auto">
                  <ReviewStatusBadge review={review} />
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <StarRating rating={review.rating} size={15} />
                <span className="flex items-center gap-1 text-xs tabular-nums text-ink-3">
                  {format.dateTime(new Date(review.date), {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                  <TooltipIcon text={t("dateTooltip")} additionalInfoLabel={t("reviewDateLabel")} />
                </span>
              </div>
            </div>
          </div>

          <p className={cn("text-sm leading-relaxed text-ink-2", !review.text && "italic text-ink-3")}>
            {review.text || t("noText")}
          </p>

          {hasTopics && (
            <div className="flex flex-wrap gap-1.5">
              {categoryChips.map(({ category, tone }) => (
                <Badge
                  key={`${tone}-${category}`}
                  variant={tone === "positive" ? "success" : "destructive"}
                  className="rounded-full font-normal"
                >
                  {tCategories(category)}
                </Badge>
              ))}
              {freeTopics.map((topic) => (
                <Badge key={topic} variant="outline" className="rounded-full bg-surface-2 font-normal">
                  {topic}
                </Badge>
              ))}
            </div>
          )}

          {(hasReply || canEdit) && (
            <div className="space-y-2 border-t border-hairline pt-5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.02em] text-ink-2">
                    {t("aiReplyLabel")}
                  </span>
                  {isPosted && review.latestAiReplyPostedAt && (
                    <span className="flex items-center gap-1 text-xs tabular-nums text-ink-3">
                      &middot;{" "}
                      {format.dateTime(new Date(review.latestAiReplyPostedAt), {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                      <TooltipIcon text={t("replyDateTooltip")} additionalInfoLabel={t("replyDateLabel")} />
                    </span>
                  )}
                </div>

                {hasReply && (
                  <div className="flex items-center gap-0.5">
                    <TooltipProvider delayDuration={300}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            onClick={() => workspace.setFeedback("liked")}
                            disabled={workspace.isFeedbackLoading || workspace.isBusy}
                            size="icon-sm"
                            variant="ghost"
                            aria-label={t("feedback.like")}
                            className={cn(
                              workspace.feedbackState === "liked" && "bg-positive-tint text-success-foreground"
                            )}
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
                            onClick={() => workspace.setFeedback("disliked")}
                            disabled={workspace.isFeedbackLoading || workspace.isBusy}
                            size="icon-sm"
                            variant="ghost"
                            aria-label={t("feedback.dislike")}
                            className={cn(
                              workspace.feedbackState === "disliked" && "bg-negative-tint text-destructive"
                            )}
                          >
                            <ThumbsDown className="size-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>{t("feedback.dislike")}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                )}
              </div>

              {workspace.isRegenerating ? (
                <div className="space-y-2 rounded-md border border-line-strong bg-surface-2 p-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ) : (
                <Textarea
                  ref={textareaRef}
                  value={workspace.replyText}
                  onChange={(e) => workspace.setReplyText(e.target.value)}
                  placeholder={tEditor("placeholder")}
                  className="min-h-[160px] resize-y leading-relaxed"
                  maxLength={workspace.maxChars}
                  disabled={workspace.isBusy}
                  aria-label={tEditor("replyLabel")}
                />
              )}

              <div className="flex items-center justify-between text-xs tabular-nums text-ink-3">
                <span>
                  {workspace.isDirty && workspace.replyText.trim() ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={workspace.saveDraft}
                      disabled={workspace.isBusy}
                    >
                      {workspace.isSaving ? tEditor("saving") : tEditor("save")}
                    </Button>
                  ) : null}
                </span>
                <span>
                  {workspace.replyText.length} / {workspace.maxChars} {tEditor("characters")}
                </span>
              </div>

              {workspace.showCommentInput && workspace.feedbackState === "disliked" && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    void workspace.saveFeedbackComment();
                  }}
                  className="flex items-center gap-2"
                >
                  <Input
                    value={workspace.feedbackComment}
                    onChange={(e) => workspace.setFeedbackComment(e.target.value)}
                    placeholder={t("feedback.commentPlaceholder")}
                    maxLength={500}
                    className="h-8 text-sm"
                    disabled={workspace.isFeedbackLoading}
                  />
                  <Button
                    type="submit"
                    size="sm"
                    variant="outline"
                    disabled={workspace.isFeedbackLoading || !workspace.feedbackComment.trim()}
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

      {(hasReply || canEdit) && (
        <div
          className={cn(
            "flex items-center gap-2 border-t border-hairline bg-card px-5 py-3",
            !isPage && "sticky bottom-0"
          )}
        >
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={workspace.regenerate}
            disabled={workspace.isBusy}
          >
            <RotateCcw className={cn("size-4", workspace.isRegenerating && "animate-spin")} />
            {t("actions.regenerate")}
          </Button>

          <Button
            type="button"
            size="sm"
            className="ms-auto gap-1.5"
            onClick={handlePublish}
            disabled={!publishable || workspace.isBusy || !workspace.replyText.trim()}
          >
            {workspace.isPublishing ? (
              tEditor("saving")
            ) : (
              <>
                {isPosted ? <Check className="size-4" /> : <Send className="size-4" />}
                {isPosted ? t("actions.update") : t("actions.publish")}
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
});
