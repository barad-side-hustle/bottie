import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { locationCompetitorSnapshots, type LocationCompetitorSnapshotInsert } from "@/lib/db/schema";
import { createLocationAccessCondition } from "./access-conditions";

export class CompetitorSnapshotsRepository {
  constructor(
    private userId: string,
    private locationId: string
  ) {}

  private getAccessCondition() {
    return createLocationAccessCondition(this.userId, this.locationId);
  }

  async getSnapshot() {
    return db.query.locationCompetitorSnapshots.findFirst({
      where: and(eq(locationCompetitorSnapshots.locationId, this.locationId), this.getAccessCondition()),
    });
  }

  async upsertSnapshot(data: LocationCompetitorSnapshotInsert) {
    await db
      .insert(locationCompetitorSnapshots)
      .values(data)
      .onConflictDoUpdate({
        target: [locationCompetitorSnapshots.locationId],
        set: {
          placeId: data.placeId,
          latitude: data.latitude,
          longitude: data.longitude,
          primaryType: data.primaryType,
          ownRating: data.ownRating,
          ownReviewCount: data.ownReviewCount,
          businessStatus: data.businessStatus,
          competitors: data.competitors,
          stats: data.stats,
          radiusMeters: data.radiusMeters,
          status: data.status,
          errorReason: data.errorReason,
          fetchedAt: data.fetchedAt,
          updatedAt: new Date(),
        },
      });
  }
}
