import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { createCheckoutSession } from "./subscription.actions";
import { getStripe, getStripePriceId } from "@/lib/stripe/config";
import { auth } from "@/lib/auth";
import { resolveLocale } from "@/lib/locale-detection";

vi.mock("@/lib/stripe/config");
vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));
vi.mock("@/lib/locale-detection");
vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}));

describe("createCheckoutSession", () => {
  const mockStripe = {
    checkout: {
      sessions: {
        create: vi.fn(),
      },
    },
    promotionCodes: {
      list: vi.fn(),
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (getStripe as unknown as Mock).mockReturnValue(mockStripe);
    (getStripePriceId as unknown as Mock).mockReturnValue("price_123");
    (resolveLocale as unknown as Mock).mockResolvedValue("en");
  });

  it("should create a checkout session successfully", async () => {
    (auth.api.getSession as unknown as Mock).mockResolvedValue({
      user: { id: "user_123", email: "test@example.com" },
    });
    mockStripe.checkout.sessions.create.mockResolvedValue({
      url: "https://checkout.stripe.com/test",
    });

    const result = await createCheckoutSession("pro", "monthly");

    expect(result).toEqual({ url: "https://checkout.stripe.com/test" });
    expect(getStripePriceId).toHaveBeenCalledWith("pro", "monthly");
    expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        customer_email: "test@example.com",
        client_reference_id: "user_123",
        line_items: [{ price: "price_123", quantity: 1 }],
      })
    );
  });

  it("should return error if user is not authenticated", async () => {
    (auth.api.getSession as unknown as Mock).mockResolvedValue(null);

    const result = await createCheckoutSession("pro", "monthly");
    expect(result).toEqual({ error: "Unauthorized" });
  });

  it("should return error for invalid plan", async () => {
    (auth.api.getSession as unknown as Mock).mockResolvedValue({
      user: { id: "user_123", email: "test@example.com" },
    });

    const result = await createCheckoutSession("invalid" as unknown as "basic" | "pro", "monthly");
    expect(result).toEqual({ error: "Invalid plan" });
  });

  it("should return error for invalid interval", async () => {
    (auth.api.getSession as unknown as Mock).mockResolvedValue({
      user: { id: "user_123", email: "test@example.com" },
    });

    const result = await createCheckoutSession("pro", "invalid" as unknown as "monthly" | "yearly");
    expect(result).toEqual({ error: "Invalid interval" });
  });
});
