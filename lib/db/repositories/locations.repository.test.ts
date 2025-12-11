import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { LocationsRepository } from "./locations.repository";
import { db } from "@/lib/db/client";
import { NotFoundError } from "@/lib/api/errors";

vi.mock("@/lib/db/client", () => ({
  db: {
    query: {
      locations: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
      accountLocations: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
      userAccounts: {
        findMany: vi.fn(),
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
    inArray: vi.fn(),
  };
});

describe("LocationsRepository", () => {
  const userId = "user-123";
  let repository: LocationsRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new LocationsRepository(userId);
  });

  describe("get", () => {
    it("should return location if user has access", async () => {
      const mockLocation = { id: "loc-1", name: "Test Location" };

      (db.query.accountLocations.findFirst as Mock).mockResolvedValue({
        account: { userAccounts: [{ userId }] },
      });
      (db.query.locations.findFirst as Mock).mockResolvedValue(mockLocation);

      const result = await repository.get("loc-1");

      expect(result).toEqual(mockLocation);
    });

    it("should return null if user does not have access", async () => {
      (db.query.accountLocations.findFirst as Mock).mockResolvedValue(null);

      const result = await repository.get("loc-1");

      expect(result).toBeNull();
    });

    it("should return null if location not found", async () => {
      (db.query.accountLocations.findFirst as Mock).mockResolvedValue({
        account: { userAccounts: [{ userId }] },
      });
      (db.query.locations.findFirst as Mock).mockResolvedValue(null);

      const result = await repository.get("loc-1");

      expect(result).toBeNull();
    });
  });

  describe("list", () => {
    it("should return locations for user accounts", async () => {
      const mockUserAccounts = [{ accountId: "acc-1" }];
      const mockAccountLocations = [{ locationId: "loc-1" }];
      const mockLocations = [{ id: "loc-1", name: "Test Location" }];

      (db.query.userAccounts.findMany as Mock).mockResolvedValue(mockUserAccounts);
      (db.query.accountLocations.findMany as Mock).mockResolvedValue(mockAccountLocations);
      (db.query.locations.findMany as Mock).mockResolvedValue(mockLocations);

      const result = await repository.list();

      expect(result).toEqual(mockLocations);
    });

    it("should return empty array if user has no accounts", async () => {
      (db.query.userAccounts.findMany as Mock).mockResolvedValue([]);

      const result = await repository.list();

      expect(result).toEqual([]);
    });

    it("should return empty array if accounts have no locations", async () => {
      (db.query.userAccounts.findMany as Mock).mockResolvedValue([{ accountId: "acc-1" }]);
      (db.query.accountLocations.findMany as Mock).mockResolvedValue([]);

      const result = await repository.list();

      expect(result).toEqual([]);
    });

    it("should filter by connected status", async () => {
      const mockUserAccounts = [{ accountId: "acc-1" }];
      const mockAccountLocations = [{ locationId: "loc-1" }];
      const mockLocations = [{ id: "loc-1", name: "Test Location" }];

      (db.query.userAccounts.findMany as Mock).mockResolvedValue(mockUserAccounts);
      (db.query.accountLocations.findMany as Mock).mockResolvedValue(mockAccountLocations);
      (db.query.locations.findMany as Mock).mockResolvedValue(mockLocations);

      await repository.list({ connected: true });

      expect(db.query.accountLocations.findMany).toHaveBeenCalled();
    });
  });

  describe("create", () => {
    it("should return existing location if googleLocationId exists", async () => {
      const existingLocation = { id: "loc-1", googleLocationId: "google-123" };
      (db.query.locations.findFirst as Mock).mockResolvedValue(existingLocation);

      const result = await repository.create({
        googleLocationId: "google-123",
        name: "Test",
        address: "123 Main St",
        starConfigs: {} as never,
      });

      expect(result).toEqual(existingLocation);
      expect(db.insert).not.toHaveBeenCalled();
    });

    it("should create new location if googleLocationId does not exist", async () => {
      const newLocation = { id: "loc-1", googleLocationId: "google-123", name: "Test" };

      (db.query.locations.findFirst as Mock).mockResolvedValue(null);

      const mockInsert = vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([newLocation]),
        }),
      });
      (db.insert as Mock).mockImplementation(mockInsert);

      const result = await repository.create({
        googleLocationId: "google-123",
        name: "Test",
        address: "123 Main St",
        starConfigs: {} as never,
      });

      expect(result).toEqual(newLocation);
    });
  });

  describe("findOrCreate", () => {
    it("should return existing location", async () => {
      const existingLocation = { id: "loc-1", googleLocationId: "google-123" };
      (db.query.locations.findFirst as Mock).mockResolvedValue(existingLocation);

      const result = await repository.findOrCreate({
        googleLocationId: "google-123",
        name: "Test",
        address: "123 Main St",
        starConfigs: {} as never,
      });

      expect(result).toEqual(existingLocation);
    });
  });

  describe("update", () => {
    it("should update location if user has access", async () => {
      const updatedLocation = { id: "loc-1", name: "Updated Name" };

      (db.query.accountLocations.findFirst as Mock).mockResolvedValue({
        account: { userAccounts: [{ userId }] },
      });

      const mockUpdate = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([updatedLocation]),
          }),
        }),
      });
      (db.update as Mock).mockImplementation(mockUpdate);

      const result = await repository.update("loc-1", { name: "Updated Name" });

      expect(result).toEqual(updatedLocation);
    });

    it("should throw NotFoundError if user does not have access", async () => {
      (db.query.accountLocations.findFirst as Mock).mockResolvedValue(null);

      await expect(repository.update("loc-1", { name: "Updated" })).rejects.toThrow(NotFoundError);
    });

    it("should throw NotFoundError if location not found", async () => {
      (db.query.accountLocations.findFirst as Mock).mockResolvedValue({
        account: { userAccounts: [{ userId }] },
      });

      const mockUpdate = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([]),
          }),
        }),
      });
      (db.update as Mock).mockImplementation(mockUpdate);

      await expect(repository.update("loc-1", { name: "Updated" })).rejects.toThrow(NotFoundError);
    });
  });

  describe("delete", () => {
    it("should throw NotFoundError if user does not have access", async () => {
      (db.query.accountLocations.findFirst as Mock).mockResolvedValue(null);

      await expect(repository.delete("loc-1")).rejects.toThrow(NotFoundError);
    });

    it("should throw error if location has active connections", async () => {
      (db.query.accountLocations.findFirst as Mock).mockResolvedValue({
        account: { userAccounts: [{ userId }] },
      });
      (db.query.accountLocations.findMany as Mock).mockResolvedValue([{ id: "al-1" }]);

      await expect(repository.delete("loc-1")).rejects.toThrow("Cannot delete location with active connections");
    });

    it("should delete location if no active connections", async () => {
      (db.query.accountLocations.findFirst as Mock).mockResolvedValue({
        account: { userAccounts: [{ userId }] },
      });
      (db.query.accountLocations.findMany as Mock).mockResolvedValue([]);

      const mockDelete = vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: "loc-1" }]),
        }),
      });
      (db.delete as Mock).mockImplementation(mockDelete);

      await repository.delete("loc-1");

      expect(db.delete).toHaveBeenCalled();
    });
  });

  describe("findByGoogleLocationId", () => {
    it("should find location by google location id", async () => {
      const mockLocation = { id: "loc-1", googleLocationId: "google-123" };
      (db.query.locations.findFirst as Mock).mockResolvedValue(mockLocation);

      const result = await repository.findByGoogleLocationId("google-123");

      expect(result).toEqual(mockLocation);
    });

    it("should return null if not found", async () => {
      (db.query.locations.findFirst as Mock).mockResolvedValue(null);

      const result = await repository.findByGoogleLocationId("non-existent");

      expect(result).toBeNull();
    });
  });

  describe("getWithConnections", () => {
    it("should return location with connections if user has access", async () => {
      const mockLocationWithConnections = {
        id: "loc-1",
        name: "Test Location",
        accountLocations: [
          {
            id: "al-1",
            accountId: "acc-1",
            connected: true,
            account: {
              id: "acc-1",
              email: "test@example.com",
              userAccounts: [{ userId, role: "owner" }],
            },
          },
        ],
      };

      (db.query.accountLocations.findFirst as Mock).mockResolvedValue({
        account: { userAccounts: [{ userId }] },
      });
      (db.query.locations.findFirst as Mock).mockResolvedValue(mockLocationWithConnections);

      const result = await repository.getWithConnections("loc-1");

      expect(result).toEqual(mockLocationWithConnections);
    });

    it("should return null if user does not have access", async () => {
      (db.query.accountLocations.findFirst as Mock).mockResolvedValue(null);

      const result = await repository.getWithConnections("loc-1");

      expect(result).toBeNull();
    });
  });
});
