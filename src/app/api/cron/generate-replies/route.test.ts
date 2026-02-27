import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { GET } from "./route";
import { NextRequest } from "next/server";
import { db } from "@/lib/db/client";
import { ReviewsController } from "@/lib/controllers/reviews.controller";
import { SubscriptionsController } from "@/lib/controllers/subscriptions.controller";
import { ReviewsRepository } from "@/lib/db/repositories/reviews.repository";
import { LocationsRepository } from "@/lib/db/repositories/locations.repository";
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
  },
}));

vi.mock("@/lib/controllers/reviews.controller");
vi.mock("@/lib/controllers/subscriptions.controller");
vi.mock("@/lib/db/repositories/reviews.repository");
vi.mock("@/lib/db/repositories/locations.repository");
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
    lt: vi.fn(),
    or: vi.fn((...args: unknown[]) => args),
    sql: vi.fn().mockImplementation((strings: TemplateStringsArray, ...values: unknown[]) => ({ strings, values })),
  };
});

function createRequest(authHeader?: string): NextRequest {
  return new NextRequest("http://localhost/api/cron/generate-replies", {
    headers: authHeader ? { authorization: authHeader } : {},
  });
}

const mockReview = (overrides = {}) => ({
  id: "review-1",
  locationId: "loc-1",
  replyStatus: "pending",
  failureReason: null,
  retryCount: 0,
  consumesQuota: true,
  receivedAt: new Date(),
  ...overrides,
});

describe("generate-replies cron", () => {
  const mockGenerateReply = vi.fn();
  const mockReviewsRepoUpdate = vi.fn();
  const mockCheckQuota = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    (findLocationOwner as Mock).mockResolvedValue({
      userId: "user-1",
      accountId: "acc-1",
      accountLocationId: "al-1",
    });

    (LocationsRepository as unknown as Mock).mockImplementation(function () {
      return { get: vi.fn().mockResolvedValue({ id: "loc-1", name: "Test Location" }) };
    });

    mockCheckQuota.mockResolvedValue({ allowed: true, currentCount: 2, limit: 10, isPaid: false });
    (SubscriptionsController as unknown as Mock).mockImplementation(function () {
      return { checkLocationQuota: mockCheckQuota };
    });

    mockGenerateReply.mockResolvedValue({ review: mockReview(), aiReply: "AI reply" });
    (ReviewsController as unknown as Mock).mockImplementation(function () {
      return { generateReply: mockGenerateReply };
    });

    mockReviewsRepoUpdate.mockResolvedValue({});
    (ReviewsRepository as unknown as Mock).mockImplementation(function () {
      return { update: mockReviewsRepoUpdate };
    });

    (db.limit as Mock).mockResolvedValue([]);
  });

  it("should return 401 when authorization header is missing", async () => {
    const req = createRequest();
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("should return 401 when authorization header is wrong", async () => {
    const req = createRequest("Bearer wrong-secret");
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("should return early when no reviews to process", async () => {
    const req = createRequest("Bearer test-cron-secret");
    const res = await GET(req);
    const body = await res.json();

    expect(body.message).toBe("No reviews to process");
    expect(body.processed).toBe(0);
  });

  it("should generate reply for pending review", async () => {
    const review = mockReview();
    (db.limit as Mock).mockResolvedValue([review]);

    const req = createRequest("Bearer test-cron-secret");
    const res = await GET(req);
    const body = await res.json();

    expect(mockGenerateReply).toHaveBeenCalledWith("review-1");
    expect(body.processed).toBe(1);
    expect(body.failed).toBe(0);
  });

  it("should bypass quota for imported reviews with consumesQuota=false (Bug #2)", async () => {
    const importedReview = mockReview({ id: "imported-1", consumesQuota: false });
    mockCheckQuota.mockResolvedValue({ allowed: false, currentCount: 10, limit: 10, isPaid: false });
    (db.limit as Mock).mockResolvedValue([importedReview]);

    const req = createRequest("Bearer test-cron-secret");
    const res = await GET(req);
    const body = await res.json();

    expect(mockGenerateReply).toHaveBeenCalledWith("imported-1");
    expect(body.processed).toBe(1);
  });

  it("should mark as failed/quota when consumesQuota review exceeds quota", async () => {
    const review = mockReview({ consumesQuota: true });
    mockCheckQuota.mockResolvedValue({ allowed: false, currentCount: 10, limit: 10, isPaid: false });
    (db.limit as Mock).mockResolvedValue([review]);

    const req = createRequest("Bearer test-cron-secret");
    const res = await GET(req);
    const body = await res.json();

    expect(mockGenerateReply).not.toHaveBeenCalled();
    expect(mockReviewsRepoUpdate).toHaveBeenCalledWith("review-1", {
      replyStatus: "failed",
      failureReason: "quota",
      retryCount: 1,
    });
    expect(body.failed).toBe(1);
  });

  it("should decrement remainingQuota only for consumesQuota reviews (Bug #1)", async () => {
    const quotaReview = mockReview({ id: "r1", consumesQuota: true });
    const importedReview = mockReview({ id: "r2", consumesQuota: false, locationId: "loc-1" });
    mockCheckQuota.mockResolvedValue({ allowed: true, currentCount: 9, limit: 10, isPaid: false });
    mockGenerateReply.mockResolvedValue({ review: mockReview(), aiReply: "AI reply" });
    (db.limit as Mock).mockResolvedValue([quotaReview, importedReview]);

    const req = createRequest("Bearer test-cron-secret");
    const res = await GET(req);
    const body = await res.json();

    expect(body.processed).toBe(2);
    expect(mockGenerateReply).toHaveBeenCalledTimes(2);
  });

  it("should increment retryCount on generation failure (Bug #3)", async () => {
    const review = mockReview({ retryCount: 2 });
    (db.limit as Mock).mockResolvedValue([review]);
    mockGenerateReply.mockRejectedValue(new Error("AI generation failed"));

    const req = createRequest("Bearer test-cron-secret");
    const res = await GET(req);
    const body = await res.json();

    expect(mockReviewsRepoUpdate).toHaveBeenCalledWith("review-1", {
      replyStatus: "failed",
      failureReason: "generation",
      retryCount: 3,
    });
    expect(body.failed).toBe(1);
  });

  it("should skip review when no owner found", async () => {
    const review = mockReview();
    (db.limit as Mock).mockResolvedValue([review]);
    (findLocationOwner as Mock).mockResolvedValue(null);

    const req = createRequest("Bearer test-cron-secret");
    const res = await GET(req);
    const body = await res.json();

    expect(mockGenerateReply).not.toHaveBeenCalled();
    expect(body.failed).toBe(1);
    expect(body.errors[0].error).toBe("Location not found or no owner");
  });
});
