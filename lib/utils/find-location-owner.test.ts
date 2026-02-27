import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { findLocationOwner } from "./find-location-owner";
import { db } from "@/lib/db/client";

vi.mock("@/lib/db/client", () => ({
  db: {
    query: {
      locationMembers: {
        findFirst: vi.fn(),
      },
      accountLocations: {
        findFirst: vi.fn(),
      },
      userAccounts: {
        findFirst: vi.fn(),
      },
    },
  },
}));

vi.mock("drizzle-orm", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as object),
    eq: vi.fn(),
    and: vi.fn(),
  };
});

describe("findLocationOwner", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return owner from locationMembers + accountLocations when both exist", async () => {
    (db.query.locationMembers.findFirst as Mock).mockResolvedValue({
      userId: "member-user-1",
      role: "owner",
    });
    (db.query.accountLocations.findFirst as Mock).mockResolvedValue({
      id: "al-1",
      accountId: "acc-1",
      connected: true,
    });

    const result = await findLocationOwner("loc-1");

    expect(result).toEqual({
      userId: "member-user-1",
      accountId: "acc-1",
      accountLocationId: "al-1",
    });
  });

  it("should fallback to userAccounts when no locationMember owner", async () => {
    (db.query.locationMembers.findFirst as Mock).mockResolvedValue(null);
    (db.query.accountLocations.findFirst as Mock).mockResolvedValue({
      id: "al-1",
      accountId: "acc-1",
      connected: true,
    });
    (db.query.userAccounts.findFirst as Mock).mockResolvedValue({
      userId: "ua-user-1",
      accountId: "acc-1",
    });

    const result = await findLocationOwner("loc-1");

    expect(result).toEqual({
      userId: "ua-user-1",
      accountId: "acc-1",
      accountLocationId: "al-1",
    });
  });

  it("should return null when no connection found", async () => {
    (db.query.locationMembers.findFirst as Mock).mockResolvedValue(null);
    (db.query.accountLocations.findFirst as Mock).mockResolvedValue(null);

    const result = await findLocationOwner("loc-1");

    expect(result).toBeNull();
  });

  it("should return null when connection exists but no userAccount", async () => {
    (db.query.locationMembers.findFirst as Mock).mockResolvedValue(null);
    (db.query.accountLocations.findFirst as Mock).mockResolvedValue({
      id: "al-1",
      accountId: "acc-1",
      connected: true,
    });
    (db.query.userAccounts.findFirst as Mock).mockResolvedValue(null);

    const result = await findLocationOwner("loc-1");

    expect(result).toBeNull();
  });

  it("should query accountLocations with orderBy for deterministic results (Bug #12)", async () => {
    (db.query.locationMembers.findFirst as Mock).mockResolvedValue(null);
    (db.query.accountLocations.findFirst as Mock).mockResolvedValue(null);

    await findLocationOwner("loc-1");

    const call = (db.query.accountLocations.findFirst as Mock).mock.calls[0][0];
    expect(call).toHaveProperty("orderBy");
    expect(typeof call.orderBy).toBe("function");
  });

  it("should use memberOwner userId but connection accountId when both exist", async () => {
    (db.query.locationMembers.findFirst as Mock).mockResolvedValue({
      userId: "owner-user",
      role: "owner",
    });
    (db.query.accountLocations.findFirst as Mock).mockResolvedValue({
      id: "al-1",
      accountId: "different-account",
      connected: true,
    });

    const result = await findLocationOwner("loc-1");

    expect(result!.userId).toBe("owner-user");
    expect(result!.accountId).toBe("different-account");
  });
});
