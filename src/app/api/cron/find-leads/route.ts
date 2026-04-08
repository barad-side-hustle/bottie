import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { inArray } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { leads } from "@/lib/db/schema";
import { env } from "@/lib/env";
import { getCitiesForToday, getQueriesForCities, searchPlaces, type Place } from "@/lib/leads/places";
import { scrapeEmails, pickBestEmail, withConcurrency } from "@/lib/leads/scraper";

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

  const startTime = Date.now();
  const TIMEOUT_MS = 240_000;

  try {
    const cities = getCitiesForToday();
    const queries = getQueriesForCities(cities);

    console.log("[find-leads] Starting cron run", {
      cities,
      queries,
      queriesCount: queries.length,
    });

    const allPlaces: Array<Place & { searchQuery: string }> = [];
    const seenPlaceIds = new Set<string>();

    for (const query of queries) {
      if (Date.now() - startTime > TIMEOUT_MS) {
        console.warn("[find-leads] Timeout approaching, stopping search early", {
          elapsedMs: Date.now() - startTime,
          queriesCompleted: queries.indexOf(query),
          queriesTotal: queries.length,
        });
        break;
      }

      const places = await searchPlaces(query, env.GOOGLE_PLACES_API_KEY);
      console.log(`[find-leads] Query "${query}" returned ${places.length} results`);

      for (const place of places) {
        if (place.placeId && !seenPlaceIds.has(place.placeId)) {
          seenPlaceIds.add(place.placeId);
          allPlaces.push({ ...place, searchQuery: query });
        }
      }
    }

    console.log("[find-leads] Search phase complete", {
      uniquePlaces: allPlaces.length,
      totalFromApi: seenPlaceIds.size,
      elapsedMs: Date.now() - startTime,
    });

    const placeIds = allPlaces.map((p) => p.placeId);
    const existingLeads =
      placeIds.length > 0
        ? await db
            .select({ googlePlaceId: leads.googlePlaceId })
            .from(leads)
            .where(inArray(leads.googlePlaceId, placeIds))
        : [];

    const existingIds = new Set(existingLeads.map((l) => l.googlePlaceId));
    const newPlaces = allPlaces.filter((p) => !existingIds.has(p.placeId));

    console.log("[find-leads] Dedup against DB complete", {
      newPlaces: newPlaces.length,
      alreadyInDb: existingIds.size,
    });

    const placesWithWebsite = newPlaces.filter((p) => p.websiteUri);
    const placesWithoutWebsite = newPlaces.filter((p) => !p.websiteUri);

    console.log("[find-leads] Starting email scraping", {
      withWebsite: placesWithWebsite.length,
      withoutWebsite: placesWithoutWebsite.length,
    });

    let scrapeCount = 0;
    const scrapeResults = await withConcurrency(placesWithWebsite, 5, async (place) => {
      if (Date.now() - startTime > TIMEOUT_MS) {
        console.warn("[find-leads] Timeout approaching, skipping remaining scrapes", {
          scraped: scrapeCount,
          total: placesWithWebsite.length,
        });
        return { place, email: "" };
      }
      const emails = await scrapeEmails(place.websiteUri!);
      const best = pickBestEmail(emails);
      scrapeCount++;
      if (best) {
        console.log(`[find-leads] Found email for "${place.displayName}": ${best}`);
      }
      return { place, email: best };
    });

    const leadsToInsert = [
      ...scrapeResults.map(({ place, email }) => ({
        googlePlaceId: place.placeId,
        businessName: place.displayName,
        email: email || null,
        websiteUrl: place.websiteUri || null,
        googleMapsUrl: place.googleMapsUri || null,
        address: place.formattedAddress || null,
        city: extractCityFromQuery(place.searchQuery),
        status: email ? ("pending" as const) : ("skipped" as const),
        searchQuery: place.searchQuery,
      })),
      ...placesWithoutWebsite.map((place) => ({
        googlePlaceId: place.placeId,
        businessName: place.displayName,
        email: null,
        websiteUrl: null,
        googleMapsUrl: place.googleMapsUri || null,
        address: place.formattedAddress || null,
        city: extractCityFromQuery(place.searchQuery),
        status: "skipped" as const,
        searchQuery: place.searchQuery,
      })),
    ];

    if (leadsToInsert.length > 0) {
      await db.insert(leads).values(leadsToInsert).onConflictDoNothing();
    }

    const emailsFound = scrapeResults.filter((r) => r.email).length;
    const elapsedMs = Date.now() - startTime;

    const summary = {
      citiesSearched: cities,
      placesFound: allPlaces.length,
      newLeads: leadsToInsert.length,
      emailsFound,
      skipped: placesWithoutWebsite.length + scrapeResults.filter((r) => !r.email).length,
      elapsedMs,
    };

    console.log("[find-leads] Cron run completed successfully", summary);

    return NextResponse.json({ message: "Find-leads cron completed", ...summary });
  } catch (error) {
    const elapsedMs = Date.now() - startTime;
    console.error("[find-leads] Cron run failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      elapsedMs,
    });
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

function extractCityFromQuery(searchQuery: string): string {
  const match = searchQuery.match(/in (.+?),/);
  return match?.[1] || "";
}
