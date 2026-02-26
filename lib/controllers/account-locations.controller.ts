import type { LocationCreate } from "@/lib/types";
import { AccountLocationsRepository, type Location, type AccountLocation } from "@/lib/db/repositories";
import { NotFoundError } from "@/lib/api/errors";

export class AccountLocationsController {
  private repository: AccountLocationsRepository;

  constructor(userId: string, accountId: string) {
    this.repository = new AccountLocationsRepository(userId, accountId);
  }

  async getAccountLocations(): Promise<AccountLocation[]> {
    return this.repository.list();
  }

  async getAccountLocationsWithDetails(): Promise<Array<AccountLocation & { location: Location }>> {
    return this.repository.listWithLocations();
  }

  async getAccountLocation(accountLocationId: string): Promise<AccountLocation> {
    const accountLocation = await this.repository.get(accountLocationId);
    if (!accountLocation) throw new NotFoundError("Account location not found");
    return accountLocation;
  }

  async connectLocation(
    data: LocationCreate
  ): Promise<
    | { accountLocation: AccountLocation; location: Location; isNew: boolean; alreadyOwned?: false }
    | { alreadyOwned: true; locationId: string }
  > {
    return this.repository.findOrCreate(data.googleBusinessId, data.googleLocationId, {
      name: data.name,
      address: data.address,
      city: data.city,
      state: data.state,
      postalCode: data.postalCode,
      country: data.country,
      phoneNumber: data.phoneNumber,
      websiteUrl: data.websiteUrl,
      mapsUrl: data.mapsUrl,
      reviewUrl: data.reviewUrl,
      description: data.description,
      photoUrl: data.photoUrl,
      starConfigs: data.starConfigs,
    });
  }

  async disconnectLocation(accountLocationId: string): Promise<AccountLocation> {
    await this.getAccountLocation(accountLocationId);
    return this.repository.disconnect(accountLocationId);
  }

  async reconnectLocation(accountLocationId: string): Promise<AccountLocation> {
    await this.getAccountLocation(accountLocationId);
    return this.repository.reconnect(accountLocationId);
  }

  async deleteConnection(accountLocationId: string): Promise<void> {
    await this.getAccountLocation(accountLocationId);
    return this.repository.delete(accountLocationId);
  }

  async checkExists(googleBusinessId: string): Promise<boolean> {
    return this.repository.checkExists(googleBusinessId);
  }

  async findByGoogleBusinessId(googleBusinessId: string): Promise<AccountLocation | null> {
    return this.repository.findByGoogleBusinessId(googleBusinessId);
  }

  async getByLocationId(locationId: string): Promise<AccountLocation | null> {
    return this.repository.getByLocationId(locationId);
  }
}
