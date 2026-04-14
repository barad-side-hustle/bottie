import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { ZoeLeadsRepository } from "@/lib/db/repositories/zoe-leads.repository";
import { getRandomCities, getQueriesForCities, searchPlaces, type Place } from "@/lib/leads/places";
import { ZOE_COUNTRY_CONFIG } from "@/lib/leads/zoe-countries";
import { isSocialMediaUrl } from "@/lib/leads/scraper";

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
    const leadsRepo = new ZoeLeadsRepository();

    const cities = getRandomCities(ZOE_COUNTRY_CONFIG);
    const queries = getQueriesForCities(cities, ZOE_COUNTRY_CONFIG);

    console.log("[zoe-find-leads] Starting search", {
      country: ZOE_COUNTRY_CONFIG.code,
      cities,
      queriesCount: queries.length,
    });

    const allPlaces: Array<Place & { searchQuery: string }> = [];
    const seenPlaceIds = new Set<string>();

    for (const query of queries) {
      if (Date.now() - startTime > TIMEOUT_MS) {
        console.warn("[zoe-find-leads] Timeout approaching, stopping search early");
        break;
      }

      const places = await searchPlaces(query, env.GOOGLE_PLACES_API_KEY);
      console.log(`[zoe-find-leads] Query "${query}" returned ${places.length} results`);

      for (const place of places) {
        if (place.placeId && !seenPlaceIds.has(place.placeId)) {
          seenPlaceIds.add(place.placeId);
          allPlaces.push({ ...place, searchQuery: query });
        }
      }
    }

    const placeIds = allPlaces.map((p) => p.placeId);
    const existingIds = await leadsRepo.findExistingPlaceIds(placeIds);
    const newPlaces = allPlaces.filter((p) => !existingIds.has(p.placeId));

    const leadsToInsert = newPlaces.map((place) => {
      const hasSocialMedia = place.websiteUri && isSocialMediaUrl(place.websiteUri);
      const hasWebsite = place.websiteUri && !hasSocialMedia;

      return {
        googlePlaceId: place.placeId,
        businessName: place.displayName,
        email: null,
        websiteUrl: place.websiteUri || null,
        googleMapsUrl: place.googleMapsUri || null,
        address: place.formattedAddress || null,
        city: extractCityFromQuery(place.searchQuery),
        country: ZOE_COUNTRY_CONFIG.code,
        status: hasWebsite ? ("pending" as const) : ("skipped" as const),
        searchQuery: place.searchQuery,
      };
    });

    await leadsRepo.insertMany(leadsToInsert);

    const results = {
      cities,
      placesFound: allPlaces.length,
      newLeads: leadsToInsert.length,
      withWebsite: leadsToInsert.filter((l) => l.status === "pending").length,
      skipped: leadsToInsert.filter((l) => l.status === "skipped").length,
    };

    const elapsedMs = Date.now() - startTime;

    console.log("[zoe-find-leads] Cron run completed", { results, elapsedMs });

    return NextResponse.json({ message: "Zoe find-leads cron completed", results, elapsedMs });
  } catch (error) {
    const elapsedMs = Date.now() - startTime;
    console.error("[zoe-find-leads] Cron run failed", {
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
