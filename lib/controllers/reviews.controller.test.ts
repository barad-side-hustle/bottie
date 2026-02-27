import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { ReviewsController } from "./reviews.controller";
import {
  ReviewsRepository,
  ReviewResponsesRepository,
  AccountsRepository,
  LocationsRepository,
  AccountLocationsRepository,
} from "@/lib/db/repositories";
import { db } from "@/lib/db/client";
import { NotFoundError } from "@/lib/api/errors";

vi.mock("@/lib/db/repositories");

vi.mock("@/lib/ai/gemini", () => ({
  generateAIReply: vi.fn().mockResolvedValue("Generated AI reply"),
}));

vi.mock("@/lib/ai/prompts/builder", () => ({
  buildReplyPrompt: vi.fn().mockReturnValue("prompt"),
}));

vi.mock("@/lib/google/reviews", () => ({
  postReplyToGoogle: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/google/business-profile", () => ({
  decryptToken: vi.fn().mockResolvedValue("decrypted-token"),
}));

vi.mock("@/lib/env", () => ({
  env: {
    GOOGLE_CLIENT_ID: "test-client-id",
    GOOGLE_CLIENT_SECRET: "test-client-secret",
  },
}));

vi.mock("@/lib/db/client", () => {
  const mockTx: Record<string, unknown> = {
    query: {
      reviewResponses: {
        findFirst: vi.fn().mockResolvedValue(null),
      },
    },
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      }),
    }),
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockResolvedValue(undefined),
    }),
  };
  return {
    db: {
      ...mockTx,
      transaction: vi.fn().mockImplementation(async (cb: (tx: Record<string, unknown>) => unknown) => cb(mockTx)),
    },
  };
});

vi.mock("drizzle-orm", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as object),
    eq: vi.fn(),
    and: vi.fn(),
    desc: vi.fn(),
  };
});

type MockRepository = Record<string, Mock>;

