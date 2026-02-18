import type { LocationUpdate } from "@/lib/types";
import { LocationsRepository, type Location } from "@/lib/db/repositories";
import { NotFoundError } from "@/lib/api/errors";

export class LocationsController {
  private repository: LocationsRepository;

  constructor(userId: string) {
    this.repository = new LocationsRepository(userId);
  }

  async getLocations(): Promise<Location[]> {
    return this.repository.list();
  }

  async getLocation(locationId: string): Promise<Location> {
    const location = await this.repository.get(locationId);
    if (!location) throw new NotFoundError("Location not found");
    return location;
  }

  async updateLocation(locationId: string, data: LocationUpdate): Promise<Location> {
    await this.getLocation(locationId);
    return this.repository.update(locationId, data);
  }

  async findByGoogleLocationId(googleLocationId: string): Promise<Location | null> {
    return this.repository.findByGoogleLocationId(googleLocationId);
  }
}
