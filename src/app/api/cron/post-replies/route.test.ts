import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { GET } from "./route";
import { NextRequest } from "next/server";
import { db } from "@/lib/db/client";
import { ReviewsController } from "@/lib/controllers/reviews.controller";
import { ReviewsRepository } from "@/lib/db/repositories/reviews.repository";
import { LocationsRepository } from "@/lib/db/repositories/locations.repository";
import { AccountsRepository } from "@/lib/db/repositories/accounts.repository";
import { findLocationOwner } from "@/lib/utils/find-location-owner";

vi.mock("@/lib/db/client", () => {
  const chain = {
    select: vi.fn(),
    from: vi.fn(),
    where: vi.fn(),
    orderBy: vi.fn(),
    limit: vi.fn(),
  };
  chain.select.mockReturnValue(chain);
  chain.from.mockReturnValue(chain);
  chain.where.mockReturnValue(chain);
  chain.orderBy.mockReturnValue(chain);
  chain.limit.mockResolvedValue([]);
  return { db: chain };
});

vi.mock("@/lib/db/schema", () => ({
  reviews: {
    replyStatus: "replyStatus",
    failureReason: "failureReason",
    retryCount: "retryCount",
    id: "id",
    receivedAt: "receivedAt",
    locationId: "locationId",
    rating: "rating",
  },
}));

vi.mock("@/lib/controllers/reviews.controller");
vi.mock("@/lib/db/repositories/reviews.repository");
vi.mock("@/lib/db/repositories/locations.repository");
vi.mock("@/lib/db/repositories/accounts.repository");
vi.mock("@/lib/utils/find-location-owner");

vi.mock("@/lib/env", () => ({
  env: { CRON_SECRET: "test-cron-secret" },
}));

vi.mock("drizzle-orm", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as object),
    and: vi.fn((...args: unknown[]) => args),
    eq: vi.fn(),
    gte: vi.fn(),
    lt: vi.fn(),
    or: vi.fn((...args: unknown[]) => args),
    sql: vi.fn().mockImplementation((strings: TemplateStringsArray, ...values: unknown[]) => ({ strings, values })),
  };
});

function createRequest(authHeader?: string): NextRequest {
  return new NextRequest("http://localhost/api/cron/post-replies", {
    headers: authHeader ? { authorization: authHeader } : {},
  });
}

const defaultStarConfigs = {
  1: { autoReply: true },
  2: { autoReply: true },
  3: { autoReply: true },
  4: { autoReply: true },
  5: { autoReply: true },
};

const mockReview = (overrides = {}) => ({
  id: "review-1",
  locationId: "loc-1",
  replyStatus: "pending",
  failureReason: null,
  retryCount: 0,
  rating: 5,
  receivedAt: new Date(),
  ...overrides,
});

describe("post-replies cron", () => {
  const mockPostReply = vi.fn();
  const mockReviewsRepoUpdate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    (findLocationOwner as Mock).mockResolvedValue({
      userId: "user-1",
      accountId: "acc-1",
      accountLocationId: "al-1",
    });

    (LocationsRepository as unknown as Mock).mockImplementation(function () {
      return {
        get: vi.fn().mockResolvedValue({ id: "loc-1", name: "Test Location", starConfigs: defaultStarConfigs }),
      };
    });

    (AccountsRepository as unknown as Mock).mockImplementation(function () {
      return { get: vi.fn().mockResolvedValue({ id: "acc-1", googleRefreshToken: "encrypted-token" }) };
    });

    mockPostReply.mockResolvedValue({ review: mockReview(), replyPosted: "AI reply" });
    (ReviewsController as unknown as Mock).mockImplementation(function () {
      return { postReply: mockPostReply };
    });

    mockReviewsRepoUpdate.mockResolvedValue({});
    (ReviewsRepository as unknown as Mock).mockImplementation(function () {
      return { update: mockReviewsRepoUpdate };
    });

    (db.limit as Mock).mockResolvedValue([]);
  });

  it("should return 401 when authorization is missing", async () => {
    const res = await GET(createRequest());
    expect(res.status).toBe(401);
  });

  it("should return early when no reviews to post", async () => {
    const res = await GET(createRequest("Bearer test-cron-secret"));
    const body = await res.json();
    expect(body.message).toBe("No replies to post");
    expect(body.posted).toBe(0);
  });

  it("should post reply for pending review with draft", async () => {
    (db.limit as Mock).mockResolvedValue([mockReview()]);

    const res = await GET(createRequest("Bearer test-cron-secret"));
    const body = await res.json();

    expect(mockPostReply).toHaveBeenCalledWith("review-1");
    expect(body.posted).toBe(1);
  });

  it("should skip review when autoReply is disabled for that star rating", async () => {
    const review = mockReview({ rating: 1 });
    (db.limit as Mock).mockResolvedValue([review]);
    (LocationsRepository as unknown as Mock).mockImplementation(function () {
      return {
        get: vi.fn().mockResolvedValue({
          id: "loc-1",
          name: "Test Location",
          starConfigs: { ...defaultStarConfigs, 1: { autoReply: false } },
        }),
      };
    });

    const res = await GET(createRequest("Bearer test-cron-secret"));
    const body = await res.json();

    expect(mockPostReply).not.toHaveBeenCalled();
    expect(body.skipped).toBe(1);
  });

  it("should fail when no refresh token available", async () => {
    (db.limit as Mock).mockResolvedValue([mockReview()]);
    (AccountsRepository as unknown as Mock).mockImplementation(function () {
      return { get: vi.fn().mockResolvedValue({ id: "acc-1", googleRefreshToken: null }) };
    });

    const res = await GET(createRequest("Bearer test-cron-secret"));
    const body = await res.json();

    expect(mockPostReply).not.toHaveBeenCalled();
    expect(mockReviewsRepoUpdate).toHaveBeenCalledWith("review-1", {
      replyStatus: "failed",
      failureReason: "posting",
      retryCount: 1,
    });
    expect(body.failed).toBe(1);
  });

  it("should increment retryCount on posting failure (Bug #5)", async () => {
    const review = mockReview({ retryCount: 2 });
    (db.limit as Mock).mockResolvedValue([review]);
    mockPostReply.mockRejectedValue(new Error("Google API error"));

    const res = await GET(createRequest("Bearer test-cron-secret"));
    const body = await res.json();

    expect(mockReviewsRepoUpdate).toHaveBeenCalledWith("review-1", {
      replyStatus: "failed",
      failureReason: "posting",
      retryCount: 3,
    });
    expect(body.failed).toBe(1);
  });

  it("should handle REVIEW_DELETED_FROM_GOOGLE gracefully", async () => {
    (db.limit as Mock).mockResolvedValue([mockReview()]);
    mockPostReply.mockRejectedValue(new Error("REVIEW_DELETED_FROM_GOOGLE"));

    const res = await GET(createRequest("Bearer test-cron-secret"));
    const body = await res.json();

    expect(body.posted).toBe(1);
    expect(body.failed).toBe(0);
  });

  it("should skip review when no owner found", async () => {
    (db.limit as Mock).mockResolvedValue([mockReview()]);
    (findLocationOwner as Mock).mockResolvedValue(null);

    const res = await GET(createRequest("Bearer test-cron-secret"));
    const body = await res.json();

    expect(mockPostReply).not.toHaveBeenCalled();
    expect(body.failed).toBe(1);
    expect(body.errors[0].error).toBe("Location not found or no owner");
  });
});
