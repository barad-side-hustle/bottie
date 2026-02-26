import type { ReviewFilters, Review, ReviewCreate } from "@/lib/types";
import { env } from "@/lib/env";
import { NotFoundError } from "@/lib/api/errors";
import {
  ReviewsRepository,
  ReviewResponsesRepository,
  AccountsRepository,
  LocationsRepository,
  AccountLocationsRepository,
  type ReviewWithLatestGeneration,
} from "@/lib/db/repositories";
import { generateAIReply } from "@/lib/ai/gemini";
import { buildReplyPrompt, type PromptSample } from "@/lib/ai/prompts/builder";
import { postReplyToGoogle } from "@/lib/google/reviews";
import { decryptToken } from "@/lib/google/business-profile";

export class ReviewsController {
  private repository: ReviewsRepository;
  private responsesRepo: ReviewResponsesRepository;
  private accountsRepo: AccountsRepository;
  private locationsRepo: LocationsRepository;
  private accountLocationsRepo: AccountLocationsRepository;
  private userId: string;

  constructor(userId: string, accountId: string, locationId: string) {
    this.userId = userId;
    this.repository = new ReviewsRepository(userId, locationId);
    this.responsesRepo = new ReviewResponsesRepository(userId, accountId, locationId);
    this.accountsRepo = new AccountsRepository(userId);
    this.locationsRepo = new LocationsRepository(userId);
    this.accountLocationsRepo = new AccountLocationsRepository(userId, accountId);
  }

  async getReviews(filters: Partial<ReviewFilters> = {}): Promise<ReviewWithLatestGeneration[]> {
    return this.repository.list(filters);
  }

  async getReview(reviewId: string): Promise<ReviewWithLatestGeneration> {
    const review = await this.repository.get(reviewId);
    if (!review) throw new NotFoundError("Review not found");
    return review;
  }

  async updateReview(reviewId: string, data: Partial<Review>): Promise<Review> {
    await this.getReview(reviewId);
    return this.repository.update(reviewId, data);
  }

  async markAsPosted(reviewId: string): Promise<Review> {
    return this.repository.markAsPosted(reviewId);
  }

  async findByGoogleReviewId(googleReviewId: string): Promise<Review | null> {
    return this.repository.findByGoogleReviewId(googleReviewId);
  }

  async createReview(data: ReviewCreate): Promise<Review> {
    return this.repository.create(data);
  }

  async generateReply(reviewId: string): Promise<{ review: ReviewWithLatestGeneration; aiReply: string }> {
    const review = await this.getReview(reviewId);

    const [location, likedGenerations, dislikedGenerations] = await Promise.all([
      this.locationsRepo.get(review.locationId),
      this.responsesRepo.getByFeedback("liked", 5),
      this.responsesRepo.getByFeedback("disliked", 5),
    ]);
    if (!location) throw new NotFoundError("Location not found");

    const approvedSamples: PromptSample[] = likedGenerations.map((g) => ({
      review: g.review,
      reply: g.text,
    }));

    const rejectedSamples: PromptSample[] = dislikedGenerations.map((g) => ({
      review: g.review,
      reply: g.text,
      comment: g.feedbackComment,
    }));

    const latestGen = await this.responsesRepo.getLatestDraft(reviewId);
    if (latestGen) {
      await this.responsesRepo.updateStatus(latestGen.id, "rejected");
    }

    const prompt = buildReplyPrompt(location, review, approvedSamples, rejectedSamples);
    const aiReply = await generateAIReply(prompt);

    await this.responsesRepo.create({
      reviewId,
      text: aiReply,
      status: "draft",
      generatedBy: null,
      type: "ai_generated",
    });

    const updatedReview = await this.getReview(reviewId);

    return {
      review: updatedReview,
      aiReply,
    };
  }

  async saveDraft(
    reviewId: string,
    customReply: string
  ): Promise<{ review: ReviewWithLatestGeneration; savedDraft: string }> {
    const review = await this.getReview(reviewId);
    const latestDraft = await this.responsesRepo.getLatestDraft(reviewId);

    if (latestDraft && latestDraft.text === customReply && latestDraft.status === "draft") {
      if (latestDraft.generatedBy) {
        return { review, savedDraft: customReply };
      }
    }

    await this.responsesRepo.create({
      reviewId,
      text: customReply,
      status: "draft",
      generatedBy: this.userId,
      type: "human_generated",
    });

    if (latestDraft) {
      await this.responsesRepo.updateStatus(latestDraft.id, "rejected");
    }

    const updatedReview = await this.getReview(reviewId);
    return { review: updatedReview, savedDraft: customReply };
  }

  async setFeedback(responseId: string, feedback: "liked" | "disliked" | null, comment?: string | null) {
    return this.responsesRepo.updateFeedback(responseId, feedback, comment);
  }

  async postReply(
    reviewId: string,
    customReply?: string,
    userId?: string
  ): Promise<{ review: Review; replyPosted: string }> {
    const review = await this.getReview(reviewId);
    const latestDraft = await this.responsesRepo.getLatestDraft(reviewId);

    const replyToPost = customReply || latestDraft?.text;

    if (!replyToPost) {
      throw new Error("No reply to post. Generate AI reply first or provide custom reply.");
    }

    const location = await this.locationsRepo.get(review.locationId);
    if (!location) throw new NotFoundError("Location not found");

    const accountLocation = await this.accountLocationsRepo.getByLocationId(review.locationId);
    if (!accountLocation) throw new NotFoundError("Account location connection not found");

    const account = await this.accountsRepo.get(accountLocation.accountId);
    if (!account) throw new NotFoundError("Account not found");

    const refreshToken = await decryptToken(account.googleRefreshToken);

    try {
      await postReplyToGoogle(
        review.googleReviewName || review.googleReviewId,
        replyToPost,
        refreshToken,
        env.GOOGLE_CLIENT_ID,
        env.GOOGLE_CLIENT_SECRET
      );
    } catch (error) {
      if (error instanceof Error && error.message.includes("404")) {
        await this.repository.delete(reviewId);
        throw new Error("REVIEW_DELETED_FROM_GOOGLE");
      }
      throw error;
    }

    const updatedReview = await this.markAsPosted(reviewId);

    const generatedBy =
      customReply && customReply !== latestDraft?.text ? (userId ?? null) : (latestDraft?.generatedBy ?? null);

    const type = generatedBy ? "human_generated" : "ai_generated";

    await this.responsesRepo.create({
      reviewId,
      text: replyToPost,
      status: "posted",
      generatedBy,
      postedBy: userId || null,
      postedAt: new Date(),
      type,
    });

    return { review: updatedReview, replyPosted: replyToPost };
  }
}
