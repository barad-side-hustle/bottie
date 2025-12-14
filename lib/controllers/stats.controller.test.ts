import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { StatsController } from "./stats.controller";
import { StatsRepository, SubscriptionsRepository } from "@/lib/db/repositories";

vi.mock("@/lib/db/repositories");

type MockStatsRepo = {
  countUserLocations: Mock;
  countUserReviewsThisMonth: Mock;
};

type MockSubsRepo = {
  getActiveSubscriptionForUser: Mock;
};

describe("StatsController", () => {
  let controller: StatsController;
  let mockStatsRepo: MockStatsRepo;
  let mockSubsRepo: MockSubsRepo;

  beforeEach(() => {
    vi.clearAllMocks();

    mockStatsRepo = {
      countUserLocations: vi.fn(),
      countUserReviewsThisMonth: vi.fn(),
    };

    mockSubsRepo = {
      getActiveSubscriptionForUser: vi.fn(),
    };

    (StatsRepository as unknown as Mock).mockImplementation(function () {
      return mockStatsRepo;
    });
    (SubscriptionsRepository as unknown as Mock).mockImplementation(function () {
      return mockSubsRepo;
    });

    controller = new StatsController();
  });

  describe("getUserStats", () => {
    it("should return user stats with correct calculations", async () => {
      const userId = "user-123";
      const locationsCount = 5;
      const reviewsCount = 50;
      const mockSubscription = { id: "sub-1", planTier: "basic", status: "active" };

      mockStatsRepo.countUserLocations.mockResolvedValue(locationsCount);
      mockStatsRepo.countUserReviewsThisMonth.mockResolvedValue(reviewsCount);
      mockSubsRepo.getActiveSubscriptionForUser.mockResolvedValue(mockSubscription);

      const result = await controller.getUserStats(userId);

      expect(mockStatsRepo.countUserLocations).toHaveBeenCalledWith(userId);
      expect(mockStatsRepo.countUserReviewsThisMonth).toHaveBeenCalledWith(userId);
      expect(mockSubsRepo.getActiveSubscriptionForUser).toHaveBeenCalledWith(userId);

      expect(result.locations).toBe(locationsCount);
      expect(result.reviews).toBe(reviewsCount);
      expect(result.subscription).toEqual(mockSubscription);
      expect(result.limits).toBeDefined();
      expect(result.locationsPercent).toBeGreaterThanOrEqual(0);
      expect(result.reviewsPercent).toBeGreaterThanOrEqual(0);
    });

    it("should cap percentages at 100", async () => {
      const userId = "user-123";
      const locationsCount = 150;
      const reviewsCount = 1500;
      mockSubsRepo.getActiveSubscriptionForUser.mockResolvedValue(null);

      mockStatsRepo.countUserLocations.mockResolvedValue(locationsCount);
      mockStatsRepo.countUserReviewsThisMonth.mockResolvedValue(reviewsCount);

      const result = await controller.getUserStats(userId);

      expect(result.locationsPercent).toBe(100);
      expect(result.reviewsPercent).toBe(100);
    });
  });
});
