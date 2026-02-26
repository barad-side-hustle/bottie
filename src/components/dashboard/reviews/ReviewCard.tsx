"use client";

import { useState, useEffect } from "react";
import { ReplyStatus } from "@/lib/types";
import { StarRating } from "@/components/ui/StarRating";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  TooltipIcon,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
  ResponsiveTooltip,
} from "@/components/ui/tooltip";
import { postReviewReply, generateReviewReply, setReviewResponseFeedback } from "@/lib/actions/reviews.actions";
import { useAuth } from "@/contexts/AuthContext";
import { ReplyEditor } from "@/components/dashboard/reviews/ReplyEditor";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { User, Bot, RotateCcw, Pencil, Send, ThumbsUp, ThumbsDown, Check } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useTranslations, useFormatter } from "next-intl";
import { useRouter } from "@/i18n/routing";
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
}

export function ReviewCard({
  review,
  userId,
  locationId,
  onUpdate,
  isSelectable,
  isSelected,
  onSelectionChange,
}: ReviewCardProps) {
  const t = useTranslations("dashboard.reviews.card");

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

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusBadge = (review: ReviewWithLatestGeneration) => {
    const status = review.replyStatus as ReplyStatus;

    if (status === "pending" && !review.latestAiReply) {
      return (
        <ResponsiveTooltip title={t("status.generating")} description={t("statusDescription.generating")}>
          <span className="cursor-default">
            <Badge variant="muted">{t("status.generating")}</Badge>
          </span>
        </ResponsiveTooltip>
      );
    }

    const failedDesc =
      review.failureReason === "quota" ? t("statusDescription.failedQuota") : t("statusDescription.failed");

    const statusMap = {
      pending: {
        label: t("status.pending"),
        variant: "warning" as const,
        description: t("statusDescription.pending"),
      },
      posted: {
        label: t("status.posted"),
        variant: "success" as const,
        description: t("statusDescription.posted"),
      },
      failed: {
        label: review.failureReason === "quota" ? t("status.quotaExceeded") : t("status.failed"),
        variant: "destructive" as const,
        description: failedDesc,
      },
    };

    const statusInfo = statusMap[status] || statusMap.pending;

    let badgeElement;
    if (status === "posted") {
      const Icon = review.latestAiReplyPostedBy ? User : Bot;
      badgeElement = (
        <Badge variant={statusInfo.variant} className="gap-1">
          <Icon className="h-3 w-3" />
          {statusInfo.label}
        </Badge>
      );
    } else {
      badgeElement = <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
    }

    return (
      <ResponsiveTooltip title={statusInfo.label} description={statusInfo.description}>
        <span className="cursor-default">{badgeElement}</span>
      </ResponsiveTooltip>
    );
  };

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

  const statusAccentColor = (() => {
    switch (review.replyStatus as ReplyStatus) {
      case "pending":
        return review.latestAiReply ? "bg-warning" : "bg-muted-foreground/40";
      case "posted":
        return "bg-success";
      case "failed":
        return "bg-destructive";
      default:
        return "bg-transparent";
    }
  })();

  return (
    <>
      <div
        className={cn(
          "w-full rounded-2xl border border-border/40 bg-card overflow-hidden transition-all duration-200",
          isSelected ? "ring-2 ring-primary/30 bg-primary/[0.02]" : "hover:shadow-md hover:border-border/60"
        )}
      >
        <div className="flex">
          <div className={cn("w-[3px] shrink-0", statusAccentColor)} />
          <div className="flex-1 p-5 sm:p-6">
            <div className="space-y-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center justify-between gap-2 w-full sm:w-auto sm:flex-1">
                  <div className="flex items-center gap-3 min-w-0">
                    {isSelectable && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectionChange?.(review.id, !isSelected);
                        }}
                        className="flex h-8 w-8 shrink-0 items-center justify-center -ms-1 rounded-md transition-colors hover:bg-accent/50"
                        aria-label={isSelected ? "Deselect review" : "Select review"}
                      >
                        <span
                          className={cn(
                            "flex h-[18px] w-[18px] items-center justify-center rounded-[4px] border-[1.5px] transition-all duration-150",
                            isSelected
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-muted-foreground/30 hover:border-primary/50"
                          )}
                        >
                          {isSelected && <Check className="h-3 w-3" strokeWidth={3} />}
                        </span>
                      </button>
                    )}
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarImage src={review.photoUrl || undefined} alt={`${review.name} profile`} />
                      <AvatarFallback className="bg-primary/10">
                        {review.photoUrl ? (
                          <User className="h-5 w-5 text-primary" />
                        ) : (
                          <span className="text-sm font-medium text-primary">{getInitials(review.name)}</span>
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <h3 className="font-semibold truncate">{review.name}</h3>
                      <div className="flex items-center gap-1">
                        <p className="text-xs text-muted-foreground">
                          {format.dateTime(new Date(review.date), {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                        <TooltipIcon text={t("dateTooltip")} additionalInfoLabel={t("reviewDateLabel")} />
                      </div>
                    </div>
                  </div>
                  <div className="sm:hidden">{getStatusBadge(review)}</div>
                </div>
                <div className="flex items-center gap-2">
                  <StarRating rating={review.rating} size={18} />
                  <div className="hidden sm:block">{getStatusBadge(review)}</div>
                </div>
              </div>

              <p className={cn("text-sm leading-relaxed", !review.text && "italic text-muted-foreground")}>
                {review.text || t("noText")}
              </p>

              {review.latestAiReply && (
                <div className="pt-3 mt-3 border-t border-border/30">
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="text-xs font-medium text-muted-foreground">{t("aiReplyLabel")}</span>
                    {review.replyStatus === "posted" && review.latestAiReplyPostedAt && (
                      <>
                        <span className="text-xs text-muted-foreground/60">&middot;</span>
                        <span className="text-xs text-muted-foreground">
                          {format.dateTime(new Date(review.latestAiReplyPostedAt), {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        <TooltipIcon text={t("replyDateTooltip")} additionalInfoLabel={t("replyDateLabel")} />
                      </>
                    )}
                  </div>
                  <div className="border-s-2 border-primary/30 ps-3 py-2.5 pe-3 rounded-e-lg bg-muted/30">
                    {isLoading ? (
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    ) : (
                      <p className="text-sm leading-relaxed">{review.latestAiReply}</p>
                    )}
                  </div>
                </div>
              )}

              {(hasActions || showFeedback) && (
                <div className="space-y-2 pt-2 mt-1 border-t border-border/20">
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
                                size="icon"
                                variant="ghost"
                                aria-label={t("feedback.like")}
                                className={cn(
                                  "h-7 w-7",
                                  feedbackState === "liked" &&
                                    "text-green-600 bg-green-50 hover:bg-green-100 dark:bg-green-950 dark:hover:bg-green-900"
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
                                onClick={(e) => handleFeedback("disliked", e)}
                                disabled={isFeedbackLoading || isLoading}
                                size="icon"
                                variant="ghost"
                                aria-label={t("feedback.dislike")}
                                className={cn(
                                  "h-7 w-7",
                                  feedbackState === "disliked" &&
                                    "text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-950 dark:hover:bg-red-900"
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
                    {hasActions && (
                      <div className="flex items-center gap-1 ms-auto">
                        <TooltipProvider delayDuration={300}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                type="button"
                                onClick={handleRegenerate}
                                disabled={isLoading}
                                size="icon"
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
                                size="icon"
                                variant="ghost"
                                aria-label={t("actions.edit")}
                              >
                                <Pencil className="size-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>{t("actions.edit")}</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <div className="h-5 w-px bg-border/40 mx-0.5" />
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
                                size="icon"
                                variant="default"
                                aria-label={
                                  review.replyStatus === "posted" ? t("actions.update") : t("actions.publish")
                                }
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
            <div className="rounded-md bg-muted p-3 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">{t("publishDialog.reviewer")}</span>
                <span>{review.name}</span>
                <span>&middot;</span>
                <StarRating rating={review.rating} size={14} />
              </div>
              <div className="text-sm">
                {review.text && <p className="mt-1 text-muted-foreground">{review.text}</p>}
              </div>
            </div>
            <div className="rounded-md border border-accent bg-accent/10 p-3">
              <p className="text-sm font-medium mb-1">{t("publishDialog.replyPreview")}</p>
              <p className="text-sm text-foreground">{review.latestAiReply}</p>
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

interface ReviewCardWithRefreshProps {
  review: ReviewWithLatestGeneration;
  userId: string;
  locationId: string;
}

export function ReviewCardWithRefresh({ review, userId, locationId }: ReviewCardWithRefreshProps) {
  const router = useRouter();

  return (
    <ReviewCard
      review={review}
      userId={userId}
      locationId={locationId}
      onUpdate={() => {
        router.refresh();
      }}
    />
  );
}
