import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { LocationSubscriptionsRepository } from "./location-subscriptions.repository";
import { db } from "@/lib/db/client";

vi.mock("@/lib/db/client", () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
  },
}));

describe("LocationSubscriptionsRepository", () => {
  let repository: LocationSubscriptionsRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new LocationSubscriptionsRepository();
  });

  describe("isLocationPaid", () => {
    it("should return false if no active subscription found", async () => {
      (db.select as Mock).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      const result = await repository.isLocationPaid("loc-1");
      expect(result).toBe(false);
    });

    it("should propagate database errors", async () => {
      (db.select as Mock).mockImplementation(() => {
        throw new Error("DB Error");
      });

      await expect(repository.isLocationPaid("loc-1")).rejects.toThrow("DB Error");
    });
  });
});