describe("ReviewsController", () => {
  const userId = "user-123";
  const accountId = "acc-123";
  const locationId = "loc-123";
  let controller: ReviewsController;
  let mockReviewsRepo: MockRepository;
  let mockResponsesRepo: MockRepository;
  let mockLocationsRepo: MockRepository;
  let mockAccountsRepo: MockRepository;
  let mockAccountLocationsRepo: MockRepository;

  const mockReview = {
    id: "review-1",
    locationId,
    name: "Test Reviewer",
    rating: 5,
    text: "Great!",
    googleReviewId: "google-review-1",
    googleReviewName: "google-review-name-1",
    replyStatus: "failed",
    failureReason: "quota",
    retryCount: 3,
  };

  const mockLocation = {
    id: locationId,
    name: "Test Location",
    tone: "professional",
    responseLanguage: "en",
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockReviewsRepo = {
      get: vi.fn().mockResolvedValue(mockReview),
      list: vi.fn(),
      update: vi.fn().mockResolvedValue(mockReview),
      create: vi.fn(),
      delete: vi.fn(),
      findByGoogleReviewId: vi.fn(),
      markAsPosted: vi.fn(),
    };

    mockResponsesRepo = {
      create: vi.fn().mockResolvedValue({ id: "resp-1" }),
      getLatestDraft: vi.fn(),
      getByFeedback: vi.fn().mockResolvedValue([]),
      updateStatus: vi.fn(),
      updateFeedback: vi.fn(),
    };

    mockLocationsRepo = {
      get: vi.fn().mockResolvedValue(mockLocation),
    };

    mockAccountsRepo = {
      get: vi.fn().mockResolvedValue({ id: accountId, googleRefreshToken: "encrypted-token" }),
    };

    mockAccountLocationsRepo = {
      getByLocationId: vi.fn().mockResolvedValue({ id: "al-1", accountId }),
    };

    (ReviewsRepository as unknown as Mock).mockImplementation(function () {
      return mockReviewsRepo;
    });
    (ReviewResponsesRepository as unknown as Mock).mockImplementation(function () {
      return mockResponsesRepo;
    });
    (LocationsRepository as unknown as Mock).mockImplementation(function () {
      return mockLocationsRepo;
    });
    (AccountsRepository as unknown as Mock).mockImplementation(function () {
      return mockAccountsRepo;
    });
    (AccountLocationsRepository as unknown as Mock).mockImplementation(function () {
      return mockAccountLocationsRepo;
    });

    controller = new ReviewsController(userId, accountId, locationId);
  });

  describe("generateReply", () => {
    it("should generate AI reply and create draft", async () => {
      const result = await controller.generateReply("review-1");

      expect(mockResponsesRepo.create).toHaveBeenCalledWith({
        reviewId: "review-1",
        text: "Generated AI reply",
        status: "draft",
        generatedBy: null,
        type: "ai_generated",
      });
      expect(result.aiReply).toBe("Generated AI reply");
    });

    it("should reset replyStatus to pending after successful generation (Bug #11)", async () => {
      await controller.generateReply("review-1");

      expect(mockReviewsRepo.update).toHaveBeenCalledWith("review-1", {
        replyStatus: "pending",
        failureReason: null,
        retryCount: 0,
      });
    });

    it("should reset status even when review was previously failed with quota reason", async () => {
      mockReviewsRepo.get.mockResolvedValue({
        ...mockReview,
        replyStatus: "failed",
        failureReason: "quota",
        retryCount: 5,
      });

      await controller.generateReply("review-1");

      expect(mockReviewsRepo.update).toHaveBeenCalledWith("review-1", {
        replyStatus: "pending",
        failureReason: null,
        retryCount: 0,
      });
    });

    it("should reject previous draft before generating new one", async () => {
      const mockDraft = { id: "old-draft-1", status: "draft" };
      const mockTxUpdate = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      });
      (db.transaction as Mock).mockImplementation(async (cb) => {
        return cb({
          query: {
            reviewResponses: {
              findFirst: vi.fn().mockResolvedValue(mockDraft),
            },
          },
          update: mockTxUpdate,
        });
      });

      await controller.generateReply("review-1");

      expect(mockTxUpdate).toHaveBeenCalled();
    });

    it("should throw NotFoundError if review not found", async () => {
      mockReviewsRepo.get.mockResolvedValue(null);

      await expect(controller.generateReply("review-1")).rejects.toThrow(NotFoundError);
    });

    it("should throw NotFoundError if location not found", async () => {
      mockLocationsRepo.get.mockResolvedValue(null);

      await expect(controller.generateReply("review-1")).rejects.toThrow(NotFoundError);
    });
  });

  describe("postReply", () => {
    it("should post reply to Google and update status to posted", async () => {
      const { postReplyToGoogle } = await import("@/lib/google/reviews");
      mockResponsesRepo.getLatestDraft.mockResolvedValue({ id: "draft-1", text: "AI reply" });

      const result = await controller.postReply("review-1");

      expect(postReplyToGoogle).toHaveBeenCalled();
      expect(result.replyPosted).toBe("AI reply");
    });

    it("should use custom reply when provided", async () => {
      const { postReplyToGoogle } = await import("@/lib/google/reviews");
      mockResponsesRepo.getLatestDraft.mockResolvedValue({ id: "draft-1", text: "AI reply" });

      const result = await controller.postReply("review-1", "Custom reply");

      expect(postReplyToGoogle).toHaveBeenCalledWith(
        "google-review-name-1",
        "Custom reply",
        "decrypted-token",
        expect.any(String),
        expect.any(String)
      );
      expect(result.replyPosted).toBe("Custom reply");
    });

    it("should throw when no draft and no custom reply", async () => {
      mockResponsesRepo.getLatestDraft.mockResolvedValue(null);

      await expect(controller.postReply("review-1")).rejects.toThrow("No reply to post");
    });

    it("should delete review and throw REVIEW_DELETED_FROM_GOOGLE on 404", async () => {
      const { postReplyToGoogle } = await import("@/lib/google/reviews");
      mockResponsesRepo.getLatestDraft.mockResolvedValue({ id: "draft-1", text: "AI reply" });
      (postReplyToGoogle as Mock).mockRejectedValue(new Error("404 Not Found"));

      await expect(controller.postReply("review-1")).rejects.toThrow("REVIEW_DELETED_FROM_GOOGLE");
      expect(mockReviewsRepo.delete).toHaveBeenCalledWith("review-1");
    });

    it("should throw NotFoundError when account location not found", async () => {
      mockResponsesRepo.getLatestDraft.mockResolvedValue({ id: "draft-1", text: "AI reply" });
      mockAccountLocationsRepo.getByLocationId.mockResolvedValue(null);

      await expect(controller.postReply("review-1")).rejects.toThrow(NotFoundError);
    });

    it("should throw NotFoundError when account not found", async () => {
      mockResponsesRepo.getLatestDraft.mockResolvedValue({ id: "draft-1", text: "AI reply" });
      mockAccountsRepo.get.mockResolvedValue(null);

      await expect(controller.postReply("review-1")).rejects.toThrow(NotFoundError);
    });
  });
});
