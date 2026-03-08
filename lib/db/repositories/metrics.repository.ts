import { eq, and, gte, lte, desc } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { locationMetrics, type LocationMetricInsert } from "@/lib/db/schema";
import { createLocationAccessCondition } from "./access-conditions";

export class MetricsRepository {
  constructor(
    private userId: string,
    private locationId: string
  ) {}

  private getAccessCondition() {
    return createLocationAccessCondition(this.userId, this.locationId);
  }

  async getMetrics(dateFrom: Date, dateTo: Date) {
    return db.query.locationMetrics.findMany({
      where: and(
        eq(locationMetrics.locationId, this.locationId),
        gte(locationMetrics.date, dateFrom),
        lte(locationMetrics.date, dateTo),
        this.getAccessCondition()
      ),
      orderBy: [desc(locationMetrics.date)],
    });
  }

  async upsertMany(data: LocationMetricInsert[]) {
    if (data.length === 0) return;

    for (const row of data) {
      await db
        .insert(locationMetrics)
        .values(row)
        .onConflictDoUpdate({
          target: [locationMetrics.locationId, locationMetrics.date],
          set: {
            searchImpressionsDesktop: row.searchImpressionsDesktop,
            searchImpressionsMobile: row.searchImpressionsMobile,
            mapsImpressionsDesktop: row.mapsImpressionsDesktop,
            mapsImpressionsMobile: row.mapsImpressionsMobile,
            websiteClicks: row.websiteClicks,
            phoneCallClicks: row.phoneCallClicks,
            directionRequests: row.directionRequests,
          },
        });
    }
  }
}
