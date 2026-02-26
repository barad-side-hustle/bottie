import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { AccountLocationsRepository } from "./account-locations.repository";
import { db } from "@/lib/db/client";
import { NotFoundError } from "@/lib/api/errors";

vi.mock("./location-members.repository", () => {
  return {
    LocationMembersRepository: class {
      isLocationOwnedByGoogleId = vi.fn().mockResolvedValue({ owned: false });
      getOwner = vi.fn().mockResolvedValue(null);
      addMember = vi.fn().mockResolvedValue({ id: "member-1" });
      getMember = vi.fn().mockResolvedValue(null);
    },
  };
});

vi.mock("@/lib/db/client", () => ({
  db: {
    query: {
      userAccounts: {
        findFirst: vi.fn(),
      },
      accountLocations: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
      locations: {
        findFirst: vi.fn(),
      },
    },
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
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

describe("AccountLocationsRepository", () => {
  const userId = "user-123";
  const accountId = "acc-123";
  let repository: AccountLocationsRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new AccountLocationsRepository(userId, accountId);
  });

  describe("get", () => {
    it("should return account location if user has access", async () => {
      const mockAccountLocation = { id: "al-1", locationId: "loc-1" };

      (db.query.userAccounts.findFirst as Mock).mockResolvedValue({ userId, accountId });
      (db.query.accountLocations.findFirst as Mock).mockResolvedValue(mockAccountLocation);

      const result = await repository.get("al-1");

      expect(result).toEqual(mockAccountLocation);
    });

    it("should return null if user does not have access", async () => {
      (db.query.userAccounts.findFirst as Mock).mockResolvedValue(null);

      const result = await repository.get("al-1");

      expect(result).toBeNull();
    });
  });

  describe("getByLocationId", () => {
    it("should return account location by location id", async () => {
      const mockAccountLocation = { id: "al-1", locationId: "loc-1" };

      (db.query.userAccounts.findFirst as Mock).mockResolvedValue({ userId, accountId });
      (db.query.accountLocations.findFirst as Mock).mockResolvedValue(mockAccountLocation);

      const result = await repository.getByLocationId("loc-1");

      expect(result).toEqual(mockAccountLocation);
    });

    it("should return null if user does not have access", async () => {
      (db.query.userAccounts.findFirst as Mock).mockResolvedValue(null);

      const result = await repository.getByLocationId("loc-1");

      expect(result).toBeNull();
    });
  });

  describe("list", () => {
    it("should return account locations if user has access", async () => {
      const mockAccountLocations = [{ id: "al-1" }, { id: "al-2" }];

      (db.query.userAccounts.findFirst as Mock).mockResolvedValue({ userId, accountId });
      (db.query.accountLocations.findMany as Mock).mockResolvedValue(mockAccountLocations);

      const result = await repository.list();

      expect(result).toEqual(mockAccountLocations);
    });

    it("should return empty array if user does not have access", async () => {
      (db.query.userAccounts.findFirst as Mock).mockResolvedValue(null);

      const result = await repository.list();

      expect(result).toEqual([]);
    });
  });

  describe("listWithLocations", () => {
    it("should return account locations with full location details", async () => {
      const mockAccountLocations = [
        {
          id: "al-1",
          location: {
            id: "loc-1",
            googleLocationId: "google-123",
            name: "Test Location",
            address: "123 Main St",
            toneOfVoice: "friendly",
            languageMode: "auto-detect",
            starConfigs: {},
            createdAt: new Date(),
          },
        },
      ];

      (db.query.userAccounts.findFirst as Mock).mockResolvedValue({ userId, accountId });
      (db.query.accountLocations.findMany as Mock).mockResolvedValue(mockAccountLocations);

      const result = await repository.listWithLocations();

      expect(result).toEqual(mockAccountLocations);
    });

    it("should return empty array if user does not have access", async () => {
      (db.query.userAccounts.findFirst as Mock).mockResolvedValue(null);

      const result = await repository.listWithLocations();

      expect(result).toEqual([]);
    });
  });

  describe("create", () => {
    it("should throw NotFoundError if user does not have access", async () => {
      (db.query.userAccounts.findFirst as Mock).mockResolvedValue(null);

      await expect(
        repository.create({
          accountId,
          locationId: "loc-1",
          googleBusinessId: "accounts/123/locations/456",
          connected: true,
        })
      ).rejects.toThrow(NotFoundError);
    });

    it("should return existing account location if already exists and connected", async () => {
      const existingAccountLocation = { id: "al-1", connected: true };

      (db.query.userAccounts.findFirst as Mock).mockResolvedValue({ userId, accountId });
      (db.query.accountLocations.findFirst as Mock).mockResolvedValue(existingAccountLocation);

      const result = await repository.create({
        accountId,
        locationId: "loc-1",
        googleBusinessId: "accounts/123/locations/456",
        connected: true,
      });

      expect(result).toEqual(existingAccountLocation);
    });

    it("should reconnect if existing but disconnected", async () => {
      const existingAccountLocation = { id: "al-1", connected: false };
      const reconnectedLocation = { ...existingAccountLocation, connected: true };

      (db.query.userAccounts.findFirst as Mock).mockResolvedValue({ userId, accountId });
      (db.query.accountLocations.findFirst as Mock).mockResolvedValue(existingAccountLocation);

      const mockUpdate = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([reconnectedLocation]),
          }),
        }),
      });
      (db.update as Mock).mockImplementation(mockUpdate);

      const result = await repository.create({
        accountId,
        locationId: "loc-1",
        googleBusinessId: "accounts/123/locations/456",
        connected: true,
      });

      expect(result).toEqual(reconnectedLocation);
    });

    it("should create new account location if does not exist", async () => {
      const newAccountLocation = { id: "al-1", accountId, locationId: "loc-1" };

      (db.query.userAccounts.findFirst as Mock).mockResolvedValue({ userId, accountId });
      (db.query.accountLocations.findFirst as Mock).mockResolvedValue(null);

      const mockInsert = vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([newAccountLocation]),
        }),
      });
      (db.insert as Mock).mockImplementation(mockInsert);

      const result = await repository.create({
        accountId,
        locationId: "loc-1",
        googleBusinessId: "accounts/123/locations/456",
        connected: true,
      });

      expect(result).toEqual(newAccountLocation);
    });
  });

  describe("update", () => {
    it("should throw NotFoundError if user does not have access", async () => {
      (db.query.userAccounts.findFirst as Mock).mockResolvedValue(null);

      await expect(repository.update("al-1", { connected: false })).rejects.toThrow(NotFoundError);
    });

    it("should update account location successfully", async () => {
      const updatedLocation = { id: "al-1", connected: false };

      (db.query.userAccounts.findFirst as Mock).mockResolvedValue({ userId, accountId });

      const mockUpdate = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([updatedLocation]),
          }),
        }),
      });
      (db.update as Mock).mockImplementation(mockUpdate);

      const result = await repository.update("al-1", { connected: false });

      expect(result).toEqual(updatedLocation);
    });

    it("should throw NotFoundError if account location not found", async () => {
      (db.query.userAccounts.findFirst as Mock).mockResolvedValue({ userId, accountId });

      const mockUpdate = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([]),
          }),
        }),
      });
      (db.update as Mock).mockImplementation(mockUpdate);

      await expect(repository.update("al-1", { connected: false })).rejects.toThrow(NotFoundError);
    });
  });

  describe("delete", () => {
    it("should throw NotFoundError if user does not have access", async () => {
      (db.query.userAccounts.findFirst as Mock).mockResolvedValue(null);

      await expect(repository.delete("al-1")).rejects.toThrow(NotFoundError);
    });

    it("should delete account location successfully", async () => {
      (db.query.userAccounts.findFirst as Mock).mockResolvedValue({ userId, accountId });

      const mockDelete = vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: "al-1" }]),
        }),
      });
      (db.delete as Mock).mockImplementation(mockDelete);

      await repository.delete("al-1");

      expect(db.delete).toHaveBeenCalled();
    });

    it("should throw NotFoundError if account location not found", async () => {
      (db.query.userAccounts.findFirst as Mock).mockResolvedValue({ userId, accountId });

      const mockDelete = vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([]),
        }),
      });
      (db.delete as Mock).mockImplementation(mockDelete);

      await expect(repository.delete("al-1")).rejects.toThrow(NotFoundError);
    });
  });

  describe("disconnect", () => {
    it("should disconnect account location", async () => {
      const disconnectedLocation = { id: "al-1", connected: false };

      (db.query.userAccounts.findFirst as Mock).mockResolvedValue({ userId, accountId });

      const mockUpdate = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([disconnectedLocation]),
          }),
        }),
      });
      (db.update as Mock).mockImplementation(mockUpdate);

      const result = await repository.disconnect("al-1");

      expect(result.connected).toBe(false);
    });
  });

  describe("reconnect", () => {
    it("should reconnect account location", async () => {
      const reconnectedLocation = { id: "al-1", connected: true, connectedAt: new Date() };

      (db.query.userAccounts.findFirst as Mock).mockResolvedValue({ userId, accountId });

      const mockUpdate = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([reconnectedLocation]),
          }),
        }),
      });
      (db.update as Mock).mockImplementation(mockUpdate);

      const result = await repository.reconnect("al-1");

      expect(result.connected).toBe(true);
    });
  });

  describe("findByGoogleBusinessId", () => {
    it("should find account location by google business id", async () => {
      const mockAccountLocation = { id: "al-1", googleBusinessId: "accounts/123/locations/456" };

      (db.query.userAccounts.findFirst as Mock).mockResolvedValue({ userId, accountId });
      (db.query.accountLocations.findFirst as Mock).mockResolvedValue(mockAccountLocation);

      const result = await repository.findByGoogleBusinessId("accounts/123/locations/456");

      expect(result).toEqual(mockAccountLocation);
    });

    it("should return null if user does not have access", async () => {
      (db.query.userAccounts.findFirst as Mock).mockResolvedValue(null);

      const result = await repository.findByGoogleBusinessId("accounts/123/locations/456");

      expect(result).toBeNull();
    });
  });

  describe("checkExists", () => {
    it("should return true if google business id exists", async () => {
      (db.query.userAccounts.findFirst as Mock).mockResolvedValue({ userId, accountId });
      (db.query.accountLocations.findFirst as Mock).mockResolvedValue({ id: "al-1" });

      const result = await repository.checkExists("accounts/123/locations/456");

      expect(result).toBe(true);
    });

    it("should return false if google business id does not exist", async () => {
      (db.query.userAccounts.findFirst as Mock).mockResolvedValue({ userId, accountId });
      (db.query.accountLocations.findFirst as Mock).mockResolvedValue(null);

      const result = await repository.checkExists("accounts/123/locations/456");

      expect(result).toBe(false);
    });
  });

  describe("findOrCreate", () => {
    const locationData = {
      name: "Test Business",
      address: "123 Main St",
      starConfigs: {
        1: { customInstructions: "", autoReply: false },
        2: { customInstructions: "", autoReply: false },
        3: { customInstructions: "", autoReply: false },
        4: { customInstructions: "", autoReply: true },
        5: { customInstructions: "", autoReply: true },
      } as {
        1: { customInstructions: string; autoReply: boolean };
        2: { customInstructions: string; autoReply: boolean };
        3: { customInstructions: string; autoReply: boolean };
        4: { customInstructions: string; autoReply: boolean };
        5: { customInstructions: string; autoReply: boolean };
      },
    };

    it("should throw NotFoundError if user does not have access", async () => {
      (db.query.userAccounts.findFirst as Mock).mockResolvedValue(null);

      await expect(repository.findOrCreate("accounts/123/locations/456", "456", locationData)).rejects.toThrow(
        NotFoundError
      );
    });

    it("should create new location and account location if location does not exist", async () => {
      const newLocation = { id: "loc-1", googleLocationId: "456" };
      const newAccountLocation = { id: "al-1", locationId: "loc-1" };

      (db.query.userAccounts.findFirst as Mock).mockResolvedValue({ userId, accountId });
      (db.query.locations.findFirst as Mock).mockResolvedValue(null);
      (db.query.accountLocations.findFirst as Mock).mockResolvedValue(null);

      const mockInsert = vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValueOnce([newLocation]).mockResolvedValueOnce([newAccountLocation]),
        }),
      });
      (db.insert as Mock).mockImplementation(mockInsert);

      const result = await repository.findOrCreate("accounts/123/locations/456", "456", locationData);

      expect("alreadyOwned" in result && result.alreadyOwned).toBeFalsy();
      if (!("alreadyOwned" in result) || !result.alreadyOwned) {
        expect(result.isNew).toBe(true);
        expect(result.location).toEqual(newLocation);
      }
    });

    it("should connect to existing location", async () => {
      const existingLocation = { id: "loc-1", googleLocationId: "456" };
      const newAccountLocation = { id: "al-1", locationId: "loc-1" };

      (db.query.userAccounts.findFirst as Mock).mockResolvedValue({ userId, accountId });
      (db.query.locations.findFirst as Mock).mockResolvedValue(existingLocation);
      (db.query.accountLocations.findFirst as Mock).mockResolvedValue(null);

      const mockInsert = vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([newAccountLocation]),
        }),
      });
      (db.insert as Mock).mockImplementation(mockInsert);

      const result = await repository.findOrCreate("accounts/123/locations/456", "456", locationData);

      if (!("alreadyOwned" in result) || !result.alreadyOwned) {
        expect(result.location).toEqual(existingLocation);
      }
    });

    it("should reconnect if disconnected", async () => {
      const existingLocation = { id: "loc-1", googleLocationId: "456" };
      const disconnectedAccountLocation = { id: "al-1", locationId: "loc-1", connected: false };
      const reconnectedAccountLocation = { ...disconnectedAccountLocation, connected: true };

      (db.query.userAccounts.findFirst as Mock).mockResolvedValue({ userId, accountId });
      (db.query.locations.findFirst as Mock).mockResolvedValue(existingLocation);
      (db.query.accountLocations.findFirst as Mock).mockResolvedValue(disconnectedAccountLocation);

      const mockUpdate = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([reconnectedAccountLocation]),
          }),
        }),
      });
      (db.update as Mock).mockImplementation(mockUpdate);

      const result = await repository.findOrCreate("accounts/123/locations/456", "456", locationData);

      if (!("alreadyOwned" in result) || !result.alreadyOwned) {
        expect(result.accountLocation.connected).toBe(true);
      }
    });
  });
});
