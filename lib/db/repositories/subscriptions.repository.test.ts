import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { SubscriptionsRepository } from "./subscriptions.repository";
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

describe("SubscriptionsRepository", () => {
  let repository: SubscriptionsRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new SubscriptionsRepository();
  });

  describe("getActiveSubscriptionForUser", () => {
    it("should return null if no active subscription found", async () => {
      (db.select as Mock).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      const result = await repository.getActiveSubscriptionForUser("user-1");
      expect(result).toBeNull();
    });

    it("should propagate database errors", async () => {
      (db.select as Mock).mockImplementation(() => {
        throw new Error("DB Error");
      });

      await expect(repository.getActiveSubscriptionForUser("user-1")).rejects.toThrow("DB Error");
    });
  });

  describe("getByUserId", () => {
    it("should return null if no subscription found", async () => {
      (db.select as Mock).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      const result = await repository.getByUserId("user-1");
      expect(result).toBeNull();
    });

    it("should propagate database errors", async () => {
      (db.select as Mock).mockImplementation(() => {
        throw new Error("DB Error");
      });

      await expect(repository.getByUserId("user-1")).rejects.toThrow("DB Error");
    });
  });
});
