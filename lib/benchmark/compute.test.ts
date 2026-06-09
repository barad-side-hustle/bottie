import { describe, it, expect } from "vitest";
import { computeBenchmarkStats, filterCompetitors, rankBusinesses, wilsonScore } from "./compute";
import type { CompetitorEntry } from "@/lib/db/schema";

function competitor(overrides: Partial<CompetitorEntry>): CompetitorEntry {
  return {
    placeId: "c",
    displayName: "Comp",
    rating: 4,
    userRatingCount: 100,
    primaryType: "restaurant",
    businessStatus: "OPERATIONAL",
    ...overrides,
  };
}

describe("filterCompetitors", () => {
  it("excludes our own place, permanently-closed, and unrated competitors", () => {
    const competitors: CompetitorEntry[] = [
      competitor({ placeId: "self" }),
      competitor({ placeId: "closed", businessStatus: "CLOSED_PERMANENTLY" }),
      competitor({ placeId: "unrated", rating: null }),
      competitor({ placeId: "keep" }),
    ];
    const result = filterCompetitors(competitors, "self");
    expect(result.map((c) => c.placeId)).toEqual(["keep"]);
  });
});

describe("rankBusinesses / wilsonScore", () => {
  it("ranks a high-volume 4.9 above a low-volume 5.0", () => {
    const ranked = rankBusinesses([
      { id: "tiny", rating: 5.0, reviewCount: 4 },
      { id: "big", rating: 4.9, reviewCount: 2000 },
    ]);
    expect(ranked.map((r) => r.id)).toEqual(["big", "tiny"]);
  });

  it("scores more reviews at the same rating higher", () => {
    expect(wilsonScore(4.5, 1000)).toBeGreaterThan(wilsonScore(4.5, 10));
  });

  it("sends unrated or zero-review businesses to the bottom", () => {
    expect(wilsonScore(null, 100)).toBe(-Infinity);
    expect(wilsonScore(4.8, 0)).toBe(-Infinity);
  });
});

describe("computeBenchmarkStats", () => {
  it("computes average and median ratings (odd count)", () => {
    const competitors = [
      competitor({ placeId: "a", rating: 4.0, userRatingCount: 50 }),
      competitor({ placeId: "b", rating: 4.5, userRatingCount: 150 }),
      competitor({ placeId: "c", rating: 5.0, userRatingCount: 100 }),
    ];
    const stats = computeBenchmarkStats({ placeId: "self", rating: 4.2, userRatingCount: 80 }, competitors);

    expect(stats.competitorCount).toBe(3);
    expect(stats.avgRating).toBe(4.5);
    expect(stats.medianRating).toBe(4.5);
    expect(stats.avgReviewCount).toBe(100);
    expect(stats.medianReviewCount).toBe(100);
  });

  it("computes median ratings for an even count", () => {
    const competitors = [competitor({ placeId: "a", rating: 4.0 }), competitor({ placeId: "b", rating: 5.0 })];
    const stats = computeBenchmarkStats({ rating: 4.0, userRatingCount: 10 }, competitors);
    expect(stats.medianRating).toBe(4.5);
  });

  it("ranks our location among competitors by rating then review count", () => {
    const competitors = [
      competitor({ placeId: "a", rating: 4.8, userRatingCount: 200 }),
      competitor({ placeId: "b", rating: 4.0, userRatingCount: 50 }),
      competitor({ placeId: "c", rating: 4.5, userRatingCount: 90 }),
    ];
    const stats = computeBenchmarkStats({ placeId: "self", rating: 4.5, userRatingCount: 120 }, competitors);

    expect(stats.totalRanked).toBe(4);
    expect(stats.ownRank).toBe(2);
    expect(stats.ratingPercentile).toBe(67);
    expect(stats.reviewCountGap).toBe(30);
  });

  it("handles zero competitors gracefully", () => {
    const stats = computeBenchmarkStats({ placeId: "self", rating: 4.0, userRatingCount: 10 }, []);
    expect(stats.competitorCount).toBe(0);
    expect(stats.avgRating).toBeNull();
    expect(stats.medianRating).toBeNull();
    expect(stats.avgReviewCount).toBeNull();
    expect(stats.medianReviewCount).toBeNull();
    expect(stats.totalRanked).toBe(1);
    expect(stats.ownRank).toBe(1);
    expect(stats.ratingPercentile).toBeNull();
    expect(stats.reviewCountGap).toBeNull();
  });

  it("ranks our location last when its rating is null (brand-new profile)", () => {
    const competitors = [
      competitor({ placeId: "a", rating: 4.5, userRatingCount: 100 }),
      competitor({ placeId: "b", rating: 3.5, userRatingCount: 20 }),
    ];
    const stats = computeBenchmarkStats({ placeId: "self", rating: null, userRatingCount: null }, competitors);
    expect(stats.ownRank).toBe(3);
    expect(stats.totalRanked).toBe(3);
    expect(stats.reviewCountGap).toBe(-60);
  });

  it("weights review volume so own 5.0 with few reviews ranks below a 4.9 with many", () => {
    const stats = computeBenchmarkStats({ placeId: "self", rating: 5.0, userRatingCount: 4 }, [
      competitor({ placeId: "big", rating: 4.9, userRatingCount: 2000 }),
    ]);
    expect(stats.totalRanked).toBe(2);
    expect(stats.ownRank).toBe(2);
  });

  it("excludes permanently-closed competitors from stats even if passed in", () => {
    const competitors = [
      competitor({ placeId: "a", rating: 5.0, userRatingCount: 100 }),
      competitor({ placeId: "closed", rating: 1.0, userRatingCount: 5, businessStatus: "CLOSED_PERMANENTLY" }),
    ];
    const stats = computeBenchmarkStats({ placeId: "self", rating: 4.0, userRatingCount: 10 }, competitors);
    expect(stats.competitorCount).toBe(1);
    expect(stats.avgRating).toBe(5.0);
  });
});
