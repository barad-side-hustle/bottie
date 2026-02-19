import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { SubscriptionsController } from "./subscriptions.controller";
import { SubscriptionsRepository, StatsRepository } from "@/lib/db/repositories";

vi.mock("@/lib/db/repositories");

type MockSubsRepo = {
  hasPaidSubscription: Mock;
};

type MockStatsRepo = {
  countUserReviewsThisMonth: Mock;
};

describe("SubscriptionsController", () => {
  let controller: SubscriptionsController;
  let mockSubsRepo: MockSubsRepo;
  let mockStatsRepo: MockStatsRepo;

  beforeEach(() => {
    vi.clearAllMocks();

    mockSubsRepo = {
      hasPaidSubscription: vi.fn(),
    };

    mockStatsRepo = {
      countUserReviewsThisMonth: vi.fn(),
    };

    (SubscriptionsRepository as unknown as Mock).mockImplementation(function () {
      return mockSubsRepo;
    });
    (StatsRepository as unknown as Mock).mockImplementation(function () {
      return mockStatsRepo;
    });

    controller = new SubscriptionsController();
  });

  describe("getUserUsageLimits", () => {
    it("should return unlimited reviews for paid users", async () => {
      mockSubsRepo.hasPaidSubscription.mockResolvedValue(true);

      const result = await controller.getUserUsageLimits("user-123");

      expect(result).toEqual({ reviewsPerMonth: -1 });
    });

    it("should return free tier limits for non-paid users", async () => {
      mockSubsRepo.hasPaidSubscription.mockResolvedValue(false);

      const result = await controller.getUserUsageLimits("user-123");

      expect(result.reviewsPerMonth).toBeGreaterThan(0);
    });
  });

  describe("checkReviewQuota", () => {
    it("should return allowed true if user has paid subscription (unlimited)", async () => {
      mockSubsRepo.hasPaidSubscription.mockResolvedValue(true);
      mockStatsRepo.countUserReviewsThisMonth.mockResolvedValue(100);

      const result = await controller.checkReviewQuota("user-123");

      expect(result).toEqual({
        allowed: true,
        currentCount: 100,
        limit: -1,
      });
    });

    it("should return allowed true if free user is under limit", async () => {
      mockSubsRepo.hasPaidSubscription.mockResolvedValue(false);
      mockStatsRepo.countUserReviewsThisMonth.mockResolvedValue(3);

      const result = await controller.checkReviewQuota("user-123");

      expect(result.allowed).toBe(true);
      expect(result.currentCount).toBe(3);
      expect(result.limit).toBeGreaterThan(0);
    });

    it("should return allowed false if free user reaches limit", async () => {
      mockSubsRepo.hasPaidSubscription.mockResolvedValue(false);

      const limits = await controller.getUserUsageLimits("user-123");
      mockStatsRepo.countUserReviewsThisMonth.mockResolvedValue(limits.reviewsPerMonth);

      const result = await controller.checkReviewQuota("user-123");

      expect(result.allowed).toBe(false);
      expect(result.currentCount).toBe(limits.reviewsPerMonth);
    });
  });

  describe("hasPaidSubscription", () => {
    it("should return true for paid users", async () => {
      mockSubsRepo.hasPaidSubscription.mockResolvedValue(true);

      const result = await controller.hasPaidSubscription("user-123");

      expect(result).toBe(true);
    });

    it("should return false for free users", async () => {
      mockSubsRepo.hasPaidSubscription.mockResolvedValue(false);

      const result = await controller.hasPaidSubscription("user-123");

      expect(result).toBe(false);
    });
  });
});
