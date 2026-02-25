import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { StatsController } from "./stats.controller";
import { StatsRepository, LocationSubscriptionsRepository } from "@/lib/db/repositories";

vi.mock("@/lib/db/repositories");

type MockStatsRepo = {
  getLocationSummaries: Mock;
};

type MockLocSubRepo = {
  getPaidLocationIds: Mock;
};

describe("StatsController", () => {
  let controller: StatsController;
  let mockStatsRepo: MockStatsRepo;
  let mockLocSubRepo: MockLocSubRepo;

  beforeEach(() => {
    vi.clearAllMocks();

    mockStatsRepo = {
      getLocationSummaries: vi.fn(),
    };

    mockLocSubRepo = {
      getPaidLocationIds: vi.fn(),
    };

    (StatsRepository as unknown as Mock).mockImplementation(function () {
      return mockStatsRepo;
    });
    (LocationSubscriptionsRepository as unknown as Mock).mockImplementation(function () {
      return mockLocSubRepo;
    });

    controller = new StatsController();
  });

  describe("getUserStats", () => {
    it("should return correct stats with paid and unpaid locations", async () => {
      const userId = "user-123";
      mockStatsRepo.getLocationSummaries.mockResolvedValue([
        {
          locationId: "loc-1",
          locationName: "Location 1",
          photoUrl: null,
          accountId: "acc-1",
          pendingCount: 2,
          avgRating: 4.5,
        },
        {
          locationId: "loc-2",
          locationName: "Location 2",
          photoUrl: null,
          accountId: "acc-1",
          pendingCount: 0,
          avgRating: 3.0,
        },
      ]);
      mockLocSubRepo.getPaidLocationIds.mockResolvedValue(["loc-1"]);

      const result = await controller.getUserStats(userId);

      expect(result.totalLocations).toBe(2);
      expect(result.paidLocations).toBe(1);
      expect(result.unpaidLocations).toBe(1);
      expect(result.monthlyTotal).toBe(39);
      expect(result.locationSummaries[0].isPaid).toBe(true);
      expect(result.locationSummaries[1].isPaid).toBe(false);
    });

    it("should return zero monthly total when no paid locations", async () => {
      const userId = "user-123";
      mockStatsRepo.getLocationSummaries.mockResolvedValue([
        {
          locationId: "loc-1",
          locationName: "Location 1",
          photoUrl: null,
          accountId: "acc-1",
          pendingCount: 0,
          avgRating: null,
        },
      ]);
      mockLocSubRepo.getPaidLocationIds.mockResolvedValue([]);

      const result = await controller.getUserStats(userId);

      expect(result.totalLocations).toBe(1);
      expect(result.paidLocations).toBe(0);
      expect(result.monthlyTotal).toBe(0);
    });
  });
});
