import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { GET } from "./route";
import { NextRequest } from "next/server";
import { db } from "@/lib/db/client";
import { ReviewsRepository } from "@/lib/db/repositories/reviews.repository";
import { LocationsRepository } from "@/lib/db/repositories/locations.repository";
import { findLocationOwner } from "@/lib/utils/find-location-owner";
import { sendReviewNotifications } from "@/lib/utils/review-notifications";

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
    notificationSent: "notificationSent",
    id: "id",
    receivedAt: "receivedAt",
    locationId: "locationId",
  },
  reviewResponses: {
    reviewId: "reviewId",
    status: "status",
    text: "text",
    createdAt: "createdAt",
  },
}));

vi.mock("@/lib/db/repositories/reviews.repository");
vi.mock("@/lib/db/repositories/locations.repository");
vi.mock("@/lib/utils/find-location-owner");
vi.mock("@/lib/utils/review-notifications");

vi.mock("@/lib/env", () => ({
  env: { CRON_SECRET: "test-cron-secret" },
}));

vi.mock("drizzle-orm", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as object),
    and: vi.fn((...args: unknown[]) => args),
    eq: vi.fn(),
    inArray: vi.fn(),
    sql: vi.fn().mockImplementation((strings: TemplateStringsArray, ...values: unknown[]) => ({ strings, values })),
  };
});

function createRequest(authHeader?: string): NextRequest {
  return new NextRequest("http://localhost/api/cron/send-notifications", {
    headers: authHeader ? { authorization: authHeader } : {},
  });
}

const mockReview = (overrides = {}) => ({
  id: "review-1",
  locationId: "loc-1",
  name: "Test Reviewer",
  rating: 5,
  text: "Great service!",
  replyStatus: "posted",
  notificationSent: false,
  ...overrides,
});

describe("send-notifications cron", () => {
  const mockReviewsRepoUpdate = vi.fn();

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

    mockReviewsRepoUpdate.mockResolvedValue({});
    (ReviewsRepository as unknown as Mock).mockImplementation(function () {
      return { update: mockReviewsRepoUpdate };
    });

    (sendReviewNotifications as Mock).mockResolvedValue(undefined);

    (db.limit as Mock).mockResolvedValue([]);
  });

  it("should return 401 when authorization is missing", async () => {
    const res = await GET(createRequest());
    expect(res.status).toBe(401);
  });

  it("should return early when no notifications to send", async () => {
    const res = await GET(createRequest("Bearer test-cron-secret"));
    const body = await res.json();
    expect(body.message).toBe("No notifications to send");
    expect(body.sent).toBe(0);
  });

  it("should send notification for posted review and mark as sent", async () => {
    const review = mockReview({ replyStatus: "posted" });
    (db.limit as Mock).mockResolvedValueOnce([review]).mockResolvedValueOnce([{ text: "AI reply text" }]);

    const res = await GET(createRequest("Bearer test-cron-secret"));
    const body = await res.json();

    expect(sendReviewNotifications).toHaveBeenCalledWith({
      reviewId: "review-1",
      locationId: "loc-1",
      locationName: "Test Location",
      reviewerName: "Test Reviewer",
      reviewRating: 5,
      reviewText: "Great service!",
      aiReply: "AI reply text",
      replyStatus: "posted",
    });
    expect(mockReviewsRepoUpdate).toHaveBeenCalledWith("review-1", { notificationSent: true });
    expect(body.sent).toBe(1);
  });

  it("should send notification for failed review without aiReply", async () => {
    const review = mockReview({ replyStatus: "failed" });
    (db.limit as Mock).mockResolvedValueOnce([review]);

    const res = await GET(createRequest("Bearer test-cron-secret"));
    const body = await res.json();

    expect(sendReviewNotifications).toHaveBeenCalledWith(
      expect.objectContaining({
        replyStatus: "failed",
        aiReply: undefined,
      })
    );
    expect(body.sent).toBe(1);
  });

  it("should skip review when no owner found", async () => {
    (db.limit as Mock).mockResolvedValueOnce([mockReview()]);
    (findLocationOwner as Mock).mockResolvedValue(null);

    const res = await GET(createRequest("Bearer test-cron-secret"));
    const body = await res.json();

    expect(sendReviewNotifications).not.toHaveBeenCalled();
    expect(body.failed).toBe(1);
  });

  it("should handle notification sending failure", async () => {
    const review = mockReview({ replyStatus: "failed" });
    (db.limit as Mock).mockResolvedValueOnce([review]);
    (sendReviewNotifications as Mock).mockRejectedValue(new Error("Email service down"));

    const res = await GET(createRequest("Bearer test-cron-secret"));
    const body = await res.json();

    expect(mockReviewsRepoUpdate).not.toHaveBeenCalled();
    expect(body.failed).toBe(1);
    expect(body.sent).toBe(0);
  });

  it("should fail when posted review has no response found", async () => {
    const review = mockReview({ replyStatus: "posted" });
    (db.limit as Mock).mockResolvedValueOnce([review]).mockResolvedValueOnce([]);

    const res = await GET(createRequest("Bearer test-cron-secret"));
    const body = await res.json();

    expect(sendReviewNotifications).not.toHaveBeenCalled();
    expect(body.failed).toBe(1);
    expect(body.errors[0].error).toBe("No response found");
  });
});
