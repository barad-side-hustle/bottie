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
    it("should return user stats with correct calculations for free user", async () => {
      const userId = "user-123";
      mockStatsRepo.countUserLocations.mockResolvedValue(5);
      mockStatsRepo.countUserReviewsThisMonth.mockResolvedValue(3);
      mockSubsRepo.getActiveSubscriptionForUser.mockResolvedValue(null);

      const result = await controller.getUserStats(userId);

      expect(mockStatsRepo.countUserLocations).toHaveBeenCalledWith(userId);
      expect(mockStatsRepo.countUserReviewsThisMonth).toHaveBeenCalledWith(userId);
      expect(mockSubsRepo.getActiveSubscriptionForUser).toHaveBeenCalledWith(userId);

      expect(result.locations).toBe(5);
      expect(result.reviews).toBe(3);
      expect(result.subscription).toBeNull();
      expect(result.hasPaidSubscription).toBe(false);
      expect(result.limits).toBeDefined();
      expect(result.limits.reviewsPerMonth).toBeGreaterThan(0);
      expect(result.reviewsPercent).toBeGreaterThanOrEqual(0);
    });

    it("should return unlimited for paid user", async () => {
      const userId = "user-123";
      const mockSubscription = { id: "sub-1", polarSubscriptionId: "polar-123", status: "active" };
      mockStatsRepo.countUserLocations.mockResolvedValue(10);
      mockStatsRepo.countUserReviewsThisMonth.mockResolvedValue(50);
      mockSubsRepo.getActiveSubscriptionForUser.mockResolvedValue(mockSubscription);

      const result = await controller.getUserStats(userId);

      expect(result.hasPaidSubscription).toBe(true);
      expect(result.limits.reviewsPerMonth).toBe(-1);
      expect(result.reviewsPercent).toBe(0);
    });

    it("should cap percentages at 100", async () => {
      const userId = "user-123";
      mockStatsRepo.countUserLocations.mockResolvedValue(150);
      mockStatsRepo.countUserReviewsThisMonth.mockResolvedValue(1500);
      mockSubsRepo.getActiveSubscriptionForUser.mockResolvedValue(null);

      const result = await controller.getUserStats(userId);

      expect(result.reviewsPercent).toBe(100);
    });
  });
});
