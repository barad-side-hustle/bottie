import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { AccountLocationsController } from "./account-locations.controller";
import { AccountLocationsRepository, LocationsRepository } from "@/lib/db/repositories";
import { ForbiddenError } from "@/lib/api/errors";

vi.mock("@/lib/db/repositories");

type MockRepository = Record<string, Mock>;

describe("AccountLocationsController", () => {
  const userId = "user-123";
  const accountId = "acc-123";
  let controller: AccountLocationsController;
  let mockAccountLocationsRepo: MockRepository;
  let mockLocationsRepo: MockRepository;

  beforeEach(() => {
    vi.clearAllMocks();

    mockAccountLocationsRepo = {
      list: vi.fn(),
      listWithLocations: vi.fn(),
      get: vi.fn(),
      findOrCreate: vi.fn(),
      disconnect: vi.fn(),
      reconnect: vi.fn(),
      delete: vi.fn(),
      checkExists: vi.fn(),
      findByGoogleBusinessId: vi.fn(),
      getByLocationId: vi.fn(),
    };

    mockLocationsRepo = {
      findByGoogleLocationId: vi.fn(),
    };

    (AccountLocationsRepository as unknown as Mock).mockImplementation(function () {
      return mockAccountLocationsRepo;
    });

    (LocationsRepository as unknown as Mock).mockImplementation(function () {
      return mockLocationsRepo;
    });

    controller = new AccountLocationsController(userId, accountId);
  });

  describe("getAccountLocations", () => {
    it("should list account locations using repository", async () => {
      const mockAccountLocations = [{ id: "al-1", locationId: "loc-1" }];
      mockAccountLocationsRepo.list.mockResolvedValue(mockAccountLocations);

      const result = await controller.getAccountLocations();

      expect(mockAccountLocationsRepo.list).toHaveBeenCalled();
      expect(result).toBe(mockAccountLocations);
    });
  });

  describe("getAccountLocationsWithDetails", () => {
    it("should list account locations with location details", async () => {
      const mockAccountLocations = [
        {
          id: "al-1",
          locationId: "loc-1",
          location: { id: "loc-1", name: "Test Location", address: "123 Main St" },
        },
      ];
      mockAccountLocationsRepo.listWithLocations.mockResolvedValue(mockAccountLocations);

      const result = await controller.getAccountLocationsWithDetails();

      expect(mockAccountLocationsRepo.listWithLocations).toHaveBeenCalled();
      expect(result).toBe(mockAccountLocations);
    });
  });

  describe("getAccountLocation", () => {
    it("should get account location by id", async () => {
      const mockAccountLocation = { id: "al-1", locationId: "loc-1" };
      mockAccountLocationsRepo.get.mockResolvedValue(mockAccountLocation);

      const result = await controller.getAccountLocation("al-1");

      expect(mockAccountLocationsRepo.get).toHaveBeenCalledWith("al-1");
      expect(result).toBe(mockAccountLocation);
    });

    it("should throw error if account location not found", async () => {
      mockAccountLocationsRepo.get.mockResolvedValue(null);

      await expect(controller.getAccountLocation("al-1")).rejects.toThrow("Account location not found");
    });
  });

  describe("connectLocation", () => {
    const locationData = {
      googleBusinessId: "accounts/123/locations/456",
      googleLocationId: "456",
      name: "Test Business",
      address: "123 Main St",
      city: "Test City",
      state: "TS",
      postalCode: "12345",
      country: "US",
      phoneNumber: "+1234567890",
      websiteUrl: "https://test.com",
      mapsUrl: "https://maps.google.com/test",
      reviewUrl: "https://search.google.com/review",
      description: "A test business",
      photoUrl: "https://photos.google.com/test.jpg",
      starConfigs: {
        1: { customInstructions: "", autoReply: false },
        2: { customInstructions: "", autoReply: false },
        3: { customInstructions: "", autoReply: false },
        4: { customInstructions: "", autoReply: true },
        5: { customInstructions: "", autoReply: true },
      },
    };

    it("should connect location successfully for new location", async () => {
      const mockResult = {
        accountLocation: { id: "al-1", locationId: "loc-1" },
        location: { id: "loc-1", googleLocationId: "456" },
        isNew: true,
      };

      mockLocationsRepo.findByGoogleLocationId.mockResolvedValue(null);
      mockAccountLocationsRepo.findOrCreate.mockResolvedValue(mockResult);

      const result = await controller.connectLocation(locationData);

      expect(mockAccountLocationsRepo.findOrCreate).toHaveBeenCalled();
      expect(result).toBe(mockResult);
    });

    it("should connect to existing location without checking limit", async () => {
      const existingLocation = { id: "loc-1", googleLocationId: "456" };
      const mockResult = {
        accountLocation: { id: "al-1", locationId: "loc-1" },
        location: existingLocation,
        isNew: false,
      };

      mockLocationsRepo.findByGoogleLocationId.mockResolvedValue(existingLocation);
      mockAccountLocationsRepo.findOrCreate.mockResolvedValue(mockResult);

      const checkLimit = vi.fn().mockResolvedValue(true);
      const result = await controller.connectLocation(locationData, checkLimit);

      expect(checkLimit).not.toHaveBeenCalled();
      expect(result).toBe(mockResult);
    });

    it("should check limit for new location and allow if under limit", async () => {
      const mockResult = {
        accountLocation: { id: "al-1", locationId: "loc-1" },
        location: { id: "loc-1", googleLocationId: "456" },
        isNew: true,
      };

      mockLocationsRepo.findByGoogleLocationId.mockResolvedValue(null);
      mockAccountLocationsRepo.findOrCreate.mockResolvedValue(mockResult);

      const checkLimit = vi.fn().mockResolvedValue(true);
      const result = await controller.connectLocation(locationData, checkLimit);

      expect(checkLimit).toHaveBeenCalled();
      expect(result).toBe(mockResult);
    });

    it("should throw ForbiddenError if limit exceeded for new location", async () => {
      mockLocationsRepo.findByGoogleLocationId.mockResolvedValue(null);

      const checkLimit = vi.fn().mockResolvedValue(false);

      await expect(controller.connectLocation(locationData, checkLimit)).rejects.toThrow(ForbiddenError);
    });
  });

  describe("disconnectLocation", () => {
    it("should disconnect location successfully", async () => {
      const mockAccountLocation = { id: "al-1", locationId: "loc-1", connected: true };
      const disconnectedLocation = { ...mockAccountLocation, connected: false };

      mockAccountLocationsRepo.get.mockResolvedValue(mockAccountLocation);
      mockAccountLocationsRepo.disconnect.mockResolvedValue(disconnectedLocation);

      const result = await controller.disconnectLocation("al-1");

      expect(mockAccountLocationsRepo.get).toHaveBeenCalledWith("al-1");
      expect(mockAccountLocationsRepo.disconnect).toHaveBeenCalledWith("al-1");
      expect(result).toBe(disconnectedLocation);
    });

    it("should throw error if account location not found", async () => {
      mockAccountLocationsRepo.get.mockResolvedValue(null);

      await expect(controller.disconnectLocation("al-1")).rejects.toThrow("Account location not found");
    });
  });

  describe("reconnectLocation", () => {
    it("should reconnect location successfully", async () => {
      const mockAccountLocation = { id: "al-1", locationId: "loc-1", connected: false };
      const reconnectedLocation = { ...mockAccountLocation, connected: true };

      mockAccountLocationsRepo.get.mockResolvedValue(mockAccountLocation);
      mockAccountLocationsRepo.reconnect.mockResolvedValue(reconnectedLocation);

      const result = await controller.reconnectLocation("al-1");

      expect(mockAccountLocationsRepo.get).toHaveBeenCalledWith("al-1");
      expect(mockAccountLocationsRepo.reconnect).toHaveBeenCalledWith("al-1");
      expect(result).toBe(reconnectedLocation);
    });
  });

  describe("deleteConnection", () => {
    it("should delete connection successfully", async () => {
      const mockAccountLocation = { id: "al-1", locationId: "loc-1" };

      mockAccountLocationsRepo.get.mockResolvedValue(mockAccountLocation);
      mockAccountLocationsRepo.delete.mockResolvedValue(undefined);

      await controller.deleteConnection("al-1");

      expect(mockAccountLocationsRepo.get).toHaveBeenCalledWith("al-1");
      expect(mockAccountLocationsRepo.delete).toHaveBeenCalledWith("al-1");
    });
  });

  describe("checkExists", () => {
    it("should return true if google business id exists", async () => {
      mockAccountLocationsRepo.checkExists.mockResolvedValue(true);

      const result = await controller.checkExists("accounts/123/locations/456");

      expect(mockAccountLocationsRepo.checkExists).toHaveBeenCalledWith("accounts/123/locations/456");
      expect(result).toBe(true);
    });

    it("should return false if google business id does not exist", async () => {
      mockAccountLocationsRepo.checkExists.mockResolvedValue(false);

      const result = await controller.checkExists("accounts/123/locations/456");

      expect(result).toBe(false);
    });
  });

  describe("findByGoogleBusinessId", () => {
    it("should find account location by google business id", async () => {
      const mockAccountLocation = { id: "al-1", googleBusinessId: "accounts/123/locations/456" };
      mockAccountLocationsRepo.findByGoogleBusinessId.mockResolvedValue(mockAccountLocation);

      const result = await controller.findByGoogleBusinessId("accounts/123/locations/456");

      expect(mockAccountLocationsRepo.findByGoogleBusinessId).toHaveBeenCalledWith("accounts/123/locations/456");
      expect(result).toBe(mockAccountLocation);
    });

    it("should return null if not found", async () => {
      mockAccountLocationsRepo.findByGoogleBusinessId.mockResolvedValue(null);

      const result = await controller.findByGoogleBusinessId("accounts/123/locations/456");

      expect(result).toBeNull();
    });
  });

  describe("getByLocationId", () => {
    it("should get account location by location id", async () => {
      const mockAccountLocation = { id: "al-1", locationId: "loc-1" };
      mockAccountLocationsRepo.getByLocationId.mockResolvedValue(mockAccountLocation);

      const result = await controller.getByLocationId("loc-1");

      expect(mockAccountLocationsRepo.getByLocationId).toHaveBeenCalledWith("loc-1");
      expect(result).toBe(mockAccountLocation);
    });

    it("should return null if not found", async () => {
      mockAccountLocationsRepo.getByLocationId.mockResolvedValue(null);

      const result = await controller.getByLocationId("loc-1");

      expect(result).toBeNull();
    });
  });
});
