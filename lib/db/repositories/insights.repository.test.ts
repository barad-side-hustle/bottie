import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { InsightsRepository } from "./insights.repository";
import { db } from "@/lib/db/client";
import { createLocationAccessCondition } from "./access-conditions";

vi.mock("@/lib/db/client", () => ({
  db: {
    select: vi.fn(),
    query: {
      reviews: {
        findMany: vi.fn(),
      },
    },
  },
}));

vi.mock("./access-conditions", () => ({
  createLocationAccessCondition: vi.fn().mockReturnValue("mock-access-condition"),
}));

vi.mock("drizzle-orm", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as object),
    eq: vi.fn(),
    and: vi.fn((...args: unknown[]) => args),
    gte: vi.fn(),
    lte: vi.fn(),
    sql: Object.assign(
      vi.fn().mockImplementation((strings: TemplateStringsArray, ...values: unknown[]) => ({ strings, values })),
      { raw: vi.fn().mockImplementation((str: string) => str) }
    ),
    count: vi.fn(),
    avg: vi.fn(),
    isNotNull: vi.fn(),
    desc: vi.fn(),
  };
});

describe("InsightsRepository", () => {
  const userId = "user-123";
  const locationId = "loc-123";
  let repository: InsightsRepository;

  const dateFrom = new Date("2026-01-01");
  const dateTo = new Date("2026-02-01");

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new InsightsRepository(userId, locationId);
  });

  describe("getClassificationStats", () => {
    it("should use shared createLocationAccessCondition (Bug #10)", async () => {
      const mockSelectChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
      };
      (db.select as Mock).mockReturnValue(mockSelectChain);
      mockSelectChain.where.mockResolvedValue([
        {
          totalReviews: 0,
          classifiedReviews: 0,
          averageRating: null,
          positiveCount: 0,
          neutralCount: 0,
          negativeCount: 0,
        },
      ]);

      await repository.getClassificationStats(dateFrom, dateTo);

      expect(createLocationAccessCondition).toHaveBeenCalledWith(userId, locationId);
    });

    it("should return stats when reviews exist", async () => {
      const mockSelectChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([
          {
            totalReviews: 10,
            classifiedReviews: 8,
            averageRating: "4.5",
            positiveCount: 6,
            neutralCount: 1,
            negativeCount: 1,
          },
        ]),
      };
      (db.select as Mock).mockReturnValue(mockSelectChain);

      (db.query.reviews.findMany as Mock).mockResolvedValue([
        {
          id: "r1",
          classifications: {
            sentiment: "positive",
            positives: [{ category: "service", text: "Great" }],
            negatives: [],
          },
        },
      ]);

      const result = await repository.getClassificationStats(dateFrom, dateTo);

      expect(result.totalReviews).toBe(10);
      expect(result.classifiedReviews).toBe(8);
      expect(result.averageRating).toBe(4.5);
      expect(result.sentimentBreakdown.positive).toBe(6);
    });

    it("should return zero stats when no reviews in date range", async () => {
      const mockSelectChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([
          {
            totalReviews: 0,
            classifiedReviews: 0,
            averageRating: null,
            positiveCount: 0,
            neutralCount: 0,
            negativeCount: 0,
          },
        ]),
      };
      (db.select as Mock).mockReturnValue(mockSelectChain);

      const result = await repository.getClassificationStats(dateFrom, dateTo);

      expect(result.totalReviews).toBe(0);
      expect(result.classifiedReviews).toBe(0);
      expect(result.averageRating).toBe(0);
      expect(result.topPositives).toEqual([]);
      expect(result.topNegatives).toEqual([]);
    });
  });

  describe("getClassificationTrends", () => {
    it("should return trends grouped by day", async () => {
      const mockSelectChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        groupBy: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue([
          {
            date: "2026-01-15",
            totalReviews: 5,
            averageRating: 4.2,
            positiveCount: 3,
            negativeCount: 1,
            neutralCount: 1,
          },
        ]),
      };
      (db.select as Mock).mockReturnValue(mockSelectChain);

      const result = await repository.getClassificationTrends(dateFrom, dateTo, "day");

      expect(result).toHaveLength(1);
      expect(result[0].date).toBe("2026-01-15");
      expect(result[0].totalReviews).toBe(5);
      expect(createLocationAccessCondition).toHaveBeenCalledWith(userId, locationId);
    });

    it("should return trends grouped by week", async () => {
      const mockSelectChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        groupBy: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue([]),
      };
      (db.select as Mock).mockReturnValue(mockSelectChain);

      const result = await repository.getClassificationTrends(dateFrom, dateTo, "week");

      expect(result).toEqual([]);
    });
  });

  describe("getTopCategories", () => {
    it("should return top categories from classified reviews", async () => {
      (db.query.reviews.findMany as Mock).mockResolvedValue([
        {
          id: "r1",
          classifications: {
            sentiment: "positive",
            positives: [
              { category: "service", text: "Great" },
              { category: "cleanliness", text: "Clean" },
            ],
            negatives: [],
          },
        },
        {
          id: "r2",
          classifications: {
            sentiment: "positive",
            positives: [{ category: "service", text: "Amazing" }],
            negatives: [],
          },
        },
      ]);

      const result = await repository.getTopCategories(dateFrom, dateTo, "positive");

      expect(result[0].category).toBe("service");
      expect(result[0].count).toBe(2);
      expect(result[0].percentage).toBe(100);
      expect(result[1].category).toBe("cleanliness");
      expect(result[1].count).toBe(1);
    });

    it("should return empty array when no classified reviews", async () => {
      (db.query.reviews.findMany as Mock).mockResolvedValue([]);

      const result = await repository.getTopCategories(dateFrom, dateTo, "positive");

      expect(result).toEqual([]);
    });
  });
});
