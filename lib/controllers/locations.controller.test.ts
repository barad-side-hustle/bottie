import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { LocationsController } from "./locations.controller";
import { LocationsRepository } from "@/lib/db/repositories";

vi.mock("@/lib/db/repositories");

type MockRepository = Record<string, Mock>;

describe("LocationsController", () => {
  const userId = "user-123";
  let controller: LocationsController;
  let mockLocationsRepo: MockRepository;

  beforeEach(() => {
    vi.clearAllMocks();

    mockLocationsRepo = {
      list: vi.fn(),
      get: vi.fn(),
      update: vi.fn(),
      findByGoogleLocationId: vi.fn(),
    };

    (LocationsRepository as unknown as Mock).mockImplementation(function () {
      return mockLocationsRepo;
    });

    controller = new LocationsController(userId);
  });

  describe("getLocations", () => {
    it("should list locations using repository", async () => {
      const mockLocations = [{ id: "loc-1", name: "Test Location" }];
      mockLocationsRepo.list.mockResolvedValue(mockLocations);

      const result = await controller.getLocations();

      expect(mockLocationsRepo.list).toHaveBeenCalled();
      expect(result).toBe(mockLocations);
    });

    it("should return empty array when no locations", async () => {
      mockLocationsRepo.list.mockResolvedValue([]);

      const result = await controller.getLocations();

      expect(result).toEqual([]);
    });
  });

  describe("getLocation", () => {
    it("should get location by id", async () => {
      const mockLocation = { id: "loc-1", name: "Test Location" };
      mockLocationsRepo.get.mockResolvedValue(mockLocation);

      const result = await controller.getLocation("loc-1");

      expect(mockLocationsRepo.get).toHaveBeenCalledWith("loc-1");
      expect(result).toBe(mockLocation);
    });

    it("should throw error if location not found", async () => {
      mockLocationsRepo.get.mockResolvedValue(null);

      await expect(controller.getLocation("loc-1")).rejects.toThrow("Location not found");
    });
  });

  describe("updateLocation", () => {
    it("should update location successfully", async () => {
      const locationId = "loc-1";
      const data = { name: "Updated Name" };
      const mockLocation = { id: locationId, name: "Original Name" };
      const updatedLocation = { ...mockLocation, ...data };

      mockLocationsRepo.get.mockResolvedValue(mockLocation);
      mockLocationsRepo.update.mockResolvedValue(updatedLocation);

      const result = await controller.updateLocation(locationId, data);

      expect(mockLocationsRepo.get).toHaveBeenCalledWith(locationId);
      expect(mockLocationsRepo.update).toHaveBeenCalledWith(locationId, data);
      expect(result).toEqual(updatedLocation);
    });

    it("should throw error if location not found during update", async () => {
      mockLocationsRepo.get.mockResolvedValue(null);

      await expect(controller.updateLocation("loc-1", { name: "Test" })).rejects.toThrow("Location not found");
    });
  });

  describe("findByGoogleLocationId", () => {
    it("should find location by google location id", async () => {
      const googleLocationId = "google-loc-123";
      const mockLocation = { id: "loc-1", googleLocationId };

      mockLocationsRepo.findByGoogleLocationId.mockResolvedValue(mockLocation);

      const result = await controller.findByGoogleLocationId(googleLocationId);

      expect(mockLocationsRepo.findByGoogleLocationId).toHaveBeenCalledWith(googleLocationId);
      expect(result).toBe(mockLocation);
    });

    it("should return null if google location not found", async () => {
      mockLocationsRepo.findByGoogleLocationId.mockResolvedValue(null);

      const result = await controller.findByGoogleLocationId("non-existent");

      expect(result).toBeNull();
    });
  });
});
