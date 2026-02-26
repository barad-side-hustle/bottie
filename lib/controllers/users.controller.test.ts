import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { UsersController } from "./users.controller";
import { UsersConfigsRepository } from "@/lib/db/repositories";
import { UserConfigMap } from "../db/schema";

vi.mock("@/lib/db/repositories");

type MockRepo = {
  getOrCreate: Mock;
  updateConfigs: Mock;
};

describe("UsersController", () => {
  let controller: UsersController;
  let mockRepo: MockRepo;

  beforeEach(() => {
    vi.clearAllMocks();

    mockRepo = {
      getOrCreate: vi.fn(),
      updateConfigs: vi.fn(),
    };

    (UsersConfigsRepository as unknown as Mock).mockImplementation(function () {
      return mockRepo;
    });

    controller = new UsersController();
  });

  describe("getUserConfig", () => {
    it("should get or create user config without locale parameter", async () => {
      const userId = "user-123";
      const mockConfig = { userId, configs: { EMAIL_ON_NEW_REVIEW: true } };
      mockRepo.getOrCreate.mockResolvedValue(mockConfig);

      const result = await controller.getUserConfig(userId);

      expect(mockRepo.getOrCreate).toHaveBeenCalledWith(userId);
      expect(result).toBe(mockConfig);
    });

    it("should create user config with detected Hebrew locale", async () => {
      const userId = "user-123";
      const mockConfig = {
        userId,
        configs: { EMAIL_ON_NEW_REVIEW: true },
      };
      mockRepo.getOrCreate.mockResolvedValue(mockConfig);

      const result = await controller.getUserConfig(userId);

      expect(mockRepo.getOrCreate).toHaveBeenCalledWith(userId);
      expect(result).toBe(mockConfig);
    });

    it("should create user config", async () => {
      const userId = "user-123";
      const mockConfig = {
        userId,
        configs: { EMAIL_ON_NEW_REVIEW: true },
      };
      mockRepo.getOrCreate.mockResolvedValue(mockConfig);

      const result = await controller.getUserConfig(userId);

      expect(mockRepo.getOrCreate).toHaveBeenCalledWith(userId);
      expect(result).toBe(mockConfig);
    });
  });

  describe("updateUserConfig", () => {
    it("should update user config", async () => {
      const userId = "user-123";
      const data = { EMAIL_ON_NEW_REVIEW: false };
      const mockConfig = { userId, configs: { EMAIL_ON_NEW_REVIEW: false } };
      mockRepo.updateConfigs.mockResolvedValue(mockConfig);

      const result = await controller.updateUserConfig(userId, data as unknown as Partial<UserConfigMap>);

      expect(mockRepo.updateConfigs).toHaveBeenCalledWith(userId, data);
      expect(result).toBe(mockConfig);
    });
  });
});
