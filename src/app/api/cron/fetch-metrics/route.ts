import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { accountLocations, googleAccounts } from "@/lib/db/schema";
import { decryptToken, extractLocationId } from "@/lib/google/business-profile";
import { fetchDailyMetrics } from "@/lib/google/performance";
import { MetricsRepository } from "@/lib/db/repositories/metrics.repository";
import { findLocationOwner } from "@/lib/utils/find-location-owner";
import { env } from "@/lib/env";
import { subDays } from "date-fns";

export const maxDuration = 300;

function secureCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const expected = `Bearer ${env.CRON_SECRET}`;
  if (!authHeader || !secureCompare(authHeader, expected)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const connectedLocations = await db
      .select({
        locationId: accountLocations.locationId,
        googleBusinessId: accountLocations.googleBusinessId,
        accountId: accountLocations.accountId,
      })
      .from(accountLocations)
      .where(eq(accountLocations.connected, true));

    const locationMap = new Map<string, { googleBusinessId: string; accountId: string }>();
    for (const loc of connectedLocations) {
      if (!locationMap.has(loc.locationId)) {
        locationMap.set(loc.locationId, {
          googleBusinessId: loc.googleBusinessId,
          accountId: loc.accountId,
        });
      }
    }

    let locationsProcessed = 0;
    let totalDaysStored = 0;
    const errors: { locationId: string; error: string }[] = [];

    const endDate = new Date();
    const startDate = subDays(endDate, 7);

    for (const [locationId, { googleBusinessId, accountId }] of locationMap) {
      try {
        const numericId = extractLocationId(googleBusinessId);
        if (!numericId) {
          errors.push({ locationId, error: "Could not extract numeric location ID" });
          continue;
        }

        const account = await db.query.googleAccounts.findFirst({
          where: eq(googleAccounts.id, accountId),
        });
        if (!account) {
          errors.push({ locationId, error: "Account not found" });
          continue;
        }

        const owner = await findLocationOwner(locationId);
        if (!owner) {
          errors.push({ locationId, error: "No owner found" });
          continue;
        }

        const refreshToken = await decryptToken(account.googleRefreshToken);
        const dailyMetrics = await fetchDailyMetrics(numericId, refreshToken, startDate, endDate);

        const repo = new MetricsRepository(owner.userId, locationId);
        await repo.upsertMany(
          dailyMetrics.map((m) => ({
            locationId,
            date: new Date(m.date),
            searchImpressionsDesktop: m.searchImpressionsDesktop,
            searchImpressionsMobile: m.searchImpressionsMobile,
            mapsImpressionsDesktop: m.mapsImpressionsDesktop,
            mapsImpressionsMobile: m.mapsImpressionsMobile,
            websiteClicks: m.websiteClicks,
            phoneCallClicks: m.phoneCallClicks,
            directionRequests: m.directionRequests,
          }))
        );

        totalDaysStored += dailyMetrics.length;
        locationsProcessed++;
      } catch (error) {
        console.error("Failed to fetch metrics for location", { locationId, error });
        errors.push({ locationId, error: String(error) });
      }
    }

    return NextResponse.json({
      message: "Fetch-metrics cron completed",
      locationsProcessed,
      totalDaysStored,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Fetch-metrics cron failed:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
