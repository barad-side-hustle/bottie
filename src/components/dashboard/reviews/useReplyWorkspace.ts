"use client";

import { useState, useEffect, useCallback } from "react";
import {
  postReviewReply,
  generateReviewReply,
  setReviewResponseFeedback,
  saveReviewDraft,
} from "@/lib/actions/reviews.actions";
import { sendRybbitEvent } from "@/lib/analytics";
import type { ReviewWithLatestGeneration } from "@/lib/db/repositories";

const MAX_REPLY_CHARS = 1000;

interface UseReplyWorkspaceArgs {
  review: ReviewWithLatestGeneration;
  locationId: string;
  onUpdate?: (updatedReview?: ReviewWithLatestGeneration) => void;
}

export function useReplyWorkspace({ review, locationId, onUpdate }: UseReplyWorkspaceArgs) {
  const [replyText, setReplyText] = useState(review.latestAiReply || "");
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const [feedbackState, setFeedbackState] = useState<"liked" | "disliked" | null>(review.latestAiReplyFeedback ?? null);
  const [feedbackComment, setFeedbackComment] = useState(review.latestAiReplyFeedbackComment ?? "");
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);

  useEffect(() => {
    setReplyText(review.latestAiReply || "");
  }, [review.id, review.latestAiReply]);

  useEffect(() => {
    setFeedbackState(review.latestAiReplyFeedback ?? null);
    setFeedbackComment(review.latestAiReplyFeedbackComment ?? "");
    setShowCommentInput(false);
  }, [review.id, review.latestAiReplyFeedback, review.latestAiReplyFeedbackComment]);

  const isDirty = replyText.trim() !== (review.latestAiReply || "").trim();

  const regenerate = useCallback(async () => {
    try {
      setIsRegenerating(true);
      const result = await generateReviewReply({ locationId, reviewId: review.id });
      sendRybbitEvent("reply_regenerated", { rating: review.rating });
      onUpdate?.(result.review);
      return result.review;
    } catch (error) {
      console.error("Error regenerating reply:", error);
      return undefined;
    } finally {
      setIsRegenerating(false);
    }
  }, [locationId, review.id, review.rating, onUpdate]);

  const saveDraft = useCallback(async () => {
    if (!replyText.trim()) return;
    try {
      setIsSaving(true);
      await saveReviewDraft({ locationId, reviewId: review.id, customReply: replyText });
      onUpdate?.();
    } catch (error) {
      console.error("Error saving reply:", error);
    } finally {
      setIsSaving(false);
    }
  }, [locationId, review.id, replyText, onUpdate]);

  const publish = useCallback(async () => {
    try {
      setIsPublishing(true);
      const updatedReview = await postReviewReply({
        locationId,
        reviewId: review.id,
        customReply: isDirty ? replyText : undefined,
      });
      sendRybbitEvent("reply_published", {
        rating: review.rating,
        is_update: review.replyStatus === "posted",
      });
      onUpdate?.(updatedReview);
      return updatedReview;
    } catch (error) {
      console.error("Error publishing reply:", error);
      throw error;
    } finally {
      setIsPublishing(false);
    }
  }, [locationId, review.id, review.rating, review.replyStatus, isDirty, replyText, onUpdate]);

  const setFeedback = useCallback(
    async (value: "liked" | "disliked") => {
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
    },
    [locationId, review.latestAiReplyId, review.rating, feedbackState, feedbackComment, isFeedbackLoading]
  );

  const saveFeedbackComment = useCallback(async () => {
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
  }, [locationId, review.latestAiReplyId, feedbackComment, isFeedbackLoading]);

  return {
    replyText,
    setReplyText,
    maxChars: MAX_REPLY_CHARS,
    isDirty,
    isRegenerating,
    isSaving,
    isPublishing,
    isBusy: isRegenerating || isSaving || isPublishing,
    feedbackState,
    feedbackComment,
    setFeedbackComment,
    showCommentInput,
    isFeedbackLoading,
    regenerate,
    saveDraft,
    publish,
    setFeedback,
    saveFeedbackComment,
  };
}
