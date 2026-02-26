import { describe, it, expect } from "vitest";
import { parseFiltersFromSearchParams, buildSearchParams, DEFAULT_REVIEW_SORT } from "./filter-utils";

describe("filter-utils", () => {
  describe("DEFAULT_REVIEW_SORT", () => {
    it("should have date as default orderBy", () => {
      expect(DEFAULT_REVIEW_SORT.orderBy).toBe("date");
    });

    it("should have desc as default orderDirection", () => {
      expect(DEFAULT_REVIEW_SORT.orderDirection).toBe("desc");
    });
  });

  describe("parseFiltersFromSearchParams", () => {
    it("should return default sort (date desc) when no params provided", () => {
      const result = parseFiltersFromSearchParams({});

      expect(result.sort).toEqual({
        orderBy: "date",
        orderDirection: "desc",
      });
    });

    it("should parse sortBy and sortDir params", () => {
      const result = parseFiltersFromSearchParams({
        sortBy: "rating",
        sortDir: "asc",
      });

      expect(result.sort).toEqual({
        orderBy: "rating",
        orderDirection: "asc",
      });
    });

    it("should default sortDir to desc when only sortBy is provided", () => {
      const result = parseFiltersFromSearchParams({
        sortBy: "date",
      });

      expect(result.sort).toEqual({
        orderBy: "date",
        orderDirection: "desc",
      });
    });

    it("should parse replyStatus as comma-separated values", () => {
      const result = parseFiltersFromSearchParams({
        replyStatus: "pending,posted,failed",
      });

      expect(result.replyStatus).toEqual(["pending", "posted", "failed"]);
    });

    it("should parse rating as comma-separated numbers", () => {
      const result = parseFiltersFromSearchParams({
        rating: "4,5",
      });

      expect(result.rating).toEqual([4, 5]);
    });

    it("should parse sentiment as comma-separated values", () => {
      const result = parseFiltersFromSearchParams({
        sentiment: "positive,negative",
      });

      expect(result.sentiment).toEqual(["positive", "negative"]);
    });

    it("should parse dateFrom and dateTo as Date objects", () => {
      const result = parseFiltersFromSearchParams({
        dateFrom: "2024-01-01",
        dateTo: "2024-12-31",
      });

      expect(result.dateFrom).toEqual(new Date("2024-01-01"));
      expect(result.dateTo).toEqual(new Date("2024-12-31"));
    });

    it("should handle all filters together", () => {
      const result = parseFiltersFromSearchParams({
        replyStatus: "pending",
        rating: "5",
        sentiment: "positive",
        dateFrom: "2024-06-01",
        dateTo: "2024-06-30",
        sortBy: "receivedAt",
        sortDir: "desc",
      });

      expect(result).toEqual({
        replyStatus: ["pending"],
        rating: [5],
        sentiment: ["positive"],
        dateFrom: new Date("2024-06-01"),
        dateTo: new Date("2024-06-30"),
        sort: {
          orderBy: "receivedAt",
          orderDirection: "desc",
        },
      });
    });

    it("should ignore non-string values for replyStatus", () => {
      const result = parseFiltersFromSearchParams({
        replyStatus: ["pending", "posted"],
      });

      expect(result.replyStatus).toBeUndefined();
    });
  });

  describe("buildSearchParams", () => {
    it("should return empty params for empty filters", () => {
      const result = buildSearchParams({});

      expect(result.toString()).toBe("");
    });

    it("should build params for replyStatus", () => {
      const result = buildSearchParams({
        replyStatus: ["pending", "posted"],
      });

      expect(result.get("replyStatus")).toBe("pending,posted");
    });

    it("should build params for rating", () => {
      const result = buildSearchParams({
        rating: [4, 5],
      });

      expect(result.get("rating")).toBe("4,5");
    });

    it("should build params for sentiment", () => {
      const result = buildSearchParams({
        sentiment: ["positive", "neutral"],
      });

      expect(result.get("sentiment")).toBe("positive,neutral");
    });

    it("should build params for dateFrom and dateTo", () => {
      const result = buildSearchParams({
        dateFrom: new Date("2024-01-15"),
        dateTo: new Date("2024-02-20"),
      });

      expect(result.get("dateFrom")).toBe("2024-01-15");
      expect(result.get("dateTo")).toBe("2024-02-20");
    });

    it("should build params for sort", () => {
      const result = buildSearchParams({
        sort: {
          orderBy: "rating",
          orderDirection: "asc",
        },
      });

      expect(result.get("sortBy")).toBe("rating");
      expect(result.get("sortDir")).toBe("asc");
    });

    it("should build all params together", () => {
      const result = buildSearchParams({
        replyStatus: ["pending"],
        rating: [5],
        sentiment: ["positive"],
        dateFrom: new Date("2024-06-01"),
        dateTo: new Date("2024-06-30"),
        sort: {
          orderBy: "receivedAt",
          orderDirection: "desc",
        },
      });

      expect(result.get("replyStatus")).toBe("pending");
      expect(result.get("rating")).toBe("5");
      expect(result.get("sentiment")).toBe("positive");
      expect(result.get("dateFrom")).toBe("2024-06-01");
      expect(result.get("dateTo")).toBe("2024-06-30");
      expect(result.get("sortBy")).toBe("receivedAt");
      expect(result.get("sortDir")).toBe("desc");
    });

    it("should not include empty arrays", () => {
      const result = buildSearchParams({
        replyStatus: [],
        rating: [],
        sentiment: [],
      });

      expect(result.toString()).toBe("");
    });
  });
});
