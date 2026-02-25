import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { SubscriptionsController } from "./subscriptions.controller";
import { LocationSubscriptionsRepository, StatsRepository } from "@/lib/db/repositories";

vi.mock("@/lib/db/repositories");

type MockLocSubRepo = {
  isLocationPaid: Mock;
};

type MockStatsRepo = {
  countLocationReviewsThisMonth: Mock;
};

describe("SubscriptionsController", () => {
  let controller: SubscriptionsController;
  let mockLocSubRepo: MockLocSubRepo;
  let mockStatsRepo: MockStatsRepo;

  beforeEach(() => {
    vi.clearAllMocks();

    mockLocSubRepo = {
      isLocationPaid: vi.fn(),
    };

    mockStatsRepo = {
      countLocationReviewsThisMonth: vi.fn(),
    };

    (LocationSubscriptionsRepository as unknown as Mock).mockImplementation(function () {
      return mockLocSubRepo;
    });
    (StatsRepository as unknown as Mock).mockImplementation(function () {
      return mockStatsRepo;
    });

    controller = new SubscriptionsController();
  });

  describe("checkLocationQuota", () => {
    it("should return allowed true for paid location (unlimited)", async () => {
      mockLocSubRepo.isLocationPaid.mockResolvedValue(true);
      mockStatsRepo.countLocationReviewsThisMonth.mockResolvedValue(100);

      const result = await controller.checkLocationQuota("loc-123");

      expect(result).toEqual({
        allowed: true,
        currentCount: 100,
        limit: -1,
        isPaid: true,
      });
    });

    it("should return allowed true if free location is under limit", async () => {
      mockLocSubRepo.isLocationPaid.mockResolvedValue(false);
      mockStatsRepo.countLocationReviewsThisMonth.mockResolvedValue(3);

      const result = await controller.checkLocationQuota("loc-123");

      expect(result.allowed).toBe(true);
      expect(result.currentCount).toBe(3);
      expect(result.limit).toBe(5);
      expect(result.isPaid).toBe(false);
    });

    it("should return allowed false if free location reaches limit", async () => {
      mockLocSubRepo.isLocationPaid.mockResolvedValue(false);
      mockStatsRepo.countLocationReviewsThisMonth.mockResolvedValue(5);

      const result = await controller.checkLocationQuota("loc-123");

      expect(result.allowed).toBe(false);
      expect(result.currentCount).toBe(5);
      expect(result.limit).toBe(5);
    });
  });

  describe("isLocationPaid", () => {
    it("should return true for paid locations", async () => {
      mockLocSubRepo.isLocationPaid.mockResolvedValue(true);

      const result = await controller.isLocationPaid("loc-123");

      expect(result).toBe(true);
    });

    it("should return false for free locations", async () => {
      mockLocSubRepo.isLocationPaid.mockResolvedValue(false);

      const result = await controller.isLocationPaid("loc-123");

      expect(result).toBe(false);
    });
  });
});
